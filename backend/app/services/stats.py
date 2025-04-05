# backend/app/services/stats.py

from sqlalchemy.orm import Session
from app.models.analytics import PredictionLog
from collections import Counter
from datetime import datetime, timedelta

# Returns total number of predictions in the database
def get_total_predictions(db: Session):
    return db.query(PredictionLog).count()

# Returns a dictionary of prediction counts grouped by date (last 30 days)
def get_predictions_over_time(db: Session):
    past_30_days = datetime.utcnow() - timedelta(days=30)
    data = db.query(PredictionLog).filter(PredictionLog.timestamp >= past_30_days).all()
    by_day = Counter([d.timestamp.date().isoformat() for d in data])
    return dict(sorted(by_day.items()))

# Returns the top 5 most common start and end locations from all predictions
def get_frequent_locations(db: Session):
    data = db.query(PredictionLog).all()
    starts = Counter([d.start_address for d in data]).most_common(5)
    ends = Counter([d.end_address for d in data]).most_common(5)
    return {"most_common_starts": starts, "most_common_ends": ends}

# Returns the 5 most recent predictions with summary messages and timestamps
def get_recent_predictions(db: Session):
    logs = db.query(PredictionLog).order_by(PredictionLog.timestamp.desc()).limit(5).all()
    return [
        {
            "message": (
                f"📍 From: {log.start_address}\n       "
                f"➡️ To:   {log.end_address}\n      "
                f"          🛑 Collision Risk: {log.collision_risk:.2f}%"
            ),
            "time": log.timestamp.isoformat()
        }
        for log in logs
    ]
