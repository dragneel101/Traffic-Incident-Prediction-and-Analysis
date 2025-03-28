# backend/app/routes/password_reset.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from app.database import SessionLocal
from app.models import User
from app.auth.jwt_handler import create_access_token, decode_access_token
from app.auth.utils import hash_password

router = APIRouter(prefix="/password-reset", tags=["Password Reset"])

# Request model for initiating a password reset
class ResetRequest(BaseModel):
    email: EmailStr

# Request model for confirming a password reset
class ResetConfirm(BaseModel):
    token: str
    new_password: str

@router.post("/request")
def request_reset(data: ResetRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # For security, you might not reveal if an email exists.
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create a reset token valid for 15 minutes
    reset_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=15)
    )
    
    # In production, send this token to the user's email.
    # For now, we return it directly.
    return {"reset_token": reset_token}

@router.post("/confirm")
def confirm_reset(data: ResetConfirm):
    payload = decode_access_token(data.token)
    if payload is None:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update the user's password
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password has been reset successfully"}
