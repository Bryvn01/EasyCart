# Install Java 17 for React Native Development
Write-Host "Downloading Java 17 (OpenJDK)..." -ForegroundColor Cyan

$jdk17Url = "https://download.oracle.com/java/17/latest/jdk-17_windows-x64_bin.exe"
$downloadPath = "$env:TEMP\jdk-17-installer.exe"

try {
    # Download JDK 17
    Invoke-WebRequest -Uri $jdk17Url -OutFile $downloadPath -UseBasicParsing

    Write-Host "Download complete. Starting installation..." -ForegroundColor Green
    Write-Host "Please follow the installer prompts." -ForegroundColor Yellow
    Write-Host "Default installation location is recommended: C:\Program Files\Java\jdk-17" -ForegroundColor Yellow

    # Run installer
    Start-Process -FilePath $downloadPath -Wait

    # Clean up
    Remove-Item $downloadPath -ErrorAction SilentlyContinue

    Write-Host ""
    Write-Host "Installation complete!" -ForegroundColor Green
    Write-Host "Please close and reopen your terminal, then run the build again." -ForegroundColor Cyan
} catch {
    Write-Host "Error downloading Java 17: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download manually from:" -ForegroundColor Yellow
    Write-Host "https://www.oracle.com/java/technologies/downloads/#java17" -ForegroundColor Blue
}
