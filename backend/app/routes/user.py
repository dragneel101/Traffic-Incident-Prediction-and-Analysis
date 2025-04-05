# backend/app/routes/user.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth.dependencies import get_current_user
from app.database import SessionLocal
from app.models.user import User

router = APIRouter()

class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    phone_number: str | None = None

@router.put("/profile")
def update_profile(data: ProfileUpdateRequest, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    # Retrieve the current user from the database
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields if provided
    if data.name is not None:
        user.name = data.name
    if data.phone_number is not None:
        user.phone_number = data.phone_number
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone_number": user.phone_number
        }
    }


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "phone_number": current_user.phone_number
    }
