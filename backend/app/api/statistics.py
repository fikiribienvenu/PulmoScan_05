"""
PulmoScan AI – Statistics Routes
GET /statistics
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_doctor
from app.core.database import get_collection

router = APIRouter(tags=["Statistics"])

# Historical CHUB case data (provided in project spec)
YEARLY_CASES = [
    {"year": 2022, "cases": 22},
    {"year": 2023, "cases": 47},
    {"year": 2024, "cases": 36},
    {"year": 2025, "cases": 30},
]

# Model performance from training (populated by train_models.py)
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

    # Total counts
    total = await col.count_documents({})
    high_risk = await col.count_documents({"prediction": "HIGH RISK"})
    low_risk = await col.count_documents({"prediction": "LOW RISK"})

    # Gender breakdown
    male_count = await col.count_documents({"GENDER": "M"})
    female_count = await col.count_documents({"GENDER": "F"})

    # NSCLC / SCLC breakdown
    nsclc = await col.count_documents({"subtype": "NSCLC"})
    sclc  = await col.count_documents({"subtype": "SCLC"})

    # Doctor-specific
    doctor_total = await col.count_documents({"doctor_email": current_doctor["email"]})
    doctor_high  = await col.count_documents(
        {"doctor_email": current_doctor["email"], "prediction": "HIGH RISK"}
    )

    return {
        "total_predictions": total,
        "high_risk_count": high_risk,
        "low_risk_count": low_risk,
        "yearly_cases": YEARLY_CASES,
        "gender_breakdown": {"male": male_count, "female": female_count},
        "subtype_breakdown": {"nsclc": nsclc, "sclc": sclc},
        "model_metrics": MODEL_METRICS,
        "doctor_stats": {
            "total": doctor_total,
            "high_risk": doctor_high,
            "low_risk": doctor_total - doctor_high,
        },
    }
