from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.routing import get_route_coordinates

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
    for i in range(len(route) - 1):
        segments.append(SegmentRisk(
            segment_start=Coordinate(**route[i]),
            segment_end=Coordinate(**route[i+1]),
            risk_score=0.5  # ⛏️ placeholder score
        ))

    overall = sum([s.risk_score for s in segments]) / len(segments) if segments else 0

    return RouteRiskResponse(route_segments=segments, overall_risk=overall)