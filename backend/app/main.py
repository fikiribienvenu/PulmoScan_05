"""
PulmoScan AI v2 – FastAPI Application Entry Point
Multi-class lung cancer subtype prediction system.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import connect_db, close_db
from app.api import auth, predictions, statistics, audit


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="PulmoScan AI v2",
    description=(
        "Multi-class Lung Cancer Subtype Prediction & Clinical Decision Support System. "
        "Uses supervised ML on tabular clinical data to predict cancer subtypes "
        "(Adenocarcinoma, Squamous Cell, SCLC, No Cancer, etc.)."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(statistics.router)
app.include_router(audit.router)


# ── Health / Root ─────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "name":    "PulmoScan AI",
        "version": "2.0.0",
        "status":  "operational",
        "mode":    "multi-class subtype prediction",
        "docs":    "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}
