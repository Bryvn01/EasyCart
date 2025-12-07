# Render Deployment Fix

## Issue
Database connection failing during build: "the database system is starting up"

## Solution
Added database wait script and updated build process.

## Files Added
1. `backend/wait_for_db.py` - Waits for database to be ready
2. `backend/build.sh` - Build script with database wait
3. `render.yaml` - Render configuration

## Render Configuration

### Build Command
```bash
cd backend && chmod +x build.sh && ./build.sh
```

### Start Command
```bash
cd backend && gunicorn ecommerce.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

### Environment Variables (Required)
```
PYTHON_VERSION=3.12.0
SECRET_KEY=<your_django_secret_key>
DEBUG=False
ALLOWED_HOSTS=<your-render-domain>.onrender.com
DB_ENGINE=django.db.backends.postgresql
DB_NAME=<from-render-db>
DB_USER=<from-render-db>
DB_PASSWORD=<from-render-db>
DB_HOST=<from-render-db>
DB_PORT=<from-render-db>
CORS_ALLOWED_ORIGINS=https://<your-frontend>.onrender.com
```

## Deploy Steps

1. **Push changes to GitHub**
2. **In Render Dashboard**:
   - Go to your backend service
   - Settings → Build & Deploy
   - Build Command: `cd backend && chmod +x build.sh && ./build.sh`
   - Start Command: `cd backend && gunicorn ecommerce.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
3. **Manual Deploy** or wait for auto-deploy

## Verification
```bash
# Check logs in Render dashboard
# Should see:
# ✅ Database is ready!
# 🗄️ Running migrations...
# ✅ Build complete!
```
