# 🎯 EasyCart Environment Setup - Action Required

> **Critical Configuration Steps for Skilled Fullstack Developer & Senior DevOps Engineer**

---

## ⚡ IMMEDIATE ACTION REQUIRED

You have **3 critical values** that must be set before your application will work:

### 1️⃣ Generate Django SECRET_KEY (Backend)

**Run this command:**
```powershell
C:/EasyCart/.venv/Scripts/python.exe -c "import secrets; print(secrets.token_urlsafe(50))"
```

**Then edit `backend\.env` line 16:**
```env
SECRET_KEY=paste_the_generated_key_here
```

---

### 2️⃣ Add Cloudinary Credentials (Backend)

**Get your credentials from:** https://cloudinary.com/console

**Edit `backend\.env` line 10:**
```env
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

**Example:**
```env
CLOUDINARY_URL=cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz123456@myapp
```

---

### 3️⃣ Set Cloudinary Cloud Name (Frontend & Admin)

**Edit `frontend\.env` line 11:**
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Edit `admin-dashboard\.env` line 11:**
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Example:** If your Cloudinary URL is `cloudinary://...@myapp`, then:
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=myapp
```

---

## 📋 Current Status

### ✅ Completed:
- PostgreSQL database configured
- Backend `.env` exists with PostgreSQL settings
- Frontend `.env` updated with all variables
- Admin Dashboard `.env` created with correct configuration
- CORS configured for localhost:3000 and localhost:3001
- Database credentials set (easycart / easycart_user)

### ⚠️ Needs Your Input (3 values):
1. **SECRET_KEY** in `backend\.env`
2. **CLOUDINARY_URL** in `backend\.env`
3. **REACT_APP_CLOUDINARY_CLOUD_NAME** in `frontend\.env` and `admin-dashboard\.env`

---

## 🚀 Quick Start Guide

### Step 1: Update Critical Values (5 minutes)

```powershell
# Generate SECRET_KEY
C:/EasyCart/.venv/Scripts/python.exe -c "import secrets; print(secrets.token_urlsafe(50))"
# Copy output and paste into backend\.env
```

Then edit these 3 files:
- `backend\.env` → Add SECRET_KEY and CLOUDINARY_URL
- `frontend\.env` → Add REACT_APP_CLOUDINARY_CLOUD_NAME
- `admin-dashboard\.env` → Add REACT_APP_CLOUDINARY_CLOUD_NAME

### Step 2: Run Database Migrations (2 minutes)

```powershell
cd C:\EasyCart\backend
C:/EasyCart/.venv/Scripts/python.exe manage.py migrate
```

Expected output:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, products, orders, users
Running migrations:
  Applying... OK
```

### Step 3: Create Admin User (2 minutes)

```powershell
C:/EasyCart/.venv/Scripts/python.exe manage.py createsuperuser
```

Follow prompts:
- Username: admin
- Email: your@email.com
- Password: (your secure password)

### Step 4: Start All Services (3 minutes)

**Terminal 1 - Backend:**
```powershell
cd C:\EasyCart\backend
C:/EasyCart/.venv/Scripts/python.exe manage.py runserver
```
Should see: `Starting development server at http://127.0.0.1:8000/`

**Terminal 2 - Frontend:**
```powershell
cd C:\EasyCart\frontend
npm start
```
Should open: http://localhost:3000

**Terminal 3 - Admin Dashboard:**
```powershell
cd C:\EasyCart\admin-dashboard
npm start
```
Should open: http://localhost:3001

### Step 5: Verify Everything Works (2 minutes)

1. **Backend API:** http://localhost:8000/api/ (should see DRF browsable API)
2. **Frontend:** http://localhost:3000/products (should show products with images)
3. **Admin:** http://localhost:3001 (should load admin login)

---

## 🔍 Environment Files Overview

### Backend Environment (`backend\.env`)
```env
# ⚠️ UPDATE THESE:
SECRET_KEY=<generate_with_command_above>
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# ✅ ALREADY SET:
DEBUG=True
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=easycart_user
DB_PASSWORD=easycart2025
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend Environment (`frontend\.env`)
```env
# ⚠️ UPDATE THIS:
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name

# ✅ ALREADY SET:
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_API_BASE_URL=http://localhost:8000
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true
REACT_APP_ITEMS_PER_PAGE=12
```

### Admin Dashboard Environment (`admin-dashboard\.env`)
```env
# ⚠️ UPDATE THIS:
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name

# ✅ ALREADY SET:
REACT_APP_API_URL=http://localhost:8000/api
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true
```

---

## 🧪 Testing Commands

### Test Database Connection
```powershell
cd C:\EasyCart\backend
C:/EasyCart/.venv/Scripts/python.exe manage.py dbshell
```
Type `\q` to exit.

### Test Backend API
```powershell
# In browser or PowerShell:
curl http://localhost:8000/api/products/
```

### Check for Errors
```powershell
# Backend logs will show in the runserver terminal
# Frontend logs in browser console (F12)
```

---

## 🚨 Troubleshooting

### Error: "The SECRET_KEY setting must not be empty"
**Cause:** SECRET_KEY not set in `backend\.env`
**Fix:** Run the SECRET_KEY generation command and update backend\.env

### Error: "could not connect to server"
**Cause:** PostgreSQL not running
**Fix:**
```powershell
# Check status:
Get-Service -Name "postgresql*"

# Start if stopped:
Start-Service -Name "postgresql-x64-15"  # Adjust version number
```

### Error: CORS policy blocked
**Cause:** Frontend URL not in CORS_ALLOWED_ORIGINS
**Fix:** Already set correctly in backend\.env

### Error: Images not loading
**Cause:** Cloudinary not configured
**Fix:**
1. Get credentials from https://cloudinary.com/console
2. Add CLOUDINARY_URL to backend\.env
3. Add REACT_APP_CLOUDINARY_CLOUD_NAME to frontend\.env and admin-dashboard\.env
4. Clear browser cache (Ctrl+Shift+Delete)

### Error: "npm: command not found"
**Cause:** Node.js not in PATH
**Fix:** Restart terminal or add Node.js to system PATH

### Error: "python: command not found"
**Cause:** Using wrong Python path
**Fix:** Use full path: `C:/EasyCart/.venv/Scripts/python.exe`

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     EasyCart Application                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │◄───────►│   Backend    │◄───────►│  PostgreSQL  │
│ React:3000   │  API    │ Django:8000  │  SQL    │ Port:5432    │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│    Admin     │         │  Cloudinary  │
│ React:3001   │         │ CDN (Images) │
└──────────────┘         └──────────────┘

Environment Variables Flow:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend → REACT_APP_API_URL → Backend
Frontend → REACT_APP_CLOUDINARY_CLOUD_NAME → Cloudinary
Backend → DB_* → PostgreSQL
Backend → CLOUDINARY_URL → Cloudinary
Backend → CORS_ALLOWED_ORIGINS → Frontend/Admin
```

---

## ✅ Pre-Flight Checklist

Before starting development, verify:

- [ ] PostgreSQL service is running
- [ ] Python virtual environment activated (`.venv`)
- [ ] Node.js dependencies installed:
  - [ ] `frontend\node_modules` exists
  - [ ] `admin-dashboard\node_modules` exists
- [ ] Environment variables set:
  - [ ] `backend\.env` has SECRET_KEY
  - [ ] `backend\.env` has CLOUDINARY_URL
  - [ ] `frontend\.env` has REACT_APP_CLOUDINARY_CLOUD_NAME
  - [ ] `admin-dashboard\.env` has REACT_APP_CLOUDINARY_CLOUD_NAME
- [ ] Database migrations run: `python manage.py migrate`
- [ ] Superuser created: `python manage.py createsuperuser`

---

## 🎯 Success Criteria

Your environment is correctly set up when:

✅ Backend starts without errors at http://localhost:8000
✅ Frontend loads at http://localhost:3000
✅ Admin dashboard loads at http://localhost:3001
✅ Products page displays with images
✅ No CORS errors in browser console
✅ Database queries work (check backend logs)
✅ Can login to admin with superuser credentials

---

## 📚 Additional Resources

- **Complete Guide:** `ENVIRONMENT_SETUP_COMPLETE.md` (all variables explained)
- **Quick Reference:** `ENVIRONMENT_VARIABLES_QUICK_REFERENCE.md` (cheat sheet)
- **Automated Setup:** Run `.\setup-environment.ps1` (checks everything)
- **Deployment:** `START_HERE_DEPLOYMENT.md` (PostgreSQL production guide)

---

## 🆘 Need Help?

### Common Questions:

**Q: Where do I get Cloudinary credentials?**
A: Sign up free at https://cloudinary.com/users/register/free → Go to Dashboard → Copy credentials

**Q: How do I know my SECRET_KEY is secure?**
A: Use the provided generation command. It creates a 50-character URL-safe key.

**Q: Do I need Redis/Celery right now?**
A: No, those are optional for caching and background tasks. Start without them.

**Q: What about payment gateways?**
A: Optional for now. Add Stripe/PayPal keys when ready to accept payments.

**Q: How do I deploy to production?**
A: See `PRODUCTION_READINESS_POSTGRESQL.md` for full deployment checklist.

---

## 🚀 Next Steps After Setup

1. **Seed Database:** Add sample products
   ```powershell
   C:/EasyCart/.venv/Scripts/python.exe manage.py loaddata initial_data.json
   ```

2. **Test Features:**
   - Browse products at http://localhost:3000/products
   - Add items to cart
   - Test checkout flow
   - Login to admin at http://localhost:3001

3. **Start Development:**
   - Create new features
   - Add more products
   - Customize styling
   - Add payment processing

4. **Prepare for Production:**
   - Review `PRODUCTION_READINESS_POSTGRESQL.md`
   - Set up CI/CD pipeline
   - Configure production database
   - Deploy to hosting platform

---

*Last Updated: EasyCart PostgreSQL Migration*
*For: Skilled Fullstack Developer & Senior DevOps Engineer*
*Total Setup Time: ~15 minutes*
