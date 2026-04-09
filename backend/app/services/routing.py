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


def get_multiple_routes(start: dict, end: dict, count: int = 3) -> dict:
    """
    Generate up to 3 meaningful route alternatives using different ORS route preferences:
      Route 0 — recommended (fastest, default)
      Route 1 — shortest distance
      Route 2 — recommended but avoiding tollways

    Each GeoJSON feature includes:
      route_id, distance_km, duration_min
    Risk scores and is_recommended are added by the caller (route_risk.py).
    """
    coords = [
        [start["longitude"], start["latitude"]],
        [end["longitude"], end["latitude"]],
    ]

    route_configs = [
        {"preference": "recommended", "options": {}},
        {"preference": "shortest",    "options": {}},
        {"preference": "recommended", "options": {"avoid_features": ["tollways"]}},
    ]

    features = []

    for i, cfg in enumerate(route_configs[:count]):
        try:
            kwargs = {
                "coordinates": coords,
                "profile": "driving-car",
                "format": "geojson",
                "preference": cfg["preference"],
            }
            if cfg["options"].get("avoid_features"):
                kwargs["options"] = {"avoid_features": cfg["options"]["avoid_features"]}

            response = client.directions(**kwargs)
            feature = response["features"][0]
            coords_raw = feature["geometry"]["coordinates"]
            summary = feature["properties"].get("summary", {})

            distance_m = summary.get("distance", 0)
            duration_s = summary.get("duration", 0)

            geo_feature = Feature(
                geometry=LineString(coords_raw),
                properties={
                    "route_id": i,
                    "distance_km": round(distance_m / 1000, 2),
                    "duration_min": round(duration_s / 60, 1),
                },
            )
            features.append(geo_feature)

        except Exception as e:
            logger.warning("ors_route_failed", extra={"route_id": i, "error": str(e)})
            continue

    logger.info("routes_generated", extra={"count": len(features)})
    return FeatureCollection(features)
