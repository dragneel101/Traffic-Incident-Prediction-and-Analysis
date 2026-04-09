import hashlib
from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Depends, Request
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.auth.utils import hash_password, verify_password
from app.auth.jwt_handler import create_access_token, create_refresh_token, decode_refresh_token
from app.notifications.email import send_signup_email
from app.limiter import limiter
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    phone_number: str | None = None

    @field_validator("password")
    @classmethod
    def password_max_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 bytes or fewer")
        return v


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


@router.post("/signup", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def sign_up(request: Request, data: SignUpRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already in use")

    new_user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        name=data.name,
        phone_number=data.phone_number,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    background_tasks.add_task(send_signup_email, email_to=data.email)
    logger.info("user_signup", extra={"user_id": new_user.id, "email": data.email})

    return {"message": "User created successfully! Please check your email to log in.", "user_id": new_user.id}


@router.post("/signin")
@limiter.limit("10/minute")
async def sign_in(request: Request, data: SignInRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=timedelta(hours=1))
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    db.add(RefreshToken(
        user_id=user.id,
        token_hash=_hash_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    ))
    db.commit()

    logger.info("user_signin", extra={"user_id": user.id})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/refresh")
def refresh_access_token(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_refresh_token(data.refresh_token)
    user_id = int(payload["sub"])

    stored = db.query(RefreshToken).filter(
        RefreshToken.token_hash == _hash_token(data.refresh_token),
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.now(timezone.utc),
    ).first()

    if not stored:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalid or revoked")

    new_access_token = create_access_token(data={"sub": str(user_id)}, expires_delta=timedelta(hours=1))
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(data: LogoutRequest, db: Session = Depends(get_db)):
    stored = db.query(RefreshToken).filter(
        RefreshToken.token_hash == _hash_token(data.refresh_token)
    ).first()
    if stored:
        stored.revoked = True
        db.commit()
    return {"message": "Logged out successfully"}
