from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

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
    # Placeholder: We fake a segment for now
    segment = SegmentRisk(
        segment_start=request.start,
        segment_end=request.end,
        risk_score=0.42
    )

    return RouteRiskResponse(
        route_segments=[segment],
        overall_risk=0.42
    )
