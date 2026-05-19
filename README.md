# 🫁 PulmoScan AI – Lung Cancer Risk Prediction & Clinical Decision Support System

![PulmoScan AI](https://img.shields.io/badge/PulmoScan-AI-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen?style=for-the-badge&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=for-the-badge&logo=docker)

> ⚠️ **DISCLAIMER:** This system is intended for **educational and clinical decision-support purposes only**. It does **not** constitute a formal medical diagnosis. All predictions must be reviewed by a qualified healthcare professional.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [ML Pipeline](#ml-pipeline)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Installation (Manual)](#installation-manual)
- [Docker Deployment](#docker-deployment)
- [API Reference](#api-reference)
- [MongoDB Setup](#mongodb-setup)
- [Gemini API Setup](#gemini-api-setup)
- [Dataset](#dataset)
- [Screenshots](#screenshots)
- [Academic Notes](#academic-notes)

---

## Overview

**PulmoScan AI** is a full-stack, production-ready clinical decision support system for lung cancer risk assessment. It integrates:

- **5 trained ML algorithms** evaluated and compared automatically
- **Google Gemini AI** for clinical explanation generation
- **JWT-secured doctor portal** with full patient record management
- **Batch CSV/Excel upload** for processing multiple patients at once
- **Downloadable reports** in CSV and Excel format
- **Analytics dashboard** with trend charts and model performance visualization

---

## Features

| Feature | Description |
|---|---|
| 🔐 Doctor Authentication | JWT-secured login, registration, protected routes |
| 🤖 ML Prediction | 5 algorithms, auto-selects best by ROC-AUC |
| 🧬 Subtype Estimation | Heuristic NSCLC/SCLC classification |
| 🤖 Gemini AI | Clinical interpretation and patient-friendly explanations |
| 📁 Batch Upload | CSV/Excel multi-patient processing |
| 📊 Analytics | Recharts: yearly trends, pie charts, model comparison |
| 📥 Export | Download records as CSV or Excel |
| 🏥 Patient Records | Search, filter, sort, paginate |
| 💡 Recommendations | Risk-stratified clinical recommendations |
| 🐳 Docker | Single-command deployment |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15 | React framework with App Router |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| Recharts | 2.x | Data visualization |
| Axios | 1.x | HTTP client |
| react-hot-toast | 2.x | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11 | Runtime |
| FastAPI | 0.115 | REST API framework |
| Motor | 3.5 | Async MongoDB driver |
| python-jose | 3.3 | JWT tokens |
| passlib[bcrypt] | 1.7 | Password hashing |
| pandas / numpy | latest | Data processing |
| scikit-learn | 1.5 | ML algorithms |
| joblib | 1.4 | Model persistence |
| google-generativeai | 0.7 | Gemini AI |

### Database
- **MongoDB 7** – Collections: `doctors`, `predictions`, `batch_uploads`, `logs`

### Deployment
- **Docker + Docker Compose** – Single-command full-stack launch

---

## ML Pipeline

```
Raw Dataset (survey_lung_cancer.csv)
    │
    ▼
Preprocessing
├── Remove duplicates
├── Handle missing values (mode imputation)
├── Encode GENDER (M→1, F→0)
├── Encode LUNG_CANCER target (LabelEncoder)
└── StandardScaler normalization
    │
    ▼
Train/Test Split (80/20, stratified)
    │
    ▼
5 Algorithms Trained
├── Logistic Regression
├── Random Forest (200 estimators)
├── Gradient Boosting (200 estimators)
├── Support Vector Machine (SVC)
└── Decision Tree (max_depth=8)
    │
    ▼
Evaluation (per model)
├── Accuracy, Precision, Recall, F1-Score
├── ROC-AUC
└── 5-Fold Cross Validation
    │
    ▼
Best Model Selection (max ROC-AUC)
    │
    ▼
Save Artifacts
├── ml_models/best_model.pkl
├── ml_models/scaler.pkl
├── ml_models/encoder.pkl
├── ml_models/feature_columns.pkl
└── ml_models/model_metrics.json
```

### Subtype Heuristic Logic
```
IF prediction == HIGH RISK:
    IF smoking==2 AND chest_pain==2 AND shortness_of_breath==2:
        → SCLC (Small Cell Lung Cancer)
    ELSE:
        → NSCLC (Non-Small Cell Lung Cancer)
ELSE:
    → No subtype (Low Risk)

NOTE: Heuristic-based only. Not medically diagnostic.
```

---

## Project Structure

```
pulmoscan/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # POST /auth/register, /auth/login
│   │   │   ├── predictions.py   # POST /predict, /batch-predict, GET /patients
│   │   │   └── statistics.py    # GET /statistics
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic settings
│   │   │   ├── database.py      # MongoDB connection (Motor)
│   │   │   └── security.py      # JWT + bcrypt
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── ml_service.py    # ML inference + subtype + recommendations
│   │   │   └── gemini_service.py# Gemini AI clinical explanation
│   │   └── main.py              # FastAPI app entry point
│   ├── data/
│   │   └── survey_lung_cancer.csv  # Real dataset (download from Kaggle)
│   ├── ml_models/               # Trained model artifacts (generated)
│   ├── lung.ipynb               # Complete ML notebook
│   ├── train_models.py          # Standalone training script
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── layout.tsx       # Root layout + providers
│   │   │   ├── globals.css      # Tailwind + custom styles
│   │   │   ├── auth/
│   │   │   │   ├── login/       # Login page
│   │   │   │   └── register/    # Register page
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── predict/         # Single prediction form
│   │   │   ├── batch/           # Batch upload page
│   │   │   ├── records/         # Patient records table
│   │   │   ├── statistics/      # Analytics & charts
│   │   │   └── about/           # About & disclaimer
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── ui/
│   │   │   │   ├── RiskGauge.tsx
│   │   │   │   ├── GeminiExplanationCard.tsx
│   │   │   │   ├── RecommendationCard.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   └── forms/
│   │   │       └── PredictionForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.tsx      # Auth context + hook
│   │   ├── lib/
│   │   │   └── api.ts           # Axios client
│   │   └── types/
│   │       └── index.ts         # TypeScript types
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── package.json
│   └── Dockerfile
│
├── docs/                        # Charts exported from notebook
├── docker-compose.yml           # Full-stack deployment
├── .env.example                 # Environment variables template
└── README.md
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone
```bash
git clone https://github.com/your-username/pulmoscan-ai.git
cd pulmoscan-ai
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and set:
#   SECRET_KEY=your-secret-key
#   GEMINI_API_KEY=your-gemini-key
```

### 3. Add Dataset
Download `survey lung cancer` dataset from Kaggle:
- URL: https://www.kaggle.com/datasets/mysarahmadbhat/lung-cancer
- Save as: `backend/data/survey_lung_cancer.csv`

### 4. Train ML Models
```bash
cd backend
pip install -r requirements.txt
python train_models.py
# This creates: ml_models/best_model.pkl, scaler.pkl, encoder.pkl, feature_columns.pkl
```

### 5. Launch with Docker
```bash
cd ..  # back to project root
docker-compose up --build
```

### 6. Access
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| MongoDB | mongodb://localhost:27017 |

---

## Installation (Manual)

### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure env
cp .env.example .env

# Train models first
python train_models.py

# Start backend
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

---

## Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (wipes MongoDB data)
docker-compose down -v
```

### Environment Variables for Docker
```bash
# In docker-compose.yml or .env:
SECRET_KEY=your-production-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new doctor |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current doctor info |

#### Register Request
```json
{
  "full_name": "Dr. Jane Smith",
  "email": "jane@hospital.com",
  "password": "securepass123",
  "specialty": "Pulmonologist",
  "hospital": "City General Hospital"
}
```

#### Login Request
```json
{
  "email": "jane@hospital.com",
  "password": "securepass123"
}
```

#### Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "doctor_id": "66abc123...",
  "full_name": "Dr. Jane Smith",
  "email": "jane@hospital.com"
}
```

---

### Predictions

All prediction endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/predict` | Single patient prediction |
| POST | `/batch-predict` | CSV/Excel batch prediction |
| GET | `/patients` | List all predictions (paginated) |
| GET | `/patients/{id}` | Get single prediction record |
| GET | `/statistics` | Platform statistics |
| GET | `/download/csv` | Download records as CSV |
| GET | `/download/excel` | Download records as Excel |

#### Predict Request
```json
{
  "patient_name": "John Doe",
  "AGE": 58,
  "GENDER": "M",
  "SMOKING": 2,
  "YELLOW_FINGERS": 2,
  "ANXIETY": 1,
  "PEER_PRESSURE": 1,
  "CHRONIC_DISEASE": 2,
  "FATIGUE": 2,
  "ALLERGY": 1,
  "WHEEZING": 2,
  "ALCOHOL_CONSUMING": 1,
  "COUGHING": 2,
  "SHORTNESS_OF_BREATH": 2,
  "SWALLOWING_DIFFICULTY": 1,
  "CHEST_PAIN": 2
}
```
> Binary fields: `1 = No`, `2 = Yes`

#### Predict Response
```json
{
  "patient_name": "John Doe",
  "prediction": "HIGH RISK",
  "risk_probability": 0.92,
  "subtype": "SCLC",
  "subtype_note": "Subtype classification is heuristic-based and not medically diagnostic.",
  "model_used": "Random Forest",
  "recommendations": [
    "Immediate referral to oncology specialist",
    "CT scan of the chest recommended",
    "Consider bronchoscopy or biopsy evaluation"
  ],
  "gemini_explanation": "Clinical interpretation by Gemini AI...",
  "disclaimer": "This system is intended for educational and clinical decision-support purposes only.",
  "prediction_id": "66abc123def456...",
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

### Batch Upload

Upload a CSV or Excel file with the following column structure:

```csv
patient_name,AGE,GENDER,SMOKING,YELLOW_FINGERS,ANXIETY,PEER_PRESSURE,CHRONIC_DISEASE,FATIGUE,ALLERGY,WHEEZING,ALCOHOL_CONSUMING,COUGHING,SHORTNESS_OF_BREATH,SWALLOWING_DIFFICULTY,CHEST_PAIN
John Doe,58,M,2,2,1,1,2,2,1,2,1,2,2,1,2
Jane Smith,42,F,1,1,2,1,1,2,1,1,2,2,1,1,1
```

```bash
curl -X POST http://localhost:8000/batch-predict \
  -H "Authorization: Bearer <token>" \
  -F "file=@patients.csv"
```

---

## MongoDB Setup

### Manual Setup
```bash
# Start MongoDB
mongod --dbpath /data/db

# Connect with mongosh
mongosh

# Create database and user (optional for production)
use pulmoscan_db
db.createUser({
  user: "pulmoscan",
  pwd: "yourpassword",
  roles: [{ role: "readWrite", db: "pulmoscan_db" }]
})
```

### Collections Created Automatically
| Collection | Purpose |
|---|---|
| `doctors` | Doctor accounts (hashed passwords) |
| `predictions` | All patient prediction records |
| `batch_uploads` | Batch upload metadata/logs |
| `logs` | System activity logs |

---

## Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to your `.env`:
   ```
   GEMINI_API_KEY=AIzaSy...your-key-here
   ```
4. Model used: `gemini-1.5-flash` (fast, cost-effective)

> If `GEMINI_API_KEY` is not set, the system still works — predictions run normally, and the Gemini explanation shows a configuration notice.

---

## Dataset

**Survey Lung Cancer Dataset**
- Source: [Kaggle – Lung Cancer Survey](https://www.kaggle.com/datasets/mysarahmadbhat/lung-cancer)
- Records: 309 patients
- Features: 15 clinical/demographic risk factors
- Target: `LUNG_CANCER` (YES/NO)

**Expected CSV columns:**
```
GENDER, AGE, SMOKING, YELLOW_FINGERS, ANXIETY, PEER_PRESSURE,
CHRONIC_DISEASE, FATIGUE, ALLERGY, WHEEZING, ALCOHOL_CONSUMING,
COUGHING, SHORTNESS_OF_BREATH, SWALLOWING_DIFFICULTY, CHEST_PAIN,
LUNG_CANCER
```

Place the file at: `backend/data/survey_lung_cancer.csv`

---

## Screenshots

> Run the application and capture screenshots for your thesis/report.

| Page | Description |
|---|---|
| `/` | Landing page with features & stats |
| `/auth/login` | Doctor login portal |
| `/auth/register` | Doctor registration |
| `/dashboard` | Overview with KPI cards |
| `/predict` | Single patient prediction form + results |
| `/batch` | CSV/Excel batch upload |
| `/records` | Searchable patient records table |
| `/statistics` | Recharts analytics dashboard |
| `/about` | System documentation & disclaimer |

---

## Running the ML Notebook

```bash
cd backend

# Install Jupyter
pip install jupyter matplotlib seaborn

# Launch notebook
jupyter notebook lung.ipynb
```

The notebook covers:
1. Data loading & inspection
2. EDA (distributions, gender breakdown)
3. Missing value analysis & heatmap
4. Outlier detection (IQR method)
5. Correlation heatmap
6. Preprocessing pipeline
7. Feature engineering
8. Training 5 ML algorithms
9. ROC curves for all models
10. Model comparison bar charts
11. Confusion matrix (best model)
12. Feature importance
13. Saving artifacts

---

## Academic Notes

This project was developed as a **university capstone project** following software engineering best practices:

- **Modularity:** Separated concerns across API routers, services, and ML pipeline
- **Clean Code:** Docstrings, type hints, consistent naming conventions
- **Security:** JWT authentication, bcrypt password hashing, protected routes
- **Reproducibility:** Fixed `random_state=42` across all experiments
- **Validation:** 5-fold stratified cross-validation per model
- **Transparency:** Subtype heuristic clearly labeled as non-diagnostic
- **Healthcare Ethics:** Disclaimers on every prediction and AI explanation

### Clinical Disclaimer (repeat)
> PulmoScan AI **does not** diagnose lung cancer. All outputs are decision-support indicators only. A qualified physician must evaluate all results before any clinical action. The subtype classification (NSCLC/SCLC) is based on heuristic rules and has **not** been clinically validated. Histopathological examination remains the gold standard for lung cancer diagnosis.

---

## License

This project is developed for educational purposes. Not licensed for clinical use without regulatory approval.

---

*Built with ❤️ for healthcare education*
