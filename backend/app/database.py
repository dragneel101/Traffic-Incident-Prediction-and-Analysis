# backend/app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the DATABASE_URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the SQLAlchemy engine (echo=True enables SQL logging)
engine = create_engine(
    DATABASE_URL,
    pool_size=10,         # Number of connections to keep in the pool
    max_overflow=20,      # Extra connections allowed temporarily
    pool_timeout=30,      # Wait time before throwing TimeoutError
    pool_pre_ping=True    # Recycle dead connections
)

# Create a session factory bound to the engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models to inherit from
Base = declarative_base()

# Dependency function for getting DB session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()