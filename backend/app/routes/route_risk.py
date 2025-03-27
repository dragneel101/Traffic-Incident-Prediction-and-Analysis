from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.routing import get_route_coordinates, get_multiple_routes
from app.services.predictor import predict_collision_risk, evaluate_route_risk
from app.services.weather import get_weather

router = APIRouter()

# ---------- Input Models ----------
class Coordinate(BaseModel):
    latitude: float
    longitude: float

class RouteRequest(BaseModel):
    start: Coordinate
    end: Coordinate

# ---------- Output Models for /predict/route_risk ----------
class SegmentRisk(BaseModel):
    segment_start: Coordinate
    segment_end: Coordinate
    risk_score: float

class RouteRiskResponse(BaseModel):
    route_segments: List[SegmentRisk]
    overall_risk: float

# ---------- Vehicle Weights ----------
vehicle_weights = {
    "AUTOMOBILE": 0.9,
    "MOTORCYCLE": 0.1,
    "PASSENGER": 0.9,
    "BICYCLE": 0.3,
    "PEDESTRIAN": 0.4
}

# ---------- POST /predict/route_risk ----------
@router.post("/predict/route_risk", response_model=RouteRiskResponse)
def predict_route_risk(request: RouteRequest):
    """
    Returns segment-by-segment collision risk and overall route risk for a single route.
    """
    route = get_route_coordinates(
        start={"latitude": request.start.latitude, "longitude": request.start.longitude},
        end={"latitude": request.end.latitude, "longitude": request.end.longitude}
    )

    segments = []
    now = datetime.now()

    for i in range(len(route) - 1):
        segment_start = route[i]
        segment_end = route[i + 1]

        # Use midpoint for risk calculation
        midpoint = {
            "latitude": (segment_start["latitude"] + segment_end["latitude"]) / 2,
            "longitude": (segment_start["longitude"] + segment_end["longitude"]) / 2
        }

        # Get weather at midpoint
        weather = get_weather(midpoint["latitude"], midpoint["longitude"])

        # Prepare model input
        input_features = {
            "hour": now.hour,
            "latitude": midpoint["latitude"],
            "longitude": midpoint["longitude"],
            "temp_c": weather["temp_c"],
            "precip_mm": weather["precip_mm"],
            **vehicle_weights
        }

        # Predict risk
        risk = predict_collision_risk(input_features)

        segments.append(SegmentRisk(
            segment_start=Coordinate(**segment_start),
            segment_end=Coordinate(**segment_end),
            risk_score=risk
        ))

    overall = round(sum([s.risk_score for s in segments]) / len(segments), 4) if segments else 0.0

    return RouteRiskResponse(route_segments=segments, overall_risk=overall)

# ---------- POST /predict/multiple_route_risks ----------
@router.post("/predict/multiple_route_risks")
def predict_multiple_route_risks(request: RouteRequest, route_count: int = 3):
    """
    Returns multiple route alternatives as GeoJSON, each with a risk score.
    """
    geojson = get_multiple_routes(
        start={"latitude": request.start.latitude, "longitude": request.start.longitude},
        end={"latitude": request.end.latitude, "longitude": request.end.longitude},
        count=route_count
    )

    # Add risk_score to each GeoJSON route feature
    for feature in geojson["features"]:
        coords = feature["geometry"]["coordinates"]
        decoded = [{"latitude": lat, "longitude": lon} for lon, lat in coords]
        risk_score = evaluate_route_risk(decoded)
        feature["properties"]["risk_score"] = risk_score

    return geojson
