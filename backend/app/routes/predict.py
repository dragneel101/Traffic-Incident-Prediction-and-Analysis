from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.weather import get_weather
from app.services.features import extract_time_features
from app.services.distance import get_route_distance


router = APIRouter()

class PredictRequest(BaseModel):
    start: list[float]  # [lon, lat]
    end: list[float]
    timestamp: str      # ISO format, e.g. "2025-03-22T08:30:00"

@router.post("/predict")
def predict_risk(data: PredictRequest):
    try:
        # 1. Fetch weather for starting point
        weather = get_weather(data.start[1], data.start[0])  # lat, lon

        # 2. Extract time features
        time_features = extract_time_features(data.timestamp)

        distance_km = get_route_distance(data.start, data.end)

        # 3. Combine into a single feature dict (dummy features for now)
        features = {
            **weather,
            **time_features,
            "distance_km": distance_km
        }

        # 4. Dummy scoring logic (replace with model.predict later)
        score = (
            features["temp"] * 0.01 +
            features["is_rush_hour"] * 2 +
            (1 if features["condition"] == "Rain" else 0) * 3
        )

        return {
            "collision_risk": round(score, 2),
            "features_used": features
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
