from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.routing import get_route_coordinates
from app.services.predictor import predict_collision_risk
from datetime import datetime
from app.services.weather import get_weather

router = APIRouter()

# Input model
class Coordinate(BaseModel):
    latitude: float
    longitude: float

class RouteRequest(BaseModel):
    start: Coordinate
    end: Coordinate

# Output model
class SegmentRisk(BaseModel):
    segment_start: Coordinate
    segment_end: Coordinate
    risk_score: float

class RouteRiskResponse(BaseModel):
    route_segments: List[SegmentRisk]
    overall_risk: float

@router.post("/predict/route_risk", response_model=RouteRiskResponse)
def predict_route_risk(request: RouteRequest):
    # Call ORS to get the route path
    route = get_route_coordinates(
        start={"latitude": request.start.latitude, "longitude": request.start.longitude},
        end={"latitude": request.end.latitude, "longitude": request.end.longitude}
    )

    # Generate fake risk per segment (later use real model)
    segments = []
    now = datetime.now()

    for i in range(len(route) - 1):
        segment_start = route[i]
        segment_end = route[i + 1]

        # Use midpoint of segment
        midpoint = {
            "latitude": (segment_start["latitude"] + segment_end["latitude"]) / 2,
            "longitude": (segment_start["longitude"] + segment_end["longitude"]) / 2
        }


        weather = get_weather(midpoint["latitude"], midpoint["longitude"])

        # Dummy contextual inputs (customize later)
        input_features = {
            "hour": now.hour,
            "latitude": midpoint["latitude"],
            "longitude": midpoint["longitude"],
            "temp_c": weather["temp_c"],
            "precip_mm": weather["precip_mm"],
            "AUTOMOBILE": 1,
            "MOTORCYCLE": 1,
            "PASSENGER": 1,
            "BICYCLE": 1,
            "PEDESTRIAN": 1
        }

        risk = predict_collision_risk(input_features)

        segments.append(SegmentRisk(
            segment_start=Coordinate(**segment_start),
            segment_end=Coordinate(**segment_end),
            risk_score=risk
        ))

    overall = round(sum([s.risk_score for s in segments]) / len(segments), 4) if segments else 0.0

    return RouteRiskResponse(route_segments=segments, overall_risk=overall)