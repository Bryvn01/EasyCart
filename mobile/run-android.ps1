# EasyCart Mobile - Quick Android Launch Script

[CmdletBinding()]
param(
    [string]$AvdName = "EasyCart_Emulator",
    [switch]$SkipMetro,
    [int]$BootTimeoutMinutes = 8
)

Write-Host "EasyCart Mobile - Starting Android App..." -ForegroundColor Green
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
    Write-Host "Android SDK not found. Install Android Studio or set ANDROID_HOME." -ForegroundColor Red
    exit 1
}

$env:ANDROID_HOME = $androidSdk
$env:ANDROID_SDK_ROOT = $androidSdk
$env:PATH = "$androidSdk\platform-tools;$androidSdk\emulator;$env:PATH"

$adb = Join-Path $androidSdk "platform-tools\adb.exe"
if (-not (Test-Path $adb)) {
    Write-Host "adb.exe not found under: $androidSdk\platform-tools" -ForegroundColor Red
    exit 1
}

$emulatorExe = Join-Path $androidSdk "emulator\emulator.exe"
if (-not (Test-Path $emulatorExe)) {
    Write-Host "emulator.exe not found under: $androidSdk\emulator" -ForegroundColor Red
    exit 1
}

function Get-ConnectedDevices {
    & $adb devices | ForEach-Object { $_.Trim() } | Where-Object { $_ -and $_ -notmatch '^List of devices' }
}

function Wait-ForBoot {
    param([int]$TimeoutMinutes)

    Write-Host "Waiting for device connection..." -ForegroundColor Yellow
    & $adb wait-for-device | Out-Null

    Write-Host "Waiting for Android to finish booting..." -ForegroundColor Yellow
    $deadline = (Get-Date).AddMinutes($TimeoutMinutes)
    while ((Get-Date) -lt $deadline) {
        try {
            $boot = (& $adb shell getprop sys.boot_completed 2>$null) -join ""
            $boot = $boot.Trim()
            if ($boot -eq "1") {
                return $true
            }
        } catch {
            # ignore and retry
        }
        Start-Sleep -Seconds 2
    }
    return $false
}

# Ensure an emulator/device is available
$devices = Get-ConnectedDevices
if (-not $devices -or ($devices | Where-Object { $_ -match '\sdevice$' }).Count -eq 0) {
    Write-Host "No connected device detected. Starting emulator..." -ForegroundColor Yellow

    # Prefer the requested AVD if it exists; otherwise fall back to first available.
    $avds = & $emulatorExe -list-avds 2>$null
    if (-not $avds -or $avds.Count -eq 0) {
        Write-Host "No AVDs found. Create one in Android Studio (Tools -> Device Manager)." -ForegroundColor Red
        exit 1
    }

    if ([string]::IsNullOrWhiteSpace($AvdName) -or -not ($avds -contains $AvdName)) {
        $AvdName = $avds[0]
        Write-Host "Requested AVD not found; using: $AvdName" -ForegroundColor Yellow
    }

    Start-Process -FilePath $emulatorExe -ArgumentList @("-avd", $AvdName, "-netdelay", "none", "-netspeed", "full") -WindowStyle Minimized | Out-Null
    Start-Sleep -Seconds 2
} else {
    Write-Host "Device already connected." -ForegroundColor Green
}

$booted = Wait-ForBoot -TimeoutMinutes $BootTimeoutMinutes
if (-not $booted) {
    Write-Host "Emulator connected but still booting. Continuing; first run may be slow." -ForegroundColor Yellow
}

Write-Host "Device ready." -ForegroundColor Green

# Ensure Metro is running
if (-not $SkipMetro) {
    $metroPort = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
    if (-not $metroPort) {
        Write-Host "Starting Metro bundler (new window)..." -ForegroundColor Yellow
        Start-Process -FilePath "powershell" -ArgumentList @("-NoExit", "-Command", "cd 'C:\EasyCart\mobile'; npm start") -WindowStyle Normal | Out-Null
        Start-Sleep -Seconds 10
    } else {
        Write-Host "Metro already running on port 8081." -ForegroundColor Green
    }
}

# Make sure the emulator/device can reach Metro
Write-Host "Setting up adb reverse (8081 -> 8081)..." -ForegroundColor Cyan
& $adb reverse tcp:8081 tcp:8081 2>$null | Out-Null

Write-Host "Building + installing EasyCart..." -ForegroundColor Cyan
npx react-native run-android

Write-Host ""
Write-Host "Done. If the app opens to a red screen, check the Metro window logs." -ForegroundColor Green
