"""
PulmoScan AI – Authentication Routes
POST /auth/register
POST /auth/login
GET  /auth/me
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from bson import ObjectId

from app.models.schemas import DoctorRegister, DoctorLogin, TokenResponse
from app.core.security import (
    hash_password, verify_password,
    create_access_token, get_current_doctor,
)
from app.core.database import get_collection

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: DoctorRegister):
    """Register a new doctor account."""
    doctors = get_collection("doctors")

    # Check duplicate email
    if await doctors.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "full_name": payload.full_name,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "specialty": payload.specialty,
        "hospital": payload.hospital,
        "created_at": datetime.now(timezone.utc),
        "is_active": True,
    }
    result = await doctors.insert_one(doc)
    return {"message": "Doctor registered successfully", "doctor_id": str(result.inserted_id)}


@router.post("/login", response_model=TokenResponse)
async def login(payload: DoctorLogin):
    """Authenticate doctor and return JWT."""
    doctors = get_collection("doctors")
    doctor = await doctors.find_one({"email": payload.email})

    if not doctor or not verify_password(payload.password, doctor["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        data={"sub": doctor["email"], "doctor_id": str(doctor["_id"])}
    )
    return TokenResponse(
        access_token=token,
        doctor_id=str(doctor["_id"]),
        full_name=doctor["full_name"],
        email=doctor["email"],
    )


@router.get("/me")
async def get_me(current: dict = Depends(get_current_doctor)):
    """Return currently authenticated doctor info."""
    doctors = get_collection("doctors")
    doctor = await doctors.find_one({"email": current["email"]})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {
        "doctor_id": str(doctor["_id"]),
        "full_name": doctor["full_name"],
        "email": doctor["email"],
        "specialty": doctor.get("specialty"),
        "hospital": doctor.get("hospital"),
    }
