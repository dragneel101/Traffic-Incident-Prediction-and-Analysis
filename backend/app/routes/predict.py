from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

# Import services
from app.services.weather import get_weather
from app.services.features import extract_time_features
from app.services.distance import get_route_distance
from app.services.predictor import predict_collision_risk

# Authentication utility
from app.auth.dependencies import get_current_user

# Model for logging predictions
from app.models.analytics import PredictionLog
from app.database import get_db

router = APIRouter()


# Request schema for the /predict endpoint
class PredictRequest(BaseModel):
    start: list[float]      # Starting coordinate as [longitude, latitude]
    end: list[float]        # Ending coordinate as [longitude, latitude]
    timestamp: str          # ISO 8601 timestamp (e.g. "2025-03-22T08:30:00")

@router.post("/predict")
def predict_risk(
    data: PredictRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
    
):
    """
    Estimate collision risk using hand-crafted rules based on:
    - Weather conditions at the start location
    - Time-of-day (rush hour, weekday)
    - Route distance between start and end points

    Also logs the prediction request into the database for future analytics.
    Returns the estimated collision risk as a percentage.
    """
    print("predict test")
    try:
        # STEP 1: Get live weather at the start location
        weather = get_weather(data.start[1], data.start[0])

        # STEP 2: Extract time-related features (e.g., is_rush_hour, day_of_week)
        time_features = extract_time_features(data.timestamp)

        # STEP 3: Calculate route distance (in kilometers)
        distance_km = get_route_distance(data.start, data.end)

        # STEP 4: Combine features for scoring
        features = {
            **weather,
            **time_features,
            "distance_km": distance_km
        }

        # STEP 5: Calculate a raw score based on simple logic
        raw_score = (
            features["temp"] * 0.01 +                        # Slight increase with temperature
            features["is_rush_hour"] * 2 +                  # Higher risk during rush hour
            (1 if features["condition"] == "Rain" else 0) * 3  # Higher risk if raining
        )

        # STEP 6: Convert raw score to percentage (0–100), clamped
        percent_score = max(0, min(round(raw_score * 10), 100))

        # STEP 7: Log the prediction to the database
        log = PredictionLog(
            user_id=user_id,
            start_location=f"{data.start[1]},{data.start[0]}",  # Store as "lat,lon"
            end_location=f"{data.end[1]},{data.end[0]}",
            timestamp=datetime.fromisoformat(data.timestamp)
        )
        print(log)
        db.add(log)
        db.commit()
        db.refresh(log)  # Refresh to get the latest data from the database

        # STEP 8: Return formatted result
        return {
            "collision_risk": f"{percent_score}%",  # Return risk as string percentage
            "features_used": features               # Return input features for transparency
        }

    except Exception as e:
        # Catch any unexpected errors and return a 500 error
        raise HTTPException(status_code=500, detail=str(e))
