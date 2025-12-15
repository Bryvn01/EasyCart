# React Native Project Initialization Script for Windows
# This script sets up the Android/iOS native folders for the EasyCart mobile app

Write-Host "🚀 EasyCart Mobile - React Native Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$TEMP_PROJECT = "EasyCartTemp"
$CURRENT_DIR = Get-Location

# Step 1: Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check npm
$npmVersion = npm --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

# Check Java (for Android)
Write-Host ""
Write-Host "📱 Checking Android development tools..." -ForegroundColor Yellow

$javaVersion = java -version 2>&1 | Select-String "version"
if ($javaVersion) {
    Write-Host "✅ Java installed: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  Java not found. Install JDK 11 or 17 for Android development." -ForegroundColor DarkYellow
}

# Check ANDROID_HOME
if ($env:ANDROID_HOME) {
    Write-Host "✅ ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "⚠️  ANDROID_HOME not set. Android Studio needed for Android builds." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "🔧 Starting React Native initialization..." -ForegroundColor Cyan
Write-Host ""

# Step 2: Create temporary React Native project
Write-Host "Creating temporary React Native project..." -ForegroundColor Yellow
Set-Location ..

npx react-native@latest init $TEMP_PROJECT --skip-install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create React Native project" -ForegroundColor Red
    Set-Location $CURRENT_DIR
    exit 1
}

Write-Host "✅ Temporary project created" -ForegroundColor Green

# Step 3: Copy android and ios folders
Write-Host ""
Write-Host "📁 Copying native folders..." -ForegroundColor Yellow

if (Test-Path "$TEMP_PROJECT\android") {
    Copy-Item -Path "$TEMP_PROJECT\android" -Destination "mobile\android" -Recurse -Force
    Write-Host "✅ Android folder copied" -ForegroundColor Green
}

if (Test-Path "$TEMP_PROJECT\ios") {
    Copy-Item -Path "$TEMP_PROJECT\ios" -Destination "mobile\ios" -Recurse -Force
    Write-Host "✅ iOS folder copied" -ForegroundColor Green
}

# Step 4: Update Android configuration
Write-Host ""
Write-Host "⚙️  Updating Android configuration..." -ForegroundColor Yellow

$androidAppName = "mobile\android\app\src\main\res\values\strings.xml"
if (Test-Path $androidAppName) {
    (Get-Content $androidAppName) -replace '<string name="app_name">.*</string>', '<string name="app_name">EasyCart</string>' | Set-Content $androidAppName
    Write-Host "✅ Android app name updated" -ForegroundColor Green
}

# Step 5: Clean up temp project
Write-Host ""
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
Remove-Item -Path $TEMP_PROJECT -Recurse -Force
Write-Host "✅ Temporary files removed" -ForegroundColor Green

# Step 6: Return to mobile directory
Set-Location mobile

# Step 7: Install dependencies for native modules
Write-Host ""
Write-Host "📦 Installing native module dependencies..." -ForegroundColor Yellow
npx pod-install ios 2>$null

Write-Host ""
Write-Host "✅ React Native setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Link vector icons: npx react-native-asset" -ForegroundColor White
Write-Host "2. Run on Android: npm run android" -ForegroundColor White
Write-Host "3. Run on iOS (Mac): npm run ios" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your app is ready to build!" -ForegroundColor Green
