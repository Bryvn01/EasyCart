# 🔐 Environment Variables Quick Reference

> **As requested by a skilled fullstack developer & senior devops engineer**
> Complete environment setup for EasyCart - Frontend, Backend & Admin Dashboard

---

## 📋 Table of Contents
- [Quick Setup](#-quick-setup)
- [Backend Environment](#-backend-environment-backendenv)
- [Frontend Environment](#-frontend-environment-frontendenv)
- [Admin Dashboard Environment](#-admin-dashboard-environment-admin-dashboardenv)
- [Critical Values](#-critical-values-to-update)
- [Testing Setup](#-testing-your-setup)

---

## 🚀 Quick Setup

### Run the automated setup script:
```powershell
.\setup-environment.ps1
```

This will:
- ✅ Check all 3 `.env` files exist
- ✅ Verify critical configuration values
- ✅ Check PostgreSQL status
- ✅ Verify Python/Node dependencies
- ✅ Provide actionable next steps

---

## 🔧 Backend Environment (`backend\.env`)

### ⚠️ CRITICAL - Must Update:

```env
# 1. Generate a secure SECRET_KEY
SECRET_KEY=your_generated_secret_key_here

# Run this to generate:
# python -c "import secrets; print(secrets.token_urlsafe(50))"

# 2. Add Cloudinary credentials
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
# Get from: https://cloudinary.com/console
```

### ✅ Already Configured (Verify):

```env
# PostgreSQL Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=easycart_user
DB_PASSWORD=easycart2025
DB_HOST=localhost
DB_PORT=5432

# Django Settings
DEBUG=True                    # ⚠️ Set to False in production!
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# CORS - Frontend URLs
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 📦 Optional (Add when needed):

```env
# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Payment Gateways (when ready)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Caching & Background Tasks
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

---

## 🎨 Frontend Environment (`frontend\.env`)

### ⚠️ CRITICAL - Must Set:

```env
# API Connection (Django backend)
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_API_BASE_URL=http://localhost:8000

# Cloudinary (for image uploads)
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### ✅ Build Configuration (Optional):

```env
# React Build Settings
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=true

# Performance
REACT_APP_ITEMS_PER_PAGE=12
REACT_APP_SEARCH_DEBOUNCE=300
REACT_APP_ENABLE_LAZY_LOADING=true
```

### 📦 Optional Features:

```env
# Analytics
REACT_APP_POSTHOG_KEY=phc_...
REACT_APP_POSTHOG_HOST=https://app.posthog.com
REACT_APP_GA_TRACKING_ID=UA-...

# Firebase (if using)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...

# Payment (Public Keys Only)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_PAYPAL_CLIENT_ID=...

# Feature Flags
REACT_APP_ENABLE_WISHLIST=true
REACT_APP_ENABLE_REVIEWS=true
REACT_APP_ENABLE_QUICK_VIEW=true
```

---

## 📊 Admin Dashboard Environment (`admin-dashboard\.env`)

### ⚠️ CRITICAL - Must Set:

```env
# API Connection
REACT_APP_API_URL=http://localhost:8000/api

# Cloudinary
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### ✅ Admin-Specific Settings:

```env
# Build Configuration
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true

# Performance
REACT_APP_ITEMS_PER_PAGE=20
REACT_APP_ENABLE_DEBUG_MODE=false

# Features
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_REFRESH_INTERVAL=30000
```

---

## 🎯 Critical Values to Update

### Priority 1 (REQUIRED for app to work):

| Variable | File | How to Get | Impact |
|----------|------|------------|--------|
| `SECRET_KEY` | backend/.env | Run: `python -c "import secrets; print(secrets.token_urlsafe(50))"` | Django won't start without it |
| `CLOUDINARY_URL` | backend/.env | Get from [Cloudinary Console](https://cloudinary.com/console) | Image uploads won't work |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` | frontend/.env | Same as Cloudinary (cloud name only) | Images won't display |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` | admin-dashboard/.env | Same as Cloudinary | Admin images won't display |

### Priority 2 (VERIFY configuration):

| Variable | File | Current Value | Correct? |
|----------|------|---------------|----------|
| `REACT_APP_API_URL` | frontend/.env | http://localhost:8000/api | ✅ Yes |
| `REACT_APP_API_URL` | admin-dashboard/.env | http://localhost:8000/api | ✅ Yes |
| `DB_NAME` | backend/.env | easycart | ✅ Yes |
| `DB_USER` | backend/.env | easycart_user | ✅ Yes |
| `CORS_ALLOWED_ORIGINS` | backend/.env | localhost:3000,localhost:3001 | ✅ Yes |

### Priority 3 (Optional, add later):

| Variable | File | When to Add |
|----------|------|-------------|
| `STRIPE_*` | backend/.env | When ready to accept payments |
| `EMAIL_*` | backend/.env | When ready to send emails |
| `REDIS_URL` | backend/.env | When adding caching |
| `SENTRY_DSN` | backend/.env | When ready for error monitoring |

---

## 🧪 Testing Your Setup

### Step 1: Generate SECRET_KEY
```powershell
cd C:\EasyCart
.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(50))"
```
Copy the output and paste into `backend\.env`:
```env
SECRET_KEY=paste_generated_key_here
```

### Step 2: Test PostgreSQL Connection
```powershell
cd backend
C:/EasyCart/.venv/Scripts/python.exe manage.py dbshell
```
Should open PostgreSQL prompt. Type `\q` to exit.

### Step 3: Run Migrations
```powershell
C:/EasyCart/.venv/Scripts/python.exe manage.py migrate
```
Should see:
```
✓ Operations to perform...
✓ Running migrations...
✓ Applying...
```

### Step 4: Create Superuser (for admin access)
```powershell
C:/EasyCart/.venv/Scripts/python.exe manage.py createsuperuser
```
Follow prompts to create admin account.

### Step 5: Start Backend
```powershell
C:/EasyCart/.venv/Scripts/python.exe manage.py runserver
```
Should see:
```
✓ Starting development server at http://127.0.0.1:8000/
```

### Step 6: Test Backend API
Open browser: http://localhost:8000/api/
Should see Django REST Framework browsable API.

### Step 7: Start Frontend
```powershell
cd C:\EasyCart\frontend
npm start
```
Should open: http://localhost:3000

### Step 8: Start Admin Dashboard
```powershell
cd C:\EasyCart\admin-dashboard
npm start
```
Should open: http://localhost:3001 (or next available port)

### Step 9: Test Image Display
1. Go to http://localhost:3000/products
2. Images should load from Cloudinary
3. If images don't load, check:
   - `REACT_APP_CLOUDINARY_CLOUD_NAME` is set correctly
   - Cloudinary console shows uploaded images
   - Browser console for errors

### Step 10: Test API Connection
Open browser console (F12) on frontend:
```javascript
fetch('http://localhost:8000/api/products/')
  .then(r => r.json())
  .then(console.log)
```
Should see product data.

---

## 🚨 Common Issues & Fixes

### Issue: Backend won't start
```
django.core.exceptions.ImproperlyConfigured: The SECRET_KEY setting must not be empty.
```
**Fix:** Generate and set SECRET_KEY in `backend\.env`

### Issue: Database connection failed
```
django.db.utils.OperationalError: could not connect to server
```
**Fix:**
1. Check PostgreSQL is running: `Get-Service -Name "postgresql*"`
2. Verify credentials in `backend\.env`
3. Test connection: `psql -U easycart_user -d easycart`

### Issue: CORS errors in browser
```
Access to fetch at 'http://localhost:8000/api/' has been blocked by CORS policy
```
**Fix:** Add frontend URL to `CORS_ALLOWED_ORIGINS` in `backend\.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Issue: Images not loading
```
Failed to load resource: cloudinary
```
**Fix:**
1. Set `REACT_APP_CLOUDINARY_CLOUD_NAME` in frontend/.env
2. Verify Cloudinary credentials in backend/.env
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Frontend can't reach backend
```
Network Error / Failed to fetch
```
**Fix:**
1. Verify backend is running: http://localhost:8000/api/
2. Check `REACT_APP_API_URL` in frontend/.env
3. Verify CORS settings in backend/.env

---

## 📚 Full Documentation

For complete details, see:
- **[ENVIRONMENT_SETUP_COMPLETE.md](ENVIRONMENT_SETUP_COMPLETE.md)** - Comprehensive guide with all variables
- **[START_HERE_DEPLOYMENT.md](START_HERE_DEPLOYMENT.md)** - PostgreSQL deployment guide
- **[PRODUCTION_READINESS_POSTGRESQL.md](PRODUCTION_READINESS_POSTGRESQL.md)** - Production checklist

---

## ✅ Checklist

Use this to track your setup:

### Backend Setup
- [ ] `backend\.env` exists
- [ ] Generated and set `SECRET_KEY`
- [ ] Added `CLOUDINARY_URL` credentials
- [ ] Verified PostgreSQL connection details
- [ ] Set `DEBUG=True` for development
- [ ] Added frontend URLs to `CORS_ALLOWED_ORIGINS`
- [ ] Ran migrations: `python manage.py migrate`
- [ ] Created superuser: `python manage.py createsuperuser`
- [ ] Backend starts successfully

### Frontend Setup
- [ ] `frontend\.env` exists
- [ ] Set `REACT_APP_API_URL=http://localhost:8000/api`
- [ ] Set `REACT_APP_CLOUDINARY_CLOUD_NAME`
- [ ] Installed dependencies: `npm install`
- [ ] Frontend starts successfully
- [ ] Can access products page
- [ ] Images load correctly

### Admin Dashboard Setup
- [ ] `admin-dashboard\.env` exists
- [ ] Set `REACT_APP_API_URL=http://localhost:8000/api`
- [ ] Set `REACT_APP_CLOUDINARY_CLOUD_NAME`
- [ ] Installed dependencies: `npm install`
- [ ] Admin dashboard starts successfully
- [ ] Can login with superuser credentials

### Integration Testing
- [ ] All 3 services running simultaneously
- [ ] Frontend can fetch data from backend
- [ ] Admin can manage products
- [ ] Images display correctly everywhere
- [ ] No CORS errors in browser console

---

## 🎉 You're Ready When...

✅ All 3 applications start without errors
✅ Frontend displays products with images
✅ Admin dashboard connects to backend
✅ Database queries work
✅ No CORS errors in console
✅ Cloudinary images load

**Next Step:** Start building features or deploy to production! 🚀

---

*Generated for skilled fullstack developers & senior devops engineers*
*Last Updated: EasyCart PostgreSQL Migration*
