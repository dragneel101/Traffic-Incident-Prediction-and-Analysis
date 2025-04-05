# backend/init_db.py
from app.database import engine
from app.models.user import Base
from app.models.analytics import PredictionLog

def init_db():
    Base.metadata.create_all(bind=engine)
    PredictionLog.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database tables created successfully!")
