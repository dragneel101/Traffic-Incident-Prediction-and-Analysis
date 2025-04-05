# app/routes/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import stats
from app.database import get_db
from app.auth.dependencies import get_current_user  # import your auth dependency
from app.models.user import User  # assuming your user model is named User

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return stats.get_recent_predictions(db, current_user.id)