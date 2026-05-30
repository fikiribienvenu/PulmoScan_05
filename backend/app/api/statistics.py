"""
PulmoScan AI v2 – Statistics & Analytics Routes
GET /statistics    – platform-wide + doctor-specific stats
GET /model-metrics – all model comparison metrics
"""
import json
from pathlib import Path
from fastapi import APIRouter, Depends
from app.core.security import get_current_doctor
from app.core.database import get_collection
from app.services.ml_service import get_ml_service

router = APIRouter(tags=["Statistics"])

MODEL_DIR = Path(__file__).parent.parent.parent / "ml_models"

# CHUB Butare – confirmed lung cancer case data 2022-2025
YEARLY_CASES = [
    {"year": 2022, "cases": 22},
    {"year": 2023, "cases": 47},
    {"year": 2024, "cases": 36},
    {"year": 2025, "cases": 30},
]

YEARLY_GENDER = [
    {"year": 2022, "male": 14, "female": 8},
    {"year": 2023, "male": 31, "female": 16},
    {"year": 2024, "male": 23, "female": 13},
    {"year": 2025, "male": 19, "female": 11},
]

CHUB_TOTALS = {
    "total":      135,
    "male":        87,
    "female":      48,
    "peak_year":  2023,
    "peak_cases":  47,
}


@router.get("/statistics")
async def get_statistics(current_doctor: dict = Depends(get_current_doctor)):
    """Return platform-wide and doctor-specific analytics."""
    col = get_collection("predictions")
    ml  = get_ml_service()

    # ── Platform totals ───────────────────────────────────────────────────────
    total        = await col.count_documents({})
    male_count   = await col.count_documents({"patient_gender": {"$in": ["Male", "M"]}})
    female_count = await col.count_documents({"patient_gender": {"$in": ["Female", "F"]}})

    # ── Subtype distribution ──────────────────────────────────────────────────
    subtype_pipeline = [
        {"$group": {"_id": "$subtype_prediction", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    subtype_cursor = col.aggregate(subtype_pipeline)
    subtype_raw    = []
    async for doc in subtype_cursor:
        if doc["_id"]:
            subtype_raw.append({"subtype": doc["_id"], "count": doc["count"]})

    subtype_distribution = [
        {
            "subtype":    s["subtype"],
            "count":      s["count"],
            "percentage": round(s["count"] / total * 100, 1) if total else 0,
        }
        for s in subtype_raw
    ]

    # ── Risk level distribution ───────────────────────────────────────────────
    risk_pipeline = [
        {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}},
    ]
    risk_cursor = col.aggregate(risk_pipeline)
    risk_dist   = {}
    async for doc in risk_cursor:
        if doc["_id"]:
            risk_dist[doc["_id"]] = doc["count"]

    # ── Doctor-specific stats ─────────────────────────────────────────────────
    email         = current_doctor["email"]
    doctor_total  = await col.count_documents({"doctor_email": email})
    doctor_recent = []
    cursor = (
        col.find({"doctor_email": email})
        .sort("created_at", -1)
        .limit(5)
    )
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        doctor_recent.append({
            "id":                 doc["id"],
            "patient_name":       doc.get("patient_name", "N/A"),
            "subtype_prediction": doc.get("subtype_prediction", "N/A"),
            "risk_level":         doc.get("risk_level", "N/A"),
            "confidence_score":   doc.get("confidence_score", 0),
            "created_at":         str(doc.get("created_at", "")),
        })

    # Doctor subtype breakdown
    doc_subtype_pipeline = [
        {"$match": {"doctor_email": email}},
        {"$group": {"_id": "$subtype_prediction", "count": {"$sum": 1}}},
    ]
    doc_subtype_cursor = col.aggregate(doc_subtype_pipeline)
    doc_subtype = {}
    async for doc in doc_subtype_cursor:
        if doc["_id"]:
            doc_subtype[doc["_id"]] = doc["count"]

    # ── Model metrics from file ───────────────────────────────────────────────
    model_metrics = ml.model_metrics
    if not model_metrics:
        p = MODEL_DIR / "model_metrics.json"
        if p.exists():
            model_metrics = json.loads(p.read_text())

    return {
        "total_predictions":    total,
        "subtype_distribution": subtype_distribution,
        "risk_distribution":    risk_dist,
        "gender_breakdown":     {"male": male_count, "female": female_count},
        "yearly_cases":         YEARLY_CASES,
        "yearly_gender":        YEARLY_GENDER,
        "chub_totals":          CHUB_TOTALS,
        "model_metrics":        model_metrics,
        "best_model":           ml.model_name,
        "class_names":          ml.class_names,
        "doctor_stats": {
            "total":            doctor_total,
            "subtype_breakdown": doc_subtype,
            "recent":           doctor_recent,
        },
    }


@router.get("/model-metrics")
async def get_model_metrics(current_doctor: dict = Depends(get_current_doctor)):
    """Return full model comparison metrics including confusion matrices."""
    ml = get_ml_service()
    info_path = MODEL_DIR / "model_info.json"
    if info_path.exists():
        return json.loads(info_path.read_text())
    return {
        "best_model":      ml.model_name,
        "class_names":     ml.class_names,
        "model_metrics":   ml.model_metrics,
        "feature_importance": ml.feature_importance,
    }
