from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.saved_location import SavedLocation
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/saved-locations", tags=["Saved Locations"])


class SavedLocationCreate(BaseModel):
    label: str = Field(..., min_length=1, max_length=60)
    address: str = Field(..., min_length=1, max_length=300)
    lat: float
    lon: float


class SavedLocationOut(BaseModel):
    id: int
    label: str
    address: str
    lat: float
    lon: float

    class Config:
        from_attributes = True


@router.get("", response_model=list[SavedLocationOut])
def list_saved_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(SavedLocation)
        .filter(SavedLocation.user_id == current_user.id)
        .order_by(SavedLocation.created_at.desc())
        .all()
    )


@router.post("", response_model=SavedLocationOut, status_code=201)
def create_saved_location(
    body: SavedLocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.query(SavedLocation).filter(SavedLocation.user_id == current_user.id).count()
    if count >= 20:
        raise HTTPException(status_code=400, detail="Maximum of 20 saved locations reached")

    loc = SavedLocation(
        user_id=current_user.id,
        label=body.label,
        address=body.address,
        lat=body.lat,
        lon=body.lon,
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    logger.info("Saved location created", extra={"user_id": current_user.id, "label": body.label})
    return loc


@router.delete("/{location_id}", status_code=204)
def delete_saved_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loc = (
        db.query(SavedLocation)
        .filter(SavedLocation.id == location_id, SavedLocation.user_id == current_user.id)
        .first()
    )
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(loc)
    db.commit()
