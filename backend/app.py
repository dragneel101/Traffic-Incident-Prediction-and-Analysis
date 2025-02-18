import os
import geopandas as gpd
import pandas as pd
import numpy as np
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# File paths for the GeoJSON dataset and trained model
print("[INFO] Loading FIle paths")
geojson_file = "./Traffic_Collisions_Open_Data.geojson"
model_file = "./model.pkl"

def load_geojson():
    """Loads the GeoJSON dataset if it exists."""
    print("[INFO] Checking if GeoJSON file exists...")
    if not os.path.exists(geojson_file):
        print(f"[ERROR] GeoJSON file '{geojson_file}' not found.")
        return None
    try:
        print("[INFO] Loading GeoJSON file...")
        df_geojson = gpd.read_file(geojson_file)
        print(f"[SUCCESS] GeoJSON Data Loaded: {df_geojson.shape[0]} records")
        return df_geojson
    except Exception as e:
        print(f"[ERROR] Error loading GeoJSON: {e}")
        return None

def train_and_save_model(df_geojson):
    """Trains and saves the machine learning model, or loads an existing one."""
    print("[INFO] Checking if model already exists...")
    if os.path.exists(model_file):
        print("[INFO] Loading existing model...")
        with open(model_file, 'rb') as f:
            return pickle.load(f)
    
    if df_geojson is None or df_geojson.empty:
        print("[ERROR] No data available for training.")
        return None
    
    print("[INFO] Preparing Training Data...")
    features = ['OCC_HOUR', 'OCC_DOW', 'OCC_MONTH', 'AUTOMOBILE', 'MOTORCYCLE', 'PASSENGER', 'BICYCLE', 'PEDESTRIAN']
    target = 'INJURY_COLLISIONS'

    if target not in df_geojson.columns:
        print("[ERROR] Target variable 'INJURY_COLLISIONS' not found.")
        return None

    df_geojson = df_geojson.dropna(subset=[target])
    X = pd.get_dummies(df_geojson[features])
    y = df_geojson[target]
    
    if y.isnull().any():
        print("[ERROR] Target variable contains NaN values. Exiting.")
        return None
    
    if y.dtype == 'O':
        y = y.astype('category').cat.codes

    print("[INFO] Splitting dataset into training and testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("[INFO] Training RandomForest Model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    print("[SUCCESS] Model Training Completed.")
    
    print("[INFO] Saving trained model...")
    with open(model_file, 'wb') as f:
        pickle.dump(model, f)
    print("[SUCCESS] Model saved successfully.")
    return model

df_geojson = load_geojson()
model = train_and_save_model(df_geojson)

if model is None:
    raise SystemExit("[ERROR] Model training failed. Exiting application.")

# Initialize Flask API
app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    """Handles prediction requests from clients."""
    print("[INFO] Received Prediction Request...")
    data = request.get_json()
    input_df = pd.DataFrame([data])
    input_df = pd.get_dummies(input_df)
    
    missing_cols = set(model.feature_names_in_) - set(input_df.columns)
    for col in missing_cols:
        input_df[col] = 0
    input_df = input_df.reindex(columns=model.feature_names_in_, fill_value=0)
    
    prediction = model.predict(input_df)
    print(f"[SUCCESS] Prediction Completed: {prediction[0]}")
    return jsonify({'predicted_injury_collisions': str(prediction[0])})

@app.route('/')
def home():
    """Returns a simple message to confirm the API is running."""
    return "Traffic Predictor API is running. Use /predict endpoint."

if __name__ == "__main__":
    print("[INFO] Starting Flask Server...")
    app.run(debug=False, host='0.0.0.0', port=5000)
