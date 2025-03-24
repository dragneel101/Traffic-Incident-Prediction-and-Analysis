import pandas as pd
import os
import warnings
import time
from meteostat import Stations, Hourly, Daily
from datetime import timedelta
from tqdm import tqdm

# Suppress future warnings (optional)
warnings.filterwarnings("ignore", category=FutureWarning)

# ✅ Load cleaned dataset
file_path = os.path.join("data", "processed", "toronto_cleaned.csv")
if not os.path.exists(file_path):
    raise FileNotFoundError(f"File not found: {file_path}")

selected = pd.read_csv(file_path)
print(f"✅ Loaded {len(selected)} rows from toronto_cleaned.csv")

# Optional: reduce size for testing
#selected = selected.head(100)

# Add weather fields
selected["temp_c"] = None
selected["precip_mm"] = None
selected["weather_code"] = None

print("🌦️ Enriching with weather data from Meteostat...")
for i in tqdm(range(len(selected))):
    row = selected.iloc[i]
    lat, lon, dt = row["latitude"], row["longitude"], pd.to_datetime(row["datetime"])
    try:
        stations = Stations().nearby(lat, lon).fetch(1)
        if not stations.empty:
            station_id = stations.index[0]
            start = dt - timedelta(hours=1)
            end = dt + timedelta(hours=1)
            weather = Hourly(station_id, start, end).fetch()
            if weather.empty:
                weather = Daily(station_id, dt, dt).fetch()
            if not weather.empty:
                record = weather.iloc[0]
                selected.at[i, "temp_c"] = record.get("temp", None)
                selected.at[i, "precip_mm"] = record.get("prcp", None)
                selected.at[i, "weather_code"] = record.get("coco", None)
    except Exception as e:
        print(f"⚠️ Row {i} failed: {e}")
    time.sleep(0.1)  # Optional sleep for rate limit safety

# Save enriched dataset
output_path = os.path.join("data", "processed", "toronto_enriched.csv")
os.makedirs(os.path.dirname(output_path), exist_ok=True)
selected.to_csv(output_path, index=False)
print(f"✅ Weather-enriched data saved to: {output_path}")

