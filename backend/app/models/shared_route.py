from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from datetime import datetime, timezone
from app.database import Base


class SharedRoute(Base):
    __tablename__ = "shared_routes"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    start_address = Column(String, nullable=True)
    end_address = Column(String, nullable=True)
    route_data = Column(JSON, nullable=False)  # full GeoJSON FeatureCollection
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
