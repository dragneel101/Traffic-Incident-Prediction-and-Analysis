from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ping

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

@app.get("/")
def root():
    return {"message": "🚦 Traffic Predictor API is running"}
