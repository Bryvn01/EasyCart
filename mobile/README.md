# EasyCart Mobile - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- React Native CLI
- Android Studio (for Android development)
- JDK 17+

### Installation

```bash
# 1. Initialize React Native project
npx react-native@latest init EasyCartMobile --template react-native-template-typescript

# 2. Navigate to project
cd EasyCartMobile

# 3. Copy mobile folder contents from this repository
cp -r ../mobile/* .

# 4. Install dependencies
npm install

# 5. Setup environment variables
cp .env.example .env
# Edit .env with your API URL and credentials

# 6. Install pods (iOS - if targeting iOS in future)
# cd ios && pod install && cd ..

# 7. Start Metro bundler
npm start

# 8. Run on Android
npm run android
```

### Project Structure Created

```
✅ mobile/
   ├── package.json              # Dependencies
   ├── tsconfig.json             # TypeScript config
   ├── .env.example              # Environment template
   ├── MOBILE_APP_GUIDE.md       # Complete guide
   ├── src/
   │   ├── api/
   │   │   ├── client.ts         # Axios with interceptors
   │   │   ├── auth.ts           # Auth endpoints
   │   │   ├── products.ts       # Product endpoints
   │   │   └── orders.ts         # Order endpoints
   │   ├── theme/
   │   │   └── index.ts          # Design system
   │   └── utils/
   │       └── storage.ts        # Secure storage
   └── README.md                 # This file
```

## 📚 Next Steps

### 1. Review the Complete Guide
Read [MOBILE_APP_GUIDE.md](./MOBILE_APP_GUIDE.md) for comprehensive documentation including:
- Complete API endpoint mapping
- Architecture overview
- Tech stack details
- Implementation timeline
- Best practices

### 2. Required Files to Create

**TypeScript Types** (`src/types/api.ts`):
```typescript
export interface User {
  id: number;
  email: string;
  username: string;
  phone?: string;
  address?: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  category: Category;
  image: string;
  stock: number;
}

// ... (see guide for complete types)
```

**Navigation** (`src/navigation/AppNavigator.tsx`):
```typescript
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import {useAuth} from '@/hooks/useAuth';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const {isAuthenticated} = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
```

**Auth Store** (`src/store/authStore.ts`):
```typescript
import {create} from 'zustand';
import {User} from '@/types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({user, isAuthenticated: !!user}),
  logout: () => set({user: null, isAuthenticated: false}),
}));
```

### 3. Key Features to Implement

**Priority 1 (Week 1):**
- ✅ API client with JWT interceptors
- ✅ Secure storage for tokens
- ✅ Theme system
- 🔲 Authentication screens (Login, Register, OTP)
- 🔲 Biometric authentication
- 🔲 Navigation structure

**Priority 2 (Week 2):**
- 🔲 Product listing with FlatList
- 🔲 Product detail screen
- 🔲 Cart management
- 🔲 Wishlist feature
- 🔲 Search & filters
- 🔲 Offline caching

**Priority 3 (Week 3):**
- 🔲 Checkout flow
- 🔲 M-Pesa integration
- 🔲 Order history
- 🔲 Push notifications

**Priority 4 (Week 4):**
- 🔲 Profile management
- 🔲 Settings
- 🔲 Dark mode
- 🔲 Performance optimization
- 🔲 Testing & bug fixes

## 🔧 Configuration

### Environment Variables
Edit `.env`:
```env
API_BASE_URL=http://10.0.2.2:8000/api  # Android emulator
# API_BASE_URL=http://localhost:8000/api  # Physical device (use your IP)
```

### Android Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📱 Build for Production

```bash
# Android Release APK
npm run build:android

# Android App Bundle (for Play Store)
npm run bundle:android
```

## 🎯 Success Criteria

- ✅ API client with automatic token refresh
- ✅ Secure token storage in Keychain
- ✅ Material Design 3 theme system
- 🔲 100% feature parity with web app
- 🔲 Biometric authentication
- 🔲 Offline mode
- 🔲 Push notifications
- 🔲 < 2s app launch time
- 🔲 60fps scrolling

## 📖 Resources

- [Mobile App Guide](./MOBILE_APP_GUIDE.md) - Complete implementation guide
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand/)

## 🤝 Contributing

Follow the implementation timeline in the guide and use industry best practices:
- TypeScript strict mode
- ESLint + Prettier
- Atomic commits
- Unit tests for utilities and hooks
- Component tests for UI
- E2E tests for critical flows

---

**Built with ❤️ using React Native and TypeScript**
