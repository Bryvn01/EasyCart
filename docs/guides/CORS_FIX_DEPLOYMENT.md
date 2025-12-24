# CORS Fix - Deployment and Verification Guide

## Problem Summary
The frontend at `https://easycart-frontend-zge5.onrender.com` was unable to load products and categories due to CORS configuration mismatch. The backend CORS settings did not include the actual frontend URL.

## Root Cause
Backend's `CORS_ALLOWED_ORIGINS` only included `https://easycart-1-752r.onrender.com` but the actual deployed frontend is at `https://easycart-frontend-zge5.onrender.com`.

## Changes Applied

### 1. Backend CORS Configuration
**File**: `backend/ecommerce/settings.py`

Updated CORS_ALLOWED_ORIGINS to include the correct frontend URL:
```python
CORS_ALLOWED_ORIGINS = [
    "https://easycart-frontend-zge5.onrender.com",
    "https://easycart-admin.onrender.com"
]
```

### 2. Deployment Configuration
**File**: `render.yaml`

Updated the CORS environment variable:
```yaml
- key: CORS_ALLOWED_ORIGINS
  value: https://easycart-frontend-zge5.onrender.com,https://easycart-admin.onrender.com
```

### 3. Frontend API Configuration
**File**: `frontend/src/services/api.js`

Updated API base URL fallback to correct backend:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://easycart-backend.onrender.com/api';
```

## Deployment Steps

### Step 1: Update Backend Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to **easycart-backend** service
3. Click on **Environment** tab
4. Update or add the following environment variable:
   ```
   CORS_ALLOWED_ORIGINS=https://easycart-frontend-zge5.onrender.com,https://easycart-admin.onrender.com
   ```
5. Click **Save Changes**
6. Backend will automatically redeploy

### Step 2: Verify Backend Configuration

Wait for backend deployment to complete, then test:

```bash
# Test health endpoint
curl -v https://easycart-backend.onrender.com/api/health/

# Test products endpoint
curl -v https://easycart-backend.onrender.com/api/products/

# Test categories endpoint
curl -v https://easycart-backend.onrender.com/api/categories/
```

**Expected Results**:
- Status code: 200
- CORS headers present in response:
  ```
  access-control-allow-origin: https://easycart-frontend-zge5.onrender.com
  access-control-allow-credentials: true
  ```

### Step 3: Verify Frontend Configuration

1. Go to **easycart-frontend** service in Render Dashboard
2. Click on **Environment** tab
3. Verify `REACT_APP_API_URL` is set to:
   ```
   https://easycart-backend.onrender.com/api
   ```
4. If not set or incorrect, update and save
5. Frontend will automatically rebuild

### Step 4: Test Frontend

Once both services are deployed:

1. **Open Frontend**: https://easycart-frontend-zge5.onrender.com
2. **Open Browser DevTools** (F12)
3. **Go to Network Tab**
4. **Refresh the page**

**Expected Results**:
- ✅ Products and categories load successfully
- ✅ No CORS errors in Console tab
- ✅ Network tab shows:
  - `GET /api/products/` → Status 200
  - `GET /api/categories/` → Status 200
- ✅ "Unable to Load Content" error disappears

## Verification Checklist

### Backend Verification
- [ ] Backend service is deployed and running
- [ ] `CORS_ALLOWED_ORIGINS` environment variable includes `https://easycart-frontend-zge5.onrender.com`
- [ ] `/api/health/` endpoint returns 200
- [ ] `/api/products/` endpoint returns 200 with product data
- [ ] `/api/categories/` endpoint returns 200 with category data
- [ ] Response headers include correct CORS headers

### Frontend Verification
- [ ] Frontend service is deployed and running
- [ ] `REACT_APP_API_URL` points to `https://easycart-backend.onrender.com/api`
- [ ] Homepage loads without errors
- [ ] Products display on homepage
- [ ] Categories display in navigation
- [ ] No CORS errors in browser console
- [ ] Network tab shows successful API calls (200 status)

### Browser Testing
- [ ] Open https://easycart-frontend-zge5.onrender.com
- [ ] Products visible on homepage
- [ ] Categories visible in navigation
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] No error messages displayed

## Troubleshooting

### Issue: Still seeing CORS errors

**Solution**:
1. Verify backend environment variable is set correctly in Render Dashboard
2. Ensure backend service has redeployed after environment variable change
3. Check backend logs for CORS-related errors
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Products not loading

**Solution**:
1. Check if backend API is accessible:
   ```bash
   curl https://easycart-backend.onrender.com/api/products/
   ```
2. Verify MongoDB connection in backend logs
3. Check if database has been seeded with products
4. Verify frontend `REACT_APP_API_URL` is correct

### Issue: 404 errors on API calls

**Solution**:
1. Verify API URL format (no trailing slash): `https://easycart-backend.onrender.com/api`
2. Check frontend API service configuration
3. Verify backend routes are properly configured

### Issue: Backend service won't start

**Solution**:
1. Check backend logs in Render Dashboard
2. Verify `MONGODB_URI` is set correctly
3. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
4. Verify all required environment variables are set

## Additional Resources

- [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [README.md](README.md) - Project overview and setup

## Success Criteria

✅ **Deployment is successful when**:
1. Frontend loads without errors
2. Products and categories display correctly
3. No CORS errors in browser console
4. All API calls return 200 status codes
5. Users can browse products and categories

## Quick Test Commands

```bash
# Test backend health
curl https://easycart-backend.onrender.com/api/health/

# Test products endpoint
curl https://easycart-backend.onrender.com/api/products/

# Test categories endpoint
curl https://easycart-backend.onrender.com/api/categories/

# Test with CORS headers (simulating frontend request)
curl -H "Origin: https://easycart-frontend-zge5.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://easycart-backend.onrender.com/api/products/
```

## Contact & Support

If issues persist after following this guide:
1. Check Render service logs for both backend and frontend
2. Review browser console for detailed error messages
3. Verify all environment variables in Render Dashboard
4. Ensure MongoDB Atlas cluster is active and accessible
