# Environment Validation Script for EasyCart
# This script checks that Node.js and npm are properly configured

Write-Host "=== EasyCart Environment Validation ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd) {
    $nodeVersion = node --version
    $nodePath = $nodeCmd.Source
    Write-Host "OK Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "  Location: $nodePath" -ForegroundColor Gray
}
else {
    Write-Host "ERROR Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCmd) {
    $npmPath = $npmCmd.Source
    Write-Host "  npm location: $npmPath" -ForegroundColor Gray

    # Check if npm is in the wrong location (Windows\system32)
    if ($npmPath -like "*Windows\system32*") {
        Write-Host "WARNING: npm is using Windows system32 installation!" -ForegroundColor Red
        Write-Host "  This is likely a broken installation." -ForegroundColor Red
        Write-Host ""
        Write-Host "To fix this issue:" -ForegroundColor Yellow
        Write-Host "1. Open System Environment Variables" -ForegroundColor White
        Write-Host "2. Edit the PATH variable" -ForegroundColor White
        Write-Host "3. Move 'C:\Program Files\nodejs' to the TOP of the list" -ForegroundColor White
        Write-Host "4. Remove any npm entries from 'C:\Windows\system32'" -ForegroundColor White
        Write-Host "5. Restart PowerShell" -ForegroundColor White
        Write-Host ""
        Write-Host "Temporary workaround: Use the full path to npm" -ForegroundColor Cyan
        Write-Host ""
    }
    else {
        $npmExe = Join-Path "C:\Program Files\nodejs" "npm.cmd"
        if (Test-Path $npmExe) {
            $npmVersion = & $npmExe --version 2>$null
            if ($npmVersion) {
                Write-Host "OK npm version: $npmVersion" -ForegroundColor Green
                Write-Host "  Location: $npmExe" -ForegroundColor Gray
            }
        }
        else {
            Write-Host "WARNING Unable to verify npm version" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "ERROR npm is not found in PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if node_modules exists
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $packageCount = (Get-ChildItem "node_modules" -Directory | Measure-Object).Count
    Write-Host "OK node_modules exists with $packageCount packages" -ForegroundColor Green

    # Check for react-icons specifically
    if (Test-Path "node_modules\react-icons") {
        Write-Host "OK react-icons is installed" -ForegroundColor Green
    }
    else {
        Write-Host "ERROR react-icons is missing - run npm install" -ForegroundColor Red
    }
}
else {
    Write-Host "ERROR node_modules not found - run npm install" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Validation Complete ===" -ForegroundColor Cyan
Write-Host ""

# Check package.json engines field
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.engines) {
        Write-Host "Package engines requirements:" -ForegroundColor Yellow
        if ($packageJson.engines.node) {
            Write-Host "  Node.js: $($packageJson.engines.node)" -ForegroundColor Gray
        }
        if ($packageJson.engines.npm) {
            Write-Host "  npm: $($packageJson.engines.npm)" -ForegroundColor Gray
        }
    }
}
