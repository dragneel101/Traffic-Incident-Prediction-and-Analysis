"""
preprocess_ontario.py
---------------------
Combines collision datasets (Toronto, Ottawa, Hamilton, Waterloo, Halifax)
into a single ontario_combined.csv ready for model training.

Output schema matches FEATURE_ORDER in train_model.py:
  hour, latitude, longitude, temp_c, precip_mm,
  AUTOMOBILE, MOTORCYCLE, PASSENGER, BICYCLE, PEDESTRIAN,
  congestion_level, jam_factor, injury, fatal
"""

import os
import sys

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "raw")
PROCESSED = os.path.join(BASE, "processed")
os.makedirs(PROCESSED, exist_ok=True)

# ---------------------------------------------------------------------------
# Weather proxy: road/environment condition → (temp_c, precip_mm)
# Used for cities without OpenWeatherMap enrichment.
# ---------------------------------------------------------------------------
ROAD_WEATHER = {
    # Ontario standard values
    "dry":                  (15.0, 0.0),
    "wet":                  (8.0,  2.0),
    "loose snow":           (-5.0, 3.0),
    "packed snow":          (-4.0, 1.5),
    "ice":                  (-7.0, 0.5),
    "slush":                (-1.0, 2.0),
    "mud":                  (5.0,  3.0),
    "loose sand or gravel": (15.0, 0.0),
    "spilled liquid":       (10.0, 0.5),
    "spilled fluid":        (10.0, 0.5),
    "snow":                 (-3.0, 3.0),
    "rain":                 (8.0,  4.0),
    "freezing rain":        (-2.0, 3.0),
    "drifting snow":        (-6.0, 2.0),
    "fog, mist, smoke, dust": (10.0, 0.0),
    "strong wind":          (10.0, 0.0),
    "clear":                (15.0, 0.0),
    "other":                (10.0, 0.0),
    # Halifax Road Surface extended values
    "dry - normal":                        (15.0, 0.0),
    "wet":                                 (8.0,  2.0),   # already covered above
    "snow - wet":                          (-1.0, 2.5),
    "snow - dry":                          (-5.0, 3.0),
    "ice":                                 (-7.0, 0.5),   # already covered above
    "loose - excess sand, gravel or dirt": (15.0, 0.0),
    "slush":                               (-1.0, 2.0),   # already covered above
    "mud or dirt":                         (5.0,  3.0),
}

def road_to_weather(condition_raw: str):
    """Map a road/environment condition string to (temp_c, precip_mm)."""
    if pd.isna(condition_raw):
        return (10.0, 0.0)
    key = str(condition_raw).lower().strip()
    # Strip leading numeric codes like "01 - "
    if " - " in key:
        key = key.split(" - ", 1)[1].strip()
    return ROAD_WEATHER.get(key, (10.0, 0.0))


# ---------------------------------------------------------------------------
# 1. Toronto — use the existing enriched sample (real weather via OpenWeather)
# ---------------------------------------------------------------------------
def load_toronto():
    path = os.path.join(PROCESSED, "toronto_enriched_sample.csv")
    df = pd.read_csv(path)
    print(f"Toronto enriched sample: {len(df)} rows")

    out = pd.DataFrame(index=df.index)
    out["hour"]       = df["hour"]
    out["latitude"]   = df["latitude"]
    out["longitude"]  = df["longitude"]
    out["temp_c"]     = df["temp_c"].fillna(10.0)   # fill remaining NaN with mild default
    out["precip_mm"]  = df["precip_mm"].fillna(0.0)
    out["AUTOMOBILE"] = df["AUTOMOBILE"].astype(int)
    out["MOTORCYCLE"] = df["MOTORCYCLE"].astype(int)
    out["PASSENGER"]  = df["PASSENGER"].astype(int)
    out["BICYCLE"]    = df["BICYCLE"].astype(int)
    out["PEDESTRIAN"] = df["PEDESTRIAN"].astype(int)
    out["injury"]     = df["injury"].astype(int)
    out["fatal"]      = df["fatal"].astype(int)
    out["source"]     = "toronto"
    return out


# ---------------------------------------------------------------------------
# 2. Ottawa — Accident_Time → hour, Lat/Long direct, Classification → target
# ---------------------------------------------------------------------------
def load_ottawa():
    path = os.path.join(RAW, "collisions_Ottawa.csv")
    df = pd.read_csv(path)
    print(f"Ottawa raw: {len(df)} rows")

    # Parse hour from "H:MM" or "HH:MM" string
    def parse_hour(t):
        try:
            return int(str(t).split(":")[0])
        except Exception:
            return 12  # default to noon

    out = pd.DataFrame(index=df.index)
    out["hour"]      = df["Accident_Time"].apply(parse_hour)
    out["latitude"]  = pd.to_numeric(df["Lat"],  errors="coerce")
    out["longitude"] = pd.to_numeric(df["Long"], errors="coerce")

    # Weather proxy from road surface condition
    weather = df["Road_Surface_Condition"].apply(road_to_weather)
    out["temp_c"]    = weather.apply(lambda x: x[0])
    out["precip_mm"] = weather.apply(lambda x: x[1])

    # Vehicle involvement
    out["AUTOMOBILE"] = (~(df["Num_of_Bicycles"].fillna(0) > 0) &
                          ~(df["Num_of_Motorcycles"].fillna(0) > 0) &
                          ~(df["Num_Of_Pedestrians"].fillna(0) > 0) &
                          (df["Num_of_Vehicle"].fillna(0) > 0)).astype(int)
    out["MOTORCYCLE"] = (df["Num_of_Motorcycles"].fillna(0) > 0).astype(int)
    out["PASSENGER"]  = out["AUTOMOBILE"].copy()  # passengers ride in automobiles
    out["BICYCLE"]    = (df["Num_of_Bicycles"].fillna(0) > 0).astype(int)
    out["PEDESTRIAN"] = (df["Num_Of_Pedestrians"].fillna(0) > 0).astype(int)

    # Target — "01 - Fatal injury" and "02 - Non-fatal injury"
    classification = df["Classification_Of_Accident"].fillna("")
    out["fatal"]    = (classification == "01 - Fatal injury").astype(int)
    out["injury"]   = classification.isin(["01 - Fatal injury", "02 - Non-fatal injury"]).astype(int)
    out["source"]   = "ottawa"

    # Drop rows with missing coordinates
    out = out.dropna(subset=["latitude", "longitude"])
    print(f"Ottawa after cleaning: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# 3. Hamilton — no lat/lon → assign city centroid; no hour → impute 14
# ---------------------------------------------------------------------------
HAMILTON_LAT = 43.2557
HAMILTON_LON = -79.8711

def load_hamilton():
    path = os.path.join(RAW, "collisions_hamilton.csv")
    df = pd.read_csv(path)
    print(f"Hamilton raw: {len(df)} rows")

    out = pd.DataFrame(index=df.index)
    out["hour"]      = 14  # no hour available — use typical afternoon peak
    out["latitude"]  = HAMILTON_LAT
    out["longitude"] = HAMILTON_LON

    # Weather proxy from road surface condition
    weather = df["ROAD_1_SURFACE_CONDITION"].apply(road_to_weather)
    out["temp_c"]    = weather.apply(lambda x: x[0])
    out["precip_mm"] = weather.apply(lambda x: x[1])

    # Vehicle type flags
    v1 = df["VEHICLE_1_TYPE"].fillna("").str.lower()
    v2 = df["VEHICLE_2_TYPE"].fillna("").str.lower()

    auto_types  = {"automobile, station wagon", "pick-up truck", "passenger van",
                   "delivery van", "police vehicle", "ambulance"}
    moto_types  = {"motorcycle"}
    truck_types = {"truck - tractor", "truck - closed", "truck - dump",
                   "truck-other", "truck - open", "municipal transit bus", "school bus"}

    def flag(series, types):
        return series.isin(types).astype(int)

    out["AUTOMOBILE"] = (flag(v1, auto_types) | flag(v2, auto_types)).clip(0, 1)
    out["MOTORCYCLE"] = (flag(v1, moto_types) | flag(v2, moto_types)).clip(0, 1)
    out["PASSENGER"]  = out["AUTOMOBILE"].copy()
    out["BICYCLE"]    = (df["CYCLIST_INVOLVED"].fillna("No").str.lower() == "yes").astype(int)
    out["PEDESTRIAN"] = (df["PEDESTRIAN_INVOLVED"].fillna("No").str.lower() == "yes").astype(int)

    # Target
    classification = df["CLASSIFICATION_OF_ACCIDENT"].fillna("")
    out["fatal"]    = (classification == "Fatal injury").astype(int)
    out["injury"]   = (classification.isin(["Fatal injury", "Non-fatal injury"])).astype(int)
    out["source"]   = "hamilton"
    print(f"Hamilton after cleaning: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# 4. Waterloo — full fields available; derive weather from environment condition
# ---------------------------------------------------------------------------
def load_waterloo():
    path = os.path.join(RAW, "collisions_waterloo.csv")
    df = pd.read_csv(path)
    print(f"Waterloo raw: {len(df)} rows")

    out = pd.DataFrame(index=df.index)
    out["hour"]      = pd.to_numeric(df["ACCIDENT_HOUR"], errors="coerce").fillna(12).astype(int)
    out["latitude"]  = pd.to_numeric(df["LATITUDE"],     errors="coerce")
    out["longitude"] = pd.to_numeric(df["LONGITUDE"],    errors="coerce")

    # Weather from environment condition (primary)
    weather = df["ENVIRONMENTCONDITION1"].apply(road_to_weather)
    out["temp_c"]    = weather.apply(lambda x: x[0])
    out["precip_mm"] = weather.apply(lambda x: x[1])

    # Vehicle involvement
    out["MOTORCYCLE"] = (df["MOTORCYCLISTINVOLVED"].fillna(False).astype(bool)).astype(int)
    out["BICYCLE"]    = (df["CYCLISTINVOLVED"].fillna(False).astype(bool)).astype(int)
    out["PEDESTRIAN"] = (df["PEDESTRIANINVOLVED"].fillna(False).astype(bool)).astype(int)
    out["AUTOMOBILE"] = (~out["BICYCLE"].astype(bool) &
                          ~out["MOTORCYCLE"].astype(bool) &
                          ~out["PEDESTRIAN"].astype(bool)).astype(int)
    out["PASSENGER"]  = out["AUTOMOBILE"].copy()

    # Target
    classification = df["CLASSIFICATIONOFACCIDENT"].fillna("")
    out["fatal"]    = (classification == "Fatal injury").astype(int)
    out["injury"]   = (classification.isin(["Fatal injury", "Non-fatal injury"])).astype(int)
    out["source"]   = "waterloo"

    out = out.dropna(subset=["latitude", "longitude"])
    print(f"Waterloo after cleaning: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# 5. Halifax — lat/lon direct, datetime → hour, Road Surface → weather proxy
# ---------------------------------------------------------------------------
def load_halifax():
    path = os.path.join(RAW, "Halifax_906585305445347675.csv")
    df = pd.read_csv(path)
    print(f"Halifax raw: {len(df)} rows")

    out = pd.DataFrame(index=df.index)

    # Parse hour from "M/D/YYYY H:MM:SS AM/PM"
    out["hour"] = pd.to_datetime(
        df["Accident Date and Time"], errors="coerce"
    ).dt.hour.fillna(12).astype(int)

    out["latitude"]  = pd.to_numeric(df["Latitude WGS84"],  errors="coerce")
    out["longitude"] = pd.to_numeric(df["Longitude WGS84"], errors="coerce")

    # Weather proxy from Road Surface
    weather = df["Road Surface"].apply(road_to_weather)
    out["temp_c"]    = weather.apply(lambda x: x[0])
    out["precip_mm"] = weather.apply(lambda x: x[1])

    # Vehicle involvement
    # Halifax has explicit Pedestrian/Bicycle flags (Y/N); no motorcycle column.
    out["PEDESTRIAN"] = (df["Pedestrian Collision"].fillna("N").str.upper() == "Y").astype(int)
    out["BICYCLE"]    = (df["Bicycle Collision"].fillna("N").str.upper() == "Y").astype(int)
    out["MOTORCYCLE"] = 0  # not available in Halifax data
    out["AUTOMOBILE"] = (~out["PEDESTRIAN"].astype(bool) &
                          ~out["BICYCLE"].astype(bool)).astype(int)
    out["PASSENGER"]  = out["AUTOMOBILE"].copy()

    # Target — "Yes" for injury, empty otherwise
    out["fatal"]  = (df["Fatal Injury"].fillna("").str.strip().str.lower() == "yes").astype(int)
    out["injury"] = (
        (df["Non Fatal Injury"].fillna("").str.strip().str.lower() == "yes") |
        out["fatal"].astype(bool)
    ).astype(int)
    out["source"] = "halifax"

    out = out.dropna(subset=["latitude", "longitude"])
    print(f"Halifax after cleaning: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# Combine and save
# ---------------------------------------------------------------------------
def main():
    toronto  = load_toronto()
    ottawa   = load_ottawa()
    hamilton = load_hamilton()
    waterloo = load_waterloo()
    halifax  = load_halifax()

    combined = pd.concat([toronto, ottawa, hamilton, waterloo, halifax], ignore_index=True)

    # Add congestion columns (filled 0.0 for all historical data)
    combined["congestion_level"] = 0.0
    combined["jam_factor"]       = 0.0

    # Enforce numeric types
    int_cols   = ["hour", "AUTOMOBILE", "MOTORCYCLE", "PASSENGER", "BICYCLE",
                  "PEDESTRIAN", "injury", "fatal"]
    float_cols = ["latitude", "longitude", "temp_c", "precip_mm",
                  "congestion_level", "jam_factor"]
    for c in int_cols:
        combined[c] = pd.to_numeric(combined[c], errors="coerce").fillna(0).astype(int)
    for c in float_cols:
        combined[c] = pd.to_numeric(combined[c], errors="coerce")

    # Drop rows with missing lat/lon (shouldn't happen after per-source cleaning)
    combined = combined.dropna(subset=["latitude", "longitude"])

    # Summary
    print(f"\nCombined dataset: {len(combined)} rows")
    print(combined["source"].value_counts().to_string())
    print(f"\nTarget distribution:")
    print(f"  injury or fatal: {(combined['injury'] | combined['fatal']).sum()} "
          f"({(combined['injury'] | combined['fatal']).mean()*100:.1f}%)")
    print(f"  fatal only:      {combined['fatal'].sum()}")

    out_path = os.path.join(PROCESSED, "ontario_combined.csv")
    combined.to_csv(out_path, index=False)
    print(f"\nSaved to: {out_path}")


if __name__ == "__main__":
    main()
