"""
PulmoScan AI v2 – Pydantic Models (Request / Response Schemas)
Multi-class lung cancer subtype prediction system.
"""
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime


# ── Authentication ────────────────────────────────────────────────────────────

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


# ── Patient Input (12 clinical / genomic features) ────────────────────────────

class PatientInput(BaseModel):
    """
    Clinical features used for multi-class lung cancer subtype prediction.
    All features are clinically obtainable without direct image processing.
    """
    # Metadata
    patient_name: str = Field(..., min_length=2, max_length=100)

    # Demographics
    patient_age: int = Field(..., ge=1, le=120, description="Age in years")
    patient_gender: str = Field(..., description="Male | Female")

    # Risk factors
    smoking_history: str = Field(..., description="Never | Former | Current")
    family_history: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")

    # Clinical measurement (from radiology report, single value)
    nodule_size_mm: float = Field(
        ..., ge=0.0, le=100.0, description="Largest nodule diameter in mm"
    )

    # Clinical assessment
    tumor_location: str = Field(
        ..., description="Right Lung | Left Lung | Bilateral | Central | Other"
    )
    tumor_stage: str = Field(
        ..., description="Stage I | Stage II | Stage III | Stage IV"
    )

    # Genomic biomarkers (lab / molecular tests)
    EGFR_mutation_status: int = Field(
        ..., ge=0, le=1, description="EGFR mutation: 0=Negative, 1=Positive"
    )
    KRAS_mutation_status: int = Field(
        ..., ge=0, le=1, description="KRAS mutation: 0=Negative, 1=Positive"
    )
    ALK_fusion_status: int = Field(
        ..., ge=0, le=1, description="ALK fusion: 0=Negative, 1=Positive"
    )

    # Immunology / TMB
    PD_L1_expression_level: float = Field(
        ..., ge=0.0, le=100.0, description="PD-L1 TPS percentage (0–100)"
    )
    tumor_mutational_burden: float = Field(
        ..., ge=0.0, description="TMB in mutations per Megabase"
    )


# ── Prediction Response ───────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    patient_name: str
    subtype_prediction: str           # e.g. "Adenocarcinoma"
    confidence_score: float           # highest class probability (0–1)
    class_probabilities: Dict[str, float]  # {"Adenocarcinoma": 0.78, ...}
    risk_level: str                   # "Low" | "Moderate" | "High" | "Critical"
    model_used: str
    dataset_version: str
    recommendations: List[str]
    gemini_explanation: Optional[str]
    prediction_id: str
    created_at: datetime


# ── Statistics ────────────────────────────────────────────────────────────────

class SubtypeStat(BaseModel):
    subtype: str
    count: int
    percentage: float


class YearlyStats(BaseModel):
    year: int
    cases: int


class YearlyGenderStats(BaseModel):
    year: int
    male: int
    female: int


class StatisticsResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    total_predictions: int
    subtype_distribution: List[SubtypeStat]
    gender_breakdown: Dict[str, int]
    yearly_cases: List[YearlyStats]
    yearly_gender: List[YearlyGenderStats]
    model_metrics: Dict
    doctor_stats: Dict
    chub_totals: Dict


# ── Patient Record (list / history view) ─────────────────────────────────────

class PatientRecord(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    id: str
    patient_name: str
    patient_age: int
    patient_gender: str
    subtype_prediction: str
    confidence_score: float
    risk_level: str
    model_used: str
    doctor_email: str
    created_at: datetime


# ── Audit Log ─────────────────────────────────────────────────────────────────

class AuditEntry(BaseModel):
    id: str
    action: str
    doctor_email: str
    detail: Optional[str]
    created_at: datetime
