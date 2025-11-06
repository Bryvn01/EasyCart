# 🚀 EasyCart Environment Setup Script
# Run this to quickly set up all environment files

Write-Host "`n" -NoNewline
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║  🔐 EASYCART ENVIRONMENT SETUP                               ║" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$rootDir = "C:\EasyCart"

# ========================================
# Backend .env Configuration
# ========================================

Write-Host "📦 Checking Backend Environment..." -ForegroundColor Yellow

$backendEnv = "$rootDir\backend\.env"

if (Test-Path $backendEnv) {
    Write-Host "   ✅ backend\.env already exists" -ForegroundColor Green

    # Check critical variables
    $envContent = Get-Content $backendEnv -Raw

    $checks = @{
        "SECRET_KEY" = $envContent -match "SECRET_KEY=<your_django_secret_key>
        "DEBUG" = $envContent -match "DEBUG=(True|False)"
        "DB_ENGINE" = $envContent -match "DB_ENGINE=django.db.backends.postgresql"
        "DB_NAME" = $envContent -match "DB_NAME=easycart"
        "CLOUDINARY" = $envContent -match "CLOUDINARY"
        "CORS" = $envContent -match "CORS_ALLOWED_ORIGINS"
    }

    Write-Host "`n   Backend Environment Check:" -ForegroundColor Cyan
    foreach ($key in $checks.Keys) {
        if ($checks[$key]) {
            Write-Host "   ✅ $key configured" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $key missing or not set" -ForegroundColor Red
        }
    }

} else {
    Write-Host "   ⚠️  backend\.env not found" -ForegroundColor Red
    Write-Host "   Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item "$rootDir\backend\.env.example" $backendEnv
    Write-Host "   ✅ Created backend\.env - Please edit with your values!" -ForegroundColor Green
}

# ========================================
# Frontend .env Configuration
# ========================================

Write-Host "`n📱 Checking Frontend Environment..." -ForegroundColor Yellow

$frontendEnv = "$rootDir\frontend\.env"

if (Test-Path $frontendEnv) {
    Write-Host "   ✅ frontend\.env already exists" -ForegroundColor Green

    $envContent = Get-Content $frontendEnv -Raw

    $checks = @{
        "REACT_APP_API_URL" = $envContent -match "REACT_APP_API_URL=.+"
        "CLOUDINARY" = $envContent -match "REACT_APP_CLOUDINARY_CLOUD_NAME"
    }

    Write-Host "`n   Frontend Environment Check:" -ForegroundColor Cyan
    foreach ($key in $checks.Keys) {
        if ($checks[$key]) {
            Write-Host "   ✅ $key configured" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $key missing or not set" -ForegroundColor Red
        }
    }

} else {
    Write-Host "   ⚠️  frontend\.env not found" -ForegroundColor Red
    Write-Host "   Creating minimal configuration..." -ForegroundColor Yellow

    $frontendEnvContent = @"
# React Build Configuration
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=true

# API Configuration
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_API_BASE_URL=http://localhost:8000

# Cloudinary (TODO: Add your cloud name)
REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>

# Performance
REACT_APP_ITEMS_PER_PAGE=12
REACT_APP_SEARCH_DEBOUNCE=300
"@

    $frontendEnvContent | Out-File -FilePath $frontendEnv -Encoding utf8
    Write-Host "   ✅ Created frontend\.env!" -ForegroundColor Green
}

# ========================================
# Admin Dashboard .env Configuration
# ========================================

Write-Host "`n📊 Checking Admin Dashboard Environment..." -ForegroundColor Yellow

$adminEnv = "$rootDir\admin-dashboard\.env"

if (Test-Path $adminEnv) {
    Write-Host "   ✅ admin-dashboard\.env already exists" -ForegroundColor Green

    $envContent = Get-Content $adminEnv -Raw

    $checks = @{
        "REACT_APP_API_URL" = $envContent -match "REACT_APP_API_URL=.+"
        "CLOUDINARY" = $envContent -match "REACT_APP_CLOUDINARY_CLOUD_NAME"
    }

    Write-Host "`n   Admin Dashboard Environment Check:" -ForegroundColor Cyan
    foreach ($key in $checks.Keys) {
        if ($checks[$key]) {
            Write-Host "   ✅ $key configured" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $key missing or not set" -ForegroundColor Red
        }
    }

} else {
    Write-Host "   ⚠️  admin-dashboard\.env not found" -ForegroundColor Red
    Write-Host "   Creating from .env.example..." -ForegroundColor Yellow

    if (Test-Path "$rootDir\admin-dashboard\.env.example") {
        Copy-Item "$rootDir\admin-dashboard\.env.example" $adminEnv
        Write-Host "   ✅ Created admin-dashboard\.env!" -ForegroundColor Green
    }
}

# ========================================
# Summary and Next Steps
# ========================================

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║  📋 CONFIGURATION SUMMARY                                    ║" -ForegroundColor Yellow
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Check PostgreSQL
Write-Host "🗄️  Database Check:" -ForegroundColor Yellow
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-Host "   ✅ PostgreSQL service found" -ForegroundColor Green
        Write-Host "   Status: $($pgService.Status)" -ForegroundColor White
    } else {
        Write-Host "   ⚠️  PostgreSQL service not found" -ForegroundColor Red
        Write-Host "   Make sure PostgreSQL is installed and running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ℹ️  Could not check PostgreSQL status" -ForegroundColor Gray
}

# Check Python virtual environment
Write-Host "`n🐍 Python Environment:" -ForegroundColor Yellow
if (Test-Path "$rootDir\.venv\Scripts\python.exe") {
    Write-Host "   ✅ Virtual environment found" -ForegroundColor Green

    # Check if psycopg2 is installed
    $output = & "$rootDir\.venv\Scripts\python.exe" -m pip show psycopg2-binary 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ psycopg2-binary installed" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  psycopg2-binary not installed" -ForegroundColor Red
        Write-Host "   Run: pip install psycopg2-binary" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Virtual environment not found at .venv" -ForegroundColor Red
}

# Check Node.js
Write-Host "`n📦 Node.js Dependencies:" -ForegroundColor Yellow
if (Test-Path "$rootDir\frontend\node_modules") {
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend dependencies not installed" -ForegroundColor Red
    Write-Host "   Run: cd frontend; npm install" -ForegroundColor Yellow
}

if (Test-Path "$rootDir\admin-dashboard\node_modules") {
    Write-Host "   ✅ Admin dashboard dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Admin dashboard dependencies not installed" -ForegroundColor Red
    Write-Host "   Run: cd admin-dashboard; npm install" -ForegroundColor Yellow
}

# ========================================
# Action Items
# ========================================

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║  🎯 REQUIRED ACTIONS                                         ║" -ForegroundColor Red
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "1️⃣  Edit backend\.env:" -ForegroundColor Cyan
Write-Host "   • Generate SECRET_KEY:" -ForegroundColor White
Write-Host "     python -c `"import secrets; print(secrets.token_urlsafe(50))`"" -ForegroundColor Gray
Write-Host "   • Add your Cloudinary credentials (CLOUDINARY_URL)" -ForegroundColor White
Write-Host "   • Verify PostgreSQL connection details" -ForegroundColor White

Write-Host "`n2️⃣  Edit frontend\.env:" -ForegroundColor Cyan
Write-Host "   • Set REACT_APP_CLOUDINARY_CLOUD_NAME" -ForegroundColor White
Write-Host "   • Verify REACT_APP_API_URL points to backend" -ForegroundColor White

Write-Host "`n3️⃣  Edit admin-dashboard\.env:" -ForegroundColor Cyan
Write-Host "   • Set REACT_APP_CLOUDINARY_CLOUD_NAME" -ForegroundColor White
Write-Host "   • Verify REACT_APP_API_URL points to backend" -ForegroundColor White

Write-Host "`n4️⃣  Run database migrations:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   C:/EasyCart/.venv/Scripts/python.exe manage.py migrate" -ForegroundColor Gray

Write-Host "`n5️⃣  Create superuser:" -ForegroundColor Cyan
Write-Host "   C:/EasyCart/.venv/Scripts/python.exe manage.py createsuperuser" -ForegroundColor Gray

Write-Host "`n6️⃣  Start your services:" -ForegroundColor Cyan
Write-Host "   Backend:  C:/EasyCart/.venv/Scripts/python.exe manage.py runserver" -ForegroundColor Gray
Write-Host "   Frontend: cd frontend; npm start" -ForegroundColor Gray
Write-Host "   Admin:    cd admin-dashboard; npm start" -ForegroundColor Gray

# ========================================
# Documentation Links
# ========================================

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║  📚 DOCUMENTATION                                            ║" -ForegroundColor Yellow
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "📖 Complete Guide:" -ForegroundColor Cyan
Write-Host "   ENVIRONMENT_SETUP_COMPLETE.md" -ForegroundColor White

Write-Host "`n🚀 Deployment Guides:" -ForegroundColor Cyan
Write-Host "   START_HERE_DEPLOYMENT.md" -ForegroundColor White
Write-Host "   QUICK_DEPLOY_POSTGRESQL.md" -ForegroundColor White
Write-Host "   PRODUCTION_READINESS_POSTGRESQL.md" -ForegroundColor White

Write-Host "`n✅ All environment files checked!`n" -ForegroundColor Green
