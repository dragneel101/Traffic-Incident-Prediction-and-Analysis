import os
import geopandas as gpd
import pandas as pd
import numpy as np
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Load Data
geojson_file = "C:/Users/raish/Documents/Application/backend/Traffic_Collisions_Open_Data.geojson"
model_file = "C:/Users/raish/Documents/Application/backend/model.pkl"

def load_geojson():
    print("[INFO] Checking if GeoJSON file exists...")
    if not os.path.exists(geojson_file):
        print(f"[ERROR] GeoJSON file '{geojson_file}' not found.")
        return None
    try:
        print("[INFO] Loading GeoJSON file...")
        df_geojson = gpd.read_file(geojson_file)
        print("[SUCCESS] GeoJSON Data Loaded Successfully")
    except Exception as e:
        print(f"[ERROR] Error loading GeoJSON: {e}")
        df_geojson = None
    return df_geojson

def train_and_save_model(df_geojson):
    print("[INFO] Checking if model already exists...")
    if os.path.exists(model_file):
        print("[INFO] Loading existing model...")
        with open(model_file, 'rb') as f:
            model = pickle.load(f)
        return model
    
    print("[INFO] Preparing Training and Testing Data...")
    features = ['OCC_HOUR', 'OCC_DOW', 'OCC_MONTH', 'AUTOMOBILE', 'MOTORCYCLE', 'PASSENGER', 'BICYCLE', 'PEDESTRIAN']
    target = 'INJURY_COLLISIONS'

    if df_geojson is not None and target in df_geojson.columns:
        df_geojson = df_geojson.dropna(subset=[target])  # Ensure no NaN in target
        
        X = pd.get_dummies(df_geojson[features])
        y = df_geojson[target]
        
        if y.isnull().any():
            print("[ERROR] Target variable contains NaN values. Exiting.")
            return None

        if y.dtype == 'O':  # If object type (string)
            y = y.astype('category').cat.codes  # Convert to categorical integer

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        print("[INFO] Training Machine Learning Model...")
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        print("[SUCCESS] Model Training Complete. Saving model...")

        with open(model_file, 'wb') as f:
            pickle.dump(model, f)
        print("[SUCCESS] Model saved successfully.")
        return model
    else:
        print("[ERROR] Target variable 'INJURY_COLLISIONS' not found in dataset.")
        return None

df_geojson = load_geojson()
model = train_and_save_model(df_geojson)

# Flask API
app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests

@app.route('/predict', methods=['POST'])
def predict():
    print("[INFO] Received Prediction Request...")
    data = request.get_json()
    
    # Convert input data into a DataFrame
    input_df = pd.DataFrame([data])
    input_df = pd.get_dummies(input_df)
    
    # Align features with training data
    missing_cols = set(model.feature_names_in_) - set(input_df.columns)
    for col in missing_cols:
        input_df[col] = 0
    input_df = input_df.reindex(columns=model.feature_names_in_, fill_value=0)  # Ensure column order matches
    
    prediction = model.predict(input_df)
    print(f"[SUCCESS] Prediction Completed: {prediction[0]}")
    return jsonify({'predicted_injury_collisions': str(prediction[0])})

@app.route('/')
def home():
    return "Traffic Predictor API is running. Use /predict endpoint."

if __name__ == "__main__":
    print("[INFO] Starting Flask Server...")
    app.run(debug=False, host='0.0.0.0', port=5000)