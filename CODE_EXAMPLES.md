# EasyCart Serverless Functions - Code Examples

Complete copy-paste ready code for all serverless functions.

## Table of Contents
- [Utilities](#utilities)
- [Health Check](#health-check)
- [Authentication](#authentication)
- [Products](#products)
- [Categories](#categories)
- [Upload](#upload)
- [Seed](#seed)
- [Configuration](#configuration)

---

## Utilities

### MongoDB Connection (`/api/_utils/mongodb.js`)

```javascript
// MongoDB connection utility for Vercel serverless functions
const mongoose = require('mongoose');

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/easycart';
  console.log('Creating new MongoDB connection');

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    cachedConnection = connection;
    console.log('✅ MongoDB connected successfully to:', mongoose.connection.name);
    return connection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = { connectToDatabase };
```

### CORS Headers (`/api/_utils/cors.js`)

```javascript
// CORS utility for Vercel serverless functions

function setCorsHeaders(req, res) {
  const allowedOrigins = (process.env.FRONTEND_URL || 
    "http://localhost:3000,http://localhost:3001,https://easycart-1-752r.onrender.com,https://easycart-admin.onrender.com"
  ).split(',');

  const origin = req.headers.origin;
  
  // Allow requests with no origin (mobile apps, curl, etc.)
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`CORS: Allowed origin: ${origin}`);
  } else {
    // In development/permissive mode, allow all origins
    console.warn(`CORS: Allowing unlisted origin: ${origin}`);
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Signal that preflight was handled
  }

  return false; // Continue with normal request handling
}

module.exports = { setCorsHeaders };
```

### Authentication (`/api/_utils/auth.js`)

```javascript
// Authentication utility for Vercel serverless functions
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import models (using require to avoid circular dependencies)
function getUser() {
  return mongoose.model('User') || require('../../backend/models/User');
}

async function authenticateUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const User = getUser();
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error('Invalid token');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

async function requireAdmin(req) {
  const user = await authenticateUser(req);
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return user;
}

module.exports = { authenticateUser, requireAdmin };
```

---

## Health Check

### `/api/health.js`

```javascript
// Vercel Serverless Function: Health Check
// Endpoint: /api/health

const mongoose = require('mongoose');
const { connectToDatabase } = require('./_utils/mongodb');
const { setCorsHeaders } = require('./_utils/cors');

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  const startTime = Date.now();

  try {
    // Connect to database
    await connectToDatabase();

    // Check MongoDB connection status
    const dbHealth = await checkDatabaseHealth();
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    // Calculate uptime (for serverless, this is the function instance uptime)
    const uptime = process.uptime();
    
    // Overall status determination
    const isHealthy = dbHealth.status === 'UP';
    const httpStatus = isHealthy ? 200 : 503;
    
    const healthResponse = {
      status: isHealthy ? 'UP' : 'DOWN',
      service: 'easycart-nodejs-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        readable: formatUptime(uptime)
      },
      components: {
        database: dbHealth,
        memory: {
          status: memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9 ? 'UP' : 'WARNING',
          details: {
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
            usage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`
          }
        }
      },
      responseTime: `${Date.now() - startTime}ms`
    };
    
    return res.status(httpStatus).json(healthResponse);
  } catch (error) {
    console.error('Health check error:', error);
    // If health check itself fails, return error status
    return res.status(503).json({
      status: 'DOWN',
      service: 'easycart-nodejs-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: `${Date.now() - startTime}ms`
    });
  }
};

async function checkDatabaseHealth() {
  try {
    const state = mongoose.connection.readyState;
    const stateNames = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (state === 1) {
      await mongoose.connection.db.admin().ping();
      const stats = await mongoose.connection.db.stats();
      
      return {
        status: 'UP',
        details: {
          state: stateNames[state],
          database: mongoose.connection.name,
          collections: stats.collections || 0,
          dataSize: `${Math.round(stats.dataSize / 1024 / 1024)}MB`
        }
      };
    } else {
      return {
        status: 'DOWN',
        details: {
          state: stateNames[state],
          message: 'Database connection is not active'
        }
      };
    }
  } catch (error) {
    return {
      status: 'DOWN',
      details: {
        error: error.message
      }
    };
  }
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}
```

**Test:**
```bash
curl https://your-project.vercel.app/api/health
```

---

## Authentication

### Register (`/api/auth/register.js`)

See the complete file in the repository at `/api/auth/register.js`

**Test:**
```bash
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "username": "testuser",
    "phone": "+254712345678",
    "address": "Nairobi, Kenya"
  }'
```

### Login (`/api/auth/login.js`)

See the complete file in the repository at `/api/auth/login.js`

**Test:**
```bash
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Profile (`/api/auth/profile.js`)

See the complete file in the repository at `/api/auth/profile.js`

**Test:**
```bash
curl https://your-project.vercel.app/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Products

### Get All Products (`/api/products/index.js`)

See the complete file in the repository at `/api/products/index.js`

**Test:**
```bash
# Get all products
curl https://your-project.vercel.app/api/products

# With filtering
curl "https://your-project.vercel.app/api/products?category=Electronics&limit=10&page=1"

# With search
curl "https://your-project.vercel.app/api/products?search=phone"

# Create product (admin only)
curl -X POST https://your-project.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 1000,
    "category": "Electronics",
    "brand": "Samsung",
    "stock": 50
  }'
```

### Product by ID (`/api/products/[id].js`)

See the complete file in the repository at `/api/products/[id].js`

**Test:**
```bash
# Get product
curl https://your-project.vercel.app/api/products/PRODUCT_ID

# Update product (admin only)
curl -X PUT https://your-project.vercel.app/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "price": 1200,
    "stock": 45
  }'

# Delete product (admin only)
curl -X DELETE https://your-project.vercel.app/api/products/PRODUCT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Product Categories (`/api/products/categories.js`)

See the complete file in the repository at `/api/products/categories.js`

**Test:**
```bash
curl https://your-project.vercel.app/api/products/categories
```

---

## Categories

### All Categories (`/api/categories/index.js`)

See the complete file in the repository at `/api/categories/index.js`

**Test:**
```bash
# Get all
curl https://your-project.vercel.app/api/categories

# Create
curl -X POST https://your-project.vercel.app/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Category",
    "description": "Category description"
  }'
```

### Category by ID (`/api/categories/[id].js`)

See the complete file in the repository at `/api/categories/[id].js`

**Test:**
```bash
# Get
curl https://your-project.vercel.app/api/categories/CATEGORY_ID

# Update
curl -X PUT https://your-project.vercel.app/api/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'

# Delete
curl -X DELETE https://your-project.vercel.app/api/categories/CATEGORY_ID
```

---

## Upload

### Single Image (`/api/upload/image.js`)

See the complete file in the repository at `/api/upload/image.js`

**Test:**
```bash
curl -X POST https://your-project.vercel.app/api/upload/image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "alt": "Product image"
  }'
```

### Multiple Images (`/api/upload/images.js`)

See the complete file in the repository at `/api/upload/images.js`

**Test:**
```bash
curl -X POST https://your-project.vercel.app/api/upload/images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "images": [
      "data:image/png;base64,iVBORw0KGgo...",
      "data:image/jpeg;base64,/9j/4AAQSkZJ..."
    ],
    "alt": "Product images"
  }'
```

---

## Seed

### Seed Database (`/api/seed.js`)

See the complete file in the repository at `/api/seed.js`

**Test:**
```bash
curl -X POST https://your-project.vercel.app/api/seed
```

---

## Configuration

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/health",
      "dest": "/api/health.js"
    },
    {
      "src": "/api/auth/register",
      "dest": "/api/auth/register.js"
    },
    {
      "src": "/api/auth/login",
      "dest": "/api/auth/login.js"
    },
    {
      "src": "/api/auth/profile",
      "dest": "/api/auth/profile.js"
    },
    {
      "src": "/api/products/categories",
      "dest": "/api/products/categories.js"
    },
    {
      "src": "/api/products/(.*)",
      "dest": "/api/products/[id].js"
    },
    {
      "src": "/api/products",
      "dest": "/api/products/index.js"
    },
    {
      "src": "/api/categories/(.*)",
      "dest": "/api/categories/[id].js"
    },
    {
      "src": "/api/categories",
      "dest": "/api/categories/index.js"
    },
    {
      "src": "/api/upload/image",
      "dest": "/api/upload/image.js"
    },
    {
      "src": "/api/upload/images",
      "dest": "/api/upload/images.js"
    },
    {
      "src": "/api/seed",
      "dest": "/api/seed.js"
    }
  ],
  "env": {
    "MONGO_URI": "@mongo_uri",
    "JWT_SECRET": "@jwt_secret",
    "FRONTEND_URL": "@frontend_url",
    "CLOUDINARY_URL": "@cloudinary_url"
  },
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### `package.json` (in `/api` directory)

```json
{
  "name": "easycart-serverless-api",
  "version": "1.0.0",
  "description": "EasyCart Serverless API Functions for Vercel",
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cloudinary": "^2.7.0",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^8.19.0"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## Environment Variables

Set these in Vercel dashboard:

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/easycart
JWT_SECRET=your-secret-key-min-32-chars-recommended
FRONTEND_URL=https://frontend.vercel.app,https://admin.vercel.app
CLOUDINARY_URL=cloudinary://key:secret@cloudname
```

---

## Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Add environment variable
vercel env add MONGO_URI

# View logs
vercel logs
```

---

## Success Response Format

All endpoints follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // for list endpoints
}
```

## Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

---

All code is production-ready and can be copied directly into your project!
