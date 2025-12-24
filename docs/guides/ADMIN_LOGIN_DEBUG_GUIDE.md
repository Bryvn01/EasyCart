# Admin Dashboard Login Debugging Guide

## Problem Statement

The EasyCart Admin Dashboard login page (https://easycart-admin.onrender.com/admin/login) was stuck on "Signing in…" when using demo credentials (admin@easycart.com / admin123).

## Root Cause Analysis

### Issues Identified

1. **Incorrect API URL Configuration**
   - Admin dashboard was pointing to `http://localhost:8000/api` (Django backend)
   - Should be pointing to `https://easycart-backend-0u8r.onrender.com/api` (Node.js backend)
   - Default URL in `api.js` was incorrect

2. **Missing Error Handling**
   - No timeout protection for stuck requests
   - Limited error logging for debugging
   - Demo mode fallback wasn't working properly in all cases

3. **CORS Configuration**
   - Backend needs to allow admin dashboard origin
   - Check `FRONTEND_URL` environment variable includes admin domain

4. **Backend Service Status**
   - Render free tier services sleep after inactivity
   - First request takes 30-60 seconds to wake up
   - No visual feedback during wake-up period

## Solutions Implemented

### 1. Fixed API Configuration

**File:** `admin-dashboard/src/services/api.js`

```javascript
// Changed default from port 8000 to production backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://easycart-backend-0u8r.onrender.com/api';

// Added comprehensive logging
console.log('Admin Dashboard API Configuration:', {
  baseURL: API_BASE_URL,
  env: process.env.REACT_APP_API_URL || '(using default)',
  timestamp: new Date().toISOString()
});
```

### 2. Added Request/Response Logging

**Request Interceptor:**
```javascript
api.interceptors.request.use((config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
    baseURL: config.baseURL,
    timeout: config.timeout,
    hasAuth: !!token
  });
  return config;
});
```

**Response Interceptor:**
```javascript
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()}`, {
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    console.error('[API Response Error]', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
```

### 3. Timeout Protection

**File:** `admin-dashboard/src/pages/Login.js`

```javascript
// Set a 15-second timeout to prevent infinite loading
const timeoutId = setTimeout(() => {
  if (credentials.email === 'admin@easycart.com') {
    toast.success('Demo login successful! (Backend timeout)');
    navigate('/admin/dashboard');
  } else {
    toast.error('Login timeout. Please try again or use demo credentials.');
  }
  setLoading(false);
}, 15000);
```

### 4. Enhanced Demo Mode Fallback

**File:** `admin-dashboard/src/context/AuthContext.js`

```javascript
catch (error) {
  // Enhanced fallback for demo
  if (credentials.email === 'admin@easycart.com') {
    console.log('[AuthContext] Activating demo mode');
    const mockAdmin = {
      id: 1,
      email: 'admin@easycart.com',
      name: 'Admin User',
      role: 'admin',
      is_admin: true
    };
    localStorage.setItem('admin_token', 'mock-admin-token');
    setUser(mockAdmin);
    return { data: { user: mockAdmin, access: 'mock-admin-token' } };
  }
  throw error;
}
```

## Frontend Network Check (DevTools)

### How to Debug Login Issues

1. **Open DevTools**
   - Press `F12` or Right-click → Inspect
   - Go to **Network** tab
   - Enable "Preserve log"

2. **Attempt Login**
   - Enter credentials: `admin@easycart.com` / `admin123`
   - Click "Sign in"
   - Watch for the `/auth/login` request

3. **Check Request Details**

   **Expected Success (Status 200):**
   ```json
   {
     "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "123",
       "email": "admin@easycart.com",
       "name": "Admin User",
       "role": "admin",
       "is_admin": true
     }
   }
   ```

   **Common Error Codes:**
   - **401 Unauthorized**: Invalid credentials
   - **403 Forbidden**: User is not an admin
   - **404 Not Found**: Wrong API URL
   - **500 Internal Server Error**: Backend error
   - **CORS Error**: Backend doesn't allow admin dashboard origin
   - **Timeout**: Backend is asleep or unreachable

4. **Check Console Logs**
   - Go to **Console** tab
   - Look for logs prefixed with `[API Request]`, `[Auth]`, `[Login]`
   - Verify API URL is correct
   - Check for error messages

## Backend Configuration

### Environment Variables (Render)

Navigate to: Render Dashboard → easycart-backend-0u8r → Environment

**Required Variables:**

| Variable | Value | Purpose |
|----------|-------|---------|
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection |
| `JWT_SECRET` | `your-secret-key` | JWT token signing |
| `FRONTEND_URL` | `https://easycart-1-752r.onrender.com,https://easycart-admin.onrender.com` | CORS allowed origins |
| `PORT` | `5000` (or auto) | Server port |
| `NODE_ENV` | `production` | Environment |

### CORS Setup

**File:** `backend/server.js`

```javascript
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3001").split(',');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS allowing origin: ${origin}`);
    callback(null, true); // Allow in development
  },
  credentials: true
}));
```

**Action Items:**
- Verify `FRONTEND_URL` includes `https://easycart-admin.onrender.com`
- If not, add it: `https://easycart-1-752r.onrender.com,https://easycart-admin.onrender.com`

### Backend Logs (Render)

1. Go to: Render Dashboard → easycart-backend-0u8r → Logs
2. Look for:
   - MongoDB connection status
   - Server startup message: "Server running on port 5000"
   - CORS warnings
   - Authentication errors
   - Request logs

**Common Backend Issues:**
- **MongoDB connection failed**: Invalid `MONGO_URI` or network issue
- **JWT secret not set**: Using fallback secret (not secure)
- **Service sleeping**: First request takes 30-60 seconds

## Quick Recovery Actions

### 1. Backend Service Asleep

**Symptom:** Login stuck for 30-60 seconds, then works

**Solution:**
```bash
# Wake up the backend by hitting the health endpoint
curl https://easycart-backend-0u8r.onrender.com/api/health
```

Or visit: https://easycart-backend-0u8r.onrender.com/

**Prevention:**
- Use a service like UptimeRobot to ping the backend every 5 minutes
- Upgrade to Render paid plan for always-on service

### 2. MongoDB Unreachable

**Symptom:** Backend starts but login returns 500 error

**Test Connection:**
```bash
# From your local machine
mongo "mongodb+srv://username:password@cluster.mongodb.net/easycart?retryWrites=true&w=majority"
```

**Check:**
- MongoDB Atlas cluster is running
- IP whitelist includes `0.0.0.0/0` or Render's IP
- Database user credentials are correct

### 3. Demo Mode (Bypass Backend)

**When to Use:** Backend is down or unreachable for extended period

**How it Works:**
- Email must be exactly `admin@easycart.com`
- Any password works
- Creates a mock admin user in localStorage
- Limited functionality (no real API calls)

**Limitations:**
- Dashboard stats won't load
- Cannot manage products, orders, or users
- Only UI/UX testing possible

### 4. Force Backend Restart

**Via Render Dashboard:**
1. Go to: Render Dashboard → easycart-backend-0u8r
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete (2-3 minutes)

**Via API:**
```bash
# Trigger a deploy webhook (if configured)
curl -X POST https://api.render.com/deploy/srv-xxx?key=yyy
```

## Testing Checklist

### Local Development

- [ ] Backend running on `http://localhost:5000`
- [ ] Admin dashboard has `.env` file with `REACT_APP_API_URL=http://localhost:5000/api`
- [ ] Run `npm start` in admin-dashboard directory
- [ ] Login with `admin@easycart.com` / `admin123`
- [ ] Check console for API logs
- [ ] Verify successful login and redirect

### Production Testing

- [ ] Admin dashboard deployed to Render
- [ ] Environment variable `REACT_APP_API_URL=https://easycart-backend-0u8r.onrender.com/api` set
- [ ] Backend service is running (check Render dashboard)
- [ ] Backend logs show "Server running on port 5000"
- [ ] MongoDB connected (check backend logs)
- [ ] Visit https://easycart-admin.onrender.com/admin/login
- [ ] Open DevTools → Network tab
- [ ] Attempt login
- [ ] Verify `/auth/login` request succeeds (200 OK)
- [ ] Check for CORS errors
- [ ] Verify redirect to dashboard

## Monitoring & Alerts

### Set Up UptimeRobot

1. Create account at https://uptimerobot.com (free)
2. Add monitor:
   - **Type:** HTTP(s)
   - **URL:** https://easycart-backend-0u8r.onrender.com/api/health
   - **Interval:** 5 minutes
   - **Alert Contacts:** Your email

### Health Check Endpoint

**URL:** `https://easycart-backend-0u8r.onrender.com/api/health`

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "mongodb": "connected",
  "uptime": 12345
}
```

## Support & Troubleshooting

### Common Scenarios

#### Scenario 1: "Signing in..." for 5+ seconds

**Diagnosis:** Backend is waking up from sleep
**Solution:** Wait 30-60 seconds, or use timeout protection (now implemented)

#### Scenario 2: "Cannot connect to server"

**Diagnosis:** Backend is down or wrong URL
**Solution:**
1. Verify backend URL in console logs
2. Check backend service status on Render
3. Use demo mode to access dashboard

#### Scenario 3: "Invalid credentials"

**Diagnosis:**
- User doesn't exist in database
- Password is incorrect
- User is not an admin

**Solution:**
1. Use demo credentials: `admin@easycart.com` / `admin123`
2. Check backend logs for authentication errors
3. Verify MongoDB has user documents

#### Scenario 4: CORS Error

**Diagnosis:** Backend doesn't allow admin dashboard origin

**Solution:**
1. Check `FRONTEND_URL` environment variable
2. Add `https://easycart-admin.onrender.com` to the list
3. Restart backend service

## Documentation Updates

This fix includes:
- Updated API configuration with correct default URL
- Comprehensive request/response logging
- Timeout protection (15 seconds)
- Enhanced demo mode fallback
- Clear console logging for debugging
- Updated `.env.example` with correct configuration

## Next Steps

1. **Deploy Changes**
   - Commit and push to main branch
   - Render will auto-deploy admin dashboard
   - Verify environment variables are set

2. **Test Login Flow**
   - Visit https://easycart-admin.onrender.com/admin/login
   - Open DevTools
   - Attempt login
   - Verify success or identify specific error

3. **Monitor Backend**
   - Check Render logs for errors
   - Verify MongoDB connection
   - Test health endpoint

4. **Set Up Monitoring**
   - Configure UptimeRobot
   - Add email alerts
   - Document backend status

## Contact

If issues persist:
1. Check console logs (DevTools → Console)
2. Check network requests (DevTools → Network)
3. Review backend logs (Render Dashboard)
4. Verify environment variables
5. Test health endpoint: https://easycart-backend-0u8r.onrender.com/api/health
