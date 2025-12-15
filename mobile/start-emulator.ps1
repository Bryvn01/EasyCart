# EasyCart Mobile - Emulator Launcher
Write-Host "===================================" -ForegroundColor Cyan
Write-Host " EasyCart Android Emulator Launcher" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$androidSdk = "$env:LOCALAPPDATA\Android\Sdk"

if (-not (Test-Path $androidSdk)) {
    Write-Host "Android SDK not found!" -ForegroundColor Red
    Write-Host "Please install Android Studio from: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

Write-Host "Android SDK found" -ForegroundColor Green
$env:ANDROID_HOME = $androidSdk

$emulatorExe = Join-Path $androidSdk "emulator\emulator.exe"
if (-not (Test-Path $emulatorExe)) {
    Write-Host "Emulator not found. Install it via Android Studio SDK Manager." -ForegroundColor Red
    exit 1
}

Write-Host "Checking for Android Virtual Devices..." -ForegroundColor Cyan
$avds = & $emulatorExe -list-avds 2>$null

if (-not $avds -or $avds.Count -eq 0) {
    Write-Host ""
    Write-Host "No AVDs found! You need to create one first:" -ForegroundColor Red
    Write-Host "  1. Open Android Studio" -ForegroundColor White
    Write-Host "  2. Tools -> Device Manager" -ForegroundColor White
    Write-Host "  3. Create Device (Pixel 5, API 33)" -ForegroundColor White
    Write-Host ""
    Write-Host "See ANDROID_EMULATOR_SETUP.md for detailed instructions" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Available AVDs:" -ForegroundColor Cyan
for ($i = 0; $i -lt $avds.Count; $i++) {
    Write-Host "  [$($i + 1)] $($avds[$i])" -ForegroundColor White
}
Write-Host ""

if ($avds.Count -eq 1) {
    $selectedAvd = $avds[0]
    Write-Host "Starting: $selectedAvd" -ForegroundColor Green
} else {
    $selection = Read-Host "Select AVD number (Enter for 1)"
    if ([string]::IsNullOrWhiteSpace($selection)) { $selection = "1" }

    $index = [int]$selection - 1
    if ($index -lt 0 -or $index -ge $avds.Count) { $index = 0 }

    $selectedAvd = $avds[$index]
}

Write-Host ""
Write-Host "Starting Emulator: $selectedAvd" -ForegroundColor Green
Write-Host "Please wait... (1-2 minutes on first boot)" -ForegroundColor Yellow
Write-Host ""
Write-Host "After emulator starts:" -ForegroundColor Cyan
Write-Host "  1. New terminal: cd backend; python manage.py runserver" -ForegroundColor White
Write-Host "  2. New terminal: cd mobile; npm run android" -ForegroundColor White
Write-Host ""

& $emulatorExe -avd $selectedAvd
