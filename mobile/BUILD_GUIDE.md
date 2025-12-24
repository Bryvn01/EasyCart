# EasyCart Mobile App - Production Build Guide

## 📱 **Overview**
This guide covers building a production-ready React Native mobile app for EasyCart following industry best practices.

---

## 🎯 **Best Practices Implemented**

### **Architecture**
- ✅ Clean architecture with separation of concerns
- ✅ Feature-based folder structure
- ✅ Centralized state management (Zustand)
- ✅ Type-safe API layer with TypeScript
- ✅ Proper error handling and logging

### **Performance**
- ✅ FlashList for optimized lists (better than FlatList)
- ✅ MMKV for fast local storage (faster than AsyncStorage)
- ✅ React Query for API caching and optimization
- ✅ Fast Image for optimized image loading
- ✅ Reanimated for 60fps animations

### **Security**
- ✅ Secure storage with react-native-keychain
- ✅ Biometric authentication support
- ✅ Encrypted token storage
- ✅ SSL pinning ready
- ✅ Code obfuscation in production builds

### **Quality**
- ✅ TypeScript for type safety
- ✅ ESLint + Prettier for code quality
- ✅ React Hook Form for performant forms
- ✅ Zod for runtime validation
- ✅ Sentry for error monitoring
- ✅ Jest for unit testing

---

## 🚀 **Quick Start**

### **1. Install Dependencies**

```bash
cd mobile
npm install

# For iOS (macOS only)
cd ios
pod install
cd ..
```

### **2. Configure Environment**

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Backend API
API_URL=https://easycart-backend-2k8l.onrender.com
API_TIMEOUT=30000

# App Configuration
APP_NAME=EasyCart
APP_VERSION=1.0.0
BUILD_NUMBER=1

# Features
ENABLE_BIOMETRICS=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ANALYTICS=true

# Optional - Sentry (Error Monitoring)
SENTRY_DSN=
SENTRY_ENVIRONMENT=production

# Optional - Firebase (Analytics & Push Notifications)
GOOGLE_SERVICES_JSON_PATH=./google-services.json
GOOGLE_PLIST_PATH=./GoogleService-Info.plist
```

---

## 🔧 **Development Setup**

### **Android Development**

**Prerequisites:**
- Node.js 18+
- JDK 17
- Android Studio with Android SDK

**Run in Development:**

```bash
# Start Metro bundler
npm start

# Run Android app (in new terminal)
npm run android

# Or with specific device
npx react-native run-android --deviceId=YOUR_DEVICE_ID
```

**Common Issues:**

```bash
# Clean build if issues
npm run clean
cd android && ./gradlew clean && cd ..

# Rebuild
npm run android
```

### **iOS Development** (macOS only)

**Prerequisites:**
- Xcode 15+
- CocoaPods

**Run in Development:**

```bash
# Install pods
cd ios && pod install && cd ..

# Run iOS app
npm run ios

# Or with specific simulator
npm run ios -- --simulator="iPhone 15 Pro"
```

---

## 📦 **Production Build**

### **Android APK (For Testing)**

```bash
# Debug APK
cd android
./gradlew assembleDebug

# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

```bash
# Release APK (Signed)
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### **Android AAB (For Google Play)**

```bash
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### **iOS IPA (For App Store)**

```bash
# 1. Open Xcode
open ios/EasyCart.xcworkspace

# 2. Select "Any iOS Device (arm64)"
# 3. Product > Archive
# 4. Distribute App > App Store Connect
```

---

## 🔐 **Code Signing**

### **Android Signing**

**1. Generate Keystore:**

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore easycart-release.keystore \
  -alias easycart-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**2. Configure Gradle:**

Create `android/gradle.properties`:

```properties
EASYCART_RELEASE_STORE_FILE=easycart-release.keystore
EASYCART_RELEASE_KEY_ALIAS=easycart-key
EASYCART_RELEASE_STORE_PASSWORD=your_store_password
EASYCART_RELEASE_KEY_PASSWORD=your_key_password
```

**3. Update `android/app/build.gradle`:**

```gradle
android {
    signingConfigs {
        release {
            storeFile file(EASYCART_RELEASE_STORE_FILE)
            storePassword EASYCART_RELEASE_STORE_PASSWORD
            keyAlias EASYCART_RELEASE_KEY_ALIAS
            keyPassword EASYCART_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### **iOS Signing**

1. Open Xcode
2. Select project > Signing & Capabilities
3. Team: Select your Apple Developer account
4. Bundle Identifier: `com.easycart.app`
5. Automatic signing recommended for development
6. Manual signing for production (use provisioning profiles)

---

## 🎨 **App Configuration**

### **App Name & Icon**

**Android:**
- Icon: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Name: `android/app/src/main/res/values/strings.xml`

**iOS:**
- Icon: `ios/EasyCart/Images.xcassets/AppIcon.appiconset/`
- Name: `ios/EasyCart/Info.plist` (CFBundleDisplayName)

### **Splash Screen**

Using `react-native-splash-screen`:

```bash
npm install react-native-splash-screen
npx react-native-asset
```

Place splash images in:
- Android: `android/app/src/main/res/drawable-*/splash.png`
- iOS: `ios/EasyCart/Images.xcassets/SplashScreen.imageset/`

---

## 🧪 **Testing**

### **Unit Tests**

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### **Type Checking**

```bash
npm run type-check
```

### **Linting**

```bash
npm run lint

# Auto-fix
npm run lint -- --fix
```

### **Manual Testing Checklist**

- [ ] Authentication (Login, Register, Logout)
- [ ] Product browsing and search
- [ ] Add to cart functionality
- [ ] Checkout flow
- [ ] Order history
- [ ] Profile management
- [ ] Wishlist operations
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Offline mode (cache)
- [ ] Network error handling
- [ ] Deep linking

---

## 📊 **Performance Optimization**

### **Bundle Size Analysis**

```bash
# Android
cd android
./gradlew bundleRelease --scan

# Check APK size
./gradlew assembleRelease
ls -lh app/build/outputs/apk/release/
```

### **Memory Profiling**

- Use React Native Debugger
- Enable Profiler in development
- Check for memory leaks with Flipper

### **Optimization Checklist**

- [x] Using FlashList instead of FlatList
- [x] Image optimization with FastImage
- [x] Code splitting with React.lazy (where applicable)
- [x] Memoization with useMemo/useCallback
- [x] MMKV for storage (faster than AsyncStorage)
- [ ] Enable Hermes engine (already default in RN 0.73+)
- [ ] Enable ProGuard/R8 for Android
- [ ] Strip debug symbols

---

## 🔔 **Push Notifications**

### **Firebase Cloud Messaging (FCM)**

**1. Setup Firebase:**
- Go to https://console.firebase.google.com/
- Create project "EasyCart"
- Add Android app (package: com.easycart.app)
- Download `google-services.json` → `android/app/`
- Add iOS app → Download `GoogleService-Info.plist` → `ios/`

**2. Configure:**

Already configured in the app. Just add Firebase config files.

**3. Test:**

```typescript
// In your app
import messaging from '@react-native-firebase/messaging';

// Request permission
const authStatus = await messaging().requestPermission();

// Get FCM token
const token = await messaging().getToken();
console.log('FCM Token:', token);
```

---

## 📈 **Analytics**

### **Firebase Analytics**

Already integrated. Events tracked:
- Screen views
- Button clicks
- Product views
- Add to cart
- Purchase completion
- Search queries

### **Custom Events**

```typescript
import analytics from '@react-native-firebase/analytics';

await analytics().logEvent('product_purchased', {
  product_id: '123',
  product_name: 'T-Shirt',
  price: 1500,
  currency: 'KES'
});
```

---

## 🐛 **Error Monitoring**

### **Sentry Integration**

Already configured. Add your DSN to `.env`:

```env
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

Errors are automatically captured and sent to Sentry.

---

## 🚢 **Deployment**

### **Google Play Store (Android)**

**1. Prepare Assets:**
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (at least 2, max 8)
- App description (short & full)
- Privacy policy URL

**2. Build AAB:**

```bash
cd android
./gradlew bundleRelease
```

**3. Upload:**
- Go to https://play.google.com/console
- Create app
- Upload AAB
- Complete store listing
- Submit for review

**4. Release Types:**
- **Internal testing**: Quick testing with limited users
- **Closed testing**: Beta testers
- **Open testing**: Public beta
- **Production**: Full release

### **Apple App Store (iOS)**

**1. Prepare:**
- Enroll in Apple Developer Program ($99/year)
- App icon (1024x1024 PNG)
- Screenshots for all device sizes
- App preview video (optional)
- App description
- Privacy policy URL

**2. Build:**
- Open Xcode
- Product > Archive
- Distribute App > App Store Connect
- Upload

**3. App Store Connect:**
- https://appstoreconnect.apple.com/
- Create app
- Configure pricing & availability
- Add screenshots and description
- Submit for review

**4. Review Process:**
- Apple reviews typically take 1-3 days
- Respond to any feedback promptly
- Once approved, choose release date

---

## 📋 **Pre-Release Checklist**

### **Code Quality**
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Code properly formatted (Prettier)
- [ ] No console.logs in production code
- [ ] All TODO comments resolved

### **Testing**
- [ ] All unit tests passing
- [ ] Manual testing completed
- [ ] Tested on multiple devices/screen sizes
- [ ] Tested on slow network
- [ ] Tested offline functionality
- [ ] Tested with different Android versions
- [ ] iOS testing (if applicable)

### **Security**
- [ ] API keys in environment variables
- [ ] Sensitive data encrypted
- [ ] SSL certificate pinning configured
- [ ] ProGuard/R8 enabled
- [ ] Debug mode disabled in production
- [ ] Crash reporting configured

### **Performance**
- [ ] App starts in <3 seconds
- [ ] List scrolling at 60fps
- [ ] Images optimized and cached
- [ ] Bundle size reasonable (<50MB)
- [ ] Memory usage optimized

### **Store Requirements**
- [ ] App icon prepared (all sizes)
- [ ] Screenshots captured
- [ ] App description written
- [ ] Privacy policy published
- [ ] Terms of service available
- [ ] App signed with release certificate
- [ ] Version codes incremented

### **Backend Integration**
- [ ] API endpoints tested
- [ ] Error handling for API failures
- [ ] Proper loading states
- [ ] Token refresh working
- [ ] Logout functionality tested

---

## 🔄 **Continuous Integration**

### **GitHub Actions (Recommended)**

Create `.github/workflows/mobile-ci.yml`:

```yaml
name: Mobile CI

on:
  push:
    branches: [ main ]
    paths:
      - 'mobile/**'
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: mobile

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: mobile/package-lock.json

    - name: Install dependencies
      run: npm ci

    - name: Run linter
      run: npm run lint

    - name: Run type check
      run: npm run type-check

    - name: Run tests
      run: npm test -- --coverage

    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build-android:
    runs-on: ubuntu-latest
    needs: test
    defaults:
      run:
        working-directory: mobile

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'

    - name: Install dependencies
      run: npm ci

    - name: Build Android APK
      run: |
        cd android
        ./gradlew assembleRelease

    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release.apk
        path: mobile/android/app/build/outputs/apk/release/app-release.apk
```

---

## 📚 **Additional Resources**

### **Documentation**
- React Native: https://reactnative.dev/
- React Navigation: https://reactnavigation.org/
- React Query: https://tanstack.com/query/latest
- Zustand: https://github.com/pmndrs/zustand

### **Tools**
- React Native Debugger: https://github.com/jhen0409/react-native-debugger
- Flipper: https://fbflipper.com/
- Reactotron: https://github.com/infinitered/reactotron

### **Community**
- React Native Community: https://github.com/react-native-community
- Stack Overflow: https://stackoverflow.com/questions/tagged/react-native
- Discord: https://discord.gg/react-native

---

## 🆘 **Troubleshooting**

### **Metro Bundler Issues**

```bash
# Clear cache
npx react-native start --reset-cache

# Or
rm -rf node_modules
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
npm install
```

### **Android Build Failures**

```bash
# Clean Gradle cache
cd android
./gradlew clean
./gradlew cleanBuildCache

# Delete build folders
rm -rf android/app/build
rm -rf android/build

# Rebuild
./gradlew assembleDebug
```

### **iOS Build Failures**

```bash
# Clean pods
cd ios
rm -rf Pods
rm Podfile.lock
pod install

# Clean Xcode
# Product > Clean Build Folder in Xcode

# Or command line
xcodebuild clean -workspace ios/EasyCart.xcworkspace -scheme EasyCart
```

### **Common Errors**

**"Unable to resolve module"**
```bash
# Clear watchman
watchman watch-del-all

# Reinstall
rm -rf node_modules
npm install
```

**"Command failed: gradlew.bat assembleDebug"**
```bash
# Check Java version
java -version  # Should be 17

# Set JAVA_HOME
export JAVA_HOME=/path/to/jdk-17  # macOS/Linux
# OR
setx JAVA_HOME "C:\Program Files\Java\jdk-17"  # Windows
```

---

## 📞 **Support**

For issues or questions:
1. Check existing documentation
2. Search GitHub issues
3. Contact the development team

---

**Last Updated:** December 15, 2025
**Version:** 1.0.0
**Status:** Production Ready
