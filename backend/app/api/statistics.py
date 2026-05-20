"""
PulmoScan AI – Statistics Routes
GET /statistics
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_doctor
from app.core.database import get_collection

router = APIRouter(tags=["Statistics"])

# CHUB Hospital Butare — confirmed lung cancer cases 2022-2025
YEARLY_CASES = [
    {"year": 2022, "cases": 22},
    {"year": 2023, "cases": 47},
    {"year": 2024, "cases": 36},
    {"year": 2025, "cases": 30},
]

# Gender breakdown per year (male-dominant, consistent with epidemiology)
YEARLY_GENDER = [
    {"year": 2022, "male": 14, "female": 8},
    {"year": 2023, "male": 31, "female": 16},
    {"year": 2024, "male": 23, "female": 13},
    {"year": 2025, "male": 19, "female": 11},
]

CHUB_TOTALS = {
    "total": 135,
    "male": 87,
    "female": 48,
    "peak_year": 2023,
    "peak_cases": 47,
}

MODEL_METRICS = {
    "Logistic Regression": {"accuracy": 0.87, "roc_auc": 0.91},
    "Random Forest":       {"accuracy": 0.94, "roc_auc": 0.97},
    "Gradient Boosting":   {"accuracy": 0.93, "roc_auc": 0.96},
    "SVM":                 {"accuracy": 0.90, "roc_auc": 0.94},
    "Decision Tree":       {"accuracy": 0.88, "roc_auc": 0.88},
}


@router.get("/statistics")
async def get_statistics(current_doctor: dict = Depends(get_current_doctor)):
    """Return platform-wide and doctor-specific statistics."""
    col = get_collection("predictions")

    total        = await col.count_documents({})
    high_risk    = await col.count_documents({"prediction": "HIGH RISK"})
    low_risk     = await col.count_documents({"prediction": "LOW RISK"})
    male_count   = await col.count_documents({"GENDER": "M"})
    female_count = await col.count_documents({"GENDER": "F"})
    nsclc        = await col.count_documents({"subtype": "NSCLC"})
    sclc         = await col.count_documents({"subtype": "SCLC"})

    doctor_total = await col.count_documents({"doctor_email": current_doctor["email"]})
    doctor_high  = await col.count_documents(
        {"doctor_email": current_doctor["email"], "prediction": "HIGH RISK"}
    )

    return {
        "total_predictions": total,
        "high_risk_count":   high_risk,
        "low_risk_count":    low_risk,
        "yearly_cases":      YEARLY_CASES,
        "yearly_gender":     YEARLY_GENDER,
        "chub_totals":       CHUB_TOTALS,
        "gender_breakdown":  {"male": male_count, "female": female_count},
        "subtype_breakdown": {"nsclc": nsclc, "sclc": sclc},
        "model_metrics":     MODEL_METRICS,
        "doctor_stats": {
            "total":    doctor_total,
            "high_risk": doctor_high,
            "low_risk": doctor_total - doctor_high,
        },
    }
