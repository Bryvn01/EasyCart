# Frontend Error Handling & Troubleshooting Guide

## Overview

This guide documents the enhanced error handling system implemented in the EasyCart frontend to diagnose and resolve product/category loading failures.

## Error Types

The system now distinguishes between different error types for better debugging:

### 1. CORS Errors
**Symptoms:**
- Error message: "CORS policy error"
- Browser console shows CORS-related errors
- No response from server

**Causes:**
- Backend CORS configuration doesn't include frontend URL
- Missing CORS headers in backend response

**Solutions:**
- Verify `CORS_ALLOWED_ORIGINS` in backend includes: `https://easycart-frontend-zge5.onrender.com`
- Check backend environment variables in Render Dashboard
- Ensure `corsheaders` middleware is properly configured

**Technical Details:**
```python
# backend/ecommerce/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://easycart-frontend-zge5.onrender.com",
    "https://easycart-admin.onrender.com"
]
```

### 2. Network Errors
**Symptoms:**
- Error message: "Network error. Please check your connection."
- Request made but no response received
- Connection timeout

**Causes:**
- Backend server is down or unreachable
- DNS resolution failure
- Network connectivity issues
- Firewall blocking requests

**Solutions:**
- Check if backend is running: `curl https://easycart-backend.onrender.com/api/health/`
- Verify backend service status in Render Dashboard
- Check network connectivity
- Disable VPN/proxy if using one

### 3. Server Errors (5xx)
**Symptoms:**
- HTTP status codes 500-599
- Error message: "Server error. Please try again later."

**Causes:**
- Backend application error
- Database connection issues
- Unhandled exceptions in backend code

**Solutions:**
- Check backend logs in Render Dashboard
- Verify database connection
- Review recent backend code changes
- Check MongoDB Atlas connection string

### 4. Not Found Errors (404)
**Symptoms:**
- HTTP status code 404
- Error message: "The requested resource was not found"

**Causes:**
- Incorrect API endpoint URL
- Backend routes not properly configured
- API path mismatch

**Solutions:**
- Verify API endpoints:
  - Products: `/api/products/`
  - Categories: `/api/categories/` or `/api/products/categories`
- Check `REACT_APP_API_URL` environment variable
- Review backend URL routing configuration

### 5. Authentication Errors (401)
**Symptoms:**
- HTTP status code 401
- Error message: "Please login to continue"

**Causes:**
- Missing or expired JWT token
- Invalid authentication credentials

**Solutions:**
- Handled automatically by token refresh mechanism
- User redirected to login if refresh fails
- No manual intervention needed for most cases

## Enhanced Features

### 1. Automatic Retry with Exponential Backoff

The system automatically retries failed requests with increasing delays:

```javascript
// Retry configuration
maxRetries: 2
initialDelay: 1500ms
backoff: exponential (1.5s, 3s)
```

**Benefits:**
- Handles temporary network glitches
- Reduces false error reports
- Improves user experience

### 2. API Health Checks

Before making requests, the system checks if the API is reachable:

```javascript
const isHealthy = await checkApiHealth(apiBaseUrl);
```

**Checked Endpoints:**
1. `/api/health/`
2. `/api/health`
3. Base API URL

### 3. Detailed Error Logging (Development)

In development mode, detailed error information is logged:

```javascript
console.error('API Error Details:', {
  type: 'NETWORK',
  message: 'Network connection failed',
  technical: 'Connection timeout after 30s',
  canRetry: true,
  originalError: error
});
```

### 4. User-Friendly Error Messages

Error messages are tailored to each error type with actionable suggestions:

**NETWORK Error:**
- Check your internet connection
- Try disabling VPN or proxy
- Refresh the page after a few moments

**CORS Error:**
- This appears to be a configuration issue
- Please contact support if the problem persists
- Try accessing the site in a different browser

**SERVER Error:**
- The server is experiencing issues
- Our team has been notified
- Please try again in a few minutes

## Configuration

### Environment Variables

#### Frontend (.env)
```bash
# Production
REACT_APP_API_URL=https://easycart-backend.onrender.com/api

# Local Development
REACT_APP_API_URL=http://localhost:8000/api
```

#### Backend (Render Dashboard)
```bash
CORS_ALLOWED_ORIGINS=https://easycart-frontend-zge5.onrender.com,https://easycart-admin.onrender.com
ALLOWED_HOSTS=easycart-backend.onrender.com,.onrender.com
DEBUG=False
```

### API Configuration

```javascript
// frontend/src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     'https://easycart-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Testing Error Scenarios

### Test CORS Configuration
```bash
curl -H "Origin: https://easycart-frontend-zge5.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://easycart-backend.onrender.com/api/products/
```

**Expected Headers in Response:**
```
Access-Control-Allow-Origin: https://easycart-frontend-zge5.onrender.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Test API Endpoints
```bash
# Test products endpoint
curl https://easycart-backend.onrender.com/api/products/

# Test categories endpoint
curl https://easycart-backend.onrender.com/api/categories/

# Test health endpoint
curl https://easycart-backend.onrender.com/api/health/
```

### Test Network Error Handling
1. Disconnect internet
2. Try to load products
3. Verify error message shows network-specific guidance
4. Reconnect internet
5. Click "Try Again" button
6. Verify automatic retry works

### Test Server Error Handling
1. Temporarily break backend (e.g., invalid DB connection)
2. Try to load products
3. Verify error message shows server-specific guidance
4. Check that retry logic is activated
5. Fix backend
6. Verify page recovers automatically or on retry

## Debugging Steps

### 1. Check Browser Console

Open DevTools (F12) and check Console tab for:
- API request URLs
- Error messages
- Network errors
- CORS errors

Example output in development mode:
```
API Configuration: {baseURL: "https://easycart-backend.onrender.com/api", env: "(using default)"}
API Request: GET /products
API Error Details: {type: "NETWORK", message: "Network connection failed", ...}
```

### 2. Check Network Tab

In DevTools Network tab, verify:
- Request URL is correct
- Request method is correct (GET)
- Response status code
- Response headers (especially CORS headers)
- Response body (error details)

### 3. Check Backend Logs

In Render Dashboard:
1. Navigate to backend service
2. Click "Logs" tab
3. Look for:
   - Request received logs
   - Error stack traces
   - Database connection errors
   - CORS-related messages

### 4. Verify Environment Variables

#### Frontend (Render Dashboard)
1. Navigate to frontend service
2. Click "Environment" tab
3. Verify:
   ```
   REACT_APP_API_URL=https://easycart-backend.onrender.com/api
   ```

#### Backend (Render Dashboard)
1. Navigate to backend service
2. Click "Environment" tab
3. Verify:
   ```
   CORS_ALLOWED_ORIGINS=https://easycart-frontend-zge5.onrender.com,https://easycart-admin.onrender.com
   DEBUG=False
   ```

### 5. Test API Directly

Use curl or Postman to test endpoints:

```bash
# Test if API is reachable
curl -v https://easycart-backend.onrender.com/api/products/

# Test with CORS headers
curl -v -H "Origin: https://easycart-frontend-zge5.onrender.com" \
     https://easycart-backend.onrender.com/api/products/
```

## Common Issues & Solutions

### Issue: "Network error. Please check your connection."

**Possible Causes:**
1. Backend service is down
2. Network connectivity issues
3. DNS resolution failure
4. Timeout

**Solutions:**
1. Check backend service status in Render Dashboard
2. Verify backend URL: `https://easycart-backend.onrender.com`
3. Test API endpoint with curl
4. Check if backend is sleeping (Render free tier) - wake it up by accessing it
5. Wait a moment and try again (automatic retry will handle temporary issues)

### Issue: "CORS policy error"

**Possible Causes:**
1. Frontend URL not in CORS whitelist
2. CORS middleware not configured
3. Incorrect CORS headers

**Solutions:**
1. Update `CORS_ALLOWED_ORIGINS` in backend settings
2. Verify CORS middleware is first in middleware list
3. Redeploy backend after changes
4. Clear browser cache and try again

### Issue: "Server error. Please try again later."

**Possible Causes:**
1. Backend application error
2. Database connection issues
3. Unhandled exception

**Solutions:**
1. Check backend logs for error details
2. Verify MongoDB connection string
3. Check database service status
4. Review recent code changes
5. Rollback to previous working version if needed

### Issue: Products not displaying but no error

**Possible Causes:**
1. Empty database
2. All products out of stock
3. Filter excluding all products

**Solutions:**
1. Check if database has products:
   ```bash
   curl https://easycart-backend.onrender.com/api/products/
   ```
2. Run database seeding script if empty
3. Check filter logic in code

## Files Modified

### Core Files
- `frontend/src/utils/errorHandler.js` - Enhanced error detection and handling
- `frontend/src/services/api.js` - Added logging, timeout, and better config
- `frontend/src/pages/LandingPage.jsx` - Enhanced error UI with retry
- `frontend/src/components/ProductList.jsx` - Enhanced error handling

### New Utilities
- `retryWithBackoff()` - Automatic retry with exponential backoff
- `checkApiHealth()` - API health check before requests
- `getDetailedErrorMessage()` - Detailed error information
- `detectErrorType()` - Error type detection

## Testing Checklist

- [ ] Products load successfully on homepage
- [ ] Categories display in navigation
- [ ] Error handling works for network errors
- [ ] Error handling works for CORS errors
- [ ] Error handling works for server errors
- [ ] Retry button works correctly
- [ ] Automatic retry with backoff works
- [ ] Development logging shows detailed info
- [ ] Production doesn't leak sensitive info
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Technical details shown only in development

## Performance Considerations

### Timeout Configuration
- API timeout: 30 seconds
- Retry delays: 1.5s, 3s (exponential backoff)
- Maximum retry attempts: 2

### Optimization Tips
1. Keep timeout reasonable (30s is good balance)
2. Limit retry attempts to avoid excessive delay
3. Use exponential backoff to avoid overwhelming server
4. Implement caching for frequently accessed data
5. Use loading skeletons for better UX

## Support & Contact

If issues persist after following this guide:
1. Check Render service logs (Backend & Frontend)
2. Review browser console for error messages
3. Verify all environment variables are set correctly
4. Test API endpoints directly with curl
5. Contact development team with:
   - Error message
   - Browser console logs
   - Network tab screenshot
   - Steps to reproduce

## References

- [SOLUTION_SUMMARY.md](./SOLUTION_SUMMARY.md) - Previous CORS fix
- [CORS_FIX_DEPLOYMENT.md](./CORS_FIX_DEPLOYMENT.md) - Deployment guide
- [CODE_EXAMPLES.md](./frontend/CODE_EXAMPLES.md) - API integration examples
- [Axios Error Handling](https://axios-http.com/docs/handling_errors)
- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
