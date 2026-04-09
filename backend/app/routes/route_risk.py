from datetime import datetime
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

from app.services.routing import get_route_coordinates, get_multiple_routes
from app.services.predictor import predict_collision_risk, evaluate_route_risk
from app.services.weather import get_weather
from app.services.geocoding import reverse_geocode
from app.services.traffic import (
    get_traffic_flow,
    get_avg_congestion_along_route,
    count_incidents_along_route,
)
from app.auth.dependencies import get_current_user
from app.models.analytics import PredictionLog
from app.database import get_db
from app.limiter import limiter
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()


class Coordinate(BaseModel):
    latitude: float
    longitude: float


class RouteRequest(BaseModel):
    start: Coordinate
    end: Coordinate


class SegmentRisk(BaseModel):
    segment_start: Coordinate
    segment_end: Coordinate
    risk_score: float


class RouteRiskResponse(BaseModel):
    route_segments: List[SegmentRisk]
    overall_risk: float


def _weighted_score(ml_risk_pct: float, congestion: float, incident_count: int) -> float:
    """
    Combine ML risk, live congestion, and incident count into a final 0-1 score.
      - ml_risk_pct:   0-100 from Random Forest (normalised to 0-1)
      - congestion:    0-1   from HERE jam factor
      - incident_count: integer count of nearby incidents
    """
    ml = ml_risk_pct / 100.0
    cong = min(congestion, 1.0)
    inc = min(incident_count / 5.0, 1.0)
    return round(ml * 0.5 + cong * 0.3 + inc * 0.2, 4)


@router.post("/predict/route_risk", response_model=RouteRiskResponse)
@limiter.limit("30/minute")
def predict_route_risk(
    request_obj: Request,
    request: RouteRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Segment-by-segment collision risk for a single route."""
    logger.info("route_risk_request", extra={"user_id": current_user.id})

    route = get_route_coordinates(
        start={"latitude": request.start.latitude, "longitude": request.start.longitude},
        end={"latitude": request.end.latitude, "longitude": request.end.longitude},
    )

    segments = []
    now = datetime.now()

    for i in range(len(route) - 1):
        seg_start = route[i]
        seg_end = route[i + 1]
        midpoint = {
            "latitude": (seg_start["latitude"] + seg_end["latitude"]) / 2,
            "longitude": (seg_start["longitude"] + seg_end["longitude"]) / 2,
        }

        weather = get_weather(midpoint["latitude"], midpoint["longitude"])
        flow = get_traffic_flow(midpoint["latitude"], midpoint["longitude"])

        input_features = {
            "hour": now.hour,
            "latitude": midpoint["latitude"],
            "longitude": midpoint["longitude"],
            "temp_c": weather["temp_c"],
            "precip_mm": weather["precip_mm"],
            "AUTOMOBILE": 0.9,
            "MOTORCYCLE": 0.1,
            "PASSENGER": 0.9,
            "BICYCLE": 0.3,
            "PEDESTRIAN": 0.4,
        }

        ml_risk = predict_collision_risk(input_features)
        risk = _weighted_score(ml_risk, flow["congestion_level"], 0)

        segments.append(SegmentRisk(
            segment_start=Coordinate(**seg_start),
            segment_end=Coordinate(**seg_end),
            risk_score=risk,
        ))

    overall = round(sum(s.risk_score for s in segments) / len(segments), 4) if segments else 0.0
    start_address = reverse_geocode(request.start.latitude, request.start.longitude)
    end_address = reverse_geocode(request.end.latitude, request.end.longitude)

    congestion = get_avg_congestion_along_route(route)

    db.add(PredictionLog(
        user_id=current_user.id,
        start_location=f"{request.start.latitude},{request.start.longitude}",
        end_location=f"{request.end.latitude},{request.end.longitude}",
        timestamp=now,
        start_address=start_address,
        end_address=end_address,
        collision_risk=overall,
        congestion_level=congestion,
    ))
    db.commit()
    logger.info("route_risk_complete", extra={"user_id": current_user.id, "risk": overall})

    return RouteRiskResponse(route_segments=segments, overall_risk=overall)


@router.post("/predict/multiple_route_risks")
@limiter.limit("30/minute")
def predict_multiple_route_risks(
    request_obj: Request,
    request: RouteRequest,
    route_count: int = 3,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Multiple route alternatives as GeoJSON with weighted risk scores.
    Risk = 50% ML model + 30% live congestion + 20% incident count.
    The lowest-scoring route is flagged with is_recommended: true.
    """
    logger.info("multiple_routes_request", extra={"user_id": current_user.id})

    geojson = get_multiple_routes(
        start={"latitude": request.start.latitude, "longitude": request.start.longitude},
        end={"latitude": request.end.latitude, "longitude": request.end.longitude},
        count=route_count,
    )

    best_score = None
    best_feature = None

    for feature in geojson["features"]:
        coords = feature["geometry"]["coordinates"]
        decoded = [{"latitude": lat, "longitude": lon} for lon, lat in coords]

        ml_risk = evaluate_route_risk(decoded)
        congestion = get_avg_congestion_along_route(decoded)
        incidents = count_incidents_along_route(decoded)

        final_score = _weighted_score(ml_risk, congestion, incidents)

        feature["properties"]["risk_score"] = final_score
        feature["properties"]["congestion_level"] = congestion
        feature["properties"]["incident_count"] = incidents
        feature["properties"]["is_recommended"] = False

        if best_score is None or final_score < best_score:
            best_score = final_score
            best_feature = feature

    if best_feature is not None:
        best_feature["properties"]["is_recommended"] = True

    start_address = reverse_geocode(request.start.latitude, request.start.longitude)
    end_address = reverse_geocode(request.end.latitude, request.end.longitude)

    best_props = best_feature["properties"] if best_feature else {}

    db.add(PredictionLog(
        user_id=current_user.id,
        start_location=f"{request.start.latitude},{request.start.longitude}",
        end_location=f"{request.end.latitude},{request.end.longitude}",
        timestamp=datetime.now(),
        start_address=start_address,
        end_address=end_address,
        collision_risk=best_score,
        congestion_level=best_props.get("congestion_level"),
        incident_count=best_props.get("incident_count"),
    ))
    db.commit()

    logger.info("multiple_routes_complete", extra={
        "user_id": current_user.id,
        "best_score": best_score,
        "routes": len(geojson["features"]),
    })
    return geojson
