import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.shared_route import SharedRoute
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/routes", tags=["Route Sharing"])

SHARE_TTL_DAYS = 7


class ShareRouteRequest(BaseModel):
    start_address: Optional[str] = None
    end_address: Optional[str] = None
    route_data: dict  # full GeoJSON FeatureCollection


class ShareRouteResponse(BaseModel):
    token: str
    expires_at: str
    share_url: str


@router.post("/share", response_model=ShareRouteResponse)
def share_route(
    body: ShareRouteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    token = uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=SHARE_TTL_DAYS)

    shared = SharedRoute(
        token=token,
        user_id=current_user.id,
        start_address=body.start_address,
        end_address=body.end_address,
        route_data=body.route_data,
        expires_at=expires_at,
    )
    db.add(shared)
    db.commit()
    logger.info("Route shared", extra={"user_id": current_user.id, "token": token})

    return {"token": token, "expires_at": expires_at.isoformat(), "share_url": f"/shared/{token}"}


@router.get("/share/{token}")
def get_shared_route(token: str, db: Session = Depends(get_db)):
    shared = db.query(SharedRoute).filter(SharedRoute.token == token).first()
    if not shared:
        raise HTTPException(status_code=404, detail="Shared route not found")
    if shared.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="This shared route link has expired")

    return {
        "start_address": shared.start_address,
        "end_address": shared.end_address,
        "route_data": shared.route_data,
        "created_at": shared.created_at.isoformat() if shared.created_at else None,
        "expires_at": shared.expires_at.isoformat(),
    }
