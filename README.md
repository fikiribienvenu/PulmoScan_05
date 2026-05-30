# PulmoScan AI v2 — Multi-class Lung Cancer Subtype Prediction

![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Motor-brightgreen?style=for-the-badge&logo=mongodb)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-orange?style=for-the-badge&logo=scikitlearn)

> **Medical Disclaimer:** PulmoScan AI is a clinical decision-support tool for educational purposes only. It does **not** constitute a formal medical diagnosis. All predictions must be reviewed by a qualified healthcare professional before any clinical action is taken.

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Features](#3-features)
4. [Tech Stack](#4-tech-stack)
5. [Prerequisites](#5-prerequisites)
6. [Project Structure](#6-project-structure)
7. [Step-by-Step Setup](#7-step-by-step-setup)
8. [Training the ML Model](#8-training-the-ml-model)
9. [Running the System](#9-running-the-system)
10. [API Reference](#10-api-reference)
11. [Environment Variables](#11-environment-variables)
12. [Gemini AI Setup](#12-gemini-ai-setup)
13. [Dataset](#13-dataset)
14. [Pages Guide](#14-pages-guide)
15. [ML Pipeline Details](#15-ml-pipeline-details)
16. [Troubleshooting](#16-troubleshooting)
17. [Academic Notes](#17-academic-notes)

---

## 1. Overview

**PulmoScan AI v2** is a full-stack clinical decision support system that predicts lung cancer subtypes from tabular clinical and genomic data using supervised machine learning.

**What it predicts:**

| Subtype | Risk | Notes |
|---|---|---|
| No Cancer | Low | Monitoring recommended |
| Adenocarcinoma | High | EGFR/ALK-driven; targeted therapy available |
| Squamous Cell | High | Smoking-linked; immunotherapy eligible |
| SCLC | Critical | Aggressive; rapid progression |
| Other | High | General malignancy |

**Key design decisions:**
- Uses **tabular clinical data only** — no CT scans, no imaging pipelines
- **Classical ML algorithms** — not deep learning or CNNs
- Trained on **LungCanC2024_Dataset.csv** (289,010 records)
- **12 clinical/genomic features** selected from the dataset

---

## 2. System Architecture

```
Browser (Next.js 15)
        |
        | HTTP / JSON
        v
FastAPI Backend (port 8000)
   |           |           |
   v           v           v
MongoDB    ML Service   Gemini AI
(Motor)   (joblib pkl)  (Google API)
```

**Data flow for a prediction:**
1. Doctor fills 12-field form in browser
2. POST `/predict` sent with JWT token
3. Backend encodes features → runs Random Forest → gets 5-class probabilities
4. Gemini 2.5 Flash generates structured clinical explanation
5. Result saved to MongoDB, returned to frontend
6. Frontend shows subtype badge, confidence bar, recommendations, and AI explanation

---

## 3. Features

| Feature | Details |
|---|---|
| Multi-class Prediction | 5 cancer subtypes using Random Forest |
| Gemini AI Explanations | 5-section clinical note per prediction |
| Dark / Light Mode | Toggle persisted in localStorage |
| JWT Auth | bcrypt passwords, 24-hour token expiry |
| Batch CSV/Excel Upload | Process many patients at once |
| Patient Records | Search, subtype filter, risk filter, pagination |
| Patient Detail Modal | Full clinical data + class probabilities |
| Analytics Dashboard | Subtype pie chart, risk bar chart, CHUB data |
| Model Performance Page | Algorithm comparison + feature importance |
| Audit Log | Every prediction logged with doctor email |
| CSV / Excel Export | Download all records |
| Settings Page | Profile info, dark mode, security details |

---

## 4. Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| Next.js | 15.0.0 | React framework (App Router) |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first CSS + dark mode |
| Recharts | 2.x | Charts (pie, bar, line) |
| Axios | 1.x | HTTP client with JWT interceptor |
| react-hot-toast | 2.x | Toast notifications |
| lucide-react | latest | Icons |
| js-cookie | latest | JWT cookie storage |

### Backend
| Package | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | 0.115 | REST API with OpenAPI docs |
| Motor | 3.5 | Async MongoDB driver |
| python-jose | 3.3 | JWT token generation/verification |
| passlib[bcrypt] | 1.7 | Password hashing |
| pandas | 2.x | Data loading and preprocessing |
| numpy | 1.x | Numerical arrays |
| scikit-learn | 1.5 | ML algorithms + StandardScaler + LabelEncoder |
| joblib | 1.4 | Save/load model artifacts |
| xgboost | 2.1 | XGBoost classifier |
| lightgbm | 4.5 | LightGBM classifier |
| google-generativeai | 0.7 | Gemini 2.5 Flash API |
| python-multipart | latest | File upload support |
| openpyxl | latest | Excel export |

### Database
- **MongoDB** — Collections: `doctors`, `predictions`, `batch_uploads`, `audit_logs`

---

## 5. Prerequisites

Install the following before starting:

| Tool | Version | Download |
|---|---|---|
| Python | 3.11 or 3.12 | https://python.org/downloads |
| Node.js | 18+ (LTS) | https://nodejs.org |
| MongoDB | 7 Community | https://www.mongodb.com/try/download/community |
| Git | any | https://git-scm.com |

**Verify installations:**
```bash
python --version      # Python 3.11.x or 3.12.x
node --version        # v18.x or v20.x
npm --version         # 9.x or 10.x
mongod --version      # db version v7.x
```

---

## 6. Project Structure

```
pulmoscan/
|
+-- backend/
|   +-- app/
|   |   +-- api/
|   |   |   +-- auth.py            # POST /auth/register, /auth/login, GET /auth/me
|   |   |   +-- predictions.py     # POST /predict, /batch-predict, GET /patients, /download/*
|   |   |   +-- statistics.py      # GET /statistics, /model-metrics
|   |   |   +-- audit.py           # GET /audit-logs
|   |   +-- core/
|   |   |   +-- config.py          # Pydantic settings (reads .env)
|   |   |   +-- database.py        # MongoDB connection via Motor
|   |   |   +-- security.py        # JWT creation/verification + bcrypt
|   |   +-- models/
|   |   |   +-- schemas.py         # PatientInput, PredictionResponse Pydantic models
|   |   +-- services/
|   |   |   +-- ml_service.py      # MLService singleton: load model, encode, predict
|   |   |   +-- gemini_service.py  # Gemini 2.5 Flash clinical explanation
|   |   +-- main.py                # FastAPI app entry + CORS + lifespan
|   +-- data/
|   |   +-- LungCanC2024_Dataset.csv   # Main dataset (289,010 rows)
|   |   +-- survey_lung_cancer.csv     # Fallback binary dataset
|   +-- ml_models/                 # Generated after training (gitignored)
|   |   +-- best_model.pkl         # Trained Random Forest (~4 GB)
|   |   +-- scaler.pkl             # StandardScaler
|   |   +-- label_encoder.pkl      # LabelEncoder for cancer_subtype
|   |   +-- feature_columns.pkl    # List of 12 feature names
|   |   +-- model_name.txt         # "Random Forest"
|   |   +-- dataset_version.txt    # "LungCanC2024"
|   |   +-- model_info.json        # Class names, feature importance, metrics
|   |   +-- model_metrics.json     # Per-algorithm accuracy/F1/ROC-AUC
|   +-- train_multiclass.py        # Training script — run this once
|   +-- requirements.txt
|   +-- .env.example
|
+-- frontend/
|   +-- src/
|   |   +-- app/
|   |   |   +-- page.tsx           # Landing page
|   |   |   +-- layout.tsx         # Root layout + ThemeProvider + AuthProvider
|   |   |   +-- globals.css        # Tailwind directives + dark mode + badge classes
|   |   |   +-- auth/login/        # Login page
|   |   |   +-- auth/register/     # Register page
|   |   |   +-- dashboard/         # KPI cards + subtype distribution + recent records
|   |   |   +-- predict/           # 12-field prediction form + results panel
|   |   |   +-- batch/             # CSV/Excel drag-and-drop upload
|   |   |   +-- records/           # Patient records table + detail modal
|   |   |   +-- statistics/        # Charts: subtype, risk, CHUB yearly, model comparison
|   |   |   +-- model-performance/ # Algorithm metrics table + feature importance
|   |   |   +-- settings/          # Profile, dark mode, security info
|   |   |   +-- about/             # System documentation
|   |   +-- components/
|   |   |   +-- layout/
|   |   |   |   +-- Navbar.tsx      # Nav links + dark mode toggle + doctor chip
|   |   |   |   +-- Footer.tsx      # Version + disclaimer
|   |   |   |   +-- ProtectedRoute.tsx  # Redirect if not logged in
|   |   |   +-- ui/
|   |   |       +-- SubtypeBadge.tsx    # Colored badge for cancer subtype
|   |   |       +-- RiskBadge.tsx       # Colored badge for risk level
|   |   |       +-- ConfidenceBar.tsx   # Gradient progress bar
|   |   |       +-- LoadingSpinner.tsx  # Spinner
|   |   +-- hooks/
|   |   |   +-- useAuth.tsx         # Auth context: login, logout, doctor state
|   |   |   +-- useTheme.tsx        # Dark/light mode context
|   |   +-- lib/
|   |   |   +-- api.ts              # Axios instance with JWT interceptor
|   |   +-- types/
|   |       +-- index.ts            # All TypeScript interfaces and types
|   +-- tailwind.config.js          # darkMode: "class" + custom colors
|   +-- next.config.js
|   +-- package.json
|   +-- .env.local
|
+-- .gitignore
+-- .env.example
+-- README.md
```

---

## 7. Step-by-Step Setup

### Step 1 — Clone the repository
```bash
git clone <your-repo-url>
cd pulmoscan
```

### Step 2 — Backend virtual environment
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (CMD):
.venv\Scripts\activate.bat
# macOS/Linux:
source .venv/bin/activate
```

### Step 3 — Install backend dependencies
```bash
pip install -r requirements.txt
```

This installs scikit-learn, FastAPI, Motor, XGBoost, LightGBM, Gemini, and all other packages.

### Step 4 — Configure backend environment
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
SECRET_KEY=any-random-long-string-here
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=pulmoscan_db
GEMINI_API_KEY=your-gemini-api-key-here
```

See [Section 12](#12-gemini-ai-setup) for how to get a Gemini API key.

### Step 5 — Start MongoDB
```bash
# Windows — MongoDB must be running as a service, or start manually:
mongod --dbpath "C:\data\db"

# macOS (Homebrew):
brew services start mongodb-community

# Linux (systemd):
sudo systemctl start mongod
```

Verify MongoDB is running:
```bash
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

### Step 6 — Train the ML model (first time only)
```bash
# Make sure you are in the backend/ directory with .venv activated
cd backend
python train_multiclass.py
```

This will take **20-60 minutes** depending on your hardware. It trains 6 algorithms on 289,010 rows and saves the best model artifacts to `ml_models/`.

Expected output:
```
[INFO] Loading dataset...
   Dataset : data\LungCanC2024_Dataset.csv
   Shape   : (289010, 27)
[PREP] Preprocessing...
   After cleaning : 289010 rows
   Features selected (12): [...]
[TRAIN] Training 6 algorithms...
   [Logistic Regression] Acc=... F1=...
   [Random Forest]       Acc=... F1=...
   [Gradient Boosting]   Acc=... F1=...
   [Decision Tree]       Acc=... F1=...
   [XGBoost]             Acc=... F1=...
   [LightGBM]            Acc=... F1=...
[BEST] Best model : Random Forest (F1=...)
[SAVE] Saving artifacts to ./ml_models/ ...
[OK] Training complete!
```

### Step 7 — Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Step 8 — Configure frontend environment
```bash
# Windows (PowerShell):
Set-Content .env.local "NEXT_PUBLIC_API_URL=http://localhost:8000"

# macOS/Linux:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

---

## 8. Training the ML Model

The training script `backend/train_multiclass.py` handles everything automatically.

### What it does
1. Loads `data/LungCanC2024_Dataset.csv` (289,010 rows, 27 columns)
2. Selects 12 clinical features (excludes imaging-derived columns)
3. Encodes categorical features using fixed maps
4. Splits: 80% train / 20% test (stratified)
5. Applies `StandardScaler`
6. Trains 6 algorithms (SVM skipped on large datasets)
7. Selects best model by weighted F1-score
8. Saves artifacts to `backend/ml_models/`

### 12 Input Features

| Feature | Type | Values |
|---|---|---|
| `patient_age` | integer | 0–100 |
| `patient_gender` | string | "Male" / "Female" |
| `smoking_history` | string | "Never" / "Former" / "Current" |
| `family_history` | integer | 0 (No) / 1 (Yes) |
| `nodule_size_mm` | float | 0–100 mm |
| `tumor_location` | string | "Right Lung" / "Left Lung" / "Bilateral" / "Central" / "Other" |
| `tumor_stage` | string | "Stage 0" / "Stage I" / "Stage II" / "Stage III" / "Stage IV" |
| `EGFR_mutation_status` | integer | 0 (Negative) / 1 (Positive) |
| `KRAS_mutation_status` | integer | 0 (Negative) / 1 (Positive) |
| `ALK_fusion_status` | integer | 0 (Negative) / 1 (Positive) |
| `PD_L1_expression_level` | float | 0–100 % |
| `tumor_mutational_burden` | float | 0–1000 mut/Mb |

### Generated Artifacts

After training, `backend/ml_models/` will contain:

| File | Size | Purpose |
|---|---|---|
| `best_model.pkl` | ~4 GB | Trained Random Forest model |
| `scaler.pkl` | <1 KB | StandardScaler fitted on training data |
| `label_encoder.pkl` | <1 KB | LabelEncoder for cancer_subtype |
| `feature_columns.pkl` | <1 KB | Ordered list of 12 feature names |
| `model_name.txt` | <1 KB | Name of best algorithm |
| `dataset_version.txt` | <1 KB | "LungCanC2024" |
| `model_info.json` | ~5 KB | Class names, feature importance, n_classes |
| `model_metrics.json` | ~1 KB | Per-algorithm accuracy/F1/ROC-AUC |

> **Note:** `ml_models/*.pkl` files are gitignored because they are large binary files. Re-run `train_multiclass.py` to regenerate them.

### Re-running training
If you want to retrain (e.g., after changing features or algorithm settings):
```bash
cd backend
# (with .venv activated)
python train_multiclass.py
```

The old artifacts will be overwritten automatically.

---

## 9. Running the System

### Terminal 1 — Backend
```bash
cd backend
.venv\Scripts\Activate.ps1    # Windows
# source .venv/bin/activate   # macOS/Linux

uvicorn app.main:app --reload --port 8000
```

Expected startup output:
```
INFO:     Started server process [...]
INFO:     Application startup complete.
[OK] Connected to MongoDB at mongodb://localhost:27017
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
[OK] ML loaded: Random Forest | Classes: [...] | Features: 12
```

> The ML model loads on the **first prediction request** (lazy loading), not at startup. This is normal.

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
  Next.js 15.0.0
  Local: http://localhost:3000
  Ready in 5s
```

### Access the application

| URL | Description |
|---|---|
| http://localhost:3000 | Frontend application |
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | Swagger UI (interactive API docs) |
| http://localhost:8000/redoc | ReDoc API reference |

### First login
1. Go to http://localhost:3000
2. Click **Create Account**
3. Fill in your name, email, password, specialty, and hospital
4. Login with those credentials
5. You will be redirected to the Dashboard

---

## 10. API Reference

All endpoints except `/auth/register` and `/auth/login` require:
```
Authorization: Bearer <your-jwt-token>
```

### Authentication

#### POST /auth/register
```json
// Request body:
{
  "full_name": "Dr. Jean Mukamana",
  "email": "jean@chub.rw",
  "password": "SecurePass123!",
  "specialty": "Pulmonology",
  "hospital": "CHUB Butare"
}

// Response 201:
{
  "message": "Doctor registered successfully",
  "doctor_id": "6a149e..."
}
```

#### POST /auth/login
```json
// Request body:
{
  "email": "jean@chub.rw",
  "password": "SecurePass123!"
}

// Response 200:
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "doctor_id": "6a149e...",
  "full_name": "Dr. Jean Mukamana",
  "email": "jean@chub.rw"
}
```

#### GET /auth/me
Returns the currently authenticated doctor's profile.

---

### Predictions

#### POST /predict
```json
// Request body (all fields required):
{
  "patient_name": "John Doe",
  "patient_age": 65,
  "patient_gender": "Female",
  "smoking_history": "Former",
  "family_history": 1,
  "nodule_size_mm": 22.5,
  "tumor_location": "Right Lung",
  "tumor_stage": "Stage III",
  "EGFR_mutation_status": 1,
  "KRAS_mutation_status": 0,
  "ALK_fusion_status": 0,
  "PD_L1_expression_level": 45.0,
  "tumor_mutational_burden": 8.5
}

// Response 200:
{
  "patient_name": "John Doe",
  "subtype_prediction": "Adenocarcinoma",
  "confidence_score": 0.395,
  "class_probabilities": {
    "Adenocarcinoma": 0.395,
    "No Cancer": 0.325,
    "Other": 0.04,
    "SCLC": 0.14,
    "Squamous Cell": 0.1
  },
  "risk_level": "Moderate",
  "model_used": "Random Forest",
  "dataset_version": "LungCanC2024",
  "recommendations": ["PRIORITY: Refer to thoracic oncology...", "..."],
  "gemini_explanation": "## Clinical Interpretation\n...",
  "prediction_id": "6a14a8...",
  "created_at": "2026-05-25T19:10:00Z"
}
```

> **Risk level logic:** If `confidence_score < 0.45` and base risk is High or Critical, risk is downgraded to "Moderate" to reflect uncertainty.

#### POST /batch-predict
Upload a CSV or Excel file. Download the template first from:
```bash
curl http://localhost:8000/download/batch-template -o template.csv
```

Required CSV columns (exact names):
```
patient_name, patient_age, patient_gender, smoking_history, family_history,
nodule_size_mm, tumor_location, tumor_stage, EGFR_mutation_status,
KRAS_mutation_status, ALK_fusion_status, PD_L1_expression_level,
tumor_mutational_burden
```

```bash
# Upload via curl:
curl -X POST http://localhost:8000/batch-predict \
  -H "Authorization: Bearer <token>" \
  -F "file=@patients.csv"
```

---

### Records

#### GET /patients
```
GET /patients?page=1&limit=20&search=John&subtype_filter=Adenocarcinoma&risk_filter=High
```

Response:
```json
{
  "total": 42,
  "page": 1,
  "limit": 20,
  "records": [...]
}
```

#### GET /patients/{id}
Returns single prediction record by MongoDB ObjectId.

---

### Statistics & Model Info

#### GET /statistics
Returns platform statistics including subtype distribution, risk breakdown, CHUB data, and model metrics.

#### GET /model-metrics
Returns model comparison metrics (accuracy, F1, ROC-AUC per algorithm) and feature importance.

#### GET /model-info
Returns full model metadata including class names, feature columns, and feature importance.

---

### Downloads

```bash
# All your prediction records as CSV:
curl http://localhost:8000/download/csv \
  -H "Authorization: Bearer <token>" -o records.csv

# All your prediction records as Excel:
curl http://localhost:8000/download/excel \
  -H "Authorization: Bearer <token>" -o records.xlsx

# Blank batch upload template:
curl http://localhost:8000/download/batch-template -o template.csv
```

---

### Audit Logs

```
GET /audit-logs?page=1&limit=30
```

Returns a log of all prediction actions (single and batch) made by the authenticated doctor.

---

## 11. Environment Variables

### Backend — `backend/.env`
```env
# Required
SECRET_KEY=change-this-to-a-random-64-character-string
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=pulmoscan_db

# Optional — system works without it, but Gemini explanations will be unavailable
GEMINI_API_KEY=AIzaSy...your-key-here

# Optional — defaults shown
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Generate a secure `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Frontend — `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> For production deployment, change this to your backend's public URL (e.g., `https://api.yourdomain.com`).

---

## 12. Gemini AI Setup

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with a Google account
3. Click **Create API key**
4. Copy the key (starts with `AIzaSy...`)
5. Add to `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...your-key-here
   ```

**Model used:** `gemini-2.5-flash` (fast, free tier available)

**If no API key is set:** The system still works normally. Predictions are made by the ML model. The `gemini_explanation` field will show: *"Gemini AI explanation unavailable. Please set GEMINI_API_KEY in your environment file."*

**If free tier quota is exceeded:** The system still works. The `gemini_explanation` field will show a quota message. It resets at midnight Pacific Time.

---

## 13. Dataset

### LungCanC2024_Dataset.csv (Primary)
- **Location:** `backend/data/LungCanC2024_Dataset.csv`
- **Rows:** 289,010 clinical records
- **Columns:** 27 (including imaging-derived columns that are excluded from training)
- **Target column:** `cancer_subtype`
- **Classes:** No Cancer, Adenocarcinoma, Squamous Cell, SCLC, Other

**Class distribution:**
```
No Cancer         100,610  (34.8%)
Adenocarcinoma     72,319  (25.0%)
Squamous Cell      57,795  (20.0%)
SCLC               43,658  (15.1%)
Other              14,628   (5.1%)
```

**Excluded columns** (imaging-derived, not used in training):
`nodule_texture`, `HU_mean`, `HU_std`, `GLCM_contrast`, `GLCM_correlation`,
`PET_SUVmax`, `PET_SUVmean`

### survey_lung_cancer.csv (Fallback)
- The old binary dataset (309 patients, binary YES/NO target)
- Used automatically if `LungCanC2024_Dataset.csv` is missing

---

## 14. Pages Guide

| URL | Requires Login | Description |
|---|---|---|
| `/` | No | Landing page with features, subtypes, stats strip, CHUB section |
| `/auth/login` | No | Doctor login |
| `/auth/register` | No | Create new doctor account |
| `/dashboard` | Yes | KPI cards, subtype distribution, recent predictions |
| `/predict` | Yes | Fill 12-field form, submit, view result with Gemini explanation |
| `/batch` | Yes | Upload CSV/Excel, view results table |
| `/records` | Yes | All predictions with search + filters + patient detail modal |
| `/statistics` | Yes | Charts: subtype pie, risk bar, CHUB yearly cases, model comparison |
| `/model-performance` | Yes | Best model banner, metrics table, feature importance bars |
| `/settings` | Yes | Profile (read-only), dark mode toggle, security info |
| `/about` | No | System documentation, tech stack, ML pipeline steps |

### How to make a prediction (step by step)
1. Login and go to **Predict** (`/predict`)
2. Fill in **Demographics:** Name, Age, Gender
3. Fill in **Clinical Assessment:** Smoking history, Family history, Nodule size, Tumor location, Tumor stage
4. Fill in **Genomic Markers:** EGFR, KRAS, ALK (toggle Negative/Positive)
5. Fill in **Biomarkers:** PD-L1 expression (%), TMB (mut/Mb)
6. Click **Run ML Prediction**
7. View: predicted subtype badge, confidence score, class probabilities, recommendations, Gemini AI explanation

---

## 15. ML Pipeline Details

### Training pipeline
```
LungCanC2024_Dataset.csv (289,010 rows)
    |
    v
Column normalization (strip spaces, replace - and space with _)
    |
    v
Drop duplicates
Drop rows with >50% missing values
Impute remaining: median (numeric), mode (categorical)
    |
    v
Select 12 clinical features
    |
    v
Encode categorical columns:
  patient_gender   : Male->1, Female->0
  smoking_history  : Never->0, Former->1, Current->2
  tumor_location   : Right Lung->0, Left Lung->1, Bilateral->2, Central->3, Other->4
  tumor_stage      : Stage 0->0, Stage I->1, Stage II->2, Stage III->3, Stage IV->4
  family_history   : 0/1 integer
  EGFR/KRAS/ALK   : 0/1 integer
    |
    v
LabelEncoder on target (cancer_subtype)
    |
    v
train_test_split: 80% train / 20% test (stratified)
    |
    v
StandardScaler.fit_transform(X_train), .transform(X_test)
    |
    v
Train 6 algorithms:
  - Logistic Regression (max_iter=2000, class_weight=balanced)
  - Random Forest (200 trees, n_jobs=-1, class_weight=balanced)
  - Gradient Boosting (100 estimators, max_depth=5)
  - Decision Tree (max_depth=10, class_weight=balanced)
  - XGBoost (200 estimators, multi:softprob)
  - LightGBM (200 estimators, class_weight=balanced)
  [SVM skipped for datasets > 50,000 rows - O(n^2) complexity]
    |
    v
Select best by weighted F1-score on test set
    |
    v
Save to ml_models/:
  best_model.pkl, scaler.pkl, label_encoder.pkl,
  feature_columns.pkl, model_name.txt, dataset_version.txt,
  model_info.json, model_metrics.json
```

### Inference pipeline (per prediction)
```
PatientInput dict
    |
    v
MLService._encode():
  - Build row dict using feature_columns order
  - Apply same encoding maps as training
  - np.array shape (1, 12)
  - scaler.transform(arr)
    |
    v
model.predict(X)        -> class index
model.predict_proba(X)  -> array of 5 probabilities
    |
    v
label_encoder.inverse_transform([raw]) -> subtype string
    |
    v
confidence = max(probabilities)
risk_level = SUBTYPE_RISK[subtype] (downgraded if confidence < 0.45)
    |
    v
Return: subtype, confidence, class_probs, risk_level, model_used
```

### Heuristic fallback
If no trained model is found (artifacts missing), the system uses a rule-based fallback:
- `EGFR=1` or `ALK=1` → Adenocarcinoma (72% confidence)
- `KRAS=1` + smoking Current/Former → Squamous Cell (65%)
- Stage >= 3 + nodule > 15mm → SCLC (55%)
- Nodule < 3mm + Stage <= 1 → No Cancer (80%)
- Otherwise → Adenocarcinoma (50%)

---

## 16. Troubleshooting

### Backend won't start
```
Error: MONGODB_URL connection refused
```
**Fix:** Start MongoDB first. On Windows: run `mongod --dbpath C:\data\db`

---

```
ModuleNotFoundError: No module named 'xgboost'
```
**Fix:** Make sure your virtual environment is activated, then:
```bash
pip install xgboost lightgbm
```

---

```
UnicodeEncodeError: 'charmap' codec can't encode character
```
**Fix:** This happens on Windows. The training script uses ASCII-only print statements. If you see this error, check that `train_multiclass.py` has no emoji characters in `print()` calls.

---

### Training is very slow
The 289,010-row dataset takes 20-60 minutes to train. SVM is automatically skipped on large datasets. To reduce training time, you can lower `n_estimators` in the model definitions inside `train_multiclass.py`.

---

### MemoryError when loading model
The `best_model.pkl` file is ~4 GB. Loading requires ~8-16 GB of RAM. If you get a `MemoryError`:
1. Close other memory-heavy applications
2. Or reduce `n_estimators` in `train_multiclass.py` and retrain

---

### Frontend won't connect to backend
```
Network Error / CORS error in browser console
```
**Fix:** Make sure `frontend/.env.local` contains:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
Also verify the backend is running on port 8000.

---

### Gemini returns "unavailable"
This is expected if `GEMINI_API_KEY` is not set or quota is exceeded. Predictions still work normally. Only the AI explanation is missing.

---

### Port already in use
```
ERROR: [Errno 10048] address already in use (port 8000)
```
**Fix (Windows):**
```powershell
# Find what's using port 8000:
netstat -ano | findstr :8000

# Kill it (replace 1234 with the PID from above):
taskkill /PID 1234 /F
```

---

### TypeScript build errors
```bash
cd frontend
npx tsc --noEmit
```
Errors should only appear in old deleted components. Confirm `PredictionForm.tsx`, `RiskGauge.tsx`, `GeminiExplanationCard.tsx`, and `RecommendationCard.tsx` are deleted from `src/components/`.

---

## 17. Academic Notes

**Project:** University Capstone — PulmoScan AI v2
**Context:** Clinical decision support prototype for CHUB Butare, Rwanda

### Design constraints
- **Tabular clinical data only** — no CT scan images, no CNNs, no computer vision
- **Classical ML algorithms only** — scikit-learn, XGBoost, LightGBM
- **12 clinically obtainable features** — a doctor can input these without imaging equipment
- **Heuristic fallback** — system is usable even without a trained model

### CHUB Butare data (seeded in statistics)
- 135 confirmed lung cancer cases between 2022-2025
- Peak year: 2023 (47 cases)
- Gender split: 87 male (64%), 48 female (36%)

### Why metrics are modest
The `LungCanC2024_Dataset.csv` is a synthetic/generated dataset. The `cancer_subtype` labels were likely generated independently of the clinical features, meaning ROC-AUC values close to 0.5 are expected. In a real clinical setting with genuine patient data, the model would perform differently.

For the capstone, the important achievements are:
- End-to-end ML pipeline implemented correctly
- System architecture is production-grade
- All features (auth, batch, export, Gemini) work end-to-end

### Reproducibility
All algorithms use `random_state=42`. Re-running `train_multiclass.py` on the same dataset produces identical results.

### Clinical disclaimer
> PulmoScan AI does not diagnose lung cancer. All outputs are decision-support indicators only. A qualified physician must evaluate all results before any clinical action. Histopathological examination remains the gold standard for lung cancer diagnosis.

---

*PulmoScan AI v2.0 — Multi-class Lung Cancer Subtype Prediction*
*Capstone project — CHUB Butare clinical context — Rwanda*
