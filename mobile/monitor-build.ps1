# Monitor Android Build Progress
# Run this in a separate PowerShell window while build is running

Write-Host "=== Android Build Monitor ===" -ForegroundColor Cyan
Write-Host ""

# Check if build process is running
$javaProcesses = Get-Process -Name java -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "✓ Build is running" -ForegroundColor Green
    Write-Host "  Java processes:" $javaProcesses.Count
    Write-Host "  Total CPU:" ([math]::Round(($javaProcesses | Measure-Object -Property CPU -Sum).Sum, 2)) "seconds"
    Write-Host ""
} else {
    Write-Host "✗ No Java processes running" -ForegroundColor Yellow
    Write-Host ""
}

# Check build directories
Write-Host "Build directories:" -ForegroundColor Cyan
$buildDir = "C:\EasyCart\mobile\android\app\build"
if (Test-Path $buildDir) {
    $size = (Get-ChildItem $buildDir -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  ✓ Build folder size: $([math]::Round($size, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "  - No build folder yet" -ForegroundColor Yellow
}

# Check for APK
$apkPath = "C:\EasyCart\mobile\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "  ✓ APK created: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== BUILD COMPLETE! ===" -ForegroundColor Green
    Write-Host "APK location: $apkPath" -ForegroundColor Cyan
} else {
    Write-Host "  - APK not created yet (still building...)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Run this script again to check build status."
