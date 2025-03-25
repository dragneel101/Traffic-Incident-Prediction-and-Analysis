import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.services.predictor import predict_collision_risk

sample_input = {
    "hour": 17,
    "latitude": 43.7,
    "longitude": -79.4,
    "temp_c": -5.0,
    "precip_mm": 0.8,
    "AUTOMOBILE": 1,
    "MOTORCYCLE": 0,
    "PASSENGER": 0,
    "BICYCLE": 0,
    "PEDESTRIAN": 1
}

prob = predict_collision_risk(sample_input)
print(f"Predicted collision probability: {prob}")