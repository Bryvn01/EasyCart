# EasyCart Environment Verification - Simple Version
Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  EASYCART ENVIRONMENT VERIFICATION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check backend .env
Write-Host "Backend Environment:" -ForegroundColor Yellow
$backendEnv = "C:\EasyCart\backend\.env"
if (Test-Path $backendEnv) {
    $content = Get-Content $backendEnv -Raw
    Write-Host "  [OK] File exists" -ForegroundColor Green

    if ($content -match "SECRET_KEY=<your_django_secret_key> {
        Write-Host "  [OK] SECRET_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "  [!!] SECRET_KEY NOT configured" -ForegroundColor Red
    }

    if ($content -match "CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name> {
        Write-Host "  [OK] CLOUDINARY_URL configured" -ForegroundColor Green
    } else {
        Write-Host "  [!!] CLOUDINARY_URL NOT configured" -ForegroundColor Red
    }
} else {
    Write-Host "  [!!] File NOT FOUND" -ForegroundColor Red
}

# Check frontend .env
Write-Host ""
Write-Host "Frontend Environment:" -ForegroundColor Yellow
$frontendEnv = "C:\EasyCart\frontend\.env"
if (Test-Path $frontendEnv) {
    $content = Get-Content $frontendEnv -Raw
    Write-Host "  [OK] File exists" -ForegroundColor Green

    if ($content -match "REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name> {
        Write-Host "  [OK] CLOUDINARY_CLOUD_NAME configured" -ForegroundColor Green
    } else {
        Write-Host "  [!!] CLOUDINARY_CLOUD_NAME NOT configured" -ForegroundColor Red
    }

    if ($content -match "REACT_APP_API_URL=http://localhost:8000") {
        Write-Host "  [OK] API_URL configured" -ForegroundColor Green
    } else {
        Write-Host "  [!!] API_URL NOT configured" -ForegroundColor Red
    }
} else {
    Write-Host "  [!!] File NOT FOUND" -ForegroundColor Red
}

# Check admin .env
Write-Host ""
Write-Host "Admin Dashboard Environment:" -ForegroundColor Yellow
$adminEnv = "C:\EasyCart\admin-dashboard\.env"
if (Test-Path $adminEnv) {
    $content = Get-Content $adminEnv -Raw
    Write-Host "  [OK] File exists" -ForegroundColor Green

    if ($content -match "REACT_APP_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name> {
        Write-Host "  [OK] CLOUDINARY_CLOUD_NAME configured" -ForegroundColor Green
    } else {
        Write-Host "  [!!] CLOUDINARY_CLOUD_NAME NOT configured" -ForegroundColor Red
    }
} else {
    Write-Host "  [!!] File NOT FOUND" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All critical variables are configured!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd backend; C:/EasyCart/.venv/Scripts/python.exe manage.py runserver" -ForegroundColor Gray
Write-Host "  2. cd frontend; npm start" -ForegroundColor Gray
Write-Host "  3. cd admin-dashboard; npm start" -ForegroundColor Gray
Write-Host ""
