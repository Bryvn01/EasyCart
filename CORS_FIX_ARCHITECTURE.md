# CORS Fix - Technical Architecture

## Problem Architecture (Before Fix)

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Client                        │
│        https://easycart-frontend-zge5.onrender.com      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ GET /api/products/
                     │ Origin: https://easycart-frontend-zge5.onrender.com
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             Django Backend API                           │
│        https://easycart-backend.onrender.com            │
│                                                          │
│  CORS Configuration:                                     │
│  ┌────────────────────────────────────────┐            │
│  │ CORS_ALLOWED_ORIGINS:                  │            │
│  │  ❌ https://easycart-1-752r.onrender.com │ (Wrong!)  │
│  │  ✅ https://easycart-admin.onrender.com  │           │
│  └────────────────────────────────────────┘            │
│                                                          │
│  Response: ❌ CORS Error - Origin Not Allowed          │
└─────────────────────────────────────────────────────────┘

Result:
❌ Frontend receives CORS error
❌ Products/categories fail to load
❌ "Unable to Load Content" error displayed
```

## Solution Architecture (After Fix)

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Client                        │
│        https://easycart-frontend-zge5.onrender.com      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ GET /api/products/
                     │ Origin: https://easycart-frontend-zge5.onrender.com
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             Django Backend API                           │
│        https://easycart-backend.onrender.com            │
│                                                          │
│  CORS Configuration:                                     │
│  ┌────────────────────────────────────────────────┐    │
│  │ CORS_ALLOWED_ORIGINS:                          │    │
│  │  ✅ https://easycart-frontend-zge5.onrender.com │ ✓  │
│  │  ✅ https://easycart-admin.onrender.com         │    │
│  │                                                 │    │
│  │ CORS_ALLOW_CREDENTIALS: True                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Response Headers:                                       │
│    ✅ Access-Control-Allow-Origin: [origin]             │
│    ✅ Access-Control-Allow-Credentials: true            │
│                                                          │
│  Response: 200 OK + JSON Data                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ 200 OK
                      │ { products: [...], categories: [...] }
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Browser Client                        │
│  ✅ Products and categories loaded successfully         │
│  ✅ No CORS errors                                       │
└─────────────────────────────────────────────────────────┘
```

## CORS Request Flow

### Preflight Request (OPTIONS)
```
Browser → Backend
────────────────
OPTIONS /api/products/
Origin: https://easycart-frontend-zge5.onrender.com
Access-Control-Request-Method: GET
Access-Control-Request-Headers: content-type

Backend → Browser
────────────────
200 OK
Access-Control-Allow-Origin: https://easycart-frontend-zge5.onrender.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Actual Request (GET)
```
Browser → Backend
────────────────
GET /api/products/
Origin: https://easycart-frontend-zge5.onrender.com
Authorization: Bearer <token>

Backend → Browser
────────────────
200 OK
Access-Control-Allow-Origin: https://easycart-frontend-zge5.onrender.com
Access-Control-Allow-Credentials: true
Content-Type: application/json

{
  "results": [
    { "id": 1, "name": "Product 1", ... },
    { "id": 2, "name": "Product 2", ... }
  ]
}
```

## Service Dependencies

```
┌─────────────────────────────────────────────┐
│         Frontend Static Site                 │
│  easycart-frontend-zge5.onrender.com        │
│                                              │
│  Build: npm install && npm run build        │
│  Env: REACT_APP_API_URL                     │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTP/HTTPS
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Backend Web Service                  │
│  easycart-backend.onrender.com              │
│                                              │
│  Runtime: Python/Django                     │
│  Middleware: django-cors-headers            │
│  Env: CORS_ALLOWED_ORIGINS                  │
└──────────────────┬──────────────────────────┘
                   │
                   │ MongoDB Protocol
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         MongoDB Atlas                        │
│  Cluster: easycart-cluster                  │
│                                              │
│  Database: easycart                         │
│  Collections: products, categories, etc.    │
└─────────────────────────────────────────────┘
```

## Configuration Files

### Backend: settings.py
```python
# CORS Middleware (must be first)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ← First!
    'django.middleware.security.SecurityMiddleware',
    # ... other middleware
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://easycart-frontend-zge5.onrender.com",
    "https://easycart-admin.onrender.com"
]
CORS_ALLOW_CREDENTIALS = True
```

### Frontend: api.js
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL ||
                     'https://easycart-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});
```

### Deployment: render.yaml
```yaml
services:
  - type: web
    name: easycart-backend
    envVars:
      - key: CORS_ALLOWED_ORIGINS
        value: https://easycart-frontend-zge5.onrender.com,https://easycart-admin.onrender.com

  - type: web
    name: easycart-frontend
    envVars:
      - key: REACT_APP_API_URL
        value: https://easycart-backend.onrender.com/api
```

## Environment Variables

### Backend (easycart-backend)
| Variable | Value | Purpose |
|----------|-------|---------|
| CORS_ALLOWED_ORIGINS | `https://easycart-frontend-zge5.onrender.com,https://easycart-admin.onrender.com` | Allowed origins for CORS |
| MONGODB_URI | `mongodb+srv://...` | Database connection |
| DEBUG | `False` | Production mode |
| ALLOWED_HOSTS | `easycart-backend.onrender.com,.onrender.com` | Django allowed hosts |

### Frontend (easycart-frontend)
| Variable | Value | Purpose |
|----------|-------|---------|
| REACT_APP_API_URL | `https://easycart-backend.onrender.com/api` | Backend API endpoint |

## Security Layers

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Network Security                      │
│  - HTTPS/TLS encryption                         │
│  - Secure headers (HSTS, X-Frame-Options)       │
└─────────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  Layer 2: CORS Protection                       │
│  - Origin validation                            │
│  - Credential control                           │
│  - Method/header restrictions                   │
└─────────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  Layer 3: Application Security                  │
│  - JWT authentication                           │
│  - Permission checks                            │
│  - Input validation                             │
└─────────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  Layer 4: Database Security                     │
│  - MongoDB authentication                       │
│  - Network access control                       │
│  - Encrypted connections                        │
└─────────────────────────────────────────────────┘
```

## Troubleshooting Decision Tree

```
Is frontend loading?
│
├─ No → Check Render service status
│       Check build logs
│       Verify DNS resolution
│
└─ Yes → Are products loading?
         │
         ├─ No → Check browser console
         │       │
         │       ├─ CORS error? → Check backend CORS config
         │       │                 Verify frontend URL in CORS_ALLOWED_ORIGINS
         │       │
         │       ├─ 404 error? → Verify API_BASE_URL
         │       │                Check API endpoint paths
         │       │
         │       ├─ 500 error? → Check backend logs
         │       │                Verify MongoDB connection
         │       │
         │       └─ Network error? → Check backend service status
         │                          Test API endpoints directly
         │
         └─ Yes → System working correctly! ✅
```

## Performance Considerations

### Cold Starts (Render Free Tier)
- Backend: ~30-60 seconds on first request
- Solution: Health check keeps service warm
- Frontend: Static site, no cold start

### API Response Times
- Local MongoDB queries: 10-50ms
- Atlas queries: 50-200ms (depending on region)
- Full page load: 1-3 seconds (including images)

### Optimization Strategies
1. Enable CORS caching with `Access-Control-Max-Age`
2. Use pagination for large datasets
3. Implement frontend caching with React Query
4. Optimize MongoDB indexes
5. Use CDN for static assets

## Monitoring & Debugging

### Browser DevTools
```
Console Tab:
  - Check for CORS errors (red)
  - Check for API errors (red)
  - Verify API responses (blue)

Network Tab:
  - Filter: XHR
  - Check status codes (200 = good)
  - Inspect response headers
  - View response preview
```

### Backend Logs (Render Dashboard)
```
Look for:
  - [CORS] origin verification
  - [API] request processing
  - [DB] query execution
  - [Error] exception traces
```

### Health Checks
```bash
# Backend health
curl https://easycart-backend.onrender.com/api/health/

# Products endpoint
curl https://easycart-backend.onrender.com/api/products/

# Categories endpoint
curl https://easycart-backend.onrender.com/api/categories/
```

## Success Metrics

✅ **All Green When**:
- Backend health check returns 200
- Products endpoint returns data
- Categories endpoint returns data
- Frontend loads without console errors
- Products display on homepage
- No CORS errors in browser
- API calls show 200 status in Network tab
