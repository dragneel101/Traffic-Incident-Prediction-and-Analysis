import os
import geopandas as gpd
import pandas as pd
import numpy as np
import pickle
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.neighbors import NearestNeighbors

# File paths for data and model
data_file = "./Traffic_Collisions_Open_Data.geojson"
model_file = "./model.pkl"
MAPBOX_API_KEY = "sk.eyJ1Ijoia2hhaXR1ciIsImEiOiJjbTdlZGc1ZHEwY3RoMmtvZWVteTd3N2FoIn0.YKCU9Yip1CMYgyI4kH-4-Q"
MAPBOX_GEOCODE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places/{}.json"

# Function to get coordinates from an address using Mapbox API
def get_coordinates(address):
    print(f"[INFO] Fetching coordinates for address: {address}")
    url = MAPBOX_GEOCODE_URL.format(address.replace(" ", "%20"))
    params = {"access_token": MAPBOX_API_KEY, "limit": 1, "country": "CA"}  # Restricting to Canada
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        if data["features"]:
            location = data["features"][0]["center"]
            print(f"[SUCCESS] Coordinates found: {location[1]}, {location[0]}")
            return float(location[1]), float(location[0])
    
    print("[ERROR] Failed to fetch coordinates. Response:", response.text)
    return None, None

# Function to load GeoJSON data if the model does not exist
def load_geojson():
    print("[INFO] Checking for existing model file...")
    if os.path.exists(model_file):
        print("[INFO] Model file found. Skipping GeoJSON loading.")
        return None
    
    print("[INFO] Checking if GeoJSON file exists...")
    if not os.path.exists(data_file):
        print("[ERROR] GeoJSON file not found.")
        return None
    try:
        print("[INFO] Loading GeoJSON file...")
        df = gpd.read_file(data_file)
        print(f"[SUCCESS] GeoJSON Data Loaded: {df.shape[0]} records")
        return df[['geometry', 'OCC_HOUR', 'OCC_DOW', 'OCC_MONTH']]
    except Exception as e:
        print(f"[ERROR] Error loading GeoJSON: {e}")
        return None

# Function to train and save the Nearest Neighbors model
def train_spatial_model(df):
    if os.path.exists(model_file):
        print("[INFO] Loading existing model...")
        with open(model_file, 'rb') as f:
            return pickle.load(f)
    
    if df is None or df.empty:
        print("[ERROR] No data available for training.")
        return None
    
    print("[INFO] Preparing training data...")
    coords = np.array([(p.x, p.y) for p in df.geometry])
    
    print("[INFO] Training Nearest Neighbors model...")
    model = NearestNeighbors(n_neighbors=5, algorithm='ball_tree').fit(coords)
    print("[SUCCESS] Model training completed.")
    
    print("[INFO] Saving trained model...")
    with open(model_file, 'wb') as f:
        pickle.dump(model, f)
    print("[SUCCESS] Model saved successfully.")
    return model

# Load or train model
print("[INFO] Initializing system...")
data = load_geojson()
spatial_model = train_spatial_model(data)
if spatial_model is None:
    print("[ERROR] Model initialization failed. Exiting application.")
    raise SystemExit

# Initialize Flask API
app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    print("[INFO] Received prediction request...")
    data = request.get_json()
    start_address = data.get('start_address')
    end_address = data.get('end_address')
    
    start_lat, start_lon = get_coordinates(start_address)
    end_lat, end_lon = get_coordinates(end_address)
    
    if None in (start_lat, start_lon, end_lat, end_lon):
        print("[ERROR] Could not geocode addresses.")
        return jsonify({'error': 'Invalid address. Unable to get coordinates.'}), 400
    
    if not spatial_model:
        print("[ERROR] Model not available.")
        return jsonify({'error': 'Model not available'}), 500
    
    print("[INFO] Calculating nearest collisions...")
    distances, _ = spatial_model.kneighbors([(start_lat, start_lon), (end_lat, end_lon)])
    risk_score = np.mean(distances)
    print(f"[SUCCESS] Prediction completed. Risk Score: {risk_score}")
    
    return jsonify({'collision_risk': float(risk_score)})

@app.route('/')
def home():
    print("[INFO] API is running...")
    return "Collision Prediction API is running. Use /predict endpoint."

if __name__ == "__main__":
    print("[INFO] Starting Flask server...")
    app.run(debug=False, host='0.0.0.0', port=5000)
