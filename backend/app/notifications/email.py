# backend/app/notifications/email.py
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv
import os

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS") == "True",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS") == "True",
    USE_CREDENTIALS=os.getenv("USE_CREDENTIALS") == "True",
    VALIDATE_CERTS=os.getenv("VALIDATE_CERTS") == "True",
)

async def send_reset_email(email_to: str, reset_token: str):
    message = MessageSchema(
        subject="Password Reset Request",
        recipients=[email_to],
        body=f"Click the link to reset your password: https://testing.khaitu.ca/reset?token={reset_token}",
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)



async def send_signup_email(email_to: str):
    message = MessageSchema(
        subject="Welcome to Collision Predictor",
        recipients=[email_to],
        body=(
            "Thank you for signing up with Collision Predictor!<br/><br/>"
            "You can now log in by clicking the following link:<br/>"
            "<a href='https://testing.khaitu.ca/login'>Login Here</a><br/><br/>"
            "We are excited to have you onboard."
        ),
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)