import os
import math
import requests
from app.cache import traffic_cache
from app.logging_config import get_logger

logger = get_logger(__name__)

HERE_API_KEY = os.getenv("HERE_API_KEY")


def _here_available() -> bool:
    return bool(HERE_API_KEY)


def get_traffic_flow(lat: float, lon: float, radius_m: int = 500) -> dict:
    """
    Fetch real-time traffic flow at a point using HERE Traffic API v7.
    Returns congestion_level (0-1), speed_ratio (current/free-flow), and jam_factor (0-10).
    Falls back to neutral values if HERE is unavailable or the call fails.
    Results are cached for 5 minutes.
    """
    cache_key = ("flow", round(lat, 2), round(lon, 2))
    if cache_key in traffic_cache:
        return traffic_cache[cache_key]

    default = {"congestion_level": 0.0, "speed_ratio": 1.0, "jam_factor": 0.0}

    if not _here_available():
        return default

    try:
        url = "https://data.traffic.hereapi.com/v7/flow"
        params = {
            "in": f"circle:{lat},{lon};r={radius_m}",
            "locationReferencing": "shape",
            "apiKey": HERE_API_KEY,
        }
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        data = resp.json()

        results = data.get("results", [])
        if not results:
            traffic_cache[cache_key] = default
            return default

        # Average across all flow segments returned for this area
        jam_factors = []
        speed_ratios = []
        for item in results:
            flow = item.get("currentFlow", {})
            jf = flow.get("jamFactor")
            speed = flow.get("speed")
            free_flow = flow.get("freeFlow")
            if jf is not None:
                jam_factors.append(jf)
            if speed is not None and free_flow and free_flow > 0:
                speed_ratios.append(speed / free_flow)

        avg_jf = sum(jam_factors) / len(jam_factors) if jam_factors else 0.0
        avg_sr = sum(speed_ratios) / len(speed_ratios) if speed_ratios else 1.0

        result = {
            "congestion_level": round(min(avg_jf / 10.0, 1.0), 3),
            "speed_ratio": round(avg_sr, 3),
            "jam_factor": round(avg_jf, 2),
        }
        traffic_cache[cache_key] = result
        return result

    except Exception as e:
        logger.warning("traffic_flow_error", extra={"error": str(e), "lat": lat, "lon": lon})
        return default


def get_traffic_incidents(lat: float, lon: float, radius_km: float = 5.0) -> list[dict]:
    """
    Fetch active traffic incidents near a point using HERE Traffic API v7.
    Returns a list of incident dicts with type, severity, lat, lon, description.
    Results are cached for 5 minutes.
    """
    cache_key = ("incidents", round(lat, 1), round(lon, 1), radius_km)
    if cache_key in traffic_cache:
        return traffic_cache[cache_key]

    if not _here_available():
        return []

    try:
        url = "https://data.traffic.hereapi.com/v7/incidents"
        params = {
            "in": f"circle:{lat},{lon};r={int(radius_km * 1000)}",
            "locationReferencing": "shape",
            "apiKey": HERE_API_KEY,
        }
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        data = resp.json()

        incidents = []
        for item in data.get("results", []):
            details = item.get("incidentDetails", {})

            severity_map = {"critical": 4, "major": 3, "minor": 2, "lowest": 1}
            criticality = details.get("criticality", "minor")

            summary_obj = details.get("summary", {})
            description = summary_obj.get("value", "Traffic incident") if isinstance(summary_obj, dict) else str(summary_obj)

            # Extract actual incident coordinates from HERE API response
            inc_lat, inc_lon = lat, lon  # fallback to query centre
            location = item.get("location", {})
            # Try geoloc origin first (point location)
            origin = location.get("geoloc", {}).get("origin", {})
            if origin.get("lat") is not None and origin.get("lng") is not None:
                inc_lat = origin["lat"]
                inc_lon = origin["lng"]
            else:
                # Try shape links (line/area location — use first point)
                links = location.get("shape", {}).get("links", [])
                if links:
                    points = links[0].get("points", [])
                    if points:
                        inc_lat = points[0].get("lat", lat)
                        inc_lon = points[0].get("lng", lon)

            incidents.append({
                "type": details.get("type", "UNKNOWN"),
                "severity": severity_map.get(criticality, 1),
                "lat": inc_lat,
                "lon": inc_lon,
                "description": description,
                "start_time": details.get("startTime"),
                "end_time": details.get("endTime"),
            })

        traffic_cache[cache_key] = incidents
        logger.info("traffic_incidents_fetched", extra={"count": len(incidents), "lat": lat, "lon": lon})
        return incidents

    except Exception as e:
        logger.warning("traffic_incidents_error", extra={"error": str(e), "lat": lat, "lon": lon})
        return []


def count_incidents_along_route(coords: list[dict], corridor_km: float = 0.1) -> int:
    """
    Count incidents that fall within `corridor_km` of any point on a sampled route.
    coords: list of {"latitude": ..., "longitude": ...}
    """
    if not coords:
        return 0

    # Use route centre point to fetch incidents once, then filter by proximity
    mid = coords[len(coords) // 2]
    route_radius_km = _route_radius_km(coords)
    incidents = get_traffic_incidents(mid["latitude"], mid["longitude"], radius_km=route_radius_km + 1)

    count = 0
    for inc in incidents:
        for pt in coords[::max(1, len(coords) // 20)]:  # sample 20 points
            if _haversine_km(pt["latitude"], pt["longitude"], inc["lat"], inc["lon"]) <= corridor_km:
                count += 1
                break
    return count


def get_avg_congestion_along_route(coords: list[dict]) -> float:
    """
    Average congestion_level (0-1) across sampled points on a route.
    """
    if not coords:
        return 0.0

    sample = coords[::max(1, len(coords) // 10)]  # up to 10 samples
    levels = []
    for pt in sample:
        flow = get_traffic_flow(pt["latitude"], pt["longitude"])
        levels.append(flow["congestion_level"])

    return round(sum(levels) / len(levels), 3) if levels else 0.0


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def _route_radius_km(coords: list[dict]) -> float:
    """Approximate bounding radius of a route from its midpoint."""
    if len(coords) < 2:
        return 5.0
    mid = coords[len(coords) // 2]
    max_dist = max(
        _haversine_km(mid["latitude"], mid["longitude"], pt["latitude"], pt["longitude"])
        for pt in coords
    )
    return max(max_dist, 1.0)
