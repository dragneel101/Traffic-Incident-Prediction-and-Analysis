from datetime import datetime

def extract_time_features(timestamp: str):
    """
    Extract useful time-based features from a timestamp (ISO format).
    Example input: "2025-03-22T08:30:00"
    """
    dt = datetime.fromisoformat(timestamp)

    return {
        "hour": dt.hour,
        "weekday": dt.weekday(),         # Monday = 0, Sunday = 6
        "is_weekend": int(dt.weekday() >= 5),
        "is_rush_hour": int(dt.hour in [7, 8, 9, 16, 17, 18])
    }


def extract_features_for_point(lat: float, lon: float) -> dict:
    """
    Build feature dictionary for a specific location.
    You can extend this with time, weather, road type, etc.
    """
    # Stub example — replace with real logic
    return {
        "hour": 14,  # you could use current time or simulate a range
        "latitude": lat,
        "longitude": lon,
        "temp_c": 10.5,
        "precip_mm": 0.0,
        "AUTOMOBILE": 1,
        "MOTORCYCLE": 0,
        "PASSENGER": 0,
        "BICYCLE": 0,
        "PEDESTRIAN": 0
    }

