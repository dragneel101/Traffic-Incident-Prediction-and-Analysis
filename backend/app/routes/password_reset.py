# backend/app/routes/password_reset.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from app.database import SessionLocal
from app.models import User
from app.auth.jwt_handler import create_access_token, decode_access_token
from app.auth.utils import hash_password
from app.notifications.email import send_reset_email

router = APIRouter(prefix="/password-reset", tags=["Password Reset"])

class ResetRequest(BaseModel):
    email: EmailStr

class ResetConfirm(BaseModel):
    token: str
    new_password: str

@router.post("/request")
async def request_reset(data: ResetRequest, background_tasks: BackgroundTasks):
    db = SessionLocal()
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # To avoid revealing existence of an email, you might return a generic response.
        raise HTTPException(status_code=404, detail="User not found")
    
    reset_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=15)
    )
    
    # Add the email sending task
    background_tasks.add_task(send_reset_email, email_to=data.email, reset_token=reset_token)
    
    return {"message": "Password reset email sent. Please check your inbox."}

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
    
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password has been reset successfully"}
