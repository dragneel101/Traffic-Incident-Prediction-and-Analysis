# backend/app/models/analytics.py
from sqlalchemy import Column, Integer, String, Float, Numeric, DateTime, CheckConstraint, func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.database import Base

Base = declarative_base()
# SQLAlchemy model to store individual prediction requests
class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    # Primary key ID (auto-incremented)
    id = Column(Integer, primary_key=True, index=True)

    # ID of the user who made the prediction (now as Integer)
    user_id = Column(Integer, nullable=True)  # Change this to Integer

    # Starting point of the route (stored as "lat,lon")
    start_location = Column(String)

    # Ending point of the route (stored as "lat,lon")
    end_location = Column(String)

    # Timestamp when the prediction was requested (defaults to current UTC time)
    timestamp = Column(DateTime, default=datetime.utcnow)

    start_address = Column(String, nullable=True)  # New field for start address
    end_address = Column(String, nullable=True)    # New field for end address
    collision_risk= Column(Numeric(5, 2), nullable=False)
