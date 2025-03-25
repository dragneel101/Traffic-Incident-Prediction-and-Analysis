import joblib
import os
import numpy as np
import pandas as pd

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
