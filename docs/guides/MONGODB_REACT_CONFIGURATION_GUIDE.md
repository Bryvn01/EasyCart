# MongoDB to React Frontend - Configuration Guide

## Overview

This guide helps you configure the connection between MongoDB, Express.js backend, and React frontend for the EasyCart products feature.

---

## 1. Backend Configuration

### Environment Variables (`.env`)

Create a `.env` file in the `backend/` directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection
# IMPORTANT: For MongoDB Atlas, use your cluster connection string
# Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/easycart?retryWrites=true&w=majority

# For local MongoDB:
# MONGO_URI=mongodb://localhost:27017/easycart

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:3000,http://localhost:3001,https://easycart-1-752r.onrender.com

# Cloudinary (optional, for image uploads)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**:
   - Create a new cluster (Free tier is fine for development)
   - Choose a region close to your users

3. **Configure Database Access**:
   - Database Access → Add New Database User
   - Create username and password
   - Grant "Read and write to any database" permissions

4. **Configure Network Access**:
   - Network Access → Add IP Address
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's specific IP address

5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `easycart`

### Verify Backend Connection

Test your MongoDB connection:

```bash
cd backend
node -e "
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/easycart';
mongoose.connect(uri).then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('Database:', mongoose.connection.name);
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
"
```

---

## 2. Frontend Configuration

### Environment Variables (`.env`)

Create a `.env` file in the `frontend/` directory:

```bash
# React Configuration
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true

# API Configuration
# IMPORTANT: No trailing slash!
REACT_APP_API_URL=http://localhost:5000/api

# For production (Render):
# REACT_APP_API_URL=https://easycart-backend.onrender.com/api

# Site Configuration (optional)
REACT_APP_SITE_NAME=EasyCart
```

### API URL Configuration

The frontend needs to know where the backend API is hosted:

- **Local Development**: `http://localhost:5000/api`
- **Production**: Your backend deployment URL + `/api`

**Important**: Do NOT include a trailing slash in `REACT_APP_API_URL`!

✅ Correct: `https://easycart-backend.onrender.com/api`
❌ Wrong: `https://easycart-backend.onrender.com/api/`

---

## 3. Testing the Integration

### Backend Tests

```bash
cd backend
npm install
npm test -- tests/products-api.test.js
```

Expected output:
```
✅ API returned 8 total products, 8 in this page
✅ Pagination works: page 1, limit 5
✅ Search returned X products
✅ Category filter returned X products
✅ Price filter endpoint responded with X products
✅ Product detail returned: iPhone 14 Pro

Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
```

### Frontend Tests

```bash
cd frontend
npm install
npm test -- src/hooks/__tests__/useProducts.test.js
```

Expected output:
```
✓ should fetch products successfully with DRF-compatible response
✓ should handle API errors gracefully

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

### Manual Integration Test

1. **Start Backend**:
```bash
cd backend
npm start
```

2. **Start Frontend** (in a new terminal):
```bash
cd frontend
npm start
```

3. **Test in Browser**:
   - Navigate to `http://localhost:3000/products`
   - You should see products displayed (or fallback products if MongoDB is not connected)
   - Test search functionality
   - Test category filtering
   - Test price range filtering

---

## 4. API Response Format

The backend now returns a hybrid format compatible with both Express and Django REST Framework clients:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [...],           // Express format
  "results": [...],        // DRF format (same as data)
  "count": 37,             // Total count (DRF format)
  "next": true,            // Has next page (DRF format)
  "previous": false,       // Has previous page (DRF format)
  "pagination": {          // Express format (detailed)
    "page": 1,
    "limit": 20,
    "total": 37,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

The frontend's `useProducts` hook handles both formats automatically:
- First tries `response.data.results` (DRF format)
- Falls back to `response.data` if results not found

---

## 5. Deployment Configuration

### Render.com (Recommended)

#### Backend Deployment

1. **Create Web Service**:
   - Service Type: Web Service
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables** (Add in Render Dashboard):
   ```
   MONGO_URI=mongodb+srv://...
   PORT=5000
   JWT_SECRET=your-production-jwt-secret
   FRONTEND_URL=https://easycart-1-752r.onrender.com,https://easycart-admin.onrender.com
   NODE_ENV=production
   ```

#### Frontend Deployment

1. **Create Static Site**:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

2. **Environment Variables** (Add in Render Dashboard):
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   NODE_VERSION=18.17.0
   ```

### Vercel (Alternative for Frontend)

1. **Deploy Frontend**:
   ```bash
   cd frontend
   vercel
   ```

2. **Configure Environment Variables** in Vercel Dashboard:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```

---

## 6. Troubleshooting

### Products Page Shows "No Products Found"

**Possible Causes**:

1. **Backend not running**:
   ```bash
   # Check if backend is running
   curl http://localhost:5000/api/health
   ```

2. **Wrong API URL in frontend**:
   - Check `frontend/.env` has correct `REACT_APP_API_URL`
   - No trailing slash!
   - Restart frontend after changing `.env`

3. **MongoDB not connected**:
   - Check backend logs for MongoDB connection errors
   - Verify `MONGO_URI` in `backend/.env`
   - Check MongoDB Atlas network access settings
   - Backend will use fallback products if MongoDB is unavailable

4. **CORS issues**:
   - Check `FRONTEND_URL` in `backend/.env` includes your frontend URL
   - Check browser console for CORS errors

### MongoDB Connection Issues

**Error: "MongooseServerSelectionError"**
- Check MongoDB Atlas network access (allow your IP)
- Verify connection string has correct password
- Ensure database name is `easycart`

**Error: "Authentication failed"**
- Verify username/password in connection string
- Check database user has correct permissions

**Error: "buffering timed out"**
- MongoDB is not accessible
- Backend will use fallback products automatically
- Check connection string and network access

### API Response Format Issues

**Products not showing in frontend**:
1. Check browser console for errors
2. Check Network tab to see API response
3. Verify response has `results` or `data` key
4. The backend now includes both keys for compatibility

---

## 7. Seeding the Database

To populate your MongoDB with sample products:

```bash
cd backend
npm run seed:kenya
# or
npm run seed
```

This will create:
- 37 sample products
- Various categories
- Kenyan-specific products with proper pricing

---

## 8. Production Checklist

Before deploying to production:

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with proper permissions
- [ ] Network access configured (whitelist IPs)
- [ ] `MONGO_URI` environment variable set in backend
- [ ] `REACT_APP_API_URL` environment variable set in frontend
- [ ] `JWT_SECRET` set to a strong random value
- [ ] `FRONTEND_URL` includes all production domains
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Test products page in production
- [ ] Test search functionality
- [ ] Test filtering functionality
- [ ] Check browser console for errors
- [ ] Verify API calls in Network tab

---

## 9. Monitoring

### Backend Health Check

```bash
curl https://your-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "uptime": 12345
}
```

### Frontend API Configuration

Check the browser console when the app loads. You should see:
```
API Configuration: { baseURL: "https://your-backend.onrender.com/api" }
```

---

## 10. Support and Documentation

- **API Documentation**: [PRODUCTS_API_DOCUMENTATION.md](./PRODUCTS_API_DOCUMENTATION.md)
- **Stakeholder Guide**: [STAKEHOLDER_COMMUNICATION.md](./STAKEHOLDER_COMMUNICATION.md)
- **Environment Verification**: [ENVIRONMENT_CONFIG_VERIFICATION.md](./ENVIRONMENT_CONFIG_VERIFICATION.md)
- **GitHub Repository**: [github.com/Bryvn01/EasyCart](https://github.com/Bryvn01/EasyCart)

---

## Quick Reference

### Backend Start
```bash
cd backend
npm install
npm start
```

### Frontend Start
```bash
cd frontend
npm install
npm start
```

### Run All Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Check Logs
```bash
# Backend logs will show MongoDB connection status
# Look for: "✅ MongoDB connected successfully"
```

---

**Questions?** Open an issue on GitHub or refer to the documentation files listed above.
