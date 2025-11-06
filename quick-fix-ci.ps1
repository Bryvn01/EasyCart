# Quick Fix Script for Common CI Issues
# This script automatically fixes common issues that cause CI failures

Write-Host "🔧 EasyCart CI Quick Fix Tool" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Check if we're in the right directory
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "❌ Error: Must be run from EasyCart root directory" -ForegroundColor Red
    exit 1
}

# 1. Fix test imports
Write-Host "📝 Fixing test imports..." -ForegroundColor Yellow
$testFiles = Get-ChildItem -Path "frontend\src" -Include "*.test.js","*.test.jsx" -Recurse

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content

    # Calculate relative path to test-utils
    $relativePath = $file.DirectoryName.Replace($PWD.Path + "\frontend\src\", "")
    $depth = ($relativePath -split "\\").Count
    $importPath = "../" * $depth + "test-utils"

    # Fix imports from @testing-library/react
    $content = $content -replace "from '@testing-library/react';", "from '$importPath';"

    if ($content -ne $originalContent) {
        $content | Set-Content $file.FullName -NoNewline
        Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
    }
}

# 2. Ensure test-utils exists and is correct
Write-Host "`n📝 Verifying test-utils.js..." -ForegroundColor Yellow
if (Test-Path "frontend\src\test-utils.js") {
    Write-Host "  ✅ test-utils.js exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ test-utils.js not found" -ForegroundColor Yellow
}

# 3. Fix package.json scripts
Write-Host "`n📝 Verifying package.json test scripts..." -ForegroundColor Yellow
$packageJson = Get-Content "frontend\package.json" -Raw | ConvertFrom-Json
if ($packageJson.scripts.test -notmatch "passWithNoTests") {
    Write-Host "  ⚠️ Consider adding --passWithNoTests flag to test script" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Test script configured correctly" -ForegroundColor Green
}

# 4. Clean up node_modules and reinstall (optional)
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
$reinstall = Read-Host "Do you want to clean install dependencies? This can fix many issues (y/N)"
if ($reinstall -eq "y" -or $reinstall -eq "Y") {
    Write-Host "  🧹 Cleaning node_modules..." -ForegroundColor Cyan
    Set-Location frontend
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force node_modules
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force package-lock.json
    }

    Write-Host "  📥 Installing dependencies..." -ForegroundColor Cyan
    npm install
    Set-Location ..
    Write-Host "  ✅ Dependencies reinstalled" -ForegroundColor Green
} else {
    Write-Host "  ⏭️ Skipped dependency reinstall" -ForegroundColor Gray
}

# 5. Run a quick test to verify fixes
Write-Host "`n🧪 Running quick test verification..." -ForegroundColor Yellow
Set-Location frontend
$testResult = npm test -- --passWithNoTests --watchAll=false 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Tests are passing!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Some tests may still be failing" -ForegroundColor Yellow
    Write-Host "  Run 'npm test' in frontend directory for details" -ForegroundColor Gray
}
Set-Location ..

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Quick fixes applied!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review any warnings above" -ForegroundColor White
Write-Host "2. Run: .\run-pre-commit-checks.ps1" -ForegroundColor White
Write-Host "3. Commit your changes" -ForegroundColor White
Write-Host ""
