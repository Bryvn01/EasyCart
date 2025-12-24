# Environment Variables - Complete Setup Guide

## 🔴 CRITICAL - Required for Basic Functionality

### Django Core
```env
SECRET_KEY=your-strong-django-secret-key-min-50-chars
DEBUG=False
ALLOWED_HOSTS=easycart-backend-2k8l.onrender.com,yourdomain.com
```
**How to get:**
- Generate SECRET_KEY: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- Set DEBUG=False in production
- Add your Render backend URL to ALLOWED_HOSTS

### PostgreSQL Database
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=easycart_user
DB_PASSWORD=your_secure_password
DB_HOST=dpg-xxxxx.oregon-postgres.render.com
DB_PORT=5432
```
**How to get:**
- Create PostgreSQL database on Render
- Copy connection details from Render dashboard
- Internal URL format: `postgresql://user:pass@host/dbname`

### CORS Settings
```env
CORS_ALLOWED_ORIGINS=https://easycart-frontend-wj9x.onrender.com,https://easycart-admin-08xf.onrender.com
```
**How to get:**
- Add your frontend and admin dashboard URLs
- Separate multiple URLs with commas (no spaces)

---

## 🟡 IMPORTANT - Required for Full E-Commerce Flow

### Cloudinary (Image Storage)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret
```
**How to get:**
1. Sign up at https://cloudinary.com (free tier available)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
**Impact if missing:** Product images won't upload, will use URLs directly

### Email (Order Notifications)
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=noreply@easycart.com
```
**How to get (Gmail):**
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Use the 16-character password (no spaces)
**Impact if missing:** Order confirmation emails won't send

---

## 🟠 OPTIONAL - Enhanced Features

### M-Pesa Payment Gateway (Kenya)
```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://easycart-backend-2k8l.onrender.com/api/orders/payment/mpesa/callback/
```
**How to get:**
1. Register at https://developer.safaricom.co.ke
2. Create an app (Sandbox or Production)
3. Get Consumer Key and Consumer Secret
4. Get Lipa Na M-Pesa Online Passkey
5. Set callback URL to your backend + `/api/orders/payment/mpesa/callback/`
**Impact if missing:** M-Pesa payments return 503 error (other payment methods still work)

### Twilio (SMS/WhatsApp Notifications)
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```
**How to get:**
1. Sign up at https://www.twilio.com (free trial available)
2. Go to Console Dashboard
3. Copy Account SID and Auth Token
4. Get a phone number or use WhatsApp sandbox
**Impact if missing:** SMS/WhatsApp notifications won't send (orders still process)

---

## 📋 Frontend Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=https://easycart-backend-2k8l.onrender.com/api
```
**Required:** Yes
**How to set:** Add in Render Static Site environment variables

### Admin Dashboard (.env)
```env
REACT_APP_API_URL=https://easycart-backend-2k8l.onrender.com/api
```
**Required:** Yes
**How to set:** Add in Render Static Site environment variables

---

## 🚀 Deployment Checklist

### Minimum for Basic E-Commerce (No Payments)
- ✅ Django Core (SECRET_KEY, DEBUG, ALLOWED_HOSTS)
- ✅ PostgreSQL Database (all DB_* variables)
- ✅ CORS Settings
- ✅ Frontend REACT_APP_API_URL

### Recommended for Production
- ✅ All Minimum variables
- ✅ Cloudinary (for image uploads)
- ✅ Email (for order notifications)

### Full Feature Set
- ✅ All Recommended variables
- ✅ M-Pesa (for Kenyan mobile payments)
- ✅ Twilio (for SMS/WhatsApp notifications)

---

## 🔧 How to Add Environment Variables on Render

### Backend (Web Service)
1. Go to Render Dashboard
2. Select your backend service
3. Click "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable (key = value)
6. Click "Save Changes"
7. Service will auto-redeploy

### Frontend/Admin (Static Site)
1. Go to Render Dashboard
2. Select your static site
3. Click "Environment" tab
4. Add `REACT_APP_API_URL`
5. Click "Save Changes"
6. Trigger manual deploy

---

## ✅ Current Production Status

Based on your deployment, you currently have:
- ✅ Django Core configured
- ✅ PostgreSQL configured
- ✅ CORS configured
- ✅ Frontend API URL configured
- ❌ M-Pesa NOT configured (causing 503 errors)
- ❓ Cloudinary status unknown
- ❓ Email status unknown
- ❓ Twilio status unknown

---

## 🐛 Troubleshooting

### Payment 503 Error
**Cause:** M-Pesa credentials not set
**Solution:** Add MPESA_* variables or use alternative payment methods (cash, bank transfer)

### Images Not Uploading
**Cause:** Cloudinary credentials not set
**Solution:** Add CLOUDINARY_* variables

### No Order Emails
**Cause:** Email credentials not set
**Solution:** Add EMAIL_* variables

### No SMS/WhatsApp
**Cause:** Twilio credentials not set
**Solution:** Add TWILIO_* variables (optional feature)

---

## 📞 Getting Credentials

| Service | Sign Up URL | Free Tier | Required |
|---------|------------|-----------|----------|
| Cloudinary | https://cloudinary.com | ✅ Yes | Recommended |
| Gmail SMTP | https://mail.google.com | ✅ Yes | Recommended |
| M-Pesa | https://developer.safaricom.co.ke | ✅ Sandbox | Optional |
| Twilio | https://www.twilio.com | ✅ Trial | Optional |

---

**Last Updated:** December 4, 2025
