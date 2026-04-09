from fastapi import APIRouter, Query
from app.services.traffic import get_traffic_flow, get_traffic_incidents

router = APIRouter(tags=["Traffic"])


@router.get("/traffic/flow")
def traffic_flow(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """
    Real-time traffic flow at a point.
    Returns congestion_level (0-1), speed_ratio, and jam_factor (0-10).
    No authentication required.
    """
    return get_traffic_flow(lat, lon)


@router.get("/traffic/incidents")
def traffic_incidents(
    lat: float = Query(..., description="Centre latitude"),
    lon: float = Query(..., description="Centre longitude"),
    radius_km: float = Query(5.0, description="Search radius in kilometres"),
):
    """
    Active traffic incidents near a point as a GeoJSON FeatureCollection.
    No authentication required — used by the map to display incident markers.
    """
    incidents = get_traffic_incidents(lat, lon, radius_km=radius_km)

    type_colors = {
        "ACCIDENT": "#f44336",
        "CONSTRUCTION": "#ff9800",
        "ROAD_CLOSURE": "#9e9e9e",
        "CONGESTION": "#ff5722",
    }

    features = []
    for inc in incidents:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [inc["lon"], inc["lat"]]},
            "properties": {
                "type": inc["type"],
                "severity": inc["severity"],
                "description": inc["description"],
                "start_time": inc.get("start_time"),
                "end_time": inc.get("end_time"),
                "color": type_colors.get(inc["type"], "#9e9e9e"),
            },
        })

    return {"type": "FeatureCollection", "features": features}
