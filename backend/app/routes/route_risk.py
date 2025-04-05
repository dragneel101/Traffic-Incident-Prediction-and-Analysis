from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

# Importing services for weather, route, and predictor
from app.services.routing import get_route_coordinates, get_multiple_routes
from app.services.predictor import predict_collision_risk, evaluate_route_risk
from app.services.weather import get_weather
from app.services.geocoding import reverse_geocode  # Import the reverse_geocode function

# Authentication utility for extracting current user
from app.auth.dependencies import get_current_user

# Import the PredictionLog model for database logging
from app.models.analytics import PredictionLog

# Database session dependency
from app.database import get_db

# Define the router
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
def predict_route_risk(request: RouteRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    """
    Returns segment-by-segment collision risk and overall route risk for a single route.
    Logs the prediction request into the database.
    """
    print("***************Getting route**************")
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

    # Get start and end addresses using reverse geocoding
    start_address = reverse_geocode(request.start.latitude, request.start.longitude)
    end_address = reverse_geocode(request.end.latitude, request.end.longitude)

    # Log the prediction to the database
    log = PredictionLog(
        user_id=user_id,
        start_location=f"{request.start.latitude},{request.start.longitude}",
        end_location=f"{request.end.latitude},{request.end.longitude}",
        timestamp=now,
        start_address=start_address,  # Save start address
        end_address=end_address       # Save end address
    )
    db.add(log)
    db.commit()

    return RouteRiskResponse(route_segments=segments, overall_risk=overall)

# ---------- POST /predict/multiple_route_risks ----------
@router.post("/predict/multiple_route_risks")
def predict_multiple_route_risks(
    request: RouteRequest, 
    route_count: int = 3, 
    db: Session = Depends(get_db),  # Inject the database session here
    user_id: int = Depends(get_current_user)  # Inject the user_id from the authentication system
):
    """
    Returns multiple route alternatives as GeoJSON, each with a risk score.
    Logs the prediction request to the database.
    """
    # Get multiple routes using the request start and end coordinates
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

    # Get start and end addresses using reverse geocoding
    start_address = reverse_geocode(request.start.latitude, request.start.longitude)
    end_address = reverse_geocode(request.end.latitude, request.end.longitude)

    # Log the prediction to the database
    log = PredictionLog(
        user_id=user_id.id,  # The user who made the prediction
        start_location=f"{request.start.latitude},{request.start.longitude}",
        end_location=f"{request.end.latitude},{request.end.longitude}",
        timestamp=datetime.now(),  # Use the current time for logging
        start_address=start_address,  # Save start address
        end_address=end_address,       # Save end address
        collision_risk=risk_score
    )
    db.add(log)  # Add the log entry to the session
    db.commit()  # Commit the log entry to the database

    return geojson  # Return the GeoJSON with the risk scores
