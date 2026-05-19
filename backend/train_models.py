"""
PulmoScan AI – Model Training Script
=====================================
Trains 5 ML algorithms on the lung cancer survey dataset,
evaluates them, selects the best model, and saves artifacts.

Dataset: survey lung cancer (Kaggle)
Expected CSV columns:
  GENDER, AGE, SMOKING, YELLOW_FINGERS, ANXIETY, PEER_PRESSURE,
  CHRONIC_DISEASE, FATIGUE, ALLERGY, WHEEZING, ALCOHOL_CONSUMING,
  COUGHING, SHORTNESS_OF_BREATH, SWALLOWING_DIFFICULTY, CHEST_PAIN,
  LUNG_CANCER

Run:  python train_models.py
Output saved to:  ./ml_models/
"""
import os
import json
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix,
)
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────────────────────────────────────
DATA_PATH   = Path("data/survey_lung_cancer.csv")
OUTPUT_DIR  = Path("ml_models")
OUTPUT_DIR.mkdir(exist_ok=True)

# ── 1. Load Dataset ───────────────────────────────────────────────────────────
print("📥 Loading dataset...")
if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found at {DATA_PATH}. "
        "Download 'survey_lung_cancer.csv' from Kaggle and place it in ./data/"
    )

df = pd.read_csv(DATA_PATH)
print(f"   Shape: {df.shape}")
print(f"   Columns: {list(df.columns)}")

# Normalize column names
df.columns = [c.strip().upper().replace(" ", "_") for c in df.columns]

# ── 2. Preprocessing ──────────────────────────────────────────────────────────
print("\n🔧 Preprocessing...")

# Remove duplicates
before = len(df)
df.drop_duplicates(inplace=True)
print(f"   Duplicates removed: {before - len(df)}")

# Drop rows with too many missing values
df.dropna(thresh=len(df.columns) - 3, inplace=True)

# Fill remaining NaN with column mode
for col in df.columns:
    if df[col].isnull().any():
        df[col].fillna(df[col].mode()[0], inplace=True)

# Encode GENDER: M→1, F→0
df["GENDER"] = df["GENDER"].map({"M": 1, "F": 0, "MALE": 1, "FEMALE": 0}).fillna(0).astype(int)

# Encode target label
le = LabelEncoder()
df["LUNG_CANCER"] = le.fit_transform(df["LUNG_CANCER"].str.upper().str.strip())
# YES→1, NO→0

print(f"   Class distribution:\n{pd.Series(df['LUNG_CANCER']).value_counts().to_string()}")

# ── 3. Features & Split ───────────────────────────────────────────────────────
FEATURE_COLS = [
    "AGE", "GENDER", "SMOKING", "YELLOW_FINGERS", "ANXIETY", "PEER_PRESSURE",
    "CHRONIC_DISEASE", "FATIGUE", "ALLERGY", "WHEEZING", "ALCOHOL_CONSUMING",
    "COUGHING", "SHORTNESS_OF_BREATH", "SWALLOWING_DIFFICULTY", "CHEST_PAIN",
]
TARGET_COL = "LUNG_CANCER"

X = df[FEATURE_COLS].values
y = df[TARGET_COL].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

print(f"   Train size: {len(X_train)} | Test size: {len(X_test)}")

# ── 4. Train Models ───────────────────────────────────────────────────────────
print("\n🤖 Training 5 algorithms...")

MODELS = {
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
    "Random Forest":       RandomForestClassifier(n_estimators=200, random_state=42),
    "Gradient Boosting":   GradientBoostingClassifier(n_estimators=200, random_state=42),
    "SVM":                 SVC(probability=True, random_state=42),
    "Decision Tree":       DecisionTreeClassifier(max_depth=8, random_state=42),
}

results = {}
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for name, model in MODELS.items():
    model.fit(X_train_sc, y_train)
    y_pred  = model.predict(X_test_sc)
    y_proba = model.predict_proba(X_test_sc)[:, 1]

    cv_acc = cross_val_score(model, X_train_sc, y_train, cv=cv, scoring="accuracy").mean()

    metrics = {
        "accuracy":  round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall":    round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1":        round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc":   round(roc_auc_score(y_test, y_proba), 4),
        "cv_accuracy": round(cv_acc, 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    }
    results[name] = {"model": model, "metrics": metrics}
    print(f"   {name:22s} → Acc: {metrics['accuracy']:.4f} | ROC-AUC: {metrics['roc_auc']:.4f}")

# ── 5. Select Best Model ──────────────────────────────────────────────────────
best_name = max(results, key=lambda n: results[n]["metrics"]["roc_auc"])
best_model = results[best_name]["model"]
print(f"\n🏆 Best model: {best_name} (ROC-AUC: {results[best_name]['metrics']['roc_auc']})")

# ── 6. Save Artifacts ─────────────────────────────────────────────────────────
print("\n💾 Saving artifacts...")
joblib.dump(best_model,    OUTPUT_DIR / "best_model.pkl")
joblib.dump(scaler,        OUTPUT_DIR / "scaler.pkl")
joblib.dump(le,            OUTPUT_DIR / "encoder.pkl")
joblib.dump(FEATURE_COLS,  OUTPUT_DIR / "feature_columns.pkl")
(OUTPUT_DIR / "model_name.txt").write_text(best_name)

# Save metrics JSON for API to serve
metrics_out = {name: v["metrics"] for name, v in results.items()}
metrics_out_clean = {n: {k: v for k, v in m.items() if k != "confusion_matrix"}
                     for n, m in metrics_out.items()}
(OUTPUT_DIR / "model_metrics.json").write_text(json.dumps(metrics_out_clean, indent=2))

# Save processed dataset
df_out = df.copy()
df.to_csv("data/processed_lung_cancer.csv", index=False)

print("✅ Training complete. Artifacts saved to ./ml_models/")
print(f"   best_model.pkl | scaler.pkl | encoder.pkl | feature_columns.pkl")
