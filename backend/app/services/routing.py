import os
import requests
from dotenv import load_dotenv
from geojson import Feature, FeatureCollection, LineString
from openrouteservice import convert
import openrouteservice
from app.logging_config import get_logger

load_dotenv()
logger = get_logger(__name__)

ORS_API_KEY = os.getenv("ORS_API_KEY")
if not ORS_API_KEY:
    raise ValueError("ORS_API_KEY not found. Make sure it is set in your .env file.")

client = openrouteservice.Client(key=ORS_API_KEY)


def get_route_coordinates(start: dict, end: dict) -> list[dict]:
    """
    Get a single route between start and end via ORS.
    Returns a list of {"latitude": ..., "longitude": ...} dicts.
    """
    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}
    body = {
        "coordinates": [
            [start["longitude"], start["latitude"]],
            [end["longitude"], end["latitude"]],
        ]
    }

    response = requests.post(url, json=body, headers=headers, timeout=10)
    if response.status_code != 200:
        raise Exception(f"ORS error {response.status_code}: {response.text}")

    data = response.json()
    if "routes" not in data or "geometry" not in data["routes"][0]:
        raise ValueError(f"Unexpected ORS response format: {data}")

    decoded = convert.decode_polyline(data["routes"][0]["geometry"])["coordinates"]
    return [{"latitude": lat, "longitude": lng} for lng, lat in decoded]


def get_multiple_routes(start: dict, end: dict, count: int = 5) -> dict:
    """
    Generate up to `count` diverse driving route alternatives.

    Strategy:
      1. ORS native alternative_routes  — up to 3 geometrically diverse options
      2. Avoid highways                 — surface-street route
      3. Avoid highways + tollways      — local roads, no tolls
      4. Shortest preference            — pure distance minimum

    Routes are deduplicated by rounded distance so near-identical paths are dropped.
    Risk scores and is_recommended are added by the caller (route_risk.py).
    """
    coords = [
        [start["longitude"], start["latitude"]],
        [end["longitude"], end["latitude"]],
    ]

    seen_dist_keys: set = set()
    collected: list = []

    def _add_from_response(response):
        for feat in response.get("features", []):
            summary  = feat.get("properties", {}).get("summary", {})
            dist_m   = summary.get("distance", 0)
            dur_s    = summary.get("duration", 0)
            dist_km  = round(dist_m / 1000, 2)
            # Deduplicate: bucket to nearest 0.3 km to drop near-identical routes
            key = round(dist_km / 0.3) * 0.3
            if key in seen_dist_keys:
                continue
            seen_dist_keys.add(key)
            collected.append(Feature(
                geometry=LineString(feat["geometry"]["coordinates"]),
                properties={
                    "distance_km": dist_km,
                    "duration_min": round(dur_s / 60, 1),
                },
            ))

    api_calls = [
        # 1. ORS native alternatives — geometrically diverse by design
        dict(
            coordinates=coords,
            profile="driving-car",
            format="geojson",
            alternative_routes={"target_count": 3, "weight_factor": 1.6, "share_factor": 0.5},
        ),
        # 2. Avoid highways — surface streets
        dict(
            coordinates=coords,
            profile="driving-car",
            format="geojson",
            options={"avoid_features": ["highways"]},
        ),
        # 3. Avoid highways + tollways — local roads, no tolls
        dict(
            coordinates=coords,
            profile="driving-car",
            format="geojson",
            options={"avoid_features": ["highways", "tollways"]},
        ),
        # 4. Shortest pure distance
        dict(
            coordinates=coords,
            profile="driving-car",
            format="geojson",
            preference="shortest",
        ),
    ]

    for kwargs in api_calls:
        if len(collected) >= count:
            break
        try:
            resp = client.directions(**kwargs)
            _add_from_response(resp)
        except Exception as e:
            logger.warning("ors_route_call_failed", extra={"error": str(e)})

    # Assign sequential route_ids after deduplication
    for i, feat in enumerate(collected[:count]):
        feat["properties"]["route_id"] = i

    logger.info("routes_generated", extra={"count": len(collected[:count])})
    return FeatureCollection(collected[:count])
