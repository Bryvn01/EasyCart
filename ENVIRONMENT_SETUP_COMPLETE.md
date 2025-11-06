# 🔐 EasyCart Complete Environment Configuration Guide

**Last Updated**: October 14, 2025
**For**: Local Development & Production Deployment

---

## 📋 Table of Contents

1. [Backend Environment Variables](#backend-environment-variables)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Admin Dashboard Environment Variables](#admin-dashboard-environment-variables)
4. [Quick Setup Guide](#quick-setup-guide)
5. [Production Checklist](#production-checklist)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Backend Environment Variables

### Location: `backend/.env`

```env
# ========================================
# CORE DJANGO SETTINGS
# ========================================

# Django Secret Key (CRITICAL - Generate new for production!)
# Generate: python -c "import secrets; print(secrets.token_urlsafe(50))"
SECRET_KEY=<your_django_secret_key>

# Debug Mode (MUST be False in production!)
DEBUG=True

# Allowed Hosts (comma-separated, no spaces)
# Local: 127.0.0.1,localhost
# Production: yourdomain.com,www.yourdomain.com,api.yourdomain.com
ALLOWED_HOSTS=127.0.0.1,localhost

# ========================================
# DATABASE CONFIGURATION (PostgreSQL)
# ========================================

# Database Engine
DB_ENGINE=django.db.backends.postgresql

# Database Name
DB_NAME=easycart

# Database User
DB_USER=easycart_user

# Database Password (CHANGE IN PRODUCTION!)
DB_PASSWORD=easycart2025

# Database Host
# Local: localhost
# Production: your-db-host.railway.app or RDS endpoint
DB_HOST=localhost

# Database Port
DB_PORT=5432

# ========================================
# CORS CONFIGURATION
# ========================================

# Frontend URLs (comma-separated, no spaces)
# Local: http://localhost:3000,http://localhost:3001
# Production: https://yourdomain.com,https://admin.yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# ========================================
# CLOUDINARY (IMAGE CDN)
# ========================================

# Option 1: Single URL (Recommended)
# Format: cloudinary://api_key:api_secret@cloud_name
# Get from: https://cloudinary.com/console
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

# Option 2: Individual credentials (Alternative)
# CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
# CLOUDINARY_API_KEY=<your_cloudinary_api_key>
# CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

# ========================================
# EMAIL CONFIGURATION
# ========================================

# Email Backend
# Development: django.core.mail.backends.console.EmailBackend
# Production: django.core.mail.backends.smtp.EmailBackend
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# SMTP Settings (for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@easycart.com
SERVER_EMAIL=server@easycart.com

# ========================================
# REDIS (OPTIONAL - FOR CACHING)
# ========================================

# Redis URL for caching
REDIS_URL=redis://localhost:6379/1

# Celery Broker (for async tasks)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
CELERY_TASK_ALWAYS_EAGER=True

# ========================================
# JWT AUTHENTICATION
# ========================================

# JWT Secret (can be same as SECRET_KEY or different)
JWT_SECRET=<your_jwt_secret>

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000

# ========================================
# PAYMENT GATEWAYS
# ========================================

# M-PESA (Safaricom - Kenya)
MPESA_CONSUMER_KEY=<your_mpesa_consumer_key>
MPESA_CONSUMER_SECRET=<your_mpesa_consumer_secret>
MPESA_SHORTCODE=174379
MPESA_PASSKEY=<your_mpesa_passkey>
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback/

# Stripe (International)
STRIPE_SECRET_KEY=<your_django_secret_key>
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal (International)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Flutterwave (Africa)
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=<your_django_secret_key>
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key

# ========================================
# MONITORING & ANALYTICS (OPTIONAL)
# ========================================

# Sentry Error Tracking
SENTRY_DSN=

# Google Analytics
GA_TRACKING_ID=

# PostHog Analytics
POSTHOG_API_KEY=
POSTHOG_HOST=https://app.posthog.com

# ========================================
# ADMIN CONFIGURATION
# ========================================

# Custom admin URL (security through obscurity)
ADMIN_URL=admin/

# Node.js Backend Port (if using separate Node backend)
PORT=5000

# ========================================
# PRODUCTION SETTINGS
# ========================================

# Security Headers
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
SECURE_HSTS_SECONDS=0

# Set these to True in production with HTTPS
# SECURE_SSL_REDIRECT=True
# SESSION_COOKIE_SECURE=True
# CSRF_COOKIE_SECURE=True
# SECURE_HSTS_SECONDS=31536000
```

---

## ⚛️ Frontend Environment Variables

### Location: `frontend/.env`

```env
# ========================================
# REACT BUILD CONFIGURATION
# ========================================

# Disable ESLint plugin during build (optional)
DISABLE_ESLINT_PLUGIN=true

# Skip preflight check (optional)
SKIP_PREFLIGHT_CHECK=true

# Generate source maps (set false for production)
GENERATE_SOURCEMAP=true

# ========================================
# API CONFIGURATION
# ========================================

# Backend API URL
# Local Development: http://localhost:8000/api (Django) or http://localhost:5000/api (Node)
# Production: https://api.yourdomain.com/api or https://your-backend.railway.app/api
REACT_APP_API_URL=http://localhost:8000/api

# Alternative backend URL (for backwards compatibility)
REACT_APP_BACKEND_URL=http://localhost:8000

# Base API URL (used in some components)
REACT_APP_API_BASE_URL=http://localhost:8000

# ========================================
# CLOUDINARY (IMAGE CDN)
# ========================================

# Cloudinary Cloud Name
REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>

# Optional: Cloudinary API Key (for upload widgets)
REACT_APP_CLOUDINARY_API_KEY=<your_cloudinary_api_key>

# Optional: Upload Preset (for unsigned uploads)
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# ========================================
# AUTHENTICATION
# ========================================

# JWT Token Settings
REACT_APP_TOKEN_STORAGE_KEY=easycart_token
REACT_APP_USER_STORAGE_KEY=easycart_user

# Session timeout (milliseconds)
REACT_APP_AUTH_TIMEOUT=3600000

# ========================================
# PAYMENT GATEWAYS (PUBLIC KEYS ONLY)
# ========================================

# Stripe Publishable Key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# PayPal Client ID
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id

# Flutterwave Public Key
REACT_APP_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key

# M-PESA Settings
REACT_APP_MPESA_SHORTCODE=174379

# ========================================
# FIREBASE (OPTIONAL)
# ========================================

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=easycart.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=easycart
REACT_APP_FIREBASE_STORAGE_BUCKET=easycart.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ========================================
# ANALYTICS & MONITORING
# ========================================

# Google Analytics
REACT_APP_GA_TRACKING_ID=UA-XXXXXXXXX-X

# PostHog Analytics
REACT_APP_POSTHOG_KEY=phc_your_posthog_key
REACT_APP_POSTHOG_HOST=https://app.posthog.com

# Sentry Error Tracking
REACT_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Hotjar Analytics
REACT_APP_HOTJAR_ID=your_hotjar_id

# ========================================
# FEATURE FLAGS
# ========================================

# Enable/Disable features
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_PAYMENTS=true
REACT_APP_ENABLE_WISHLIST=true
REACT_APP_ENABLE_REVIEWS=true
REACT_APP_ENABLE_CHAT=false

# ========================================
# SEO & METADATA
# ========================================

# Site Information
REACT_APP_SITE_NAME=EasyCart
REACT_APP_SITE_DESCRIPTION=Your one-stop online shopping destination
REACT_APP_SITE_URL=https://easycart.com
REACT_APP_SITE_IMAGE=https://res.cloudinary.com/your-cloud/image/upload/og-image.jpg

# Social Media
REACT_APP_FACEBOOK_URL=https://facebook.com/easycart
REACT_APP_TWITTER_URL=https://twitter.com/easycart
REACT_APP_INSTAGRAM_URL=https://instagram.com/easycart

# ========================================
# PERFORMANCE
# ========================================

# Items per page
REACT_APP_ITEMS_PER_PAGE=12

# Search debounce (milliseconds)
REACT_APP_SEARCH_DEBOUNCE=300

# Max image upload size (bytes)
REACT_APP_MAX_UPLOAD_SIZE=5242880

# ========================================
# DEVELOPMENT
# ========================================

# Debug mode
REACT_APP_DEBUG_MODE=false

# Mock API responses
REACT_APP_USE_MOCK_DATA=false
```

---

## 📊 Admin Dashboard Environment Variables

### Location: `admin-dashboard/.env`

```env
# ========================================
# REACT BUILD CONFIGURATION
# ========================================

# Generate source maps (set false for production)
GENERATE_SOURCEMAP=true

# ========================================
# API CONFIGURATION
# ========================================

# Backend API URL
# Local: http://localhost:8000/api (Django) or http://localhost:5000/api (Node)
# Production: https://api.yourdomain.com/api
REACT_APP_API_URL=http://localhost:8000/api

# Upload URL (for file uploads)
REACT_APP_UPLOAD_URL=http://localhost:8000/uploads

# ========================================
# AUTHENTICATION
# ========================================

# Admin authentication settings
REACT_APP_AUTH_TIMEOUT=3600000
REACT_APP_ADMIN_EMAIL=admin@easycart.com

# Token storage keys
REACT_APP_TOKEN_KEY=admin_token
REACT_APP_USER_KEY=admin_user

# ========================================
# CLOUDINARY (IMAGE MANAGEMENT)
# ========================================

# Cloudinary Cloud Name
REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>

# Cloudinary API Key
REACT_APP_CLOUDINARY_API_KEY=<your_cloudinary_api_key>

# Upload Preset
REACT_APP_CLOUDINARY_UPLOAD_PRESET=admin_preset

# ========================================
# FEATURES
# ========================================

# Enable demo data
REACT_APP_ENABLE_DEMO_DATA=true

# Max upload size (bytes - 5MB)
REACT_APP_MAX_UPLOAD_SIZE=5242880

# Supported image formats
REACT_APP_SUPPORTED_IMAGE_FORMATS=image/jpeg,image/png,image/gif,image/webp

# ========================================
# PERFORMANCE
# ========================================

# Items per page in tables
REACT_APP_ITEMS_PER_PAGE=10

# Search debounce (milliseconds)
REACT_APP_SEARCH_DEBOUNCE=300

# Auto-save interval (milliseconds)
REACT_APP_AUTOSAVE_INTERVAL=30000

# ========================================
# ANALYTICS (OPTIONAL)
# ========================================

# Google Analytics
REACT_APP_GA_TRACKING_ID=

# Hotjar
REACT_APP_HOTJAR_ID=

# ========================================
# ERROR REPORTING (OPTIONAL)
# ========================================

# Sentry DSN
REACT_APP_SENTRY_DSN=

# ========================================
# DEVELOPMENT
# ========================================

# Debug mode
REACT_APP_DEBUG_MODE=false

# Mock API
REACT_APP_USE_MOCK_API=false
```

---

## 🚀 Quick Setup Guide

### Step 1: Backend Setup

```powershell
# Navigate to backend
cd C:\EasyCart\backend

# Copy example file
Copy-Item .env.example .env

# Edit .env file with your values
notepad .env

# Install PostgreSQL driver (if not already installed)
C:/EasyCart/.venv/Scripts/python.exe -m pip install psycopg2-binary

# Run migrations
C:/EasyCart/.venv/Scripts/python.exe manage.py migrate

# Create superuser
C:/EasyCart/.venv/Scripts/python.exe manage.py createsuperuser

# Start backend server
C:/EasyCart/.venv/Scripts/python.exe manage.py runserver
```

### Step 2: Frontend Setup

```powershell
# Navigate to frontend
cd C:\EasyCart\frontend

# Create .env file
New-Item -Path .env -ItemType File

# Add this content to frontend/.env:
@"
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
DISABLE_ESLINT_PLUGIN=true
"@ | Out-File -FilePath .env -Encoding utf8

# Install dependencies
npm install

# Start frontend
npm start
```

### Step 3: Admin Dashboard Setup

```powershell
# Navigate to admin dashboard
cd C:\EasyCart\admin-dashboard

# Create .env file
New-Item -Path .env -ItemType File

# Add this content to admin-dashboard/.env:
@"
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
REACT_APP_ENABLE_DEMO_DATA=true
"@ | Out-File -FilePath .env -Encoding utf8

# Install dependencies (if needed)
npm install

# Start admin dashboard
npm start
```

---

## ✅ Production Checklist

### Backend Production Settings

- [ ] ✅ Change `SECRET_KEY` to secure 50+ character string
- [ ] ✅ Set `DEBUG=False`
- [ ] ✅ Update `ALLOWED_HOSTS` with your domain(s)
- [ ] ✅ Configure production PostgreSQL database
- [ ] ✅ Update `CORS_ALLOWED_ORIGINS` with production URLs
- [ ] ✅ Add real Cloudinary credentials
- [ ] ✅ Configure email SMTP settings
- [ ] ✅ Add payment gateway credentials
- [ ] ✅ Enable security headers (SSL redirect, secure cookies)
- [ ] ✅ Set up Sentry for error tracking

### Frontend Production Settings

- [ ] ✅ Update `REACT_APP_API_URL` to production backend
- [ ] ✅ Add Cloudinary cloud name
- [ ] ✅ Set `GENERATE_SOURCEMAP=false`
- [ ] ✅ Add payment gateway public keys
- [ ] ✅ Configure analytics (GA, PostHog)
- [ ] ✅ Add Sentry DSN
- [ ] ✅ Update SEO metadata
- [ ] ✅ Set production feature flags

### Admin Dashboard Production Settings

- [ ] ✅ Update `REACT_APP_API_URL` to production backend
- [ ] ✅ Set `REACT_APP_ENABLE_DEMO_DATA=false`
- [ ] ✅ Add Cloudinary credentials
- [ ] ✅ Configure error tracking

---

## 🔍 Required vs Optional Variables

### Backend - REQUIRED for Basic Functionality

```env
SECRET_KEY=<your_django_secret_key>           # Django security
DEBUG=True/False         # Environment mode
ALLOWED_HOSTS=...        # Allowed domains
DB_ENGINE=...            # PostgreSQL engine
DB_NAME=...              # Database name
DB_USER=...              # Database user
DB_PASSWORD=...          # Database password
DB_HOST=...              # Database host
DB_PORT=...              # Database port
CORS_ALLOWED_ORIGINS=... # Frontend URLs
CLOUDINARY_URL=...       # Image hosting
```

### Backend - OPTIONAL (Recommended for Production)

```env
EMAIL_HOST=...           # Email service
STRIPE_SECRET_KEY=<your_django_secret_key>    # Payments
REDIS_URL=...            # Caching
SENTRY_DSN=...           # Error tracking
```

### Frontend - REQUIRED

```env
REACT_APP_API_URL=...             # Backend API
REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name> # Images
```

### Frontend - OPTIONAL

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=... # Payments
REACT_APP_GA_TRACKING_ID=...         # Analytics
REACT_APP_SENTRY_DSN=...             # Errors
```

---

## 🆘 Troubleshooting

### Issue: "SECRET_KEY not set"

**Solution**: Edit `backend/.env` and set SECRET_KEY:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### Issue: "Database connection failed"

**Solution**: Check PostgreSQL is running:
```powershell
# Check if PostgreSQL service is running
Get-Service postgresql*

# Test connection
psql -U easycart_user -d easycart -h localhost
```

### Issue: Frontend can't connect to backend

**Solution**:
1. Check backend is running on port 8000
2. Verify `REACT_APP_API_URL=http://localhost:8000/api` in `frontend/.env`
3. Check CORS settings in `backend/.env`:
   ```env
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ```

### Issue: Images not loading

**Solution**:
1. Check Cloudinary credentials in `backend/.env`
2. Verify cloud name in `frontend/.env`
3. Check CORS settings in Cloudinary dashboard

### Issue: CORS errors

**Solution**: Update `backend/.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 📝 Environment Variable Generation Commands

### Generate SECRET_KEY

```powershell
# Python method
python -c "import secrets; print(secrets.token_urlsafe(50))"

# PowerShell method
-join ((33..126) | Get-Random -Count 50 | % {[char]$_})
```

### Generate JWT_SECRET

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

### Test Database Connection

```powershell
# From backend directory
C:/EasyCart/.venv/Scripts/python.exe manage.py dbshell
```

### Check Environment Variables Loaded

```powershell
# Backend
C:/EasyCart/.venv/Scripts/python.exe manage.py check

# Frontend
npm run start # Check console output
```

---

## 🎯 Summary: Minimal Working Configuration

### For local development, you ONLY need:

**Backend** (`backend/.env`):
```env
SECRET_KEY=<your_django_secret_key>
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=easycart_user
DB_PASSWORD=easycart2025
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
```

**Admin Dashboard** (`admin-dashboard/.env`):
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
```

---

**✅ That's everything you need for a fully functional EasyCart setup!**

**Next Steps**:
1. Copy the appropriate environment variables
2. Replace placeholder values with your actual credentials
3. Start your services
4. Test all functionality

**For production deployment**, see: `PRODUCTION_READINESS_POSTGRESQL.md`
