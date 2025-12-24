# Next Steps After Build Completes

## 1. When You See "BUILD SUCCESSFUL"

The APK will be at:
```
C:\EasyCart\mobile\android\app\build\outputs\apk\debug\app-debug.apk
```

If you ran `npx react-native run-android`, it already built + installed the APK for you.

## 2. Start Metro Bundler

Open a NEW terminal and run:
```powershell
cd C:\EasyCart\mobile
npm start
```

Keep this terminal open - it's the JavaScript bundler.

Tip: If you use `./run-android.ps1`, it will start Metro for you (unless you pass `-SkipMetro`).

## 3. Install APK on Emulator

In another terminal:
```powershell
adb install C:\EasyCart\mobile\android\app\build\outputs\apk\debug\app-debug.apk
```

Note: If you used `npx react-native run-android`, you can skip this step because it installs automatically.

## 4. Launch the App

```powershell
adb shell am start -n com.easycart/com.easycart.MainActivity
```

## 5. Connect Emulator to Metro

```powershell
adb reverse tcp:8081 tcp:8081
```

## What You'll See

1. EasyCart app icon on emulator
2. App launches
3. Metro bundler shows "Bundling... 100%"
4. Login/Register screen appears

## Troubleshooting

### If you see an NPX warning about CLI versions
You may see a warning like: `NPX has cached version (0.73.2) != current release (0.83.0)`.

This project is on React Native `0.73.2`, so using the cached `0.73.2` CLI is expected. Avoid running `npx react-native@latest` unless you are intentionally upgrading React Native.

### If `run-android` says the emulator took too long to start
This is a common Windows/AVD timeout. Start the emulator manually, then re-run the command.

Option A (recommended):
```powershell
cd C:\EasyCart\mobile
./start-emulator.ps1 -Background
```

If you have a specific AVD name:
```powershell
./start-emulator.ps1 -AvdName EasyCart_Emulator -Background
```

Option B (direct emulator command):
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
& "$env:ANDROID_HOME\emulator\emulator.exe" @EasyCart_Emulator
```

Then confirm a device is connected:
```powershell
adb devices
```

Then run:
```powershell
cd C:\EasyCart\mobile
npm run android
```

Tip: `./run-android.ps1` does the “start emulator (if needed) + wait for boot + start Metro + adb reverse + run Android” flow in one shot.

If you want to use a specific AVD or skip Metro:
```powershell
./run-android.ps1 -AvdName EasyCart_Emulator
./run-android.ps1 -SkipMetro
```

### If app shows "Could not connect to server"
```powershell
adb reverse tcp:8081 tcp:8081
# Then reload app: Press R+R in Metro terminal
```

### If app crashes
Check Metro terminal for errors in the JavaScript bundle.

### If build fails
Check the new PowerShell window for the error message.

## Future Builds (After First Success)

Much faster! Just run:
```powershell
cd C:\EasyCart\mobile
npm run android
```

This will:
- Build (1-2 min with cache)
- Install automatically
- Launch app
- Start Metro if not running
