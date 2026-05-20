"""
PulmoScan AI – Machine Learning Service
Loads trained models and runs predictions.
"""
import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List

# Path to saved model artifacts
MODEL_DIR = Path(__file__).parent.parent.parent / "ml_models"


class MLService:
    """Singleton ML service – loads models once at startup."""

    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.feature_columns = None
        self.model_name = "Random Forest"
        self._load_models()

    def _load_models(self):
        """Load saved model artifacts from disk."""
        try:
            self.model = joblib.load(MODEL_DIR / "best_model.pkl")
            self.scaler = joblib.load(MODEL_DIR / "scaler.pkl")
            self.label_encoder = joblib.load(MODEL_DIR / "encoder.pkl")
            self.feature_columns = joblib.load(MODEL_DIR / "feature_columns.pkl")
            # Try to read the model name saved alongside
            name_path = MODEL_DIR / "model_name.txt"
            if name_path.exists():
                self.model_name = name_path.read_text().strip()
            print(f"✅ ML Model loaded: {self.model_name}")
        except FileNotFoundError:
            print("⚠️  Trained model not found – using fallback heuristic predictor")
            self.model = None

    def _build_feature_vector(self, patient: Dict[str, Any]) -> np.ndarray:
        """Convert patient dict to a scaled feature array."""
        gender_encoded = 1 if patient.get("GENDER", "M") == "M" else 0
        features = {
            "AGE": patient["AGE"],
            "GENDER": gender_encoded,
            "SMOKING": patient["SMOKING"],
            "YELLOW_FINGERS": patient["YELLOW_FINGERS"],
            "ANXIETY": patient["ANXIETY"],
            "PEER_PRESSURE": patient["PEER_PRESSURE"],
            "CHRONIC_DISEASE": patient["CHRONIC_DISEASE"],
            "FATIGUE": patient["FATIGUE"],
            "ALLERGY": patient["ALLERGY"],
            "WHEEZING": patient["WHEEZING"],
            "ALCOHOL_CONSUMING": patient["ALCOHOL_CONSUMING"],
            "COUGHING": patient["COUGHING"],
            "SHORTNESS_OF_BREATH": patient["SHORTNESS_OF_BREATH"],
            "SWALLOWING_DIFFICULTY": patient["SWALLOWING_DIFFICULTY"],
            "CHEST_PAIN": patient["CHEST_PAIN"],
        }
        # Ensure column ordering matches training
        if self.feature_columns:
            arr = np.array([[features[c] for c in self.feature_columns]])
        else:
            arr = np.array([[v for v in features.values()]])

        if self.scaler:
            arr = self.scaler.transform(arr)
        return arr

    def predict(self, patient: Dict[str, Any]) -> Dict[str, Any]:
        """Run prediction for a single patient."""
        if self.model is None:
            return self._heuristic_predict(patient)

        X = self._build_feature_vector(patient)
        raw_pred = self.model.predict(X)[0]
        proba = self.model.predict_proba(X)[0]

        # Decode label if encoder was used
        if self.label_encoder:
            try:
                label = self.label_encoder.inverse_transform([raw_pred])[0]
            except Exception:
                label = str(raw_pred)
        else:
            label = "YES" if raw_pred == 1 else "NO"

        high_risk = label.upper() in ("YES", "1", "HIGH")

        # Find the probability of the positive (cancer=YES) class
        pos_idx = None
        for i, cls in enumerate(self.model.classes_):
            try:
                decoded = self.label_encoder.inverse_transform([cls])[0].upper() if self.label_encoder else str(cls).upper()
                if decoded in ("YES", "1", "HIGH"):
                    pos_idx = i
                    break
            except Exception:
                pass
        risk_prob = float(proba[pos_idx]) if pos_idx is not None else float(proba[1] if len(proba) > 1 else proba[0])

        return {
            "high_risk": high_risk,
            "risk_probability": risk_prob,
            "model_used": self.model_name,
        }

    def _heuristic_predict(self, patient: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based predictor when no trained model exists."""
        score = 0
        if patient.get("SMOKING", 1) == 2:
            score += 3
        if patient.get("CHEST_PAIN", 1) == 2:
            score += 2
        if patient.get("SHORTNESS_OF_BREATH", 1) == 2:
            score += 2
        if patient.get("COUGHING", 1) == 2:
            score += 1
        if patient.get("WHEEZING", 1) == 2:
            score += 1
        if patient.get("CHRONIC_DISEASE", 1) == 2:
            score += 1
        if patient.get("AGE", 40) > 55:
            score += 1
        high_risk = score >= 5
        risk_prob = min(score / 10.0, 0.95)
        return {
            "high_risk": high_risk,
            "risk_probability": risk_prob,
            "model_used": "Heuristic Rule Engine",
        }

    @staticmethod
    def estimate_subtype(patient: Dict[str, Any], high_risk: bool) -> tuple[str | None, str]:
        """
        Heuristic subtype classification.
        Returns (subtype, note).
        DISCLAIMER: NOT medically diagnostic.
        """
        NOTE = (
            "Subtype classification is heuristic-based and not medically diagnostic. "
            "Confirmed diagnosis requires histopathological examination."
        )
        if not high_risk:
            return None, NOTE

        # SCLC heuristic: heavy smoking + chest pain + shortness of breath
        if (
            patient.get("SMOKING", 1) == 2
            and patient.get("CHEST_PAIN", 1) == 2
            and patient.get("SHORTNESS_OF_BREATH", 1) == 2
        ):
            return "SCLC", NOTE
        return "NSCLC", NOTE

    @staticmethod
    def get_recommendations(prediction_label: str) -> List[str]:
        if prediction_label == "HIGH RISK":
            return [
                "Immediate referral to oncology specialist",
                "CT scan of the chest recommended",
                "Consider bronchoscopy or biopsy evaluation",
                "Smoking cessation program – urgent",
                "Pulmonary function tests",
                "Follow-up within 2 weeks",
            ]
        return [
            "Schedule follow-up appointment within 3 months",
            "Chest X-ray screening recommended",
            "Smoking cessation if applicable",
            "Monitor and report any worsening symptoms",
            "Maintain a healthy lifestyle and balanced diet",
        ]


# ── Module-level singleton ────────────────────────────────────────────────────
_ml_service: MLService | None = None


def get_ml_service() -> MLService:
    global _ml_service
    if _ml_service is None:
        _ml_service = MLService()
    return _ml_service
