# backend/app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()  # This loads environment variables from .env

DATABASE_URL = os.getenv("DATABASE_URL")  # Should be something like: postgresql://user:password@localhost:5432/your_db

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
