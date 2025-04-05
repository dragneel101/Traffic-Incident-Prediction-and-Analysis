import pandas as pd
import os
import warnings


# Suppress future warnings (optional)
warnings.filterwarnings("ignore", category=FutureWarning)

# Step 1: Load CSV
file_path = os.path.join("data", "raw", "collisions_Toronto.csv")
if not os.path.exists(file_path):
    raise FileNotFoundError(f"File not found: {file_path}")

df = pd.read_csv(file_path)
print(f"✅ Loaded {len(df)} rows")

#for sample Test
df = df.head(10000)
print(f"✅ Loaded {len(df)} rows")

# Step 2: Drop rows with missing or invalid coordinates
df = df.dropna(subset=["LAT_WGS84", "LONG_WGS84"])
df = df[(df["LAT_WGS84"] != 0) & (df["LONG_WGS84"] != 0)]

# Step 3: Convert OCC_DATE (in ms) to datetime
df["datetime"] = pd.to_datetime(df["OCC_DATE"], unit="ms", errors="coerce")
df = df.dropna(subset=["datetime"])

# Step 4: Convert YES/NO/N/R to binary
binary_columns = [
    "INJURY_COLLISIONS", "FATALITIES", "AUTOMOBILE",
    "MOTORCYCLE", "PASSENGER", "BICYCLE", "PEDESTRIAN"
]

for col in binary_columns:
    df[col] = df[col].fillna("NO").astype(str).str.strip().str.upper()
    df[col] = df[col].replace({"YES": 1, "NO": 0, "N/R": 0, "": 0})
    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

# Step 5: Select and rename final columns
selected = df[[
    "datetime", "OCC_HOUR", "LAT_WGS84", "LONG_WGS84",
    "INJURY_COLLISIONS", "FATALITIES",
    "AUTOMOBILE", "MOTORCYCLE", "PASSENGER", "BICYCLE", "PEDESTRIAN"
]].copy()

selected.rename(columns={
    "OCC_HOUR": "hour",
    "LAT_WGS84": "latitude",
    "LONG_WGS84": "longitude",
    "INJURY_COLLISIONS": "injury",
    "FATALITIES": "fatal"
}, inplace=True)

# Save cleaned sample
output_path = os.path.join("data", "processed", "toronto_cleaned_sample.csv")
#output_path = os.path.join("data", "processed", "toronto_cleaned.csv")
os.makedirs(os.path.dirname(output_path), exist_ok=True)
selected.to_csv(output_path, index=False)

print(f"✅ Cleaned data saved to: {output_path}")

