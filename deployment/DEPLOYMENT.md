# PulmoScan AI – Deployment Guide

## Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine + Compose (Linux)
- Git
- 4GB RAM minimum
- Internet connection (for Gemini API)

## Step-by-Step Deployment

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/pulmoscan-ai.git
cd pulmoscan-ai
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```
SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters
GEMINI_API_KEY=AIzaSy...your-google-gemini-key
```

### Step 3: Download Dataset
1. Go to: https://www.kaggle.com/datasets/mysarahmadbhat/lung-cancer
2. Download `survey_lung_cancer.csv`
3. Place at: `backend/data/survey_lung_cancer.csv`

### Step 4: Train ML Models (run once)
```bash
cd backend
pip install scikit-learn pandas numpy joblib
python train_models.py
cd ..
```
This creates `backend/ml_models/` with trained model artifacts.

### Step 5: Launch with Docker Compose
```bash
docker-compose up --build
```

Wait ~2 minutes for all services to start.

### Step 6: Verify Services
```bash
# Check all containers are running
docker-compose ps

# Check backend health
curl http://localhost:8000/health

# Check frontend
open http://localhost:3000
```

### Step 7: Setup MongoDB Indexes (optional, improves performance)
```bash
pip install motor
python deployment/setup_mongo.py
```

### Step 8: Register First Doctor Account
1. Open http://localhost:3000
2. Click "Register"
3. Fill in your doctor details
4. Login with your credentials

---

## Production Considerations

### Security
- Change `SECRET_KEY` to a cryptographically secure random string:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- Enable MongoDB authentication in production
- Use HTTPS with a reverse proxy (Nginx + Let's Encrypt)
- Set secure CORS origins

### Scaling
- Add Nginx reverse proxy for load balancing
- Use MongoDB Atlas for managed database
- Deploy backend to multiple replicas
- Use Redis for session caching

### Nginx Configuration (example)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://backend:8000/;
    }

    location / {
        proxy_pass http://frontend:3000;
    }
}
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Models not loading | Run `python train_models.py` in `backend/` |
| MongoDB connection error | Check `docker-compose ps`, ensure mongo is healthy |
| CORS errors | Verify `ALLOWED_ORIGINS` in backend `.env` includes frontend URL |
| Gemini not working | Check `GEMINI_API_KEY` is valid in `.env` |
| Frontend not connecting | Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local` |
