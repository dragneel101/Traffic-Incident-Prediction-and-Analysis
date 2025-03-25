import pandas as pd
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    RocCurveDisplay,
    PrecisionRecallDisplay,
    classification_report
)
import joblib

# Paths
data_path = os.path.join("data", "processed", "toronto_enriched_sample.csv")
model_path = os.path.join("app", "models", "collision_risk_model.pkl")
save_path = os.path.join("data", "visualise", "first_pass")
os.makedirs(save_path, exist_ok=True)

# Load data and model
df = pd.read_csv(data_path)
model = joblib.load(model_path)

# Drop missing
df = df.dropna(subset=["temp_c"])

# Features and target
features = [
    "hour", "latitude", "longitude", "temp_c", "precip_mm",
    "AUTOMOBILE", "MOTORCYCLE", "PASSENGER", "BICYCLE", "PEDESTRIAN"
]
X = df[features]
y = (df["injury"] | df["fatal"]).astype(int)

# Predict
y_pred = model.predict(X)
y_proba = model.predict_proba(X)[:, 1]

# 1. Confusion Matrix
ConfusionMatrixDisplay.from_predictions(y, y_pred, cmap="Blues")
plt.title("Confusion Matrix")
plt.tight_layout()
plt.savefig(os.path.join(save_path, "confusion_matrix.png"))
plt.show()

# 2. ROC Curve
RocCurveDisplay.from_predictions(y, y_proba)
plt.title("ROC Curve")
plt.tight_layout()
plt.savefig(os.path.join(save_path, "roc_curve.png"))
plt.show()

# 3. Precision-Recall Curve
PrecisionRecallDisplay.from_predictions(y, y_proba)
plt.title("Precision-Recall Curve")
plt.tight_layout()
plt.savefig(os.path.join(save_path, "precision_recall_curve.png"))
plt.show()

# 4. Feature Importances
importances = model.feature_importances_
feature_df = pd.DataFrame({"feature": features, "importance": importances})
feature_df = feature_df.sort_values("importance", ascending=False)

plt.figure(figsize=(10, 6))
sns.barplot(data=feature_df, x="importance", y="feature", hue="feature", palette="viridis", legend=False)
plt.title("Feature Importance")
plt.tight_layout()
plt.savefig(os.path.join(save_path, "feature_importance.png"))
plt.show()

print(f"✅ Visualizations saved in: {save_path}")
