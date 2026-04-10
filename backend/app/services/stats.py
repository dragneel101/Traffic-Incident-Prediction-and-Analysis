# backend/app/services/stats.py

from sqlalchemy.orm import Session
from app.models.analytics import PredictionLog
from collections import Counter
from datetime import datetime, timedelta, timezone

# Returns total number of predictions for the currently logged in user
def get_total_predictions(db: Session, user_id: int):
    return db.query(PredictionLog).filter(PredictionLog.user_id == user_id).count()

# Returns a dictionary of prediction counts grouped by date (last 30 days)
def get_predictions_over_time(db: Session, user_id: int):
    past_30_days = datetime.now(timezone.utc) - timedelta(days=30)
    data = (
        db.query(PredictionLog)
        .filter(PredictionLog.user_id == user_id)
        .filter(PredictionLog.timestamp >= past_30_days)
        .all()
    )
    by_day = Counter([d.timestamp.date().isoformat() for d in data])
    return dict(sorted(by_day.items()))

# Returns the top 5 most common start and end locations from all predictions
def get_frequent_locations(db: Session, user_id: int):
    data = db.query(PredictionLog).filter(PredictionLog.user_id == user_id).all()
    starts = Counter([d.start_address for d in data]).most_common(5)
    ends = Counter([d.end_address for d in data]).most_common(5)
    return {"most_common_starts": starts, "most_common_ends": ends}

# Returns the most recent predictions with summary messages and timestamps (paginated)
def get_recent_predictions(db: Session, user_id: int, limit: int = 5, offset: int = 0):
    logs = (
        db.query(PredictionLog)
        .filter(PredictionLog.user_id == user_id)
        .order_by(PredictionLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "message": (
                f"From: {log.start_address}\n"
                f"To:   {log.end_address}\n"
                f"Collision Risk: {float(log.collision_risk):.2f}%" if log.collision_risk else ""
            ),
            "time": log.timestamp.isoformat()
        }
        for log in logs
    ]


# Returns paginated route history with full data for the history page
def get_route_history(db: Session, user_id: int, limit: int = 10, offset: int = 0):
    total = db.query(PredictionLog).filter(PredictionLog.user_id == user_id).count()
    logs = (
        db.query(PredictionLog)
        .filter(PredictionLog.user_id == user_id)
        .order_by(PredictionLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    items = [
        {
            "id": log.id,
            "start_address": log.start_address,
            "end_address": log.end_address,
            "start_location": log.start_location,
            "end_location": log.end_location,
            "collision_risk": float(log.collision_risk) if log.collision_risk is not None else None,
            "congestion_level": log.congestion_level,
            "incident_count": log.incident_count,
            "timestamp": log.timestamp.isoformat(),
        }
        for log in logs
    ]
    return {"total": total, "offset": offset, "limit": limit, "items": items}
