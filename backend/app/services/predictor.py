import joblib
import os
import numpy as np
import pandas as pd
from app.logging_config import get_logger
from app.services.features import extract_features_for_point

logger = get_logger(__name__)

MODEL_PATH = os.path.join("app", "models", "collision_risk_model.pkl")
_model = None


def _get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(
                f"Model file not found at {os.path.abspath(MODEL_PATH)}. "
                "Ensure the S3 download completed successfully before uvicorn started."
            )
        logger.info("Loading ML model from %s", MODEL_PATH)
        _model = joblib.load(MODEL_PATH)
    return _model

# Must match train_model.py FEATURE_ORDER exactly.
# congestion_level / jam_factor are intentionally excluded — all historical
# training rows have congestion = 0, so the model cannot learn from it.
# Live congestion is applied as a post-model multiplier below instead.
FEATURE_ORDER = [
    "hour_sin", "hour_cos", "is_rush_hour",
    "latitude", "longitude", "temp_c", "precip_mm",
    "AUTOMOBILE", "MOTORCYCLE", "PASSENGER", "BICYCLE", "PEDESTRIAN",
]


def predict_collision_risk(input_data: dict, jam_factor: float = 0.0) -> float:
    """
    Returns collision risk as a percentage (0–100).

    jam_factor (0–10 from HERE API) boosts the base ML probability to
    reflect live congestion — up to +40% at maximum congestion.
    """
    features = pd.DataFrame([input_data], columns=FEATURE_ORDER)
    prob = _get_model().predict_proba(features)[0][1]
    # Congestion multiplier: jam_factor 0 → ×1.0, jam_factor 10 → ×1.4
    congestion_boost = 1.0 + min(jam_factor / 10.0, 1.0) * 0.40
    return round(min(float(prob) * congestion_boost * 100, 100.0), 2)


def evaluate_route_risk(coords: list, sample_step: int = 10) -> float:
    """
    Evaluates average collision risk over a route.
    - coords: List of {"latitude": ..., "longitude": ...}
    - sample_step: Sample every nth point to speed up processing
    """
    risks = []

    for i in range(0, len(coords), sample_step):
        point = coords[i]
        features = extract_features_for_point(point["latitude"], point["longitude"])

        # Separate live traffic from model inputs
        jam_factor = features.get("jam_factor", 0.0)
        input_data = {key: features.get(key, 0) for key in FEATURE_ORDER}
        prob = predict_collision_risk(input_data, jam_factor=jam_factor)
        risks.append(prob)

    if not risks:
        return 0.0

    return round(float(np.mean(risks)), 2)

