from pydantic import BaseModel
from datetime import datetime

class PredictionLogCreate(BaseModel):
    user_id: int | None = None          # User ID (optional for anonymous)
    start_location: str                 # Start location in "latitude,longitude" format
    end_location: str                   # End location in "latitude,longitude" format
    start_address: str | None = None    # Start address (optional)
    end_address: str | None = None      # End address (optional)

class PredictionLogResponse(PredictionLogCreate):
    id: int                            # Prediction Log ID (auto-generated)
    timestamp: datetime                # Timestamp when the prediction was made

    class Config:
        orm_mode = True                 # Enable ORM mode for automatic data transformation
