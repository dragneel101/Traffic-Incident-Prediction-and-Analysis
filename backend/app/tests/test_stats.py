from datetime import datetime
from app.tests.conftest import register_user, get_tokens, auth_headers
from app.models.analytics import PredictionLog
from app.models.user import User


def _add_prediction(db, user_id):
    db.add(PredictionLog(
        user_id=user_id,
        start_location="43.65,-79.38",
        end_location="43.70,-79.42",
        start_address="Start St, Toronto",
        end_address="End Ave, Toronto",
        timestamp=datetime.utcnow(),
        collision_risk=0.25,
    ))
    db.commit()


def _get_user(db, email):
    return db.query(User).filter(User.email == email).first()


# ── /api/stats/total ──────────────────────────────────────────────────────────

def test_total_starts_at_zero(client):
    register_user(client)
    tokens = get_tokens(client)
    resp = client.get("/api/stats/total", headers=auth_headers(tokens["access_token"]))
    assert resp.status_code == 200
    assert resp.json()["count"] == 0


def test_total_reflects_inserted_predictions(client, db):
    register_user(client, email="counter@example.com")
    tokens = get_tokens(client, email="counter@example.com")

    user = _get_user(db, "counter@example.com")
    _add_prediction(db, user.id)
    _add_prediction(db, user.id)

    resp = client.get("/api/stats/total", headers=auth_headers(tokens["access_token"]))
    assert resp.json()["count"] == 2


def test_total_is_user_scoped(client, db):
    register_user(client, email="alice@example.com")
    register_user(client, email="bob@example.com")
    tokens_alice = get_tokens(client, email="alice@example.com")
    tokens_bob   = get_tokens(client, email="bob@example.com")

    alice = _get_user(db, "alice@example.com")
    for _ in range(3):
        _add_prediction(db, alice.id)

    # Alice sees 3, Bob sees 0
    assert client.get("/api/stats/total", headers=auth_headers(tokens_alice["access_token"])).json()["count"] == 3
    assert client.get("/api/stats/total", headers=auth_headers(tokens_bob["access_token"])).json()["count"] == 0


# ── /api/stats/recent ─────────────────────────────────────────────────────────

def test_recent_returns_list(client):
    register_user(client, email="recent@example.com")
    tokens = get_tokens(client, email="recent@example.com")
    resp = client.get("/api/stats/recent", headers=auth_headers(tokens["access_token"]))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_recent_is_user_scoped(client, db):
    register_user(client, email="recentA@example.com")
    register_user(client, email="recentB@example.com")
    tokens_a = get_tokens(client, email="recentA@example.com")
    tokens_b = get_tokens(client, email="recentB@example.com")

    user_a = _get_user(db, "recentA@example.com")
    _add_prediction(db, user_a.id)

    resp_b = client.get("/api/stats/recent", headers=auth_headers(tokens_b["access_token"]))
    assert resp_b.json() == []


# ── /api/stats/frequent ───────────────────────────────────────────────────────

def test_frequent_returns_expected_shape(client):
    register_user(client, email="freq@example.com")
    tokens = get_tokens(client, email="freq@example.com")
    resp = client.get("/api/stats/frequent", headers=auth_headers(tokens["access_token"]))
    assert resp.status_code == 200
    body = resp.json()
    assert "most_common_starts" in body
    assert "most_common_ends" in body


# ── Auth required for all stat endpoints ──────────────────────────────────────

def test_all_stat_endpoints_require_auth(client):
    paths = ["/api/stats/total", "/api/stats/recent", "/api/stats/frequent", "/api/stats/timeseries"]
    for path in paths:
        resp = client.get(path)
        assert resp.status_code == 401, f"{path} should require auth but returned {resp.status_code}"
