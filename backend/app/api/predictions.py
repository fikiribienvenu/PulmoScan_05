"""
PulmoScan AI v2 – Prediction Routes
POST /predict           – single patient multi-class prediction
POST /batch-predict     – CSV / Excel batch upload
GET  /patients          – paginated prediction history
GET  /patients/{id}     – single record
GET  /download/csv      – export CSV
GET  /download/excel    – export Excel
"""
import io
import csv
from datetime import datetime, timezone
from typing import List

import pandas as pd
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse

from app.models.schemas import PatientInput, PredictionResponse
from app.core.security import get_current_doctor
from app.core.database import get_collection
from app.services.ml_service import get_ml_service
from app.services.gemini_service import get_gemini_explanation

router = APIRouter(tags=["Predictions"])


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


async def _log_audit(doctor_email: str, action: str, detail: str = ""):
    col = get_collection("audit_logs")
    await col.insert_one({
        "doctor_email": doctor_email,
        "action":       action,
        "detail":       detail,
        "created_at":   datetime.now(timezone.utc),
    })


# ── Single Prediction ─────────────────────────────────────────────────────────

@router.post("/predict", response_model=PredictionResponse)
async def predict(
    patient: PatientInput,
    current_doctor: dict = Depends(get_current_doctor),
):
    """Run multi-class ML prediction for a single patient."""
    ml   = get_ml_service()
    data = patient.model_dump()

    result     = ml.predict(data)
    subtype    = result["subtype_prediction"]
    confidence = result["confidence_score"]
    class_probs = result["class_probabilities"]
    risk_level  = result["risk_level"]
    model_used  = result["model_used"]
    ds_version  = result["dataset_version"]

    recommendations = ml.get_recommendations(subtype, risk_level)

    gemini_text = await get_gemini_explanation(
        data, subtype, confidence, risk_level, class_probs, recommendations
    )

    doc = {
        **data,
        "subtype_prediction":  subtype,
        "confidence_score":    confidence,
        "class_probabilities": class_probs,
        "risk_level":          risk_level,
        "model_used":          model_used,
        "dataset_version":     ds_version,
        "recommendations":     recommendations,
        "gemini_explanation":  gemini_text,
        "doctor_email":        current_doctor["email"],
        "doctor_id":           current_doctor["doctor_id"],
        "created_at":          datetime.now(timezone.utc),
    }

    col      = get_collection("predictions")
    inserted = await col.insert_one(doc)

    await _log_audit(
        current_doctor["email"],
        "single_prediction",
        f"Patient: {patient.patient_name} | Subtype: {subtype} | Confidence: {confidence:.0%}",
    )

    return PredictionResponse(
        patient_name       = patient.patient_name,
        subtype_prediction = subtype,
        confidence_score   = confidence,
        class_probabilities= class_probs,
        risk_level         = risk_level,
        model_used         = model_used,
        dataset_version    = ds_version,
        recommendations    = recommendations,
        gemini_explanation = gemini_text,
        prediction_id      = str(inserted.inserted_id),
        created_at         = doc["created_at"],
    )


# ── Batch Prediction ──────────────────────────────────────────────────────────

@router.post("/batch-predict")
async def batch_predict(
    file: UploadFile = File(...),
    current_doctor: dict = Depends(get_current_doctor),
):
    """Process a CSV or Excel file with multiple patients."""
    content = await file.read()
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Only CSV or Excel files accepted")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"File parsing error: {exc}")

    required = [
        "patient_name", "patient_age", "patient_gender", "smoking_history",
        "family_history", "nodule_size_mm", "tumor_location", "tumor_stage",
        "EGFR_mutation_status", "KRAS_mutation_status", "ALK_fusion_status",
        "PD_L1_expression_level", "tumor_mutational_burden",
    ]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}. "
                   f"Download the batch template for the correct format.",
        )

    ml      = get_ml_service()
    col     = get_collection("predictions")
    results = []

    for _, row in df.iterrows():
        try:
            p = row.to_dict()
            p["patient_name"] = str(p.get("patient_name", "Unknown"))

            result      = ml.predict(p)
            subtype     = result["subtype_prediction"]
            confidence  = result["confidence_score"]
            risk_level  = result["risk_level"]
            recs        = ml.get_recommendations(subtype, risk_level)

            doc = {
                **p,
                "subtype_prediction":  subtype,
                "confidence_score":    confidence,
                "class_probabilities": result["class_probabilities"],
                "risk_level":          risk_level,
                "model_used":          result["model_used"],
                "dataset_version":     result["dataset_version"],
                "recommendations":     recs,
                "gemini_explanation":  None,
                "doctor_email":        current_doctor["email"],
                "doctor_id":           current_doctor["doctor_id"],
                "batch_upload":        True,
                "source_file":         file.filename,
                "created_at":          datetime.now(timezone.utc),
            }
            inserted = await col.insert_one(doc)
            results.append({
                "patient_name":       p["patient_name"],
                "patient_age":        p.get("patient_age"),
                "patient_gender":     p.get("patient_gender"),
                "subtype_prediction": subtype,
                "confidence_score":   f"{confidence:.1%}",
                "risk_level":         risk_level,
                "prediction_id":      str(inserted.inserted_id),
            })
        except Exception as exc:
            results.append({
                "patient_name": row.get("patient_name", "?"),
                "error": str(exc),
            })

    await get_collection("batch_uploads").insert_one({
        "filename":     file.filename,
        "doctor_email": current_doctor["email"],
        "total_rows":   len(df),
        "processed":    len([r for r in results if "error" not in r]),
        "errors":       len([r for r in results if "error" in r]),
        "created_at":   datetime.now(timezone.utc),
    })

    await _log_audit(
        current_doctor["email"],
        "batch_prediction",
        f"File: {file.filename} | Rows: {len(df)} | Processed: {len(results)}",
    )

    return {"total": len(results), "processed": len([r for r in results if "error" not in r]), "results": results}


# ── Patient Records ───────────────────────────────────────────────────────────

@router.get("/patients")
async def get_patients(
    page:           int  = Query(1, ge=1),
    limit:          int  = Query(20, ge=1, le=100),
    search:         str  = Query(""),
    subtype_filter: str  = Query(""),
    risk_filter:    str  = Query(""),
    current_doctor: dict = Depends(get_current_doctor),
):
    """Return paginated patient prediction records for the authenticated doctor."""
    col   = get_collection("predictions")
    query: dict = {"doctor_email": current_doctor["email"]}

    if search:
        query["patient_name"] = {"$regex": search, "$options": "i"}
    if subtype_filter:
        query["subtype_prediction"] = subtype_filter
    if risk_filter:
        query["risk_level"] = risk_filter

    total  = await col.count_documents(query)
    cursor = (
        col.find(query)
        .sort("created_at", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    records = []
    async for doc in cursor:
        _serialize(doc)
        records.append(doc)

    return {"total": total, "page": page, "limit": limit, "records": records}


@router.get("/patients/{patient_id}")
async def get_patient(
    patient_id:     str,
    current_doctor: dict = Depends(get_current_doctor),
):
    """Return a single prediction record by ID."""
    col = get_collection("predictions")
    try:
        doc = await col.find_one({
            "_id":          ObjectId(patient_id),
            "doctor_email": current_doctor["email"],
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Record not found")
    _serialize(doc)
    return doc


# ── Model Info ────────────────────────────────────────────────────────────────

@router.get("/model-info")
async def model_info(current_doctor: dict = Depends(get_current_doctor)):
    """Return loaded model metadata, metrics, and feature importance."""
    ml = get_ml_service()
    return ml.get_model_info()


# ── Download ──────────────────────────────────────────────────────────────────

@router.get("/download/csv")
async def download_csv(current_doctor: dict = Depends(get_current_doctor)):
    """Stream all predictions for this doctor as a CSV file."""
    col    = get_collection("predictions")
    cursor = col.find({"doctor_email": current_doctor["email"]}).sort("created_at", -1)

    output = io.StringIO()
    writer = None
    async for doc in cursor:
        doc.pop("_id", None)
        doc.pop("gemini_explanation", None)
        doc.pop("recommendations", None)
        doc.pop("class_probabilities", None)
        doc["created_at"] = str(doc.get("created_at", ""))
        if writer is None:
            writer = csv.DictWriter(output, fieldnames=list(doc.keys()))
            writer.writeheader()
        writer.writerow(doc)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=pulmoscan_records.csv"},
    )


@router.get("/download/excel")
async def download_excel(current_doctor: dict = Depends(get_current_doctor)):
    """Stream all predictions for this doctor as an Excel file."""
    col    = get_collection("predictions")
    cursor = col.find({"doctor_email": current_doctor["email"]}).sort("created_at", -1)

    rows = []
    async for doc in cursor:
        doc.pop("_id", None)
        doc.pop("gemini_explanation", None)
        doc.pop("recommendations", None)
        doc.pop("class_probabilities", None)
        doc["created_at"] = str(doc.get("created_at", ""))
        rows.append(doc)

    out = io.BytesIO()
    pd.DataFrame(rows).to_excel(out, index=False, sheet_name="PulmoScan Records")
    out.seek(0)

    return StreamingResponse(
        iter([out.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=pulmoscan_records.xlsx"},
    )


# ── Batch template download ───────────────────────────────────────────────────

@router.get("/download/batch-template")
async def download_batch_template():
    """Download a CSV template for batch predictions."""
    cols = [
        "patient_name", "patient_age", "patient_gender", "smoking_history",
        "family_history", "nodule_size_mm", "tumor_location", "tumor_stage",
        "EGFR_mutation_status", "KRAS_mutation_status", "ALK_fusion_status",
        "PD_L1_expression_level", "tumor_mutational_burden",
    ]
    sample = [
        "John Doe", 58, "Male", "Current", 1, 24.5, "Right Lung", "Stage III",
        1, 0, 0, 45.2, 12.3,
    ]
    out = io.StringIO()
    w   = csv.writer(out)
    w.writerow(cols)
    w.writerow(sample)
    out.seek(0)
    return StreamingResponse(
        iter([out.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=batch_template.csv"},
    )
