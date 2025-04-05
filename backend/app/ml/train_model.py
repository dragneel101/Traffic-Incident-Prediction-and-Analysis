import pandas as pd
import os
import warnings
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# Suppress future warnings
warnings.filterwarnings("ignore", category=FutureWarning)

# Load weather-enriched dataset
file_path = os.path.join("data", "processed", "toronto_enriched_sample.csv")
if not os.path.exists(file_path):
    raise FileNotFoundError(f"File not found: {file_path}")

df = pd.read_csv(file_path)
print(f"✅ Loaded {len(df)} rows from toronto_enriched_sample.csv")

# Drop rows with missing weather data
df = df.dropna(subset=["temp_c"])

# Define features and target
features = [
    "hour", "latitude", "longitude", "temp_c", "precip_mm",
    "AUTOMOBILE", "MOTORCYCLE", "PASSENGER", "BICYCLE", "PEDESTRIAN"
]
X = df[features]
y = (df["injury"] | df["fatal"]).astype(int)  # Define collision as injury OR fatality

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train a Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate performance
y_pred = model.predict(X_test)
print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

# Save the model
model_path = os.path.join("app", "models", "collision_risk_model.pkl")
os.makedirs(os.path.dirname(model_path), exist_ok=True)
joblib.dump(model, model_path)
print(f"✅ Model saved to: {model_path}")
