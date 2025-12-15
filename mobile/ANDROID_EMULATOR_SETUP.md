# Android Emulator Setup Guide

## Current Status
✅ Android SDK installed at: `%LOCALAPPDATA%\Android\Sdk`
✅ ADB is working
❌ No Android Virtual Devices (AVDs) created yet

## Option 1: Create Emulator via Android Studio (Recommended - Easiest)

### Step 1: Open Android Studio
1. Launch **Android Studio**
2. If you see the welcome screen, click **"More Actions"** → **"Virtual Device Manager"**
3. If you have a project open, go to **Tools** → **Device Manager**

### Step 2: Create New Device
1. Click **"Create Device"** (+ icon)
2. Select **Phone** → **Pixel 5** (or any device you prefer)
3. Click **Next**

### Step 3: Download System Image
1. Select **API Level 33** (Android 13.0 - Tiramisu) or **API Level 34** (Android 14)
   - Click **Download** next to the system image if not already downloaded
   - Wait for download to complete
2. Click **Next**

### Step 4: Verify Configuration
1. AVD Name: `Pixel_5_API_33` (or whatever name you prefer)
2. Click **Finish**

### Step 5: Start Emulator
1. In Device Manager, find your new AVD
2. Click the **▶ Play** button
3. Wait for emulator to boot (may take 1-2 minutes first time)

---

## Option 2: Create Emulator via Command Line (Advanced)

### Step 1: Set Environment Variables
```powershell
# Add to your PowerShell profile or run each time
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin"
```

### Step 2: List Available System Images
```powershell
sdkmanager --list | Select-String "system-images"
```

### Step 3: Download System Image (if needed)
```powershell
sdkmanager "system-images;android-33;google_apis;x86_64"
```

### Step 4: Create AVD
```powershell
avdmanager create avd -n Pixel5_API33 -k "system-images;android-33;google_apis;x86_64" -d "pixel_5"
```

### Step 5: Start Emulator
```powershell
emulator -avd Pixel5_API33
```

---

## Option 3: Quick Start Script (If AVD Already Exists)

Save this as `start-emulator.ps1`:

```powershell
# Set Android SDK path
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# List available AVDs
Write-Host "Available Android Virtual Devices:" -ForegroundColor Cyan
& "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds

Write-Host "`nEnter AVD name to start (or press Enter to use first available):" -ForegroundColor Yellow
$avdName = Read-Host

if ([string]::IsNullOrWhiteSpace($avdName)) {
    $avds = & "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds
    if ($avds) {
        $avdName = $avds[0]
        Write-Host "Starting $avdName..." -ForegroundColor Green
    } else {
        Write-Host "No AVDs found. Please create one first." -ForegroundColor Red
        exit
    }
}

# Start emulator
& "$env:ANDROID_HOME\emulator\emulator.exe" -avd $avdName
```

---

## After Emulator is Running

### Verify Device Connection
```powershell
adb devices
```

You should see output like:
```
List of devices attached
emulator-5554   device
```

### Start Backend Server
In a **new terminal**:
```powershell
cd C:\EasyCart\backend
python manage.py runserver
```

### Run the Mobile App
In **another terminal**:
```powershell
cd C:\EasyCart\mobile
npm run android
```

---

## Troubleshooting

### Emulator Won't Start
- **Error: "HAXM not installed"**
  - Go to SDK Manager → SDK Tools → Install "Intel x86 Emulator Accelerator (HAXM)"
  - Or use ARM-based system image if on ARM CPU

- **Error: "VT-x/AMD-V disabled"**
  - Enable virtualization in BIOS settings
  - Restart computer and enter BIOS (usually F2, F10, or Del during boot)
  - Find and enable Intel VT-x or AMD-V

- **Slow Performance**
  - Use x86_64 system images (faster with hardware acceleration)
  - Allocate more RAM in AVD settings (Edit AVD → Show Advanced Settings → RAM: 2048 MB+)

### ADB Not Recognizing Emulator
```powershell
adb kill-server
adb start-server
adb devices
```

### Metro Bundler Port Conflict
```powershell
# Kill process on port 8081
npx react-native start --reset-cache
```

---

## Quick Reference Commands

```powershell
# Set Android SDK path (add to PowerShell profile)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\platform-tools"

# List AVDs
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_33

# Check connected devices
adb devices

# Run app
cd C:\EasyCart\mobile
npm run android
```

---

## Next Steps

1. ✅ Create an AVD using **Option 1** (Android Studio - easiest)
2. ✅ Start the emulator
3. ✅ Verify with `adb devices`
4. ✅ Start Django backend: `python manage.py runserver`
5. ✅ Run mobile app: `npm run android`
6. 🎉 Test the Login screen!

The app will connect to your backend at `http://10.0.2.2:8000/api` (Android emulator's special IP for localhost).
