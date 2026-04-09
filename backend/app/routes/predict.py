from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from app.services.weather import get_weather
from app.services.features import extract_time_features
from app.services.distance import get_route_distance
from app.services.predictor import predict_collision_risk
from app.auth.dependencies import get_current_user
from app.models.analytics import PredictionLog
from app.database import get_db
from app.limiter import limiter
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()


class PredictRequest(BaseModel):
    start: list[float]
    end: list[float]
    timestamp: str


@router.post("/predict")
@limiter.limit("30/minute")
def predict_risk(
    request: Request,
    data: PredictRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        weather = get_weather(data.start[1], data.start[0])
        time_features = extract_time_features(data.timestamp)
        distance_km = get_route_distance(data.start, data.end)

        features = {**weather, **time_features, "distance_km": distance_km}

        raw_score = (
            features.get("temp_c", 0) * 0.01
            + time_features["is_rush_hour"] * 2
            + (1 if weather["condition"] == "Rain" else 0) * 3
        )
        percent_score = max(0, min(round(raw_score * 10), 100))

        log = PredictionLog(
            user_id=current_user.id,
            start_location=f"{data.start[1]},{data.start[0]}",
            end_location=f"{data.end[1]},{data.end[0]}",
            timestamp=datetime.fromisoformat(data.timestamp),
            collision_risk=percent_score,
        )
        db.add(log)
        db.commit()

        logger.info("prediction_made", extra={"user_id": current_user.id, "risk": percent_score})
        return {"collision_risk": f"{percent_score}%", "features_used": features}

    except Exception as e:
        logger.error("prediction_error", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail=str(e))
