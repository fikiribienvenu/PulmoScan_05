"""
PulmoScan AI v2 - Multi-class ML Inference Service
Loads trained artifacts and performs lung cancer subtype prediction.
"""
import json
import joblib
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional

MODEL_DIR = Path(__file__).parent.parent.parent / "ml_models"

# Encoding maps - must stay in sync with train_multiclass.py
GENDER_MAP   = {"Male": 1, "Female": 0, "M": 1, "F": 0}
SMOKING_MAP  = {"Never": 0, "Former": 1, "Current": 2}
LOCATION_MAP = {"Right Lung": 0, "Left Lung": 1, "Bilateral": 2, "Central": 3, "Other": 4}
STAGE_MAP    = {"Stage 0": 0, "Stage I": 1, "Stage II": 2, "Stage III": 3, "Stage IV": 4}

# Risk level per subtype
SUBTYPE_RISK = {
    "No Cancer":       "Low",
    "Adenocarcinoma":  "High",
    "Squamous Cell":   "High",
    "SCLC":            "Critical",
    "Large Cell":      "High",
    "Small Cell":      "Critical",
    "Cancer":          "High",
}

# Clinical recommendations per subtype
RECOMMENDATIONS: Dict[str, List[str]] = {
    "No Cancer": [
        "Schedule follow-up imaging in 6-12 months",
        "Annual low-dose CT screening (if high-risk criteria met)",
        "Smoking cessation counselling if applicable",
        "Maintain healthy weight and balanced diet",
        "Report any new respiratory symptoms promptly",
    ],
    "Adenocarcinoma": [
        "PRIORITY: Refer to thoracic oncology within 1 week",
        "Complete molecular profiling: EGFR, ALK, ROS1, BRAF, MET, RET",
        "PET-CT scan for comprehensive staging",
        "Multidisciplinary tumour board (MDT) review",
        "Discuss targeted therapy options based on genomic profile",
        "Smoking cessation - urgent priority",
        "Consider clinical trial eligibility",
    ],
    "Squamous Cell": [
        "PRIORITY: Urgent referral to thoracic oncology",
        "Bronchoscopy for histological confirmation",
        "Staging workup: CT chest / abdomen / pelvis",
        "PD-L1 immunohistochemistry and TMB testing",
        "Evaluate immunotherapy (pembrolizumab) eligibility",
        "Pulmonary function tests before treatment planning",
        "Smoking cessation - critical",
    ],
    "SCLC": [
        "EMERGENCY: Immediate oncology referral - rapid progression expected",
        "Brain MRI for CNS staging",
        "Full-body PET-CT scan urgently",
        "Initiate combination chemotherapy (EP/EC regimen) evaluation",
        "Prophylactic cranial irradiation (PCI) consideration",
        "Clinical trial eligibility assessment",
        "Palliative care team involvement for supportive planning",
    ],
    "Large Cell": [
        "Urgent referral to thoracic oncology",
        "Comprehensive molecular profiling",
        "Full staging workup required",
        "Discuss surgical resection if early-stage",
        "MDT review for treatment planning",
    ],
}

_GENERIC_RECS = [
    "Refer to pulmonology / oncology specialist",
    "Complete histological staging workup",
    "Multidisciplinary team consultation",
    "Patient education and psychosocial support",
]


class MLService:
    """Singleton - loads model artifacts once at app startup."""

    def __init__(self):
        self.model            = None
        self.scaler           = None
        self.label_encoder    = None
        self.feature_columns: List[str] = []
        self.model_name       = "Unknown"
        self.class_names: List[str] = []
        self.dataset_version  = "LungCanC2024"
        self.feature_importance: Dict[str, float] = {}
        self.model_metrics: Dict = {}
        self.all_models: Dict   = {}
        self.n_classes          = 0
        self._load()

    # ── Loader ────────────────────────────────────────────────────────────────

    def _load(self):
        try:
            self.model          = joblib.load(MODEL_DIR / "best_model.pkl")
            self.scaler         = joblib.load(MODEL_DIR / "scaler.pkl")
            self.label_encoder  = joblib.load(MODEL_DIR / "label_encoder.pkl")
            self.feature_columns = joblib.load(MODEL_DIR / "feature_columns.pkl")

            p = MODEL_DIR / "model_name.txt"
            if p.exists():
                self.model_name = p.read_text().strip()

            p = MODEL_DIR / "dataset_version.txt"
            if p.exists():
                self.dataset_version = p.read_text().strip()

            p = MODEL_DIR / "model_info.json"
            if p.exists():
                info = json.loads(p.read_text())
                self.class_names        = info.get("class_names", [])
                self.feature_importance = info.get("feature_importance", {})
                self.n_classes          = info.get("n_classes", 0)

            if not self.class_names and self.label_encoder is not None:
                self.class_names = list(self.label_encoder.classes_)
                self.n_classes   = len(self.class_names)

            p = MODEL_DIR / "model_metrics.json"
            if p.exists():
                self.model_metrics = json.loads(p.read_text())

            # all_models.pkl omitted — model comparison data is in model_metrics.json

            print(
                f"[OK] ML loaded: {self.model_name} | "
                f"Classes: {self.class_names} | "
                f"Features: {len(self.feature_columns)}"
            )
        except FileNotFoundError:
            print(
                "[WARN] No trained model found.\n"
                "       Run: python train_multiclass.py"
            )

    # ── Feature encoding ──────────────────────────────────────────────────────

    def _encode(self, patient: Dict[str, Any]) -> np.ndarray:
        """Convert a patient dict into a scaled feature array."""
        # Normalise patient keys to lowercase for case-insensitive lookup.
        # This makes encoding work whether feature_columns.pkl stores
        # 'egfr_mutation_status' (new) or 'EGFR_mutation_status' (old).
        p = {k.lower(): v for k, v in patient.items()}
        row: Dict[str, float] = {}

        for col in self.feature_columns:
            c = col.lower()   # normalise the stored column name too

            if c == "patient_age":
                row[col] = float(p.get("patient_age", 50))

            elif c == "patient_gender":
                raw = str(p.get("patient_gender", "Male"))
                row[col] = float(GENDER_MAP.get(raw, 1))

            elif c == "smoking_history":
                raw = str(p.get("smoking_history", "Never"))
                row[col] = float(SMOKING_MAP.get(raw, 0))

            elif c == "family_history":
                row[col] = float(p.get("family_history", 0))

            elif c == "nodule_size_mm":
                row[col] = float(p.get("nodule_size_mm", 5.0))

            elif c == "tumor_location":
                raw = str(p.get("tumor_location", "Right Lung"))
                row[col] = float(LOCATION_MAP.get(raw, 0))

            elif c == "tumor_stage":
                raw = str(p.get("tumor_stage", "Stage II"))
                row[col] = float(STAGE_MAP.get(raw, 2))

            elif c in ("egfr_mutation_status", "kras_mutation_status", "alk_fusion_status"):
                row[col] = float(p.get(c, 0))

            elif c == "pd_l1_expression_level":
                row[col] = float(p.get("pd_l1_expression_level", 0.0))

            elif c == "tumor_mutational_burden":
                row[col] = float(p.get("tumor_mutational_burden", 0.0))

            else:
                # Imaging features, treatment flags, engineered features — use as-is
                try:
                    row[col] = float(p.get(c, 0))
                except (TypeError, ValueError):
                    row[col] = 0.0

        arr = np.array([[row.get(c, 0.0) for c in self.feature_columns]])
        if self.scaler is not None:
            arr = self.scaler.transform(arr)
        return arr

    # ── Risk level ────────────────────────────────────────────────────────────

    @staticmethod
    def _risk(subtype: str, confidence: float) -> str:
        base = SUBTYPE_RISK.get(subtype, "Moderate")
        # Reduce certainty for borderline confidence
        if confidence < 0.45 and base in ("High", "Critical"):
            return "Moderate"
        return base

    # ── Main predict ──────────────────────────────────────────────────────────

    def predict(self, patient: Dict[str, Any]) -> Dict[str, Any]:
        """Run multi-class inference for one patient."""
        if self.model is None:
            return self._fallback(patient)

        X       = self._encode(patient)
        raw     = self.model.predict(X)[0]
        probas  = self.model.predict_proba(X)[0]
        classes = (
            list(self.label_encoder.classes_)
            if self.label_encoder is not None
            else self.class_names
        )

        subtype = (
            str(self.label_encoder.inverse_transform([raw])[0])
            if self.label_encoder is not None
            else str(raw)
        )
        confidence = float(probas.max())
        class_probs = {
            str(cls): round(float(p), 4)
            for cls, p in zip(classes, probas)
        }

        return {
            "subtype_prediction":  subtype,
            "confidence_score":    round(confidence, 4),
            "class_probabilities": class_probs,
            "risk_level":          self._risk(subtype, confidence),
            "model_used":          self.model_name,
            "dataset_version":     self.dataset_version,
        }

    # ── Heuristic fallback ────────────────────────────────────────────────────

    def _fallback(self, patient: Dict[str, Any]) -> Dict[str, Any]:
        egfr   = int(patient.get("EGFR_mutation_status", 0))
        alk    = int(patient.get("ALK_fusion_status", 0))
        kras   = int(patient.get("KRAS_mutation_status", 0))
        smoke  = str(patient.get("smoking_history", "Never"))
        stage  = STAGE_MAP.get(str(patient.get("tumor_stage", "Stage I")), 1)
        nodule = float(patient.get("nodule_size_mm", 5.0))
        pdl1   = float(patient.get("PD_L1_expression_level", 0.0))

        if egfr or alk:
            subtype = "Adenocarcinoma"
            conf    = 0.72
        elif kras and smoke in ("Current", "Former"):
            subtype = "Squamous Cell"
            conf    = 0.65
        elif stage >= 3 and nodule > 15:
            subtype = "SCLC"
            conf    = 0.55
        elif nodule < 3 and stage <= 1:
            subtype = "No Cancer"
            conf    = 0.80
        else:
            subtype = "Adenocarcinoma"
            conf    = 0.50

        return {
            "subtype_prediction":  subtype,
            "confidence_score":    conf,
            "class_probabilities": {subtype: conf, "No Cancer": round(1 - conf, 4)},
            "risk_level":          self._risk(subtype, conf),
            "model_used":          "Heuristic Rule Engine (no model loaded)",
            "dataset_version":     "N/A",
        }

    # ── Recommendations ───────────────────────────────────────────────────────

    @staticmethod
    def get_recommendations(subtype: str, risk_level: str) -> List[str]:
        recs = list(RECOMMENDATIONS.get(subtype, _GENERIC_RECS))
        if risk_level == "Critical" and not any("EMERGENCY" in r for r in recs):
            recs.insert(0, "CRITICAL: Arrange emergency oncology review immediately")
        return recs

    # ── Model info getters ────────────────────────────────────────────────────

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "best_model":         self.model_name,
            "dataset_version":    self.dataset_version,
            "class_names":        self.class_names,
            "n_classes":          self.n_classes,
            "feature_columns":    self.feature_columns,
            "feature_importance": self.feature_importance,
            "model_metrics":      self.model_metrics,
        }


# ── Module-level singleton ────────────────────────────────────────────────────
_svc: Optional[MLService] = None


def get_ml_service() -> MLService:
    global _svc
    if _svc is None:
        _svc = MLService()
    return _svc
