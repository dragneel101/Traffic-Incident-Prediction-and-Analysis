import os
import geopandas as gpd
import numpy as np
import pickle
from sklearn.neighbors import NearestNeighbors

# Get absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
data_file = os.path.join(BASE_DIR, "../Data/Traffic_Collisions_Open_Data.geojson")
model_file = os.path.join(BASE_DIR, "../Data/model.pkl")

def load_geojson():
    """Loads GeoJSON traffic data and extracts coordinates."""
    if not os.path.exists(data_file):
        print("[ERROR] GeoJSON file not found. Please check the data path.")
        return None

    try:
        print("[INFO] Loading GeoJSON file...")
        df = gpd.read_file(data_file)
        
        # Ensure only Point geometries are used
        df = df[df['geometry'].geom_type == 'Point']
        if df.empty:
            print("[ERROR] No valid Point geometries found in dataset.")
            return None

        print(f"[SUCCESS] GeoJSON Data Loaded: {df.shape[0]} records")
        return df[['geometry']]
    
    except Exception as e:
        print(f"[ERROR] Error loading GeoJSON: {e}")
        return None

def train_spatial_model(df):
    """Trains and saves the Nearest Neighbors model."""
    if df is None or df.empty:
        print("[ERROR] No data available for training.")
        return None

    print("[INFO] Extracting coordinates...")
    coords = np.array([(p.x, p.y) for p in df.geometry])

    print("[INFO] Training Nearest Neighbors model...")
    model = NearestNeighbors(n_neighbors=5, algorithm='ball_tree').fit(coords)
    print("[SUCCESS] Model training completed.")

    print("[INFO] Saving trained model...")
    with open(model_file, 'wb') as f:
        pickle.dump(model, f)
    print(f"[SUCCESS] Model saved at {model_file}")

if __name__ == "__main__":
    print("[INFO] Starting training process...")
    data = load_geojson()
    
    if data is not None:
        train_spatial_model(data)
    else:
        print("[ERROR] Training failed due to missing or invalid data.")
