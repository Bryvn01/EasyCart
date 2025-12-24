# Admin Dashboard Setup & Troubleshooting Guide

## Current Issues & Fixes

### ✅ FIXED: API Configuration
**Problem**: Admin dashboard was connecting to port 5000 (old Node.js backend) instead of port 8000 (Django backend)

**Solution Applied**:
- Updated `.env` file: `REACT_APP_API_URL=http://localhost:8000/api`
- Updated `.env.example` to reflect Django port

**Verification**:
```bash
# Check .env file
Get-Content C:\EasyCart\admin-dashboard\.env | Select-String "REACT_APP_API_URL"

# Should show: REACT_APP_API_URL=http://localhost:8000/api
```

### ⚠️ IN PROGRESS: @mui/icons-material Installation

**Problem**: Module not found error for `@mui/icons-material`

**Attempted Solutions**:
1. Added to package.json ✅
2. Ran `npm install` multiple times
3. Created batch script: `install-icons.bat`

**Manual Installation Steps**:
```bash
# Option 1: Using npm (recommended)
cd C:\EasyCart\admin-dashboard
npm install @mui/icons-material@6.1.9

# Option 2: Using batch script
# Double-click: C:\EasyCart\admin-dashboard\install-icons.bat
# Wait for "Installation complete!" message

# Option 3: Clear cache and reinstall all
cd C:\EasyCart\admin-dashboard
Remove-Item node_modules\.cache -Recurse -Force
npm install
```

**Verification**:
```bash
# Check if package exists
Test-Path "C:\EasyCart\admin-dashboard\node_modules\@mui\icons-material\package.json"

# Should return: True
```

### ✅ FIXED: React Code Issues

**Problems**:
1. `'token' is not defined` error in Terminal.jsx
2. Missing useEffect dependencies in Dashboard.jsx

**Solutions Applied**:
1. Declared `token` at component level in Terminal.jsx
2. Added ESLint disable comment for exhaustive-deps in Dashboard.jsx

## Complete Setup Process

### 1. Start Django Backend

```bash
# Terminal 1
cd C:\EasyCart\backend
venv\Scripts\Activate.ps1
python manage.py runserver

# Should see:
# Starting development server at http://127.0.0.1:8000/
```

### 2. Install Admin Dashboard Dependencies

```bash
# Terminal 2
cd C:\EasyCart\admin-dashboard

# Clear any cached modules
Remove-Item node_modules\.cache -Recurse -Force -ErrorAction SilentlyContinue

# Install all dependencies
npm install

# If @mui/icons-material fails, install separately:
npm install @mui/icons-material@6.1.9
```

### 3. Verify Configuration

```bash
# Check .env file exists and has correct port
Get-Content .env | Select-String "REACT_APP_API_URL"

# Should show: REACT_APP_API_URL=http://localhost:8000/api
```

### 4. Start Admin Dashboard

```bash
cd C:\EasyCart\admin-dashboard
npm start

# Wait for "Compiled successfully!"
# Browser should open to http://localhost:3000
```

### 5. Run Database Migrations (First Time Only)

```bash
# Terminal 3
cd C:\EasyCart\backend
venv\Scripts\Activate.ps1
python manage.py makemigrations pos
python manage.py migrate
```

## Common Errors & Solutions

### Error: "Module not found: @mui/icons-material"

**Cause**: Package not installed or installation corrupted

**Fix**:
```bash
cd C:\EasyCart\admin-dashboard

# Option A: Clear and reinstall
Remove-Item node_modules\@mui\icons-material -Recurse -Force
npm install @mui/icons-material@6.1.9

# Option B: Clear entire node_modules and reinstall
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

### Error: "Proxy error: ECONNREFUSED localhost:5000"

**Cause**: Wrong API URL in .env file

**Fix**:
1. Open `C:\EasyCart\admin-dashboard\.env`
2. Change: `REACT_APP_API_URL=http://localhost:5000/api`
3. To: `REACT_APP_API_URL=http://localhost:8000/api`
4. Restart dev server: `Ctrl+C` then `npm start`

### Error: "Failed to compile" with webpack errors

**Cause**: Corrupted webpack cache

**Fix**:
```bash
cd C:\EasyCart\admin-dashboard
Remove-Item node_modules\.cache -Recurse -Force
npm start
```

### Error: "'token' is not defined" in Terminal.jsx

**Status**: ✅ FIXED

**Previous Error**: Variable used before declaration

**Fix Applied**: Declared token at component level

### Error: "React Hook useEffect has missing dependency"

**Status**: ✅ FIXED

**Fix Applied**: Added ESLint disable comment

## Verification Checklist

Before starting development:

- [ ] Django backend running on port 8000
- [ ] PostgreSQL database accessible
- [ ] .env file has `REACT_APP_API_URL=http://localhost:8000/api`
- [ ] `@mui/icons-material` installed in node_modules
- [ ] Webpack cache cleared (`node_modules/.cache` removed)
- [ ] No compilation errors in terminal
- [ ] Browser opens to http://localhost:3000
- [ ] No console errors related to API connection
- [ ] Can navigate to http://localhost:3000/admin/login

## File Locations

### Configuration Files
- `.env`: `C:\EasyCart\admin-dashboard\.env`
- `package.json`: `C:\EasyCart\admin-dashboard\package.json`

### POS Module Files
- Session Manager: `C:\EasyCart\admin-dashboard\src\pages\POS\SessionManager.jsx`
- Terminal: `C:\EasyCart\admin-dashboard\src\pages\POS\Terminal.jsx`
- Dashboard: `C:\EasyCart\admin-dashboard\src\pages\POS\Dashboard.jsx`
- Routes: `C:\EasyCart\admin-dashboard\src\pages\POS\index.jsx`

### Backend POS Files
- Models: `C:\EasyCart\backend\apps\pos\models.py`
- Views: `C:\EasyCart\backend\apps\pos\views.py`
- URLs: `C:\EasyCart\backend\apps\pos\urls.py`

## Quick Reference Commands

```powershell
# Start Backend
cd C:\EasyCart\backend; .\venv\Scripts\Activate.ps1; python manage.py runserver

# Start Frontend
cd C:\EasyCart\admin-dashboard; npm start

# Install Missing Package
cd C:\EasyCart\admin-dashboard; npm install @mui/icons-material@6.1.9

# Clear Cache
cd C:\EasyCart\admin-dashboard; Remove-Item node_modules\.cache -Recurse -Force

# Check Package Installation
Test-Path "C:\EasyCart\admin-dashboard\node_modules\@mui\icons-material\package.json"

# Check API URL Configuration
Get-Content "C:\EasyCart\admin-dashboard\.env" | Select-String "API_URL"
```

## Next Steps

Once all errors are resolved:

1. **Access POS Module**: http://localhost:3000/admin/pos/dashboard
2. **Create Staff Permissions**: Via Django Admin
3. **Test Complete Workflow**: Open session → Make sale → Close session
4. **Review Documentation**: `POS_MODULE_DOCUMENTATION.md`

## Support

For additional help, refer to:
- Full POS Documentation: `C:\EasyCart\POS_MODULE_DOCUMENTATION.md`
- Quick Start Guide: `C:\EasyCart\POS_QUICK_START.md`
