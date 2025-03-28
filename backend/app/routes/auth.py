from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import SessionLocal
from app.models import User
from app.auth.utils import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.notifications.email import send_signup_email

router = APIRouter()

# Request models
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    phone_number: str | None = None

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
def sign_up(data: SignUpRequest, background_tasks: BackgroundTasks):
    db: Session = SessionLocal()
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already in use"
        )
    
    new_user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        name=data.name,
        phone_number=data.phone_number
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Add task to send a welcome email with a login link
    background_tasks.add_task(send_signup_email, email_to=data.email)
    
    return {"message": "User created successfully! Please check your email to log in.", "user_id": new_user.id}

@router.post("/signin")
def sign_in(data: SignInRequest):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(hours=1)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
