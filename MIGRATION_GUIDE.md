# EasyCart Full-Stack Migration Guide

## 🎯 Executive Summary

This guide provides a complete roadmap for migrating EasyCart from Create React App to Next.js 14 with optional PostgreSQL integration.

---

## 📊 Current System Overview

### Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React CRA     │────▶│  Express API    │────▶│    MongoDB      │
│  (Port 3000)    │     │  (Port 5000)    │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        │
        ▼
┌─────────────────┐
│ Admin Dashboard │
│  (Port 3001)    │
└─────────────────┘
```

### Technology Stack
| Component | Current | Target |
|-----------|---------|--------|
| Frontend | React 18 + CRA | Next.js 14 App Router |
| Backend | Express + Node.js | Next.js API Routes |
| Database | MongoDB | MongoDB or PostgreSQL |
| Auth | JWT (custom) | NextAuth.js |
| State | Context API | Zustand + React Query |
| Styling | Tailwind CSS | Tailwind CSS (unchanged) |

---

## 🚦 Migration Approach Options

### Option A: Incremental (Recommended)
**Timeline**: 12-14 weeks  
**Risk**: Low  
**Database**: Keep MongoDB  

**Pros**:
- ✅ Lower risk
- ✅ Faster delivery
- ✅ No data migration
- ✅ Easy rollback

**Cons**:
- ❌ Still using MongoDB (if goal is SQL)
- ❌ Gradual UX improvements

### Option B: Complete Rebuild
**Timeline**: 16-20 weeks  
**Risk**: High  
**Database**: PostgreSQL + Prisma  

**Pros**:
- ✅ Modern tech stack
- ✅ Better scalability
- ✅ SQL benefits

**Cons**:
- ❌ Complex data migration
- ❌ Longer timeline
- ❌ Higher risk

### Option C: Parallel Development
**Timeline**: 8-12 weeks (with dedicated team)  
**Risk**: Medium  
**Database**: Your choice  

**Pros**:
- ✅ Faster with dedicated team
- ✅ Current app stays stable
- ✅ Can compare before switching

**Cons**:
- ❌ Requires more developers
- ❌ Duplicate effort initially

---

## 📋 Detailed Phase Breakdown

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up Next.js 14 infrastructure

#### Tasks
- [x] Create Next.js 14 app structure
- [ ] Configure TypeScript and ESLint
- [ ] Set up Tailwind CSS
- [ ] Create basic layouts
- [ ] Configure path aliases
- [ ] Set up environment variables

#### Deliverables
- Next.js app running on port 3001
- Basic routing structure
- Development environment ready

#### Commands
```bash
# Automated setup
cd /home/runner/work/EasyCart/EasyCart
chmod +x scripts/setup-nextjs.sh
./scripts/setup-nextjs.sh

# Or manual setup
npx create-next-app@latest easycart-nextjs --typescript --tailwind --app
```

---

### Phase 2: Database Strategy (Week 2)

#### Option A: MongoDB (Recommended for speed)
```typescript
// lib/mongodb.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
  }
  cached.conn = await cached.promise
  return cached.conn
}
```

**Time to implement**: 1-2 days  
**Data migration**: None required

#### Option B: PostgreSQL + Prisma
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  price       Float
  description String?
  image       String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  stock       Int      @default(0)
  orderItems  OrderItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  products Product[]
}

model Order {
  id         String      @id @default(cuid())
  userId     String
  user       User        @relation(fields: [userId], references: [id])
  total      Float
  status     OrderStatus @default(PENDING)
  items      OrderItem[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

**Time to implement**: 1-2 weeks  
**Data migration**: Required from MongoDB

---

### Phase 3: API Routes Migration (Week 3-5)

#### Example: Product API Route
```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    
    const query = category ? { category } : {}
    
    const products = await Product.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
    
    const total = await Product.countDocuments(query)
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate with Zod
    const productData = productSchema.parse(body)
    
    const product = await Product.create(productData)
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
```

#### APIs to Migrate
- [ ] `/api/products` - Product listing and CRUD
- [ ] `/api/products/[id]` - Single product
- [ ] `/api/categories` - Category management
- [ ] `/api/auth/login` - Authentication
- [ ] `/api/auth/register` - User registration
- [ ] `/api/orders` - Order management
- [ ] `/api/cart` - Shopping cart
- [ ] `/api/upload` - Image uploads

---

### Phase 4: Authentication (Week 5-6)

#### NextAuth.js Setup
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await User.findOne({ email: credentials.email })
        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

---

### Phase 5: Frontend Pages (Week 7-9)

#### Server Component Example
```typescript
// app/products/page.tsx
import { Suspense } from 'react'
import ProductGrid from '@/components/ProductGrid'
import ProductSkeleton from '@/components/ProductSkeleton'

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
    next: { revalidate: 60 } // ISR: revalidate every 60 seconds
  })
  
  if (!res.ok) throw new Error('Failed to fetch products')
  
  return res.json()
}

export default async function ProductsPage() {
  const { products } = await getProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductGrid products={products} />
      </Suspense>
    </div>
  )
}
```

#### Client Component Example
```typescript
// components/ProductGrid.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ProductCard from './ProductCard'

export default function ProductGrid({ initialProducts }) {
  const [page, setPage] = useState(1)
  
  const { data, isLoading } = useQuery({
    queryKey: ['products', page],
    queryFn: async () => {
      const res = await fetch(`/api/products?page=${page}`)
      return res.json()
    },
    initialData: initialProducts,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {data.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

---

### Phase 6: State Management (Week 9)

#### Zustand Store
```typescript
// stores/cartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => set((state) => {
        const existingItem = state.items.find(item => item.id === product.id)
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
        }
        return {
          items: [...state.items, { ...product, quantity: 1 }]
        }
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      })),
      clearCart: () => set({ items: [] }),
      total: () => {
        const items = get().items
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage',
    }
  )
)
```

---

## 🎯 Quick Win: Start with Phase 1

You can start immediately with Phase 1, which is low-risk and doesn't affect the existing system:

```bash
cd /home/runner/work/EasyCart/EasyCart
chmod +x scripts/setup-nextjs.sh
./scripts/setup-nextjs.sh
```

This creates a parallel Next.js app you can develop without disrupting the current CRA app.

---

## 📊 Progress Tracking

Use this checklist to track your migration:

### Foundation
- [ ] Phase 1: Next.js 14 setup complete
- [ ] Database strategy decided
- [ ] Development environment configured

### Backend
- [ ] API routes migrated
- [ ] Authentication implemented
- [ ] Database connected
- [ ] File uploads working

### Frontend
- [ ] Home page migrated
- [ ] Product listing migrated
- [ ] Product details migrated
- [ ] Cart functionality migrated
- [ ] Checkout process migrated
- [ ] User dashboard migrated

### Admin
- [ ] Admin authentication
- [ ] Product management
- [ ] Order management
- [ ] User management

### Testing & Launch
- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security audit complete
- [ ] Staging deployment
- [ ] Production deployment

---

## 🚨 Important Reminders

1. **Backup Everything**: Before making changes, backup your database and code
2. **Test Incrementally**: Test each phase before moving to the next
3. **Monitor Performance**: Track metrics throughout migration
4. **User Communication**: Keep users informed of changes
5. **Rollback Plan**: Always have a way to revert changes

---

## 📞 Support

For questions or issues during migration:
- Check [PHASE_1_IMPLEMENTATION.md](./PHASE_1_IMPLEMENTATION.md)
- Review [NEXTJS_MIGRATION_PLAN.md](./NEXTJS_MIGRATION_PLAN.md)
- Consult [Next.js documentation](https://nextjs.org/docs)

---

**Last Updated**: 2025-10-12  
**Version**: 1.0
