import math
from datetime import datetime


def extract_time_features(timestamp: str) -> dict:
    """
    Extract time-based features from an ISO 8601 timestamp string.
    Example input: "2025-03-22T08:30:00"
    """
    dt = datetime.fromisoformat(timestamp)
    return {
        "hour": dt.hour,
        "weekday": dt.weekday(),
        "is_weekend": int(dt.weekday() >= 5),
        "is_rush_hour": int(dt.hour in [7, 8, 9, 16, 17, 18]),
    }


def _hour_features(hour: int) -> dict:
    """Cyclical encoding of hour + rush-hour flag, matching model FEATURE_ORDER."""
    return {
        "hour_sin":     math.sin(2 * math.pi * hour / 24),
        "hour_cos":     math.cos(2 * math.pi * hour / 24),
        "is_rush_hour": int(hour in [7, 8, 9, 16, 17, 18]),
    }


def extract_features_for_point(lat: float, lon: float) -> dict:
    """
    Build a full feature dictionary for a location using:
    - Real-time weather from OpenWeatherMap
    - Real-time traffic flow from HERE Traffic API
    - Current time

    The ML model fields (hour, latitude, longitude, temp_c, precip_mm, vehicle types)
    are always present. Traffic fields (congestion_level, jam_factor) are included
    for the weighted scoring formula and for the next model version.
    """
    from app.services.weather import get_weather
    from app.services.traffic import get_traffic_flow

    now = datetime.now()

    try:
        weather = get_weather(lat, lon)
        temp_c = weather["temp_c"]
        precip_mm = weather["precip_mm"]
    except Exception:
        temp_c = 10.5
        precip_mm = 0.0

    try:
        flow = get_traffic_flow(lat, lon)
        congestion_level = flow["congestion_level"]
        jam_factor = flow["jam_factor"]
    except Exception:
        congestion_level = 0.0
        jam_factor = 0.0

    time_feats = _hour_features(now.hour)

    return {
        # Model features — must match FEATURE_ORDER in predictor.py / train_model.py
        "hour_sin":     time_feats["hour_sin"],
        "hour_cos":     time_feats["hour_cos"],
        "is_rush_hour": time_feats["is_rush_hour"],
        "latitude":     lat,
        "longitude":    lon,
        "temp_c":       temp_c,
        "precip_mm":    precip_mm,
        "AUTOMOBILE":   1,
        "MOTORCYCLE":   0,
        "PASSENGER":    0,
        "BICYCLE":      0,
        "PEDESTRIAN":   0,
        # Live traffic — NOT model inputs; used as post-model multiplier in predictor.py
        "congestion_level": congestion_level,
        "jam_factor":       jam_factor,
    }
