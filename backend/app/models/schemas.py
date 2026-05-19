"""
PulmoScan AI – Pydantic Models (Request/Response Schemas)
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class DoctorRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    specialty: Optional[str] = "General Practitioner"
    hospital: Optional[str] = ""


class DoctorLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    doctor_id: str
    full_name: str
    email: str


# ── Prediction ────────────────────────────────────────────────────────────────

class PatientInput(BaseModel):
    patient_name: str = Field(..., min_length=2, max_length=100)
    AGE: int = Field(..., ge=1, le=120)
    GENDER: str = Field(..., pattern="^(M|F)$")
    SMOKING: int = Field(..., ge=1, le=2)
    YELLOW_FINGERS: int = Field(..., ge=1, le=2)
    ANXIETY: int = Field(..., ge=1, le=2)
    PEER_PRESSURE: int = Field(..., ge=1, le=2)
    CHRONIC_DISEASE: int = Field(..., ge=1, le=2)
    FATIGUE: int = Field(..., ge=1, le=2)
    ALLERGY: int = Field(..., ge=1, le=2)
    WHEEZING: int = Field(..., ge=1, le=2)
    ALCOHOL_CONSUMING: int = Field(..., ge=1, le=2)
    COUGHING: int = Field(..., ge=1, le=2)
    SHORTNESS_OF_BREATH: int = Field(..., ge=1, le=2)
    SWALLOWING_DIFFICULTY: int = Field(..., ge=1, le=2)
    CHEST_PAIN: int = Field(..., ge=1, le=2)


class PredictionResponse(BaseModel):
    patient_name: str
    prediction: str          # "HIGH RISK" | "LOW RISK"
    risk_probability: float  # 0.0 – 1.0
    subtype: Optional[str]   # "NSCLC" | "SCLC" | None
    subtype_note: str
    model_used: str
    recommendations: List[str]
    gemini_explanation: Optional[str]
    disclaimer: str
    prediction_id: str
    created_at: datetime


# ── Statistics ────────────────────────────────────────────────────────────────

class YearlyStats(BaseModel):
    year: int
    cases: int


class StatisticsResponse(BaseModel):
    total_predictions: int
    high_risk_count: int
    low_risk_count: int
    yearly_cases: List[YearlyStats]
    gender_breakdown: dict
    model_accuracy: dict


# ── Patient Record ────────────────────────────────────────────────────────────

class PatientRecord(BaseModel):
    id: str
    patient_name: str
    age: int
    gender: str
    prediction: str
    risk_probability: float
    subtype: Optional[str]
    model_used: str
    doctor_email: str
    created_at: datetime
