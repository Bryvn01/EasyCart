# Phase 1 Implementation Guide: Next.js 14 Foundation

## 🎯 Goal
Set up a complete Next.js 14 application with App Router that can run alongside the existing CRA app.

## 📦 What We'll Create

```
easycart-nextjs/                 # New Next.js 14 app
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── (auth)/                 # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (shop)/                 # Shop route group
│   │   ├── products/
│   │   ├── cart/
│   │   └── checkout/
│   └── api/                    # API routes
│       ├── products/
│       ├── auth/
│       └── health/
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   └── features/
├── lib/
│   ├── db.ts                   # Database connection
│   ├── auth.ts                 # Auth utilities
│   └── utils.ts                # Helper functions
├── types/
│   └── index.ts                # TypeScript types
├── middleware.ts               # Route protection
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🚀 Quick Start Commands

### Option 1: Manual Setup (Recommended for learning)

```bash
# Navigate to repository root
cd /home/runner/work/EasyCart/EasyCart

# Create new Next.js 14 app with App Router
npx create-next-app@latest easycart-nextjs --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Navigate to new app
cd easycart-nextjs

# Install additional dependencies
npm install mongoose bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# Install UI library (shadcn/ui)
npx shadcn-ui@latest init

# Install state management and data fetching
npm install zustand @tanstack/react-query
npm install zod                         # Validation
npm install next-auth                   # Authentication
npm install sharp                       # Image optimization
```

### Option 2: Automated Setup Script

```bash
# We'll create a setup script for you
cd /home/runner/work/EasyCart/EasyCart
chmod +x scripts/setup-nextjs.sh
./scripts/setup-nextjs.sh
```

## 📝 Configuration Files

### 1. next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'easycart-j6ue.onrender.com'],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

### 2. .env.local
```env
# Database
MONGODB_URI=mongodb://localhost:27017/easycart

# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🗂️ Core File Structure

### app/layout.tsx
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EasyCart - Modern E-commerce',
  description: 'Shop the best products online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### app/page.tsx
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to EasyCart Next.js</h1>
      <div className="flex gap-4">
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
      </div>
    </main>
  )
}
```

### lib/db.ts
```typescript
import mongoose from 'mongoose'

declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/easycart'
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected')
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
```

### middleware.ts
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' || path === '/register' || path === '/'
  const isAuthPath = path.startsWith('/api/auth')

  // Allow public paths and auth paths
  if (isPublicPath || isAuthPath) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('next-auth.session-token')?.value || 
                request.cookies.get('__Secure-next-auth.session-token')?.value

  // Redirect to login if no token and trying to access protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
```

## 🎨 Tailwind Configuration

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

## 📦 Package.json Scripts

```json
{
  "name": "easycart-nextjs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## ✅ Verification Steps

1. **Start the Next.js app**
   ```bash
   cd easycart-nextjs
   npm run dev
   ```

2. **Verify it's running**
   - Open http://localhost:3001
   - Should see welcome page

3. **Test MongoDB connection**
   - Create a test API route
   - Verify connection in terminal logs

4. **Verify build**
   ```bash
   npm run build
   ```

## 🔧 Integration with Existing App

### Run both apps simultaneously:

Terminal 1 (Existing CRA app):
```bash
cd frontend
npm start              # Runs on port 3000
```

Terminal 2 (New Next.js app):
```bash
cd easycart-nextjs
npm run dev            # Runs on port 3001
```

Terminal 3 (Backend):
```bash
cd backend
npm start              # Runs on port 5000
```

## 📊 Success Criteria

- ✅ Next.js 14 app running on port 3001
- ✅ TypeScript configured
- ✅ Tailwind CSS working
- ✅ MongoDB connection successful
- ✅ Build completes without errors
- ✅ Can access home page
- ✅ Coexists with existing CRA app

## 🎯 Next Phase

Once Phase 1 is complete, you can proceed to:
- **Phase 2**: Database strategy decision
- **Phase 3**: API routes migration
- **Phase 4**: Authentication setup

## 📚 Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [TypeScript in Next.js](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

---

**Estimated Time**: 1-2 days for Phase 1 setup  
**Risk Level**: Low (doesn't affect existing app)  
**Prerequisites**: Node.js 18+, npm, MongoDB running
