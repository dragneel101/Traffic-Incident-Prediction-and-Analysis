from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ping, predict,route_risk, auth, user, password_reset, stats
from pydantic import BaseModel
from typing import List



app = FastAPI(title="Traffic Risk Prediction API")

# CORS setup to allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://traffic.khaitu.ca","https://trafficapi.khaitu.ca/api/stats/total",
                   "https://trafficapi.khaitu.ca/api/stats/timeseries",
                   "https://trafficapi.khaitu.ca/api/stats/frequent",
                   "https://trafficapi.khaitu.ca/api/stats/recent",
                   " https://trafficapi.khaitu.ca/api/predict/multiple_route_risks"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ping.router)
app.include_router(predict.router, prefix="/api")
app.include_router(route_risk.router, prefix="/api")
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(password_reset.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {"message": "🚦 Traffic Predictor API is running"}
