"""
PulmoScan AI v2 - Multi-class Lung Cancer Subtype Training
===========================================================
Dataset : LungCanC2024_Dataset.csv
Target  : cancer_subtype  (multi-class)
Features: 12 clinical / genomic / biomarker columns
Models  : Logistic Regression, Random Forest, Gradient Boosting,
          SVM, Decision Tree, XGBoost (if installed), LightGBM (if installed)

Run: python train_multiclass.py
Output : ./ml_models/
"""

import json
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    f1_score, precision_score, recall_score, roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

warnings.filterwarnings("ignore")

try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

try:
    import lightgbm as lgb
    HAS_LGBM = True
except ImportError:
    HAS_LGBM = False

# ── Paths ─────────────────────────────────────────────────────────────────────
DATA_PATH    = Path("data/LungCanC2024_Dataset.csv")
FALLBACK_PATH = Path("data/survey_lung_cancer.csv")
OUTPUT_DIR   = Path("ml_models")
OUTPUT_DIR.mkdir(exist_ok=True)

# Skip SVM and cross-validation for datasets > this threshold (rows)
LARGE_DATASET_THRESHOLD = 50_000

# ── Encoding maps (must match ml_service.py) ──────────────────────────────────
GENDER_MAP   = {"Male": 1, "Female": 0, "M": 1, "F": 0}
SMOKING_MAP  = {"Never": 0, "Former": 1, "Current": 2}
LOCATION_MAP = {"Right Lung": 0, "Left Lung": 1, "Bilateral": 2, "Central": 3, "Other": 4}
STAGE_MAP    = {"Stage 0": 0, "Stage I": 1, "Stage II": 2, "Stage III": 3, "Stage IV": 4}


# ─────────────────────────────────────────────────────────────────────────────
# 1. Load dataset
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 60)
print("  PulmoScan AI v2 - Multi-class Training Pipeline")
print("=" * 60)
print("\n[INFO] Loading dataset...")

if DATA_PATH.exists():
    df = pd.read_csv(DATA_PATH)
    DATASET_VERSION = "LungCanC2024"
    print(f"   Dataset : {DATA_PATH}")
elif FALLBACK_PATH.exists():
    df = pd.read_csv(FALLBACK_PATH)
    DATASET_VERSION = "LungCancerSurvey"
    print(f"   Dataset : {FALLBACK_PATH} (fallback)")
else:
    raise FileNotFoundError(
        "No dataset found.\n"
        "Place LungCanC2024_Dataset.csv in the backend/data/ folder.\n"
        "Fallback: survey_lung_cancer.csv also accepted."
    )

# Normalize column names: strip whitespace, replace dash/space with underscore
df.columns = [c.strip().replace("-", "_").replace(" ", "_") for c in df.columns]

print(f"   Shape   : {df.shape}")
print(f"   Columns : {list(df.columns)}\n")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Preprocessing
# ─────────────────────────────────────────────────────────────────────────────
print("[PREP] Preprocessing...")

# Remove duplicates
before = len(df)
df.drop_duplicates(inplace=True)
print(f"   Duplicates removed : {before - len(df)}")

# Drop rows with >50% missing values
thresh = int(len(df.columns) * 0.5)
df.dropna(thresh=thresh, inplace=True)

# Impute remaining NaN: median for numeric, mode for categorical
for col in df.columns:
    if df[col].isnull().any():
        if pd.api.types.is_numeric_dtype(df[col]):
            df[col].fillna(df[col].median(), inplace=True)
        else:
            df[col].fillna(df[col].mode()[0], inplace=True)

print(f"   After cleaning     : {df.shape[0]} rows")


# ─────────────────────────────────────────────────────────────────────────────
# 3. Feature selection (clinical only - no imaging-derived columns)
# ─────────────────────────────────────────────────────────────────────────────
CLINICAL_FEATURES = [
    "patient_age",
    "patient_gender",
    "smoking_history",
    "family_history",
    "nodule_size_mm",
    "tumor_location",
    "tumor_stage",
    "EGFR_mutation_status",
    "KRAS_mutation_status",
    "ALK_fusion_status",
    "PD_L1_expression_level",
    "tumor_mutational_burden",
]

# Keep only features that exist in this dataset
FEATURE_COLS = [f for f in CLINICAL_FEATURES if f in df.columns]

if not FEATURE_COLS:
    raise ValueError(
        "None of the expected clinical feature columns were found.\n"
        f"Expected: {CLINICAL_FEATURES}\n"
        f"Found   : {list(df.columns)}"
    )

print(f"\n   Features selected ({len(FEATURE_COLS)}): {FEATURE_COLS}")


# ─────────────────────────────────────────────────────────────────────────────
# 4. Encode categorical feature columns
# ─────────────────────────────────────────────────────────────────────────────
if "patient_gender" in df.columns:
    df["patient_gender"] = (
        df["patient_gender"].map(GENDER_MAP).fillna(0).astype(int)
    )

if "smoking_history" in df.columns:
    df["smoking_history"] = (
        df["smoking_history"].map(SMOKING_MAP).fillna(0).astype(int)
    )

if "tumor_location" in df.columns:
    df["tumor_location"] = (
        df["tumor_location"].map(LOCATION_MAP)
    )
    # Any unknown location → label-encode
    unknown_mask = df["tumor_location"].isnull()
    if unknown_mask.any():
        le_loc = LabelEncoder()
        known = df.loc[~unknown_mask, "tumor_location"].astype(int)
        max_known = known.max() if len(known) else 4
        raw_vals = df.loc[unknown_mask, "tumor_location_raw"] if "tumor_location_raw" in df.columns else max_known + 1
        df.loc[unknown_mask, "tumor_location"] = max_known + 1
    df["tumor_location"] = df["tumor_location"].fillna(0).astype(int)

if "tumor_stage" in df.columns:
    df["tumor_stage"] = (
        df["tumor_stage"].map(STAGE_MAP).fillna(2).astype(int)
    )

# Binary fields
BINARY_COLS = [
    "family_history", "EGFR_mutation_status",
    "KRAS_mutation_status", "ALK_fusion_status",
]
for col in BINARY_COLS:
    if col in df.columns and df[col].dtype == object:
        df[col] = df[col].map({"Yes": 1, "No": 0, "True": 1, "False": 0,
                               "1": 1, "0": 0}).fillna(0).astype(int)
    elif col in df.columns:
        df[col] = df[col].fillna(0).astype(int)

# Numeric clamping
if "PD_L1_expression_level" in df.columns:
    df["PD_L1_expression_level"] = df["PD_L1_expression_level"].clip(0, 100)
if "tumor_mutational_burden" in df.columns:
    df["tumor_mutational_burden"] = df["tumor_mutational_burden"].clip(0, 1000)
if "nodule_size_mm" in df.columns:
    df["nodule_size_mm"] = df["nodule_size_mm"].clip(0, 100)

# Final safety: convert any remaining object features to numeric
for col in FEATURE_COLS:
    if df[col].dtype == object:
        le_tmp = LabelEncoder()
        df[col] = le_tmp.fit_transform(df[col].astype(str))


# ─────────────────────────────────────────────────────────────────────────────
# 5. Encode target (cancer_subtype)
# ─────────────────────────────────────────────────────────────────────────────
TARGET_COL = "cancer_subtype"
if TARGET_COL not in df.columns:
    # Fallback: binary dataset
    if "LUNG_CANCER" in df.columns:
        df["cancer_subtype"] = df["LUNG_CANCER"].str.upper().map(
            {"YES": "Cancer", "NO": "No Cancer"}
        )
    else:
        raise ValueError(
            f"Target column '{TARGET_COL}' not found.\n"
            f"Available: {list(df.columns)}"
        )

# Clean target
df[TARGET_COL] = df[TARGET_COL].astype(str).str.strip()

print(f"\n   Target distribution:")
print(df[TARGET_COL].value_counts().to_string())

label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df[TARGET_COL])
class_names = label_encoder.classes_.tolist()
n_classes   = len(class_names)

print(f"\n   Classes ({n_classes}): {class_names}")


# ─────────────────────────────────────────────────────────────────────────────
# 6. Train / test split + scaling
# ─────────────────────────────────────────────────────────────────────────────
X = df[FEATURE_COLS].values.astype(float)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

IS_LARGE = len(X_train) > LARGE_DATASET_THRESHOLD
print(f"\n   Train : {len(X_train)} samples | Test : {len(X_test)} samples")
if IS_LARGE:
    print("   [NOTE] Large dataset detected - SVM skipped, cross-validation disabled")


# ─────────────────────────────────────────────────────────────────────────────
# 7. Model definitions
# ─────────────────────────────────────────────────────────────────────────────
multi = "multinomial" if n_classes > 2 else "auto"

MODELS: dict = {
    "Logistic Regression": LogisticRegression(
        max_iter=2000, random_state=42,
        class_weight="balanced", multi_class=multi, solver="lbfgs",
    ),
    "Random Forest": RandomForestClassifier(
        n_estimators=200, random_state=42,
        class_weight="balanced", n_jobs=-1,
    ),
    "Gradient Boosting": GradientBoostingClassifier(
        n_estimators=100, max_depth=5, random_state=42,
    ),
    "Decision Tree": DecisionTreeClassifier(
        max_depth=10, random_state=42, class_weight="balanced",
    ),
}

# SVM is O(n^2) — impractical for large datasets
if not IS_LARGE:
    MODELS["SVM"] = SVC(
        probability=True, random_state=42,
        class_weight="balanced", kernel="rbf", C=1.0,
    )

if HAS_XGBOOST:
    kwargs = {
        "n_estimators": 200, "random_state": 42, "n_jobs": -1,
        "eval_metric": "mlogloss", "verbosity": 0,
    }
    if n_classes > 2:
        kwargs["objective"] = "multi:softprob"
        kwargs["num_class"] = n_classes
    MODELS["XGBoost"] = XGBClassifier(**kwargs)

if HAS_LGBM:
    MODELS["LightGBM"] = lgb.LGBMClassifier(
        n_estimators=200, random_state=42, n_jobs=-1,
        class_weight="balanced", verbose=-1,
    )


# ─────────────────────────────────────────────────────────────────────────────
# 8. Train, evaluate, cross-validate
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n[TRAIN] Training {len(MODELS)} algorithms...")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
avg = "weighted"

results: dict = {}
for name, model in MODELS.items():
    print(f"   [{name}]")
    model.fit(X_train_sc, y_train)
    y_pred  = model.predict(X_test_sc)
    y_proba = model.predict_proba(X_test_sc)

    if IS_LARGE:
        cv_f1 = -1.0  # skipped for large datasets
    else:
        cv_scores = cross_val_score(model, X_train_sc, y_train, cv=cv, scoring="f1_weighted")
        cv_f1 = float(cv_scores.mean())

    # ROC-AUC (multi-class one-vs-rest)
    try:
        if n_classes == 2:
            roc = roc_auc_score(y_test, y_proba[:, 1])
        else:
            roc = roc_auc_score(y_test, y_proba, multi_class="ovr", average=avg)
    except Exception:
        roc = 0.0

    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average=avg, zero_division=0)
    rec  = recall_score(y_test, y_pred, average=avg, zero_division=0)
    f1   = f1_score(y_test, y_pred, average=avg, zero_division=0)

    metrics = {
        "accuracy":    round(acc, 4),
        "precision":   round(prec, 4),
        "recall":      round(rec, 4),
        "f1":          round(f1, 4),
        "roc_auc":     round(roc, 4),
        "cv_f1":       round(cv_f1, 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classification_report": classification_report(
            y_test, y_pred, target_names=class_names, zero_division=0
        ),
    }
    results[name] = {"model": model, "metrics": metrics}
    print(
        f"     Acc={acc:.4f}  Prec={prec:.4f}  Rec={rec:.4f}  "
        f"F1={f1:.4f}  ROC-AUC={roc:.4f}  CV-F1={cv_f1:.4f}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# 9. Select best model (by weighted F1)
# ─────────────────────────────────────────────────────────────────────────────
best_name  = max(results, key=lambda n: results[n]["metrics"]["f1"])
best_model = results[best_name]["model"]
best_f1    = results[best_name]["metrics"]["f1"]
print(f"\n[BEST] Best model : {best_name}  (F1={best_f1})")


# ─────────────────────────────────────────────────────────────────────────────
# 10. Feature importance
# ─────────────────────────────────────────────────────────────────────────────
feature_importance: dict = {}
if hasattr(best_model, "feature_importances_"):
    fi = best_model.feature_importances_
    feature_importance = {
        FEATURE_COLS[i]: round(float(fi[i]), 6) for i in range(len(FEATURE_COLS))
    }
    feature_importance = dict(
        sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    )
    print("\n[FEAT] Feature importance (top 6):")
    for feat, imp in list(feature_importance.items())[:6]:
        bar = "#" * int(imp * 40)
        print(f"   {feat:<35} {imp:.4f}  {bar}")
elif hasattr(best_model, "coef_"):
    # Logistic Regression: use mean absolute coefficient
    coefs = np.abs(best_model.coef_).mean(axis=0)
    feature_importance = {
        FEATURE_COLS[i]: round(float(coefs[i]), 6) for i in range(len(FEATURE_COLS))
    }
    feature_importance = dict(
        sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    )


# ─────────────────────────────────────────────────────────────────────────────
# 11. Save artifacts
# ─────────────────────────────────────────────────────────────────────────────
print("\n[SAVE] Saving artifacts to ./ml_models/ ...")

joblib.dump(best_model,    OUTPUT_DIR / "best_model.pkl")
joblib.dump(scaler,        OUTPUT_DIR / "scaler.pkl")
joblib.dump(label_encoder, OUTPUT_DIR / "label_encoder.pkl")
joblib.dump(FEATURE_COLS,  OUTPUT_DIR / "feature_columns.pkl")

(OUTPUT_DIR / "model_name.txt").write_text(best_name)
(OUTPUT_DIR / "dataset_version.txt").write_text(DATASET_VERSION)

# Full model info JSON
metrics_for_json = {}
confusion_matrices = {}
for name, data in results.items():
    m = {k: v for k, v in data["metrics"].items()
         if k not in ("confusion_matrix", "classification_report")}
    metrics_for_json[name] = m
    confusion_matrices[name] = data["metrics"]["confusion_matrix"]

model_info = {
    "best_model":          best_name,
    "dataset_version":     DATASET_VERSION,
    "n_classes":           n_classes,
    "class_names":         class_names,
    "feature_columns":     FEATURE_COLS,
    "n_features":          len(FEATURE_COLS),
    "feature_importance":  feature_importance,
    "model_metrics":       metrics_for_json,
    "confusion_matrices":  confusion_matrices,
    "train_size":          int(len(X_train)),
    "test_size":           int(len(X_test)),
}

(OUTPUT_DIR / "model_info.json").write_text(json.dumps(model_info, indent=2))
(OUTPUT_DIR / "model_metrics.json").write_text(json.dumps(metrics_for_json, indent=2))

# all_models.pkl not saved - model comparison data is captured in model_metrics.json above

print("[OK] Training complete!")
print(f"   best_model.pkl | scaler.pkl | label_encoder.pkl | feature_columns.pkl")
print(f"   model_info.json | model_metrics.json")
print(f"\n   Classes   : {class_names}")
print(f"   Best model: {best_name}  F1={best_f1}")
print(f"\n   Run the backend and you are ready to predict!\n")
