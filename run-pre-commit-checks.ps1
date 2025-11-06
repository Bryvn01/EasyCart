# Pre-Commit Check Script for EasyCart
# Run this script before committing to ensure all checks pass

Write-Host "🔍 Running pre-commit checks for EasyCart..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$hasErrors = $false

# Check if we're in the right directory
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "❌ Error: Must be run from EasyCart root directory" -ForegroundColor Red
    exit 1
}

# Frontend checks
Write-Host "📦 Frontend Checks" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow

# Lint frontend
Write-Host "`n📋 Linting frontend code..." -ForegroundColor Cyan
Set-Location frontend
$lintResult = npm run lint 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend lint failed!" -ForegroundColor Red
    Write-Host $lintResult
    $hasErrors = $true
} else {
    Write-Host "✅ Frontend lint passed" -ForegroundColor Green
}

# Test frontend
Write-Host "`n🧪 Running frontend tests..." -ForegroundColor Cyan
$testResult = npm test -- --passWithNoTests --watchAll=false 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend tests failed!" -ForegroundColor Red
    Write-Host $testResult
    $hasErrors = $true
} else {
    Write-Host "✅ Frontend tests passed" -ForegroundColor Green
}

# Build frontend
Write-Host "`n🔨 Building frontend..." -ForegroundColor Cyan
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Write-Host $buildResult
    $hasErrors = $true
} else {
    Write-Host "✅ Frontend build passed" -ForegroundColor Green
}

Set-Location ..

# Backend checks
Write-Host "`n📦 Backend Checks" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow

# Activate virtual environment if it exists
if (Test-Path "backend\.venv\Scripts\Activate.ps1") {
    Write-Host "`n🐍 Activating Python virtual environment..." -ForegroundColor Cyan
    & backend\.venv\Scripts\Activate.ps1
}

# Lint backend (if flake8 is installed)
Write-Host "`n📋 Linting backend code..." -ForegroundColor Cyan
Set-Location backend
$flake8 = Get-Command flake8 -ErrorAction SilentlyContinue
if ($flake8) {
    $backendLintResult = flake8 . 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Backend lint warnings found" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Backend lint passed" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ flake8 not installed, skipping backend lint" -ForegroundColor Yellow
}

# Test backend
Write-Host "`n🧪 Running backend tests..." -ForegroundColor Cyan
$backendTestResult = python manage.py test 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend tests failed!" -ForegroundColor Red
    Write-Host $backendTestResult
    $hasErrors = $true
} else {
    Write-Host "✅ Backend tests passed" -ForegroundColor Green
}

Set-Location ..

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
if ($hasErrors) {
    Write-Host "❌ Some checks failed! Please fix errors before committing." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ All checks passed! Safe to commit." -ForegroundColor Green
    exit 0
}
