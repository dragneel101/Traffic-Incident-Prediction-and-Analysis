# app/routes/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import stats
from app.database import get_db

router = APIRouter(prefix="/api/stats", tags=["Stats"])

@router.get("/total")
def total_predictions(db: Session = Depends(get_db)):
    return {"count": stats.get_total_predictions(db)}

@router.get("/timeseries")
def predictions_over_time(db: Session = Depends(get_db)):
    return stats.get_predictions_over_time(db)

@router.get("/frequent")
def frequent_locations(db: Session = Depends(get_db)):
    return stats.get_frequent_locations(db)

@router.get("/recent")
def recent_predictions(db: Session = Depends(get_db)):
    return stats.get_recent_predictions(db)