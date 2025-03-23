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
