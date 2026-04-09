import json
import os
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, f1_score, accuracy_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split

warnings.filterwarnings("ignore", category=FutureWarning)

# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------
file_path = os.path.join("data", "processed", "ontario_combined.csv")
if not os.path.exists(file_path):
    raise FileNotFoundError(
        f"File not found: {file_path}\n"
        "Run data/scripts/preprocess_ontario.py first."
    )

df = pd.read_csv(file_path)
print(f"Loaded {len(df)} rows from ontario_combined.csv")
print(df["source"].value_counts().to_string() if "source" in df.columns else "")

# Drop rows with missing coordinates (shouldn't happen but guard)
df = df.dropna(subset=["latitude", "longitude"])

# ---------------------------------------------------------------------------
# Derived time features
#
# Why cyclical encoding?
#   Raw hour treats 23 and 0 as 23 units apart, but they are 1 hour apart on
#   the clock. sin/cos maps hour onto a circle so the model sees correct proximity.
#
# Why no congestion_level / jam_factor in training?
#   All historical rows have congestion = 0 (we have no historical flow data).
#   A zero-variance feature teaches the model nothing and creates a
#   training/inference mismatch when real congestion values arrive at prediction
#   time. Instead, live congestion is applied as a post-model multiplier in
#   predictor.py.
# ---------------------------------------------------------------------------
df["hour_sin"]     = np.sin(2 * np.pi * df["hour"] / 24)
df["hour_cos"]     = np.cos(2 * np.pi * df["hour"] / 24)
df["is_rush_hour"] = df["hour"].isin([7, 8, 9, 16, 17, 18]).astype(int)

FEATURE_ORDER = [
    "hour_sin", "hour_cos", "is_rush_hour",
    "latitude", "longitude", "temp_c", "precip_mm",
    "AUTOMOBILE", "MOTORCYCLE", "PASSENGER", "BICYCLE", "PEDESTRIAN",
]

X = df[FEATURE_ORDER]
y = (df["injury"] | df["fatal"]).astype(int)

# ---------------------------------------------------------------------------
# Train / test split
# ---------------------------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ---------------------------------------------------------------------------
# 5-fold cross-validation for unbiased metric estimates
# ---------------------------------------------------------------------------
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
base_model = RandomForestClassifier(
    n_estimators=200, class_weight="balanced", random_state=42, n_jobs=-1
)

cv_accuracy = cross_val_score(base_model, X_train, y_train, cv=cv, scoring="accuracy")
cv_auc = cross_val_score(base_model, X_train, y_train, cv=cv, scoring="roc_auc")
cv_f1 = cross_val_score(base_model, X_train, y_train, cv=cv, scoring="f1")

print(f"CV Accuracy : {cv_accuracy.mean():.4f} ± {cv_accuracy.std():.4f}")
print(f"CV AUC      : {cv_auc.mean():.4f} ± {cv_auc.std():.4f}")
print(f"CV F1       : {cv_f1.mean():.4f} ± {cv_f1.std():.4f}")

# ---------------------------------------------------------------------------
# Final model — fit on full training set, evaluate on held-out test set
# ---------------------------------------------------------------------------
model = RandomForestClassifier(
    n_estimators=200, class_weight="balanced", random_state=42, n_jobs=-1
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

test_accuracy = accuracy_score(y_test, y_pred)
test_auc = roc_auc_score(y_test, y_proba)
test_f1 = f1_score(y_test, y_pred)

print(f"\nTest Accuracy : {test_accuracy:.4f}")
print(f"Test AUC      : {test_auc:.4f}")
print(f"Test F1       : {test_f1:.4f}")

# Feature importances — sanity check that geographic + time features dominate
importances = sorted(zip(FEATURE_ORDER, model.feature_importances_), key=lambda x: -x[1])
print("\nFeature importances:")
for feat, imp in importances:
    print(f"  {feat:<20} {imp:.4f}")

# ---------------------------------------------------------------------------
# Save model
# ---------------------------------------------------------------------------
model_path = os.path.join("app", "models", "collision_risk_model.pkl")
os.makedirs(os.path.dirname(model_path), exist_ok=True)
joblib.dump(model, model_path)
print(f"\nModel saved to: {model_path}")

# ---------------------------------------------------------------------------
# Save metrics JSON — consumed by GET /api/stats/model-performance
# ---------------------------------------------------------------------------
metrics = {
    "version": "v4",
    "features": FEATURE_ORDER,
    "train_samples": int(len(X_train)),
    "test_samples": int(len(X_test)),
    "cv_folds": 5,
    "cv_accuracy": round(float(cv_accuracy.mean()), 4),
    "cv_accuracy_std": round(float(cv_accuracy.std()), 4),
    "cv_auc": round(float(cv_auc.mean()), 4),
    "cv_auc_std": round(float(cv_auc.std()), 4),
    "cv_f1": round(float(cv_f1.mean()), 4),
    "cv_f1_std": round(float(cv_f1.std()), 4),
    "test_accuracy": round(test_accuracy, 4),
    "test_auc": round(test_auc, 4),
    "test_f1": round(test_f1, 4),
}

metrics_path = os.path.join("app", "models", "model_metrics.json")
with open(metrics_path, "w") as f:
    json.dump(metrics, f, indent=2)
print(f"Metrics saved to: {metrics_path}")
