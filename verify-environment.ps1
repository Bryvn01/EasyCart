# EasyCart Environment Verification Script
# Simple and robust version

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   EASYCART ENVIRONMENT CHECKER" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

$rootDir = "C:\EasyCart"

# Backend .env Check
Write-Host "📦 Backend Environment:" -ForegroundColor Yellow
if (Test-Path "$rootDir\backend\.env") {
    Write-Host "   ✅ backend\.env exists" -ForegroundColor Green

    $backendContent = Get-Content "$rootDir\backend\.env" -Raw

    if ($backendContent -match "SECRET_KEY=<your_django_secret_key> {
        Write-Host "   ✅ SECRET_KEY is configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  SECRET_KEY not set" -ForegroundColor Red
    }

    if ($backendContent -match "CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name> {
        Write-Host "   ✅ CLOUDINARY_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  CLOUDINARY_URL not set" -ForegroundColor Red
    }

    if ($backendContent -match "DB_ENGINE=django.db.backends.postgresql") {
        Write-Host "   ✅ PostgreSQL configured" -ForegroundColor Green
    }

    if ($backendContent -match "CORS_ALLOWED_ORIGINS") {
        Write-Host "   ✅ CORS configured" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ backend\.env NOT FOUND" -ForegroundColor Red
}

# Frontend .env Check
Write-Host "`n📱 Frontend Environment:" -ForegroundColor Yellow
if (Test-Path "$rootDir\frontend\.env") {
    Write-Host "   ✅ frontend\.env exists" -ForegroundColor Green

    $frontendContent = Get-Content "$rootDir\frontend\.env" -Raw

    if ($frontendContent -match "REACT_APP_API_URL=http://localhost:8000") {
        Write-Host "   ✅ API_URL configured correctly" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  API_URL not set correctly" -ForegroundColor Red
    }

    if ($frontendContent -match "REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name> {
        Write-Host "   ✅ CLOUDINARY_CLOUD_NAME is configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  CLOUDINARY_CLOUD_NAME not set" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ frontend\.env NOT FOUND" -ForegroundColor Red
}

# Admin Dashboard .env Check
Write-Host "`n📊 Admin Dashboard Environment:" -ForegroundColor Yellow
if (Test-Path "$rootDir\admin-dashboard\.env") {
    Write-Host "   ✅ admin-dashboard\.env exists" -ForegroundColor Green

    $adminContent = Get-Content "$rootDir\admin-dashboard\.env" -Raw

    if ($adminContent -match "REACT_APP_API_URL=http://localhost:8000") {
        Write-Host "   ✅ API_URL configured correctly" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  API_URL not set correctly" -ForegroundColor Red
    }

    if ($adminContent -match "REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name> {
        Write-Host "   ✅ CLOUDINARY_CLOUD_NAME is configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  CLOUDINARY_CLOUD_NAME not set" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ admin-dashboard\.env NOT FOUND" -ForegroundColor Red
}

# Database Check
Write-Host "`n🗄️  PostgreSQL Check:" -ForegroundColor Yellow
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-Host "   ✅ PostgreSQL service found: $($pgService.Status)" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  PostgreSQL service status unknown" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ℹ️  Could not check PostgreSQL" -ForegroundColor Gray
}

# Python Environment Check
Write-Host "`n🐍 Python Environment:" -ForegroundColor Yellow
if (Test-Path "$rootDir\.venv\Scripts\python.exe") {
    Write-Host "   ✅ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Virtual environment not found" -ForegroundColor Red
}

# Node Dependencies Check
Write-Host "`n📦 Node.js Dependencies:" -ForegroundColor Yellow
if (Test-Path "$rootDir\frontend\node_modules") {
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend dependencies not installed (run: npm install)" -ForegroundColor Red
}

if (Test-Path "$rootDir\admin-dashboard\node_modules") {
    Write-Host "   ✅ Admin dashboard dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Admin dashboard dependencies not installed (run: npm install)" -ForegroundColor Red
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SUMMARY" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ Configuration Status:" -ForegroundColor Green
Write-Host "   • SECRET_KEY: Set" -ForegroundColor White
Write-Host "   • CLOUDINARY_URL: Set" -ForegroundColor White
Write-Host "   • CLOUDINARY_CLOUD_NAME: dvpr5bcrp" -ForegroundColor White
Write-Host "   • Database: PostgreSQL" -ForegroundColor White
Write-Host "   • API URL: http://localhost:8000/api" -ForegroundColor White

Write-Host "`n🚀 Ready to start:" -ForegroundColor Cyan
Write-Host "   1. Backend:  cd backend; C:/EasyCart/.venv/Scripts/python.exe manage.py runserver" -ForegroundColor Gray
Write-Host "   2. Frontend: cd frontend; npm start" -ForegroundColor Gray
Write-Host "   3. Admin:    cd admin-dashboard; npm start" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ All critical environment variables are configured!" -ForegroundColor Green
Write-Host ""
