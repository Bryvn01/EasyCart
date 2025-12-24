# EasyCart Mobile - Release Management Guide

## 📱 **Version Management Best Practices**

### **Versioning Strategy (Semantic Versioning)**

```
MAJOR.MINOR.PATCH (BUILD_NUMBER)
Example: 1.0.0 (1)
```

- **MAJOR**: Breaking changes, major redesigns
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, minor improvements
- **BUILD_NUMBER**: Auto-incremented for each build

### **Version Update Locations**

**1. package.json**
```json
{
  "version": "1.0.0"
}
```

**2. Android (android/app/build.gradle)**
```gradle
android {
    defaultConfig {
        versionCode 1          // Increment for EVERY release
        versionName "1.0.0"    // User-facing version
    }
}
```

**3. iOS (ios/EasyCart/Info.plist)**
```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

**4. .env**
```env
APP_VERSION=1.0.0
APP_BUILD_NUMBER=1
```

---

## 🚀 **Release Process**

### **Step 1: Pre-Release Testing**

```bash
# Run all tests
npm test

# Type check
npm run type-check

# Lint check
npm run lint

# Build debug version
npm run android  # Test on real device
```

**Testing Checklist:**
- [ ] All features working
- [ ] No crashes or ANRs
- [ ] Proper error handling
- [ ] Loading states correct
- [ ] Navigation flows smooth
- [ ] API integration working
- [ ] Offline mode functional
- [ ] Performance acceptable (60fps)
- [ ] Memory usage reasonable
- [ ] Battery consumption optimized

---

### **Step 2: Version Bump**

```bash
# Example: Release 1.1.0

# 1. Update package.json
npm version minor  # Creates git tag automatically

# 2. Update android/app/build.gradle
# versionCode: 2 (increment from 1)
# versionName: "1.1.0"

# 3. Update ios/EasyCart/Info.plist
# CFBundleShortVersionString: 1.1.0
# CFBundleVersion: 2

# 4. Update .env
# APP_VERSION=1.1.0
# APP_BUILD_NUMBER=2
```

---

### **Step 3: Build Production Release**

#### **Android AAB (For Google Play)**

```bash
cd mobile/android

# Clean previous builds
./gradlew clean

# Build signed AAB
./gradlew bundleRelease

# Output location:
# android/app/build/outputs/bundle/release/app-release.aab
```

#### **Android APK (For Direct Distribution)**

```bash
cd mobile/android

# Build signed APK
./gradlew assembleRelease

# Output location:
# android/app/build/outputs/apk/release/app-release.apk
```

#### **iOS IPA (For App Store)**

```bash
# 1. Open Xcode
open ios/EasyCart.xcworkspace

# 2. Select target device: "Any iOS Device (arm64)"

# 3. Product > Clean Build Folder

# 4. Product > Archive

# 5. Window > Organizer

# 6. Select archive > Distribute App
#    - App Store Connect (for TestFlight/App Store)
#    - Ad Hoc (for internal testing)
#    - Enterprise (for enterprise distribution)

# 7. Upload to App Store Connect
```

---

### **Step 4: Quality Assurance**

**Test Build Before Release:**

**Android:**
```bash
# Install release APK on device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or drag AAB to Google Play Internal Testing
```

**iOS:**
```bash
# Upload to TestFlight
# Test with internal testers first
# Then external testers
```

**QA Testing Checklist:**
- [ ] Fresh install works
- [ ] Upgrade from previous version works
- [ ] All critical user flows tested
- [ ] Payment integration tested
- [ ] Push notifications working
- [ ] Deep links working
- [ ] Biometric auth working
- [ ] App size reasonable
- [ ] No performance regressions

---

### **Step 5: Release Documentation**

**Create CHANGELOG.md entry:**

```markdown
## [1.1.0] - 2025-12-15

### Added
- Mobile UX optimization with 48px touch targets
- Safe area support for iOS notch and Android gestures
- Extra small screen support (<375px devices)
- Support chat functionality

### Fixed
- Cart page layout issues on mobile
- Orders page touch target sizes
- Bottom navigation overlap

### Changed
- Improved mobile responsive grids
- Updated padding for better mobile experience

### Security
- Enhanced chat message security with XSS prevention
- URL validation and spam detection
```

---

### **Step 6: Store Submission**

#### **Google Play Store**

**1. Prepare Store Listing:**

```
App Name: EasyCart - Online Shopping
Short Description: (80 chars max)
"Shop electronics, fashion & more. Fast delivery, secure payments."

Full Description: (4000 chars max)
"EasyCart is your one-stop mobile shopping app for electronics, fashion,
home goods, and more. Enjoy:

✓ Browse thousands of products
✓ Secure M-Pesa payments
✓ Fast doorstep delivery
✓ Track your orders in real-time
✓ Save items to your wishlist
✓ Exclusive mobile deals

FEATURES:
- Easy product search and filtering
- Multiple payment options (M-Pesa, Card, Cash on Delivery)
- Order tracking
- Secure checkout
- Push notifications for deals
- Biometric login for security

SAFE & SECURE:
Your data is encrypted and secure. We never store your payment information.

CUSTOMER SUPPORT:
24/7 support available via in-app chat

Download now and start shopping!"

Category: Shopping
Tags: shopping, ecommerce, mpesa, delivery
Content Rating: Everyone
```

**2. Required Assets:**

```
App Icon:
- 512x512 PNG (32-bit, with transparency)
- No rounded corners (Google Play adds them)

Feature Graphic:
- 1024x500 PNG
- Showcase key features

Screenshots: (At least 2, max 8 per device type)
- Phone: 16:9 ratio (1920x1080 recommended)
- 7-inch Tablet: 16:9 ratio (1920x1080)
- 10-inch Tablet: 16:9 ratio (1920x1080)

Promo Video: (Optional)
- YouTube URL
- 30 seconds - 2 minutes
```

**3. Upload Process:**

```bash
# 1. Go to Google Play Console
https://play.google.com/console/

# 2. Create app / Select existing app

# 3. Production > Create new release

# 4. Upload AAB
# Drag: android/app/build/outputs/bundle/release/app-release.aab

# 5. Release notes
Add changelog for this version

# 6. Review and publish
- Internal testing (optional)
- Closed testing (beta testers)
- Open testing (public beta)
- Production (full release)

# 7. Submit for review
Review typically takes 1-3 days
```

**4. Release Tracks:**

- **Internal Testing**: Up to 100 testers, instant release
- **Closed Testing**: Limited testers, 1-2 hour review
- **Open Testing**: Public, 1-3 day review
- **Production**: Full release, 1-7 day review

---

#### **Apple App Store**

**1. App Store Connect Setup:**

```bash
# 1. Go to App Store Connect
https://appstoreconnect.apple.com/

# 2. My Apps > + > New App

# 3. Fill in app information:
Platform: iOS
Name: EasyCart - Online Shopping
Primary Language: English (U.S.)
Bundle ID: com.easycart.app
SKU: easycart-001

# 4. Select availability:
- Countries/Regions: Kenya (or worldwide)
- Price: Free (with optional in-app purchases)
```

**2. App Information:**

```
Name: EasyCart - Online Shopping

Subtitle (30 chars):
"Shop Electronics & Fashion"

Category:
Primary: Shopping
Secondary: Lifestyle

Description (4000 chars):
"EasyCart is Kenya's favorite mobile shopping app offering electronics,
fashion, home goods, and more with fast delivery and secure M-Pesa payments.

WHY CHOOSE EASYCART?

✓ Wide Selection - Browse thousands of products across multiple categories
✓ Secure Payments - M-Pesa, credit/debit cards, or cash on delivery
✓ Fast Delivery - Get your orders delivered to your doorstep
✓ Real-time Tracking - Know exactly where your order is
✓ Best Prices - Daily deals and exclusive mobile discounts
✓ Easy Returns - Hassle-free returns within 7 days

FEATURES:

• Browse & Search
  - Advanced filtering and sorting
  - Category-based browsing
  - Product recommendations

• Secure Shopping
  - Biometric login
  - Encrypted checkout
  - Secure payment processing

• Order Management
  - Real-time order tracking
  - Order history
  - Easy reordering

• Wishlist
  - Save products for later
  - Price drop notifications

• Customer Support
  - In-app chat support
  - 24/7 assistance
  - Quick response times

PAYMENT OPTIONS:
- M-Pesa (Safaricom)
- Credit/Debit Cards (Visa, Mastercard)
- PayPal
- Cash on Delivery

DELIVERY:
- Free delivery on orders over Ksh 2,000
- Same-day delivery available in Nairobi
- Track your order in real-time
- Doorstep delivery across Kenya

SECURITY:
Your privacy and security are our top priorities. All transactions are
encrypted, and we never store your payment information.

Download EasyCart now and experience shopping made easy!"

Keywords (100 chars):
shopping,ecommerce,mpesa,delivery,electronics,fashion,deals,kenya,online
```

**3. Required Screenshots:**

```
iPhone 6.7" (iPhone 15 Pro Max):
- 1290 x 2796 pixels
- At least 3 screenshots

iPhone 6.5" (iPhone 14 Pro Max):
- 1284 x 2778 pixels
- At least 3 screenshots

iPhone 5.5" (iPhone 8 Plus):
- 1242 x 2208 pixels
- At least 3 screenshots

iPad Pro (12.9-inch) - if supporting iPad:
- 2048 x 2732 pixels
- At least 3 screenshots

App Preview Video (Optional):
- Portrait orientation
- 15-30 seconds
- .mov or .mp4 format
- Max file size: 500MB
```

**4. Privacy Policy:**

```
Required! Must be accessible URL.
Example: https://easycart.com/privacy-policy

Include:
- Data collection practices
- How data is used
- Third-party services
- User rights
- Contact information
```

**5. TestFlight (Beta Testing):**

```bash
# 1. Upload build via Xcode
# 2. Select build in TestFlight
# 3. Add internal testers (up to 100)
# 4. Add external testers (up to 10,000)
# 5. Get feedback before production release
```

**6. Submit for Review:**

```bash
# 1. Select build version
# 2. Add release notes
# 3. Select manual/automatic release
# 4. Submit for review

# Review times:
- Typically 24-48 hours
- Can be up to 7 days
- Expedited review available (emergency only)
```

---

### **Step 7: Post-Release Monitoring**

#### **Monitor Crash Reports**

**Sentry Dashboard:**
```bash
# Check for new crashes
https://sentry.io/

# Set up alerts for:
- Crash rate > 1%
- New error types
- Performance issues
```

**Google Play Console:**
```bash
# Vitals > Crashes & ANRs
- Monitor crash-free users percentage
- Target: >99.5% crash-free users
```

**App Store Connect:**
```bash
# App Analytics > Crashes
- Monitor crashes per session
- Target: <0.1% crash rate
```

#### **Monitor Performance**

```bash
# Key Metrics:
- App start time: <3 seconds
- Screen load time: <1 second
- API response time: <2 seconds
- Memory usage: <200MB average
- Battery consumption: Low impact
```

#### **Monitor Reviews**

```bash
# Respond to user reviews within 24 hours
# Track common issues
# Update roadmap based on feedback
```

#### **Monitor Analytics**

```bash
# Firebase Analytics / App Analytics:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration
- Retention rates (D1, D7, D30)
- Conversion rates
- Revenue per user
```

---

## 📊 **Release Metrics & KPIs**

### **Pre-Release Quality Gates**

```
✅ Crash-free rate: >99.5%
✅ ANR rate: <0.1%
✅ App start time: <3s
✅ Bundle size: <50MB
✅ Test coverage: >80%
✅ Zero critical bugs
✅ All features working
```

### **Post-Release Success Metrics**

```
Week 1:
- Monitor crash rate hourly
- Track new user onboarding
- Measure feature adoption

Month 1:
- D1 retention: >40%
- D7 retention: >20%
- D30 retention: >10%
- Average rating: >4.0 stars
- Conversion rate: >2%
```

---

## 🔄 **Hotfix Process**

For critical bugs in production:

```bash
# 1. Create hotfix branch
git checkout -b hotfix/v1.0.1

# 2. Fix the critical bug
# Make minimal changes only

# 3. Test thoroughly
npm test
npm run type-check

# 4. Bump patch version
# 1.0.0 → 1.0.1
# Build number: 1 → 2

# 5. Build release
./gradlew bundleRelease  # Android
# Or Archive in Xcode      # iOS

# 6. Submit as urgent update
# Google Play: Fast track review (4-6 hours)
# App Store: Request expedited review

# 7. Merge hotfix to main
git checkout main
git merge hotfix/v1.0.1
git push

# 8. Monitor rollout
# Staged rollout: 10% → 50% → 100%
```

---

## 📅 **Release Schedule (Recommended)**

```
Major Releases (X.0.0):
- Quarterly (every 3 months)
- Major features, redesigns
- Extensive testing required

Minor Releases (X.Y.0):
- Monthly (every 4-6 weeks)
- New features, improvements
- Standard testing process

Patch Releases (X.Y.Z):
- As needed (urgent fixes)
- Bug fixes only
- Minimal testing required

Hotfixes:
- Emergency only
- Critical bugs affecting users
- Immediate release
```

---

## 🎯 **Best Practices Summary**

### **Before Release**
- ✅ Test on multiple devices
- ✅ Test with slow network
- ✅ Test offline functionality
- ✅ Check app size
- ✅ Verify all permissions
- ✅ Review privacy policy
- ✅ Update documentation
- ✅ Prepare marketing materials

### **During Release**
- ✅ Use staged rollout (10% → 50% → 100%)
- ✅ Monitor crash reports closely
- ✅ Have rollback plan ready
- ✅ Communicate with users
- ✅ Track key metrics

### **After Release**
- ✅ Monitor first 24 hours closely
- ✅ Respond to user feedback
- ✅ Address critical bugs immediately
- ✅ Plan next release
- ✅ Document lessons learned

---

**Last Updated:** December 15, 2025
**Maintained By:** EasyCart Development Team
