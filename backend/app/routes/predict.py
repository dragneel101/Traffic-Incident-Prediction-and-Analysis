from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.weather import get_weather
from app.services.features import extract_time_features
from app.services.distance import get_route_distance
from app.services.predictor import predict_collision_risk

router = APIRouter()

# -----------------------------
# Route 1: Context-Aware Prediction (uses weather, time, and distance)
# -----------------------------

class PredictRequest(BaseModel):
    start: list[float]  # Starting coordinate [lon, lat]
    end: list[float]    # Ending coordinate [lon, lat]
    timestamp: str      # ISO format timestamp (e.g. "2025-03-22T08:30:00")

@router.post("/predict")
def predict_risk(data: PredictRequest):
    """
    Context-aware collision risk estimation based on:
    - Live weather at the start location
    - Extracted time-of-day features (e.g., rush hour)
    - Route distance using open route service
    This returns a hand-crafted score (not ML-based).
    """
    try:
        # 1. Get current weather at the starting point (lat, lon)
        weather = get_weather(data.start[1], data.start[0])

        # 2. Get time-based features (e.g., rush hour, weekday)
        time_features = extract_time_features(data.timestamp)

        # 3. Estimate distance between start and end points (in km)
        distance_km = get_route_distance(data.start, data.end)

        # 4. Combine all features
        features = {
            **weather,
            **time_features,
            "distance_km": distance_km
        }

        # 5. Dummy scoring logic (to be replaced by real ML model)
        score = (
            features["temp"] * 0.01 +  # Slight risk increase with temp
            features["is_rush_hour"] * 2 +  # Boost risk during rush hour
            (1 if features["condition"] == "Rain" else 0) * 3  # Heavy weight if raining
        )

        return {
            "collision_risk": round(score, 2),
            "features_used": features
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# Route 2: ML Model-Based Prediction
# -----------------------------

class CollisionInput(BaseModel):
    hour: int = Field(..., ge=0, le=23, description="Hour of day (0-23)")
    latitude: float
    longitude: float
    temp_c: float
    precip_mm: float
    AUTOMOBILE: int = Field(..., ge=0, le=1)
    MOTORCYCLE: int = Field(..., ge=0, le=1)
    PASSENGER: int = Field(..., ge=0, le=1)
    BICYCLE: int = Field(..., ge=0, le=1)
    PEDESTRIAN: int = Field(..., ge=0, le=1)

@router.post("/predict_model")
def predict_with_model(data: CollisionInput):
    """
    Predict collision probability using the trained ML model.
    Input must include weather, location, and vehicle involvement flags.
    Returns probability from 0.0 (safe) to 1.0 (high collision risk).
    """
    try:
        prob = predict_collision_risk(data.dict())
        return {"collision_probability": prob}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
