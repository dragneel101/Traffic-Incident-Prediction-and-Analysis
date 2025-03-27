import joblib
import os
import numpy as np
import pandas as pd
from app.services.features import extract_features_for_point

# Load the model once at startup
MODEL_PATH = os.path.join("app", "models", "collision_risk_model.pkl")
model = joblib.load(MODEL_PATH)

# Define input feature order
FEATURE_ORDER = [
    "hour", "latitude", "longitude", "temp_c", "precip_mm",
    "AUTOMOBILE", "MOTORCYCLE", "PASSENGER", "BICYCLE", "PEDESTRIAN"
]

def predict_collision_risk(input_data: dict) -> float:
    """Takes a dictionary of input features and returns collision probability"""
    features = pd.DataFrame([input_data], columns=FEATURE_ORDER)
    prob = model.predict_proba(features)[0][1]  # Probability of class 1 (collision)
    return round(float(prob), 4)


from app.services.features import extract_features_for_point

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
        
        # Ensure keys match FEATURE_ORDER
        input_data = {key: features.get(key, 0) for key in FEATURE_ORDER}
        prob = predict_collision_risk(input_data)
        risks.append(prob)

    if not risks:
        return 0.0

    return round(float(np.mean(risks)), 4)

