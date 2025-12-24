# Build Android App - Manual Steps

## Current Status
✅ AGP updated to 8.6.1
✅ compileSdk and targetSdk set to 35
✅ Gradle 8.8 configured
✅ Android emulator running
✅ Dependencies installed

## Build the App Now

### Option 1: Using Gradle Directly (Recommended)
Open a **new PowerShell terminal** and run:

```powershell
cd C:\EasyCart\mobile\android
.\gradlew.bat assembleDebug
```

**Wait 3-5 minutes** for the first build. You'll see:
- `> Starting Daemon` - Gradle initializing
- `> Task :app:compileDebugKotlin` - Compiling
- `> Task :app:mergeDebugResources` - Processing resources
- `BUILD SUCCESSFUL` - When complete

### Option 2: Using React Native CLI
Open a **new PowerShell terminal** and run:

```powershell
cd C:\EasyCart\mobile
npx react-native run-android --no-packager
```

### Option 3: Using npm Script
```powershell
cd C:\EasyCart\mobile
npm run android -- --no-packager
```

## After Successful Build

The APK will be at:
```
C:\EasyCart\mobile\android\app\build\outputs\apk\debug\app-debug.apk
```

## Install on Emulator

If the build succeeds but doesn't auto-install:

```powershell
adb install C:\EasyCart\mobile\android\app\build\outputs\apk\debug\app-debug.apk
```

## Launch the App

```powershell
adb shell am start -n com.easycart/com.easycart.MainActivity
```

## Common Build Errors & Fixes

### Error: "JAVA_HOME not set"
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

### Error: "SDK location not found"
Create `C:\EasyCart\mobile\android\local.properties`:
```
sdk.dir=C:\\Users\\hp\\AppData\\Local\\Android\\Sdk
```

### Error: "Execution failed for task ':app:mergeDebugResources'"
```powershell
cd C:\EasyCart\mobile\android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

### Error: "Could not resolve all dependencies"
```powershell
cd C:\EasyCart\mobile
rm -r node_modules
npm install
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

## Check Build Progress

While building, open another terminal and run:
```powershell
Get-Process | Where-Object { $_.ProcessName -like "*java*" } | Select-Object ProcessName, CPU
```

You should see Java processes consuming CPU while building.

## Verify Emulator is Ready

```powershell
adb devices
```

Should show:
```
List of devices attached
emulator-5554   device
```

## Metro Bundler

Make sure Metro is still running. If not, start it:
```powershell
cd C:\EasyCart\mobile
npm start
```

## Full Clean Build (if nothing works)

```powershell
cd C:\EasyCart\mobile

# Clean everything
rm -r node_modules
rm -r android/build
rm -r android/app/build
rm -r android/.gradle

# Reinstall
npm install

# Build
cd android
.\gradlew.bat clean assembleDebug
```

## Success Indicators

✅ You see: `BUILD SUCCESSFUL in Xm Xs`
✅ APK exists at `android/app/build/outputs/apk/debug/app-debug.apk`
✅ App installs on emulator
✅ You see EasyCart splash screen or login page

## Next Steps After Successful Build

1. Test navigation between screens
2. Test API connectivity to Render backend
3. Test product browsing
4. Test cart functionality
5. Test checkout flow

## Need Help?

If you encounter errors, share:
1. The exact error message
2. The command you ran
3. The build output (last 50 lines)
