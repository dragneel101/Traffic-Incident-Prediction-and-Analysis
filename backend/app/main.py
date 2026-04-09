from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

load_dotenv()

from app.logging_config import setup_logging
from app.limiter import limiter
from app.routes import ping, predict, route_risk, auth, user, password_reset, stats, traffic

setup_logging()

app = FastAPI(title="Traffic Risk Prediction API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://traffic.khaitu.ca", "https://trafficapi.khaitu.ca", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ping.router)
app.include_router(predict.router, prefix="/api")
app.include_router(route_risk.router, prefix="/api")
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(password_reset.router)
app.include_router(stats.router)
app.include_router(traffic.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Traffic Predictor API is running"}
