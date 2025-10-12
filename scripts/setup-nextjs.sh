#!/bin/bash

# EasyCart Next.js 14 Setup Script - Phase 1
# This script sets up a complete Next.js 14 application with App Router

set -e  # Exit on error

echo "🚀 EasyCart Next.js 14 Migration - Phase 1 Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NEXTJS_DIR="$PROJECT_ROOT/easycart-nextjs"

echo -e "${BLUE}📂 Project root: $PROJECT_ROOT${NC}"
echo ""

# Check if Next.js directory already exists
if [ -d "$NEXTJS_DIR" ]; then
    echo -e "${YELLOW}⚠️  Directory 'easycart-nextjs' already exists${NC}"
    echo "Do you want to remove it and start fresh? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Removing existing directory..."
        rm -rf "$NEXTJS_DIR"
    else
        echo "Aborting setup. Please remove the directory manually or use a different name."
        exit 1
    fi
fi

# Step 1: Create Next.js app
echo -e "${BLUE}Step 1: Creating Next.js 14 app with TypeScript and Tailwind...${NC}"
cd "$PROJECT_ROOT"

# Use create-next-app with all options
npx create-next-app@latest easycart-nextjs \
    --typescript \
    --tailwind \
    --app \
    --no-src-dir \
    --import-alias "@/*" \
    --use-npm

cd "$NEXTJS_DIR"

# Step 2: Install additional dependencies
echo ""
echo -e "${BLUE}Step 2: Installing additional dependencies...${NC}"

# Production dependencies
npm install mongoose bcryptjs jsonwebtoken zod zustand @tanstack/react-query next-auth sharp

# Dev dependencies
npm install -D @types/bcryptjs @types/jsonwebtoken

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Create directory structure
echo ""
echo -e "${BLUE}Step 3: Creating project structure...${NC}"

mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/register
mkdir -p app/\(shop\)/products
mkdir -p app/\(shop\)/cart
mkdir -p app/\(shop\)/checkout
mkdir -p app/api/products
mkdir -p app/api/auth
mkdir -p app/api/health
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/features
mkdir -p lib
mkdir -p types

echo -e "${GREEN}✅ Directory structure created${NC}"

# Step 4: Create configuration files
echo ""
echo -e "${BLUE}Step 4: Creating configuration files...${NC}"

# Create .env.local
cat > .env.local << 'EOF'
# Database
MONGODB_URI=mongodb://localhost:27017/easycart

# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=replace-with-random-secret

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EOF

# Create .env.example
cat > .env.example << 'EOF'
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
EOF

# Update next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'easycart-j6ue.onrender.com', 'localhost'],
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
EOF

# Update package.json scripts
cat > package-temp.json << 'EOF'
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
EOF

# Merge scripts into package.json
node -e "
const pkg = require('./package.json');
const temp = require('./package-temp.json');
pkg.scripts = { ...pkg.scripts, ...temp.scripts };
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"
rm package-temp.json

echo -e "${GREEN}✅ Configuration files created${NC}"

# Step 5: Create core files
echo ""
echo -e "${BLUE}Step 5: Creating core application files...${NC}"

# lib/db.ts
cat > lib/db.ts << 'EOF'
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
EOF

# lib/utils.ts
cat > lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(price)
}
EOF

# types/index.ts
cat > types/index.ts << 'EOF'
export interface Product {
  id: string
  name: string
  price: number
  description?: string
  image?: string
  category?: string
  stock: number
  createdAt?: Date
  updatedAt?: Date
}

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export interface CartItem {
  product: Product
  quantity: number
}
EOF

# middleware.ts
cat > middleware.ts << 'EOF'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' || path === '/register' || path === '/' || path.startsWith('/products')
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
EOF

# app/page.tsx
cat > app/page.tsx << 'EOF'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          Welcome to EasyCart
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Next.js 14 with App Router - Phase 1 Complete
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/products"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Products
          </Link>
          <Link 
            href="/login"
            className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}
EOF

# app/api/health/route.ts
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'

export async function GET() {
  try {
    await connectDB()
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
EOF

echo -e "${GREEN}✅ Core files created${NC}"

# Step 6: Install additional UI dependencies
echo ""
echo -e "${BLUE}Step 6: Installing UI dependencies...${NC}"
npm install clsx tailwind-merge tailwindcss-animate

echo -e "${GREEN}✅ UI dependencies installed${NC}"

# Step 7: Create README
cat > README.md << 'EOF'
# EasyCart Next.js 14

This is the Next.js 14 migration of EasyCart e-commerce platform.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable React components
- `lib/` - Utility functions and configurations
- `types/` - TypeScript type definitions

## Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## Documentation

See [PHASE_1_IMPLEMENTATION.md](../PHASE_1_IMPLEMENTATION.md) for detailed documentation.
EOF

echo ""
echo -e "${GREEN}✅✅✅ Phase 1 Setup Complete! ✅✅✅${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. cd easycart-nextjs"
echo "2. Update .env.local with your MongoDB URI"
echo "3. npm run dev"
echo "4. Open http://localhost:3001"
echo ""
echo -e "${YELLOW}📝 Running alongside existing app:${NC}"
echo "- CRA app: http://localhost:3000"
echo "- Next.js app: http://localhost:3001"
echo "- Backend API: http://localhost:5000"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
