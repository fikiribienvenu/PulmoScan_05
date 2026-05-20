"""
PulmoScan AI – FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import connect_db, close_db
from app.api import auth, predictions, statistics

app = FastAPI(
    title="PulmoScan AI",
    description="Lung Cancer Risk Prediction & Clinical Decision Support System.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
# Allow ALL origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Lifecycle ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await close_db()


# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(statistics.router)


@app.get("/")
async def root():
    return {
        "name": "PulmoScan AI",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}