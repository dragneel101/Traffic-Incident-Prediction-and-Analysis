"""
visualise_model.py
------------------
Generates model evaluation plots for the current collision_risk_model.pkl.
Output: backend/data/visualise/v4/

Plots produced:
  1. roc_curve.png           — ROC with AUC
  2. precision_recall.png    — PR curve with average precision
  3. confusion_matrix.png    — Normalised + raw counts
  4. feature_importance.png  — Ranked horizontal bar chart
  5. cv_metrics.png          — CV vs test metric comparison with std error bars
  6. calibration_curve.png   — Reliability diagram (are probabilities trustworthy?)
  7. score_distribution.png  — Predicted probability distribution by class
"""

import os
import sys
import warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import joblib

from sklearn.calibration import calibration_curve
from sklearn.metrics import (
    roc_curve, auc,
    precision_recall_curve, average_precision_score,
    confusion_matrix, ConfusionMatrixDisplay,
    accuracy_score, roc_auc_score, f1_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE        = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH   = os.path.join(BASE, "processed", "ontario_combined.csv")
MODEL_PATH  = os.path.join(BASE, os.pardir, "app", "models", "collision_risk_model.pkl")
OUT_DIR     = os.path.join(BASE, "visualise", "v4")
os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Style
# ---------------------------------------------------------------------------
ACCENT   = "#4F6BED"
ACCENT2  = "#E85D4A"
GRID_CLR = "#EBEBEB"
BG       = "#FAFAFA"

plt.rcParams.update({
    "figure.facecolor":  BG,
    "axes.facecolor":    BG,
    "axes.edgecolor":    "#CCCCCC",
    "axes.grid":         True,
    "grid.color":        GRID_CLR,
    "grid.linewidth":    0.7,
    "font.family":       "sans-serif",
    "font.size":         11,
    "axes.titlesize":    13,
    "axes.titleweight":  "bold",
    "axes.labelsize":    11,
    "xtick.labelsize":   10,
    "ytick.labelsize":   10,
    "legend.fontsize":   10,
    "legend.framealpha": 0.8,
})

def save(fig, name):
    path = os.path.join(OUT_DIR, name)
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"  saved: {path}")

# ---------------------------------------------------------------------------
# Load data + model
# ---------------------------------------------------------------------------
print("Loading data and model...")
df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=["latitude", "longitude"])

df["hour_sin"]     = np.sin(2 * np.pi * df["hour"] / 24)
df["hour_cos"]     = np.cos(2 * np.pi * df["hour"] / 24)
df["is_rush_hour"] = df["hour"].isin([7, 8, 9, 16, 17, 18]).astype(int)

FEATURE_ORDER = [
    "hour_sin", "hour_cos", "is_rush_hour",
    "latitude", "longitude", "temp_c", "precip_mm",
    "AUTOMOBILE", "MOTORCYCLE", "PASSENGER", "BICYCLE", "PEDESTRIAN",
]
FEATURE_LABELS = [
    "hour sin", "hour cos", "rush hour",
    "latitude", "longitude", "temp °C", "precip mm",
    "automobile", "motorcycle", "passenger", "bicycle", "pedestrian",
]

X = df[FEATURE_ORDER]
y = (df["injury"] | df["fatal"]).astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = joblib.load(MODEL_PATH)
y_proba = model.predict_proba(X_test)[:, 1]
y_pred  = model.predict(X_test)

print(f"  {len(df):,} rows | {y.sum():,} positive ({y.mean()*100:.1f}%)")

# ---------------------------------------------------------------------------
# 1. ROC Curve
# ---------------------------------------------------------------------------
print("1/7  ROC curve...")
fpr, tpr, _ = roc_curve(y_test, y_proba)
roc_auc = auc(fpr, tpr)

fig, ax = plt.subplots(figsize=(6, 5))
ax.plot(fpr, tpr, color=ACCENT, lw=2, label=f"AUC = {roc_auc:.3f}")
ax.plot([0, 1], [0, 1], color="#BBBBBB", lw=1.2, linestyle="--", label="Random")
ax.fill_between(fpr, tpr, alpha=0.08, color=ACCENT)
ax.set_xlabel("False Positive Rate")
ax.set_ylabel("True Positive Rate")
ax.set_title("ROC Curve")
ax.legend(loc="lower right")
ax.set_xlim(0, 1); ax.set_ylim(0, 1.02)
save(fig, "roc_curve.png")

# ---------------------------------------------------------------------------
# 2. Precision-Recall Curve
# ---------------------------------------------------------------------------
print("2/7  Precision-Recall curve...")
precision, recall, _ = precision_recall_curve(y_test, y_proba)
ap = average_precision_score(y_test, y_proba)
baseline = y_test.mean()

fig, ax = plt.subplots(figsize=(6, 5))
ax.plot(recall, precision, color=ACCENT2, lw=2, label=f"AP = {ap:.3f}")
ax.axhline(baseline, color="#BBBBBB", lw=1.2, linestyle="--",
           label=f"Baseline (class balance {baseline:.2f})")
ax.fill_between(recall, precision, alpha=0.08, color=ACCENT2)
ax.set_xlabel("Recall")
ax.set_ylabel("Precision")
ax.set_title("Precision-Recall Curve")
ax.legend(loc="upper right")
ax.set_xlim(0, 1); ax.set_ylim(0, 1.05)
save(fig, "precision_recall.png")

# ---------------------------------------------------------------------------
# 3. Confusion Matrix (normalised + raw)
# ---------------------------------------------------------------------------
print("3/7  Confusion matrix...")
cm      = confusion_matrix(y_test, y_pred)
cm_norm = confusion_matrix(y_test, y_pred, normalize="true")

fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))
for ax, mat, fmt, title in zip(
    axes,
    [cm_norm, cm],
    [".2%", "d"],
    ["Normalised (row %)", "Raw counts"],
):
    disp = ConfusionMatrixDisplay(confusion_matrix=mat,
                                  display_labels=["No Injury", "Injury/Fatal"])
    disp.plot(ax=ax, colorbar=False, cmap="Blues", values_format=fmt)
    ax.set_title(title)
    ax.grid(False)

fig.suptitle("Confusion Matrix", fontsize=14, fontweight="bold", y=1.01)
fig.tight_layout()
save(fig, "confusion_matrix.png")

# ---------------------------------------------------------------------------
# 4. Feature Importance
# ---------------------------------------------------------------------------
print("4/7  Feature importance...")
importances = model.feature_importances_
order = np.argsort(importances)
colors = [ACCENT if importances[i] >= np.median(importances) else "#A8B8F8"
          for i in order]

fig, ax = plt.subplots(figsize=(8, 5.5))
bars = ax.barh(
    [FEATURE_LABELS[i] for i in order],
    importances[order],
    color=colors,
    edgecolor="white",
    height=0.65,
)
ax.bar_label(bars, fmt="%.3f", padding=4, fontsize=9)
ax.set_xlabel("Mean Decrease in Impurity")
ax.set_title("Feature Importances")
ax.set_xlim(0, importances.max() * 1.20)
save(fig, "feature_importance.png")

# ---------------------------------------------------------------------------
# 5. CV vs Test metric comparison
# ---------------------------------------------------------------------------
print("5/7  CV vs test metrics...")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_acc = cross_val_score(model, X_train, y_train, cv=cv, scoring="accuracy")
cv_auc_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="roc_auc")
cv_f1  = cross_val_score(model, X_train, y_train, cv=cv, scoring="f1")

metrics     = ["Accuracy", "AUC", "F1"]
cv_means    = [cv_acc.mean(),       cv_auc_scores.mean(), cv_f1.mean()]
cv_stds     = [cv_acc.std(),        cv_auc_scores.std(),  cv_f1.std()]
test_scores = [
    accuracy_score(y_test, y_pred),
    roc_auc_score(y_test, y_proba),
    f1_score(y_test, y_pred),
]

x      = np.arange(len(metrics))
width  = 0.32

fig, ax = plt.subplots(figsize=(7, 5))
b1 = ax.bar(x - width/2, cv_means, width, yerr=cv_stds, capsize=5,
            color=ACCENT,  label="CV mean ± std", error_kw={"elinewidth": 1.5})
b2 = ax.bar(x + width/2, test_scores, width,
            color=ACCENT2, label="Hold-out test")

ax.bar_label(b1, fmt="%.3f", padding=3, fontsize=9)
ax.bar_label(b2, fmt="%.3f", padding=3, fontsize=9)
ax.set_xticks(x); ax.set_xticklabels(metrics)
ax.set_ylim(0, 1.05)
ax.set_ylabel("Score")
ax.set_title("Cross-Validation vs Hold-out Test Metrics")
ax.legend()
save(fig, "cv_metrics.png")

# ---------------------------------------------------------------------------
# 6. Calibration Curve
# ---------------------------------------------------------------------------
print("6/7  Calibration curve...")
fraction_pos, mean_pred = calibration_curve(y_test, y_proba, n_bins=10)

fig, ax = plt.subplots(figsize=(6, 5))
ax.plot(mean_pred, fraction_pos, "s-", color=ACCENT, lw=2, label="Model")
ax.plot([0, 1], [0, 1], color="#BBBBBB", lw=1.2, linestyle="--", label="Perfect calibration")
ax.fill_between(mean_pred, fraction_pos, mean_pred, alpha=0.1, color=ACCENT)
ax.set_xlabel("Mean Predicted Probability")
ax.set_ylabel("Fraction of Positives")
ax.set_title("Calibration Curve (Reliability Diagram)")
ax.legend()
ax.set_xlim(0, 1); ax.set_ylim(0, 1)
save(fig, "calibration_curve.png")

# ---------------------------------------------------------------------------
# 7. Score Distribution by class
# ---------------------------------------------------------------------------
print("7/7  Score distribution...")
proba_pos = y_proba[y_test == 1]
proba_neg = y_proba[y_test == 0]

fig, ax = plt.subplots(figsize=(7, 4.5))
ax.hist(proba_neg, bins=40, density=True, alpha=0.6, color="#6EA8D8",
        label="No injury (class 0)", edgecolor="white")
ax.hist(proba_pos, bins=40, density=True, alpha=0.6, color=ACCENT2,
        label="Injury / fatal (class 1)", edgecolor="white")
ax.axvline(0.5, color="#444", lw=1.2, linestyle="--", label="Decision threshold 0.5")
ax.set_xlabel("Predicted Probability of Injury/Fatal")
ax.set_ylabel("Density")
ax.set_title("Predicted Score Distribution by Class")
ax.legend()
save(fig, "score_distribution.png")

print(f"\nAll 7 plots saved to: {OUT_DIR}")
