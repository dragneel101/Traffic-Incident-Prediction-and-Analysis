from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ping, predict,route_risk
from pydantic import BaseModel
from typing import List



app = FastAPI(title="Traffic Risk Prediction API")

# CORS setup to allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ping.router)
app.include_router(predict.router, prefix="/api")
app.include_router(route_risk.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "🚦 Traffic Predictor API is running"}
