# EasyCart Mobile App - Implementation Guide

## 🎯 Overview

This guide provides a complete implementation plan for the **EasyCart React Native Android mobile app** with 100% feature parity to the web app plus mobile-specific enhancements.

---

## 📊 Backend Analysis Summary

### API Architecture
- **Django REST Framework** backend
- **PostgreSQL** database
- **JWT** authentication (access/refresh tokens)
- **Cloudinary** for image storage
- **Redis** caching layer
- **M-Pesa** payment integration

### Complete API Endpoints

#### Authentication (`/api/auth/`)
```typescript
POST   /api/auth/register/              // Register new user
POST   /api/auth/login/                 // Login (email/password)
POST   /api/auth/login/2fa/             // Login with 2FA code
POST   /api/auth/token/refresh/         // Refresh JWT token
GET    /api/auth/profile/               // Get user profile
PUT    /api/auth/profile/               // Update profile
PATCH  /api/auth/profile/               // Partial update profile
POST   /api/auth/otp/request/           // Request OTP (SMS/WhatsApp/Email)
POST   /api/auth/otp/verify/            // Verify OTP code
POST   /api/auth/otp/resend/            // Resend OTP
POST   /api/auth/2fa/setup/             // Setup 2FA (admin only)
POST   /api/auth/2fa/enable/            // Enable 2FA
POST   /api/auth/2fa/disable/           // Disable 2FA
POST   /api/auth/2fa/verify/            // Verify 2FA code
POST   /api/auth/forgot-password/       // Request password reset
POST   /api/auth/reset-password/        // Reset password
GET    /api/auth/customers/             // List customers (admin)
GET    /api/auth/customers/:id/         // Get customer details
PUT    /api/auth/customers/:id/         // Update customer
DELETE /api/auth/customers/:id/         // Delete customer
```

#### Products (`/api/products/`)
```typescript
GET    /api/products/                   // List products (paginated)
GET    /api/products/:id/               // Product detail
GET    /api/products/categories/        // List categories
POST   /api/products/                   // Create product (admin)
PUT    /api/products/:id/               // Update product (admin)
DELETE /api/products/:id/               // Delete product (admin)

// Wishlist
GET    /api/products/wishlist/          // Get user wishlist
POST   /api/products/wishlist/add/      // Add to wishlist
DELETE /api/products/wishlist/remove/:id/ // Remove from wishlist
POST   /api/products/wishlist/move-to-cart/:id/ // Move to cart
GET    /api/products/wishlist/check/:product_id/ // Check if in wishlist

// Reviews
GET    /api/products/reviews/:product_id/ // Get product reviews
POST   /api/products/reviews/create/    // Create review
POST   /api/products/reviews/helpful/   // Mark review helpful
```

#### Orders & Cart (`/api/orders/`)
```typescript
GET    /api/orders/                     // List user orders
GET    /api/orders/:id/                 // Order detail
GET    /api/orders/cart/                // Get cart
POST   /api/orders/cart/add/            // Add to cart
DELETE /api/orders/cart/remove/:id/     // Remove from cart
PATCH  /api/orders/cart/update/:id/     // Update cart item quantity
POST   /api/orders/cart/move-to-wishlist/:id/ // Move to wishlist
POST   /api/orders/checkout/            // Checkout
POST   /api/orders/payment/initiate/    // Initiate payment
GET    /api/orders/payment/status/:id/  // Payment status
```

#### Payments (`/api/payments/`)
```typescript
POST   /api/payments/payments/initiate_mpesa/ // M-Pesa STK Push
POST   /api/payments/mpesa/callback/    // M-Pesa webhook (backend)
```

#### Health (`/api/health/`)
```typescript
GET    /api/health/                     // Health check
GET    /api/health/live/                // Liveness probe
GET    /api/health/ready/               // Readiness probe
```

### Query Parameters

**Products Listing:**
- `category`: Filter by category slug
- `search`: Search products by name/description
- `ordering`: `-created_at`, `price`, `-price`, `name`, `-view_count`
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)
- `price_min`: Minimum price filter
- `price_max`: Maximum price filter

**Orders Listing:**
- `status`: Filter by order status
- `page`: Page number
- `page_size`: Items per page

---

## 🏗️ Mobile App Architecture

### Tech Stack

#### Core Framework
```json
{
  "react-native": "0.73.2",
  "react": "18.2.0",
  "typescript": "5.3.3"
}
```

#### Navigation
```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "react-native-screens": "^3.29.0",
  "react-native-safe-area-context": "^4.8.2",
  "react-native-gesture-handler": "^2.14.1"
}
```

#### State Management
```json
{
  "@tanstack/react-query": "^5.17.0",
  "zustand": "^4.4.7"
}
```

#### UI Components
```json
{
  "react-native-paper": "^5.11.6",
  "react-native-vector-icons": "^10.0.3"
}
```

#### Storage & Security
```json
{
  "@react-native-async-storage/async-storage": "^1.21.0",
  "react-native-mmkv": "^2.11.0",
  "react-native-keychain": "^8.1.2",
  "react-native-biometrics": "^3.0.1"
}
```

#### API & Networking
```json
{
  "axios": "^1.6.5",
  "react-native-netinfo": "^11.1.0"
}
```

#### Image Handling
```json
{
  "react-native-fast-image": "^8.6.3",
  "react-native-image-picker": "^7.1.0"
}
```

#### Camera & Scanner
```json
{
  "react-native-vision-camera": "^3.6.17",
  "react-native-qrcode-scanner": "^1.5.5"
}
```

#### Push Notifications
```json
{
  "@react-native-firebase/app": "^19.0.1",
  "@react-native-firebase/messaging": "^19.0.1"
}
```

#### Performance & Analytics
```json
{
  "@sentry/react-native": "^5.15.2",
  "@react-native-firebase/analytics": "^19.0.1",
  "@shopify/flash-list": "^1.6.3"
}
```

#### Utilities
```json
{
  "react-native-toast-message": "^2.2.0",
  "date-fns": "^3.0.6",
  "react-hook-form": "^7.49.3",
  "zod": "^3.22.4"
}
```

---

## 📁 Project Structure

```
EasyCartMobile/
├── src/
│   ├── api/                    # API services
│   │   ├── client.ts          # Axios instance with interceptors
│   │   ├── auth.ts            # Auth endpoints
│   │   ├── products.ts        # Products endpoints
│   │   ├── orders.ts          # Orders endpoints
│   │   ├── payments.ts        # Payment endpoints
│   │   └── types.ts           # API types
│   │
│   ├── components/            # Reusable components
│   │   ├── base/              # Atomic components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Text/
│   │   │   ├── Card/
│   │   │   └── Image/
│   │   ├── composite/         # Combined components
│   │   │   ├── ProductCard/
│   │   │   ├── CartItem/
│   │   │   ├── OrderCard/
│   │   │   └── ReviewCard/
│   │   ├── layout/            # Layout components
│   │   │   ├── Screen/
│   │   │   ├── Container/
│   │   │   ├── Header/
│   │   │   └── BottomNav/
│   │   └── feedback/          # User feedback
│   │       ├── Loading/
│   │       ├── Error/
│   │       ├── Empty/
│   │       └── Skeleton/
│   │
│   ├── screens/               # Screen components
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── OTPScreen.tsx
│   │   │   └── BiometricSetupScreen.tsx
│   │   ├── Home/
│   │   │   └── HomeScreen.tsx
│   │   ├── Products/
│   │   │   ├── ProductListScreen.tsx
│   │   │   ├── ProductDetailScreen.tsx
│   │   │   ├── CategoryScreen.tsx
│   │   │   └── SearchScreen.tsx
│   │   ├── Cart/
│   │   │   ├── CartScreen.tsx
│   │   │   └── CheckoutScreen.tsx
│   │   ├── Orders/
│   │   │   ├── OrdersListScreen.tsx
│   │   │   └── OrderDetailScreen.tsx
│   │   ├── Profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   ├── AddressesScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── Wishlist/
│   │       └── WishlistScreen.tsx
│   │
│   ├── navigation/            # Navigation config
│   │   ├── AppNavigator.tsx   # Root navigator
│   │   ├── AuthNavigator.tsx  # Auth stack
│   │   └── MainNavigator.tsx  # Main tabs
│   │
│   ├── store/                 # State management
│   │   ├── authStore.ts       # Auth state (Zustand)
│   │   ├── cartStore.ts       # Cart state
│   │   ├── wishlistStore.ts   # Wishlist state
│   │   └── settingsStore.ts   # App settings
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   ├── useOffline.ts
│   │   └── useBiometric.ts
│   │
│   ├── utils/                 # Helper functions
│   │   ├── storage.ts         # AsyncStorage/MMKV wrapper
│   │   ├── validation.ts      # Form validation
│   │   ├── formatting.ts      # Date/price formatting
│   │   ├── errorHandler.ts    # Error handling
│   │   └── cache.ts           # Cache management
│   │
│   ├── types/                 # TypeScript types
│   │   ├── api.ts             # API types
│   │   ├── models.ts          # Data models
│   │   ├── navigation.ts      # Navigation types
│   │   └── index.ts           # Exports
│   │
│   ├── constants/             # App constants
│   │   ├── config.ts          # App configuration
│   │   ├── endpoints.ts       # API endpoints
│   │   └── strings.ts         # Static strings
│   │
│   ├── theme/                 # Theme configuration
│   │   ├── colors.ts          # Color palette
│   │   ├── typography.ts      # Font styles
│   │   ├── spacing.ts         # Spacing scale
│   │   ├── shadows.ts         # Shadow styles
│   │   └── index.ts           # Theme object
│   │
│   └── assets/                # Static assets
│       ├── images/
│       ├── fonts/
│       └── icons/
│
├── android/                   # Android native code
├── __tests__/                 # Test files
├── .env.example               # Environment template
├── .env.development
├── .env.production
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── app.json
├── babel.config.js
├── metro.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Initialize Project

```bash
npx react-native@latest init EasyCartMobile --template react-native-template-typescript
cd EasyCartMobile
```

### 2. Install Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler

# State Management
npm install @tanstack/react-query zustand

# UI
npm install react-native-paper react-native-vector-icons

# Storage & Security
npm install @react-native-async-storage/async-storage react-native-mmkv react-native-keychain react-native-biometrics

# API
npm install axios @react-native-community/netinfo

# Images
npm install react-native-fast-image react-native-image-picker

# Camera
npm install react-native-vision-camera react-native-qrcode-scanner

# Push Notifications
npm install @react-native-firebase/app @react-native-firebase/messaging

# Performance
npm install @sentry/react-native @shopify/flash-list

# Utilities
npm install react-native-toast-message date-fns react-hook-form zod

# Dev Dependencies
npm install --save-dev @types/react @types/react-native
```

### 3. Configure Environment

Create `.env.development`:
```env
API_BASE_URL=http://localhost:8000/api
MPESA_SHORTCODE=174379
SENTRY_DSN=your-sentry-dsn
FIREBASE_API_KEY=your-firebase-key
```

Create `.env.production`:
```env
API_BASE_URL=https://api.easycart.com/api
MPESA_SHORTCODE=174379
SENTRY_DSN=your-sentry-dsn
FIREBASE_API_KEY=your-firebase-key
```

---

## 📱 Mobile-Specific Features

### 1. Biometric Authentication
- Fingerprint/Face ID for quick login
- Secure credential storage in Keychain
- Fallback to PIN if biometric fails

### 2. Offline Mode
- Cache product listings locally
- Queue cart actions when offline
- Sync automatically when online
- Offline indicator UI

### 3. Push Notifications
- Order status updates
- Payment confirmations
- Promotional offers
- Cart abandonment reminders

### 4. QR/Barcode Scanner
- Product search by barcode
- Quick add to cart
- Price comparison

### 5. Native Features
- Pull-to-refresh on all lists
- Swipe gestures (delete, move)
- Haptic feedback
- Native share functionality
- Deep linking
- Camera for profile pictures

### 6. Performance Optimizations
- FlatList/FlashList for virtualized lists
- Image lazy loading & caching
- Request debouncing
- Memoization
- Code splitting
- Bundle optimization

---

## 🔒 Security Best Practices

### Token Storage
```typescript
// Use react-native-keychain for JWT tokens
import * as Keychain from 'react-native-keychain';

// Store tokens securely
await Keychain.setGenericPassword('access_token', token, {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
  securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE
});

// Retrieve tokens
const credentials = await Keychain.getGenericPassword();
```

### API Security
- Certificate pinning for API calls
- Encrypted local storage for sensitive data
- Input validation on all forms
- XSS prevention
- SQL injection prevention

### Session Management
- Auto-logout on token expiration
- Background task restrictions
- Screenshot prevention on sensitive screens

---

## 🧪 Testing Strategy

### Unit Tests
- Utilities, helpers, pure functions
- State management (stores)
- Custom hooks

### Component Tests
- UI components with React Native Testing Library
- Snapshot tests for visual regression

### Integration Tests
- API calls with mocked responses
- Navigation flows
- Form submissions

### E2E Tests (Detox)
- Login/Register flow
- Product browsing
- Add to cart
- Checkout process
- Order placement

---

## 📈 Performance Targets

- **App Launch**: < 2 seconds
- **Screen Transitions**: < 300ms
- **API Response Time**: < 1 second
- **Image Load Time**: < 500ms (cached), < 2s (network)
- **Frame Rate**: 60fps (scrolling, animations)
- **Memory Usage**: < 150MB (active)
- **Bundle Size**: < 50MB (initial)

---

## 🎨 Design System

### Color Palette
```typescript
export const colors = {
  primary: '#3B82F6',      // Blue
  secondary: '#10B981',    // Green
  accent: '#F59E0B',       // Amber
  error: '#EF4444',        // Red
  warning: '#F59E0B',      // Amber
  success: '#10B981',      // Green
  info: '#3B82F6',         // Blue

  // Neutrals
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',

  // Dark mode
  backgroundDark: '#111827',
  surfaceDark: '#1F2937',
  textDark: '#F9FAFB',
  textSecondaryDark: '#9CA3AF',
  borderDark: '#374151',
};
```

### Typography Scale
```typescript
export const typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
};
```

### Spacing Scale
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

---

## 📅 Implementation Timeline

### Week 1: Foundation & Authentication
- ✅ Project setup & configuration
- ✅ Folder structure
- ✅ API client with interceptors
- ✅ Navigation structure
- ✅ Theme & design system
- ✅ Login screen
- ✅ Register screen
- ✅ OTP verification
- ✅ Biometric authentication
- ✅ Token management

### Week 2: Products & Cart
- ✅ Home screen
- ✅ Product listing (FlatList)
- ✅ Product detail screen
- ✅ Category browsing
- ✅ Search functionality
- ✅ Filters & sorting
- ✅ Cart screen
- ✅ Cart management
- ✅ Wishlist feature
- ✅ Offline product caching

### Week 3: Checkout & Orders
- ✅ Checkout flow
- ✅ Address management
- ✅ M-Pesa integration
- ✅ Payment status polling
- ✅ Order confirmation
- ✅ Order history
- ✅ Order tracking
- ✅ Order details
- ✅ Reorder functionality

### Week 4: Profile & Polish
- ✅ User profile screen
- ✅ Edit profile
- ✅ Settings screen
- ✅ Push notifications
- ✅ QR/Barcode scanner
- ✅ Dark mode
- ✅ Performance optimization
- ✅ Bug fixes
- ✅ Testing
- ✅ Play Store preparation

---

## 🚢 Deployment

### Android Build
```bash
# Generate release APK
cd android
./gradlew assembleRelease

# Generate AAB for Play Store
./gradlew bundleRelease
```

### Play Store Checklist
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone & tablet)
- [ ] Privacy policy
- [ ] App description
- [ ] Category selection
- [ ] Content rating
- [ ] Pricing & distribution
- [ ] Signed release build

---

## 📚 Documentation

- **API Documentation**: See API endpoints section above
- **Component Documentation**: Storybook (optional)
- **Architecture Decisions**: ADRs in `/docs/adr/`
- **Release Notes**: `CHANGELOG.md`
- **Contributing Guide**: `CONTRIBUTING.md`

---

## 🎯 Success Metrics

### Technical
- 100% feature parity with web app
- < 1% crash rate
- 4.5+ star rating on Play Store
- < 5s average screen load time

### Business
- 50K+ downloads in first 3 months
- 40%+ conversion rate (install to purchase)
- 60%+ retention rate (7-day)
- 70%+ push notification opt-in

---

## 🔗 Resources

- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [React Native Paper](https://reactnativepaper.com/)
- [M-Pesa API Docs](https://developer.safaricom.co.ke/)

---

**Ready to build a world-class mobile e-commerce experience! 🚀**
