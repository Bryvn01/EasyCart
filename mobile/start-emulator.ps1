# EasyCart Mobile - Emulator Launcher

[CmdletBinding()]
param(
    [string]$AvdName = "",
    [switch]$Background
)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host " EasyCart Android Emulator Launcher" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

function Get-AndroidSdkPath {
    $candidates = @(
        $env:ANDROID_HOME,
        $env:ANDROID_SDK_ROOT,
        (Join-Path $env:LOCALAPPDATA "Android\Sdk")
    ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique

    foreach ($p in $candidates) {
        if (Test-Path $p) { return $p }
    }
    return $null
}

$androidSdk = Get-AndroidSdkPath

if (-not $androidSdk) {
    Write-Host "Android SDK not found!" -ForegroundColor Red
    Write-Host "Expected at %LOCALAPPDATA%\Android\Sdk or via ANDROID_HOME/ANDROID_SDK_ROOT." -ForegroundColor Yellow
    Write-Host "Install Android Studio from: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

Write-Host "Android SDK found: $androidSdk" -ForegroundColor Green
$env:ANDROID_HOME = $androidSdk
$env:ANDROID_SDK_ROOT = $androidSdk
$env:PATH = "$androidSdk\platform-tools;$androidSdk\emulator;$env:PATH"

$emulatorExe = Join-Path $androidSdk "emulator\emulator.exe"
if (-not (Test-Path $emulatorExe)) {
    Write-Host "Emulator not found. Install it via Android Studio SDK Manager." -ForegroundColor Red
    exit 1
}

Write-Host "Checking for Android Virtual Devices (AVDs)..." -ForegroundColor Cyan
$avds = & $emulatorExe -list-avds 2>$null

if (-not $avds -or $avds.Count -eq 0) {
    Write-Host ""
    Write-Host "No AVDs found! Create one first:" -ForegroundColor Red
    Write-Host "  1. Android Studio -> Tools -> Device Manager" -ForegroundColor White
    Write-Host "  2. Create Device (e.g. Pixel 5, API 33/34)" -ForegroundColor White
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

$selectedAvd = $null

if (-not [string]::IsNullOrWhiteSpace($AvdName) -and ($avds -contains $AvdName)) {
    $selectedAvd = $AvdName
    Write-Host "Using requested AVD: $selectedAvd" -ForegroundColor Green
}

if (-not $selectedAvd) {
    if ($avds.Count -eq 1) {
        $selectedAvd = $avds[0]
    } else {
        $selection = Read-Host "Select AVD number (Enter for 1)"
        if ([string]::IsNullOrWhiteSpace($selection)) { $selection = "1" }

        $index = 0
        try { $index = [int]$selection - 1 } catch { $index = 0 }
        if ($index -lt 0 -or $index -ge $avds.Count) { $index = 0 }
        $selectedAvd = $avds[$index]
    }
}

Write-Host "Starting Emulator: $selectedAvd" -ForegroundColor Green
Write-Host "Tip: first boot can take 1-3 minutes." -ForegroundColor Yellow
Write-Host ""

$args = @(
    "-avd", $selectedAvd,
    "-netdelay", "none",
    "-netspeed", "full"
)

if ($Background) {
    Start-Process -FilePath $emulatorExe -ArgumentList $args -WindowStyle Minimized | Out-Null
    Write-Host "Emulator launch triggered in background." -ForegroundColor Green
    Write-Host "After it appears, verify with: adb devices" -ForegroundColor Cyan
    exit 0
}

Write-Host "After emulator starts:" -ForegroundColor Cyan
Write-Host "  1. Terminal: cd C:\EasyCart\backend; python manage.py runserver" -ForegroundColor White
Write-Host "  2. Terminal: cd C:\EasyCart\mobile; npm run android" -ForegroundColor White
Write-Host ""

& $emulatorExe @args
