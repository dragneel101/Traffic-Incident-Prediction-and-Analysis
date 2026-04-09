import copy
import pytest
from unittest.mock import patch
from app.tests.conftest import register_user, get_tokens, auth_headers

# ── Minimal GeoJSON that get_multiple_routes would return ─────────────────────
_ROUTE_COORDS = [
    [[-79.38, 43.65], [-79.39, 43.655], [-79.40, 43.66]],
    [[-79.38, 43.65], [-79.41, 43.66], [-79.42, 43.67]],
    [[-79.38, 43.65], [-79.43, 43.67], [-79.44, 43.68]],
]

MOCK_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {"type": "LineString", "coordinates": coords},
            "properties": {
                "route_id": i,
                "distance_km": round(5.0 + i * 1.5, 1),
                "duration_min": 10 + i * 4,
            },
        }
        for i, coords in enumerate(_ROUTE_COORDS)
    ],
}

_PAYLOAD = {
    "start": {"latitude": 43.65, "longitude": -79.38},
    "end":   {"latitude": 43.70, "longitude": -79.42},
}


@pytest.fixture()
def mocked_services():
    """Patch all external service calls used by the route_risk endpoint."""
    with (
        patch(
            "app.routes.route_risk.get_multiple_routes",
            return_value=copy.deepcopy(MOCK_GEOJSON),
        ),
        patch(
            "app.routes.route_risk.evaluate_route_risk",
            side_effect=[30.0, 60.0, 20.0],  # route 2 wins (lowest ML risk)
        ),
        patch("app.routes.route_risk.get_avg_congestion_along_route", return_value=0.2),
        patch("app.routes.route_risk.count_incidents_along_route", return_value=1),
        patch("app.routes.route_risk.reverse_geocode", return_value="Toronto, ON"),
    ):
        yield


def _predict(client, tokens):
    return client.post(
        "/api/predict/multiple_route_risks",
        json=_PAYLOAD,
        headers=auth_headers(tokens["access_token"]),
    )


def test_returns_geojson_feature_collection(client, mocked_services):
    register_user(client)
    tokens = get_tokens(client)
    resp = _predict(client, tokens)
    assert resp.status_code == 200
    body = resp.json()
    assert body["type"] == "FeatureCollection"
    assert len(body["features"]) == 3


def test_each_feature_has_required_properties(client, mocked_services):
    register_user(client)
    tokens = get_tokens(client)
    features = _predict(client, tokens).json()["features"]
    for f in features:
        props = f["properties"]
        assert "risk_score" in props
        assert "is_recommended" in props
        assert "incident_count" in props
        assert "congestion_level" in props


def test_exactly_one_recommended_route(client, mocked_services):
    register_user(client)
    tokens = get_tokens(client)
    features = _predict(client, tokens).json()["features"]
    recommended = [f for f in features if f["properties"]["is_recommended"]]
    assert len(recommended) == 1


def test_risk_score_is_between_0_and_1(client, mocked_services):
    register_user(client)
    tokens = get_tokens(client)
    features = _predict(client, tokens).json()["features"]
    for f in features:
        score = f["properties"]["risk_score"]
        assert 0.0 <= score <= 1.0, f"risk_score {score!r} out of range"


def test_requires_authentication(client):
    resp = client.post("/api/predict/multiple_route_risks", json=_PAYLOAD)
    assert resp.status_code == 401
