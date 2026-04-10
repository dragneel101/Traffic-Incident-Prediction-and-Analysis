# app/routes/stats.py
import json
import os

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.services import stats
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/stats", tags=["Stats"])

@router.get("/total")
def total_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {"count": stats.get_total_predictions(db,current_user.id)}

@router.get("/timeseries")
def predictions_over_time(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return stats.get_predictions_over_time(db, current_user.id)

@router.get("/frequent")
def frequent_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return stats.get_frequent_locations(db, current_user.id)

@router.get("/recent")
def recent_predictions(
    limit: int = Query(default=5, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return stats.get_recent_predictions(db, current_user.id, limit=limit, offset=offset)


@router.get("/history")
def route_history(
    limit: int = Query(default=10, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return stats.get_route_history(db, current_user.id, limit=limit, offset=offset)


_METRICS_PATH = os.path.join("app", "models", "model_metrics.json")

@router.get("/model-performance")
def model_performance():
    if not os.path.exists(_METRICS_PATH):
        raise HTTPException(status_code=404, detail="Model metrics not available")
    with open(_METRICS_PATH) as f:
        return json.load(f)