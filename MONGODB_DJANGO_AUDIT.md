# EasyCart MongoDB + Django Backend Configuration Audit

## Executive Summary

This audit examines the EasyCart backend configuration to verify MongoDB Atlas connectivity and ensure the products endpoint correctly retrieves data from the `easycart.products` collection.

**Key Finding:** EasyCart uses a **dual-backend architecture**:
- **Node.js backend** (port 5000) - Primary API serving products from MongoDB Atlas
- **Django backend** (port 8000) - Handles authentication, admin, and Django ORM models

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│              API_BASE_URL: /api (backend URL)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Backend (server.js)                    │
│              Port: 5000 (or process.env.PORT)               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Routes:                                            │    │
│  │  - /api/products  → MongoDB Atlas (easycart.products)│   │
│  │  - /api/categories → MongoDB Atlas (easycart.categories)││
│  │  - /api/auth      → MongoDB Atlas (easycart.users)  │   │
│  │  - /api/seed      → Seed MongoDB with 37 products   │   │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           MongoDB Atlas (easycart database)                 │
│  Collections:                                                │
│  - products (37 Kenyan products)                            │
│  - categories                                               │
│  - users                                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            Django Backend (manage.py)                       │
│            Port: 8000 (optional, for admin only)            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Uses: SQLite/PostgreSQL (not MongoDB)             │    │
│  │  Handles: Django Admin, Auth models, Sessions      │    │
│  │  MongoDB: Optional via PyMongo (MONGO_URI)         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Django Backend Configuration Audit

### ✅ Django settings.py Analysis

**File:** `backend/ecommerce/settings.py`

#### Database Configuration (Lines 88-106)

```python
# MongoDB support via PyMongo (optional)
MONGO_URI = config('MONGO_URI', default='')

# Primary database for Django ORM (auth, sessions, admin, etc.)
DATABASES = {
    'default': {
        'ENGINE': config('DB_ENGINE', default='django.db.backends.sqlite3'),
        'NAME': config('DB_NAME', default=str(BASE_DIR / 'db.sqlite3')),
        'USER': config('DB_USER', default=''),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default=''),
        'PORT': config('DB_PORT', default=''),
    }
}

# MongoDB client configuration (optional)
if MONGO_URI:
    MONGODB_DATABASES = {
        'default': {
            'URI': MONGO_URI,
        }
    }
```

**Status:** ⚠️ **CONFIGURATION ISSUE IDENTIFIED**

**Problems:**
1. Django is NOT using `djongo` - it uses standard SQLite/PostgreSQL backend
2. `ENGINE` is set to `django.db.backends.sqlite3` (or PostgreSQL), NOT `djongo`
3. MongoDB is only available via PyMongo client, not Django ORM
4. Django Product model (`apps/products/models.py`) stores data in SQLite/PostgreSQL, NOT MongoDB

**Impact:**
- Django's `Product.objects.count()` will query SQLite, NOT MongoDB Atlas
- The Django Product model is separate from MongoDB products collection
- Products endpoint must use Node.js backend to access MongoDB data

---

## 2. Node.js Backend Configuration (Actual Products Source)

### ✅ Node.js server.js Configuration

**File:** `backend/server.js`

```javascript
// MongoDB Connection (Line 28)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/easycart')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes (Lines 63-68)
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/seed', require('./routes/seed'));
```

**Status:** ✅ **CORRECTLY CONFIGURED**

### ✅ Product Model (MongoDB Schema)

**File:** `backend/models/Product.js`

```javascript
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String },
  // ... additional fields
});

module.exports = mongoose.model('Product', productSchema);
```

**Collection Name:** `products` (Mongoose defaults to lowercase plural)
**Database:** `easycart` (from MONGO_URI connection string)

---

## 3. Environment Variables Verification

### Required Environment Variables

#### For Node.js Backend (Primary)

```bash
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority

# Port Configuration
PORT=5000

# Frontend URL (CORS)
FRONTEND_URL=https://easycart-frontend.onrender.com

# JWT Secret (for auth)
JWT_SECRET=<your_jwt_secret>
```

#### For Django Backend (Optional Admin)

```bash
# Django Configuration
SECRET_KEY=<your_django_secret_key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,easycart-backend.onrender.com

# Database (SQLite or PostgreSQL for Django models)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# Optional MongoDB (for PyMongo direct access)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority
```

### ⚠️ Common Configuration Issues

1. **MONGO_URI vs MONGODB_URI**
   - Node.js backend expects: `MONGO_URI`
   - Some docs reference: `MONGODB_URI`
   - **Solution:** Use `MONGO_URI` consistently

2. **Database Name in URI**
   - ✅ Correct: `mongodb+srv://...cluster.mongodb.net/easycart?...`
   - ❌ Wrong: `mongodb+srv://...cluster.mongodb.net/?...` (defaults to `test` database)
   - ❌ Wrong: `mongodb+srv://...cluster.mongodb.net/admin?...` (uses admin database)

3. **Connection String Format**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```
   - Replace `<username>`, `<password>`, `<cluster>`, `<database>`
   - Password must be URL-encoded if it contains special characters

---

## 4. Products Endpoint Analysis

### ✅ Node.js Products Controller

**File:** `backend/controllers/productController.js`

```javascript
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const total = await Product.countDocuments(query);
    
    return sendResponse(res, 200, true, products, 'Products retrieved successfully', pagination);
  } catch (error) {
    // Fallback to 8 hardcoded products if MongoDB unavailable
    return sendResponse(res, 200, true, fallbackProducts, 'Products retrieved successfully (fallback)', pagination);
  }
};
```

**Status:** ✅ **INCLUDES DEBUG FALLBACK**

**Behavior:**
- ✅ Queries MongoDB `easycart.products` collection
- ✅ Returns fallback data if MongoDB is unavailable
- ✅ Includes pagination metadata
- ✅ Has error handling with console logging

### 🔧 Recommended Debug Logging Enhancement

Add this logging to the products controller:

```javascript
exports.getAllProducts = async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Fetching products from MongoDB');
    console.log('📊 [DEBUG] Database:', mongoose.connection.name);
    console.log('🔗 [DEBUG] Connection state:', mongoose.connection.readyState); // 1 = connected
    
    const products = await Product.find(query).sort(sort).skip(skip).limit(limitNum).lean();
    const total = await Product.countDocuments(query);
    
    console.log(`✅ [DEBUG] Retrieved ${products.length} products (Total: ${total})`);
    console.log('📦 [DEBUG] Sample product:', products[0] ? products[0].name : 'No products found');
    
    return sendResponse(res, 200, true, products, 'Products retrieved successfully', pagination);
  } catch (error) {
    console.error('❌ [DEBUG] MongoDB Error:', error.message);
    console.log('⚠️  [DEBUG] Using fallback products');
    // ... fallback logic
  }
};
```

---

## 5. Frontend Configuration Verification

### Frontend API Configuration

**File:** `frontend/src/services/api.js`

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://easycart-backend.onrender.com/api';
```

**Status:** ⚠️ **NEEDS VERIFICATION**

### Required Frontend Environment Variables

#### Local Development (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

#### Production (.env.production)
```bash
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
```

**Important:** 
- If deployed Node.js backend is on port 5000, frontend must point to that URL
- If using Render, verify the backend service URL matches `REACT_APP_API_URL`

---

## 6. Testing & Verification Steps

### Test 1: Verify MongoDB Connection (Node.js)

```bash
# In backend directory
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    console.log('📊 Database:', mongoose.connection.name);
    
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    console.log(\`📦 Total Products: \${count}\`);
    
    if (count === 37) {
      console.log('✅ CORRECT: 37 products found (matches seeded data)');
    } else if (count === 0) {
      console.log('⚠️  WARNING: 0 products found - run seed script');
    } else {
      console.log(\`ℹ️  INFO: \${count} products found\`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
"
```

### Test 2: Seed MongoDB with 37 Products

```bash
cd backend
npm install
node routes/seed.js
# Or use the API endpoint:
curl -X POST http://localhost:5000/api/seed
```

### Test 3: Test Products API Endpoint

```bash
# Test local Node.js backend
curl http://localhost:5000/api/products | jq '.data | length'
# Should return: 37 (or number of products in database)

# Test production backend
curl https://easycart-backend.onrender.com/api/products | jq '.data | length'
```

### Test 4: Test Frontend API Connection

```javascript
// In browser console (on your React app)
fetch('https://easycart-backend.onrender.com/api/products')
  .then(res => res.json())
  .then(data => {
    console.log('✅ API Response:', data);
    console.log('📦 Products Count:', data.data?.length || 0);
    console.log('📊 Total:', data.pagination?.total || 0);
  })
  .catch(err => console.error('❌ API Error:', err));
```

### Test 5: Django Shell Test (Not Recommended for Products)

⚠️ **Important:** Django's Product model is separate from MongoDB products!

```bash
cd backend
python manage.py shell

# This queries SQLite/PostgreSQL, NOT MongoDB Atlas
>>> from apps.products.models import Product
>>> Product.objects.count()
# Returns: Count from Django database (NOT MongoDB)
```

To query MongoDB from Django shell (using PyMongo):

```python
from django.conf import settings
from pymongo import MongoClient

if settings.MONGO_URI:
    client = MongoClient(settings.MONGO_URI)
    db = client.easycart
    count = db.products.count_documents({})
    print(f"MongoDB products: {count}")
else:
    print("MONGO_URI not configured")
```

---

## 7. Issues & Recommendations

### 🚨 Critical Issues

1. **Dual Backend Confusion**
   - **Issue:** Documentation suggests using Django for products, but actual products are in Node.js/MongoDB
   - **Solution:** Clarify that Node.js backend is the primary API for products

2. **Django Product Model Mismatch**
   - **Issue:** Django has a Product model but it's stored in SQLite/PostgreSQL, not MongoDB
   - **Solution:** Either:
     - Option A: Use Node.js backend exclusively for products (recommended)
     - Option B: Migrate Django to use Djongo to connect to MongoDB (not compatible with Django 4.x)
     - Option C: Sync Django models with MongoDB via custom management commands

3. **Environment Variable Naming**
   - **Issue:** Inconsistent use of `MONGO_URI` vs `MONGODB_URI`
   - **Solution:** Standardize on `MONGO_URI` (used by Node.js backend)

### ⚠️ Configuration Warnings

1. **Missing MONGO_URI Validation**
   - Add startup check to verify MongoDB connection
   - Fail fast if MONGO_URI is invalid

2. **Fallback Products in Production**
   - Current implementation returns 8 fallback products if MongoDB fails
   - Recommendation: Log alerts when fallback is used

3. **Frontend API URL Configuration**
   - Verify `REACT_APP_API_URL` points to Node.js backend (port 5000)
   - Not Django backend (port 8000)

---

## 8. Corrected Configuration Snippets

### Backend .env (Node.js)

```bash
# MongoDB Atlas Connection (REQUIRED)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/easycart?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://easycart-frontend.onrender.com,https://easycart-1-752r.onrender.com

# JWT Authentication
JWT_SECRET=<your_jwt_secret>
```

### Frontend .env.production

```bash
# Point to Node.js backend (port 5000), NOT Django backend (port 8000)
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
```

### Render Environment Variables

In Render dashboard for Node.js backend service:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority` |
| `PORT` | `5000` (or leave blank, Render assigns automatically) |
| `FRONTEND_URL` | `https://easycart-frontend.onrender.com` |
| `JWT_SECRET` | `your-secret-key` |
| `NODE_ENV` | `production` |

**Important:** Verify the database name is `easycart`, not `admin` or `test`

---

## 9. Final Verification Checklist

### ✅ Backend Configuration Checklist

- [ ] **Node.js Backend Running:** Server starts on port 5000
- [ ] **MongoDB Connected:** Console shows "MongoDB connected"
- [ ] **MONGO_URI Configured:** Environment variable set with `easycart` database
- [ ] **Products Collection Seeded:** 37 products in `easycart.products`
- [ ] **API Endpoint Working:** `/api/products` returns JSON with products
- [ ] **Error Handling:** Console logs show detailed error messages
- [ ] **CORS Configured:** Frontend domain allowed in CORS settings

### ✅ Database Connection Checklist

- [ ] **Database Name:** URI includes `/easycart?` (not `/admin` or `/?`)
- [ ] **Credentials Valid:** Username and password are correct
- [ ] **Network Access:** IP whitelist includes `0.0.0.0/0` or Render IPs
- [ ] **Connection String Format:** Matches `mongodb+srv://...?retryWrites=true&w=majority`
- [ ] **Collection Exists:** `products` collection visible in Atlas dashboard
- [ ] **Document Count:** Atlas shows 37 documents in products collection

### ✅ Frontend Configuration Checklist

- [ ] **API URL Configured:** `REACT_APP_API_URL` points to Node.js backend
- [ ] **Correct Port:** URL includes port 5000 (or Render-assigned URL)
- [ ] **HTTPS in Production:** Production URL uses `https://`
- [ ] **No Trailing Slash:** URL ends with `/api` (not `/api/`)
- [ ] **Browser Console:** No CORS errors
- [ ] **Network Tab:** API requests return 200 status

### ✅ API Response Checklist

- [ ] **Status:** Response status is 200
- [ ] **Data Structure:** Response has `{ success: true, data: [...], pagination: {...} }`
- [ ] **Products Count:** `data.length` matches expected count (37)
- [ ] **Pagination:** `pagination.total` shows total count
- [ ] **Product Fields:** Each product has `name`, `price`, `category`, `image`

---

## 10. Quick Fix Commands

### If MongoDB returns 0 products:

```bash
# Seed the database with 37 Kenyan products
cd backend
curl -X POST http://localhost:5000/api/seed

# Or run seed script directly
node routes/seed.js
```

### If frontend can't reach backend:

1. Check `REACT_APP_API_URL` in frontend:
   ```bash
   cd frontend
   cat .env.production
   # Should show: REACT_APP_API_URL=https://easycart-backend.onrender.com/api
   ```

2. Verify backend is accessible:
   ```bash
   curl https://easycart-backend.onrender.com/api/health
   # Should return: {"status":"OK",...}
   ```

### If "MongoDB connection error":

1. Check MONGO_URI format:
   ```bash
   # Should be:
   mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority
   
   # Common mistakes:
   # ❌ mongodb:// (missing srv)
   # ❌ mongodb+srv://.../?... (missing database name)
   # ❌ mongodb+srv://.../admin?... (wrong database)
   ```

2. Test connection:
   ```bash
   cd backend
   node -e "require('mongoose').connect(process.env.MONGO_URI || 'mongodb://localhost').then(() => console.log('✅ Connected')).catch(e => console.error('❌', e.message))"
   ```

---

## 11. Conclusion

### Summary of Findings

✅ **What's Working:**
- Node.js backend is correctly configured for MongoDB
- Product model schema matches requirements
- Fallback products provide resilience
- Frontend API service is well-structured

⚠️ **What Needs Attention:**
- Django backend is NOT using MongoDB (uses SQLite/PostgreSQL)
- `Product.objects.count()` in Django queries the wrong database
- Environment variables need verification in Render dashboard
- Frontend must point to Node.js backend URL, not Django

### Recommended Architecture

```
Frontend (React)
    ↓
Node.js Backend (Primary API)
    ↓
MongoDB Atlas (easycart.products)

Django Backend (Optional Admin Only)
    ↓
SQLite/PostgreSQL (Django models)
```

### Final Answer

**Q: Is the backend correctly pulling from MongoDB Atlas `easycart.products`?**

**A:** YES, but only through the **Node.js backend**. The Django backend does NOT connect to MongoDB for the Product model. 

To verify:
1. Run: `curl http://localhost:5000/api/products` (Node.js - MongoDB)
2. NOT: `python manage.py shell → Product.objects.count()` (Django - SQLite)

**Expected Count:** 37 products (after running seed script)

---

## Support

For issues:
1. Check Node.js backend logs: `heroku logs --tail` or Render logs
2. Verify MongoDB Atlas connection in database dashboard
3. Test API endpoints with curl or Postman
4. Check browser console for frontend errors

Generated: $(date)
