"""
PulmoScan AI – Prediction Routes
POST /predict          – single patient prediction
POST /batch-predict    – CSV/Excel batch upload
"""
import io
import csv
from datetime import datetime, timezone
from typing import List

import pandas as pd
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse

from app.models.schemas import PatientInput, PredictionResponse
from app.core.security import get_current_doctor
from app.core.database import get_collection
from app.services.ml_service import get_ml_service
from app.services.gemini_service import get_gemini_explanation

router = APIRouter(tags=["Predictions"])


def _serialize_prediction(p: dict) -> dict:
    p["id"] = str(p.pop("_id"))
    return p


# ── Single Prediction ─────────────────────────────────────────────────────────

@router.post("/predict", response_model=PredictionResponse)
async def predict(
    patient: PatientInput,
    current_doctor: dict = Depends(get_current_doctor),
):
    """Run ML prediction for a single patient."""
    ml = get_ml_service()
    patient_dict = patient.model_dump()

    # ML inference
    result = ml.predict(patient_dict)
    risk_prob = result["risk_probability"]
    model_used = result["model_used"]

    # Two-class label based on cancer probability
    high_risk = risk_prob >= 0.5
    prediction_label = "HIGH RISK" if high_risk else "LOW RISK"

    # Subtype heuristic
    subtype, subtype_note = ml.estimate_subtype(patient_dict, high_risk)

    # Recommendations
    recommendations = ml.get_recommendations(prediction_label)
    gemini_text = await get_gemini_explanation(
        patient_dict, prediction_label, risk_prob, subtype
    )

    # Persist to MongoDB
    doc = {
        **patient_dict,
        "prediction": prediction_label,
        "risk_probability": risk_prob,
        "subtype": subtype,
        "subtype_note": subtype_note,
        "model_used": model_used,
        "recommendations": recommendations,
        "gemini_explanation": gemini_text,
        "doctor_email": current_doctor["email"],
        "doctor_id": current_doctor["doctor_id"],
        "created_at": datetime.now(timezone.utc),
    }
    col = get_collection("predictions")
    inserted = await col.insert_one(doc)

    return PredictionResponse(
        patient_name=patient.patient_name,
        prediction=prediction_label,
        risk_probability=risk_prob,
        subtype=subtype,
        subtype_note=subtype_note,
        model_used=model_used,
        recommendations=recommendations,
        gemini_explanation=gemini_text,
        prediction_id=str(inserted.inserted_id),
        created_at=doc["created_at"],
    )


# ── Batch Prediction ──────────────────────────────────────────────────────────

@router.post("/batch-predict")
async def batch_predict(
    file: UploadFile = File(...),
    current_doctor: dict = Depends(get_current_doctor),
):
    """Process CSV or Excel file with multiple patients."""
    allowed = {"text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
               "application/vnd.ms-excel"}
    content = await file.read()

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Only CSV or Excel files accepted")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File parsing error: {e}")

    required_cols = [
        "patient_name", "AGE", "GENDER", "SMOKING", "YELLOW_FINGERS",
        "ANXIETY", "PEER_PRESSURE", "CHRONIC_DISEASE", "FATIGUE", "ALLERGY",
        "WHEEZING", "ALCOHOL_CONSUMING", "COUGHING", "SHORTNESS_OF_BREATH",
        "SWALLOWING_DIFFICULTY", "CHEST_PAIN",
    ]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")

    ml = get_ml_service()
    results = []
    col = get_collection("predictions")

    for _, row in df.iterrows():
        try:
            patient_dict = row.to_dict()
            patient_dict["patient_name"] = str(patient_dict.get("patient_name", "Unknown"))
            result = ml.predict(patient_dict)
            high_risk = result["high_risk"]
            risk_prob = result["risk_probability"]
            subtype, subtype_note = ml.estimate_subtype(patient_dict, high_risk)
            label = "HIGH RISK" if high_risk else "LOW RISK"

            doc = {
                **patient_dict,
                "prediction": label,
                "risk_probability": risk_prob,
                "subtype": subtype,
                "subtype_note": subtype_note,
                "model_used": result["model_used"],
                "recommendations": ml.get_recommendations(high_risk),
                "doctor_email": current_doctor["email"],
                "doctor_id": current_doctor["doctor_id"],
                "batch_upload": True,
                "source_file": file.filename,
                "created_at": datetime.now(timezone.utc),
            }
            inserted = await col.insert_one(doc)
            results.append({
                "patient_name": patient_dict["patient_name"],
                "AGE": patient_dict.get("AGE"),
                "GENDER": patient_dict.get("GENDER"),
                "prediction": label,
                "risk_probability": f"{risk_prob:.2%}",
                "subtype": subtype or "N/A",
                "prediction_id": str(inserted.inserted_id),
            })
        except Exception as exc:
            results.append({"patient_name": row.get("patient_name", "?"), "error": str(exc)})

    # Log the batch upload
    await get_collection("batch_uploads").insert_one({
        "filename": file.filename,
        "doctor_email": current_doctor["email"],
        "total_rows": len(df),
        "processed": len(results),
        "created_at": datetime.now(timezone.utc),
    })

    return {"total": len(results), "results": results}


# ── Patients Dashboard ────────────────────────────────────────────────────────

@router.get("/patients")
async def get_patients(
    page: int = 1,
    limit: int = 20,
    search: str = "",
    risk_filter: str = "",
    current_doctor: dict = Depends(get_current_doctor),
):
    """Return paginated patient prediction records for the authenticated doctor."""
    col = get_collection("predictions")
    query: dict = {"doctor_email": current_doctor["email"]}
    if search:
        query["patient_name"] = {"$regex": search, "$options": "i"}
    if risk_filter in ("HIGH RISK", "LOW RISK"):
        query["prediction"] = risk_filter

    total = await col.count_documents(query)
    cursor = col.find(query).sort("created_at", -1).skip((page - 1) * limit).limit(limit)
    records = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        records.append(doc)

    return {"total": total, "page": page, "limit": limit, "records": records}


@router.get("/patients/{patient_id}")
async def get_patient(
    patient_id: str,
    current_doctor: dict = Depends(get_current_doctor),
):
    """Return a single prediction record."""
    col = get_collection("predictions")
    try:
        doc = await col.find_one({"_id": ObjectId(patient_id), "doctor_email": current_doctor["email"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Record not found")
    doc["id"] = str(doc.pop("_id"))
    return doc


# ── Download ──────────────────────────────────────────────────────────────────

@router.get("/download/csv")
async def download_csv(current_doctor: dict = Depends(get_current_doctor)):
    """Stream all predictions as CSV download."""
    col = get_collection("predictions")
    cursor = col.find({"doctor_email": current_doctor["email"]}).sort("created_at", -1)

    output = io.StringIO()
    writer = None
    async for doc in cursor:
        doc.pop("_id", None)
        doc.pop("gemini_explanation", None)
        doc.pop("recommendations", None)
        doc["created_at"] = str(doc.get("created_at", ""))
        if writer is None:
            writer = csv.DictWriter(output, fieldnames=doc.keys())
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
    """Stream all predictions as Excel download."""
    col = get_collection("predictions")
    cursor = col.find({"doctor_email": current_doctor["email"]}).sort("created_at", -1)

    rows = []
    async for doc in cursor:
        doc.pop("_id", None)
        doc.pop("gemini_explanation", None)
        doc.pop("recommendations", None)
        doc["created_at"] = str(doc.get("created_at", ""))
        rows.append(doc)

    df = pd.DataFrame(rows)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="PulmoScan Records")
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=pulmoscan_records.xlsx"},
    )
