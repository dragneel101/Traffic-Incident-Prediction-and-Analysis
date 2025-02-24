import os
import geopandas as gpd
import numpy as np
import pickle
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sklearn.neighbors import NearestNeighbors

# Initialize Flask App
app = Flask(__name__, static_folder="static")
CORS(app, origins=["*"])  # 🔥 Allow all origins (Temporary fix for debugging)

# File Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
data_file = os.path.join(BASE_DIR, "../Data/Traffic_Collisions_Open_Data.geojson")
model_file = os.path.join(BASE_DIR, "../Data/model.pkl")

# API Key for Mapbox
MAPBOX_API_KEY = "sk.eyJ1Ijoia2hhaXR1ciIsImEiOiJjbTdlZGc1ZHEwY3RoMmtvZWVteTd3N2FoIn0.YKCU9Yip1CMYgyI4kH-4-Q"

# Function to load model
def load_model():
    if os.path.exists(model_file):
        print("[INFO] Loading existing model...")
        with open(model_file, 'rb') as f:
            return pickle.load(f)
    else:
        print("[ERROR] Model file missing. Run `train_model.py` first.")
        return None

# Load model at startup
spatial_model = load_model()

# Serve Static Files (Frontend)
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

# Prediction API
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    start_address = data.get('start_address')
    end_address = data.get('end_address')

    if not start_address or not end_address:
        return jsonify({'error': 'Invalid input. Both addresses are required.'}), 400

    # Get coordinates
    start_coords = get_coordinates(start_address)
    end_coords = get_coordinates(end_address)

    if not start_coords or not end_coords:
        return jsonify({'error': 'Could not geocode addresses.'}), 400

    # Make Prediction
    try:
        distances, _ = spatial_model.kneighbors([start_coords, end_coords])
        risk_score = np.mean(distances)
        return jsonify({'collision_risk': float(risk_score)})
    except Exception as e:
        print(f"[ERROR] Prediction error: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

# Function to get coordinates using Mapbox API
def get_coordinates(address):
    try:
        url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{address.replace(' ', '%20')}.json"
        params = {"access_token": MAPBOX_API_KEY, "limit": 1, "country": "CA"}
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()

        if data.get("features"):
            location = data["features"][0]["center"]
            return float(location[1]), float(location[0])
    except requests.RequestException as e:
        print(f"[ERROR] Mapbox API error: {e}")

    return None

# Run Flask Server
if __name__ == "__main__":
    print("[INFO] Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
