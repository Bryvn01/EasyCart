# Render Dashboard Manual Configuration Guide

If you're configuring services manually in the Render dashboard (not using `render.yaml`), follow these exact settings:

## EasyCart Backend (Django API)

**Service Type:** Web Service
**Environment:** Python

### Build & Deploy
- **Root Directory:** `backend`
- **Build Command:**
  ```bash
  pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate --no-input
  ```
- **Start Command:**
  ```bash
  gunicorn ecommerce.wsgi:application --bind 0.0.0.0:$PORT
  ```

### Environment Variables
```
PYTHON_VERSION=3.11.0
DEBUG=False
SECRET_KEY=[Auto-generated or set manually]
ALLOWED_HOSTS=easycart-backend.onrender.com,.onrender.com
CORS_ALLOWED_ORIGINS=https://easycart-frontend-zge5.onrender.com,https://easycart-admin.onrender.com
MONGODB_URI=[Your MongoDB Atlas connection string]
JWT_SECRET=[Auto-generated or set manually]
DJANGO_SETTINGS_MODULE=ecommerce.settings
WEB_CONCURRENCY=2
```

### Health Check
- **Health Check Path:** `/api/health/`

---

## EasyCart Frontend (Customer Site)

**Service Type:** Static Site

### Build & Deploy
- **Root Directory:** `frontend`
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Publish Directory:** `build`
  - ⚠️ **IMPORTANT:** Must be `build`, NOT `frontend/build`
  - The path is relative to the Root Directory

### Environment Variables
```
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
NODE_VERSION=18.17.0
REACT_APP_SITE_NAME=EasyCart
```

### Routes & Rewrites
Add this route to support React Router:
- **Type:** Rewrite
- **Source:** `/*`
- **Destination:** `/index.html`

---

## EasyCart Admin Dashboard

**Service Type:** Static Site

### Build & Deploy
- **Root Directory:** `admin-dashboard`
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Publish Directory:** `build`
  - ⚠️ **IMPORTANT:** Must be `build`, NOT `admin-dashboard/build`
  - The path is relative to the Root Directory

### Environment Variables
```
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
NODE_VERSION=18.17.0
REACT_APP_SITE_NAME=EasyCart Admin
```

### Routes & Rewrites
Add this route to support React Router:
- **Type:** Rewrite
- **Source:** `/*`
- **Destination:** `/index.html`

---

## Common Mistakes to Avoid

### ❌ Wrong: Absolute Publish Directories
```
Publish Directory: frontend/build      ← WRONG!
Publish Directory: admin-dashboard/build  ← WRONG!
```

### ✅ Correct: Relative Publish Directories
```
Root Directory: frontend
Publish Directory: build               ← CORRECT!

Root Directory: admin-dashboard
Publish Directory: build               ← CORRECT!
```

### Why?
- Render changes the working directory to your `Root Directory` first
- Then it looks for the `Publish Directory` relative to that location
- So `Root Directory: frontend` + `Publish Directory: build` = `frontend/build/`

---

## Troubleshooting

### "Publish directory build does not exist"

**Check:**
1. Is `Root Directory` set correctly?
2. Is `Publish Directory` set to `build` (not the full path)?
3. Does the build command complete successfully?
4. Check build logs for npm errors

**Solution:**
```
Root Directory: frontend
Publish Directory: build
```

### "npm error ERESOLVE could not resolve"

**For Admin Dashboard:**
This is fixed in the current PR by upgrading `@mui/x-data-grid` to v8.0.0.

If you still see this error:
1. Clear build cache in Render dashboard
2. Trigger a new deployment
3. Verify `package.json` has `@mui/x-data-grid@^8.0.0`

---

## Deployment Order

1. **Deploy Backend First**
   - Ensures API is available
   - Set all environment variables
   - Wait for health check to pass

2. **Deploy Frontend & Admin**
   - Can deploy simultaneously
   - Both depend on backend being live
   - Verify CORS origins include both URLs

---

## Verification Steps

After deployment, verify each service:

### Backend
```bash
curl https://easycart-backend.onrender.com/api/health/
# Should return: {"status": "ok"}
```

### Frontend
1. Visit `https://easycart-frontend-[your-slug].onrender.com`
2. Check browser console for CORS errors
3. Verify products load correctly

### Admin Dashboard
1. Visit `https://easycart-admin-[your-slug].onrender.com`
2. Login with admin credentials
3. Verify data loads from backend API

---

## Security Headers (Optional)

Both static sites can include these headers for better security:

### X-Frame-Options
- **Path:** `/*`
- **Name:** `X-Frame-Options`
- **Value:** `DENY`

### X-Content-Type-Options
- **Path:** `/*`
- **Name:** `X-Content-Type-Options`
- **Value:** `nosniff`

### Cache-Control for Static Assets
- **Path:** `/static/*`
- **Name:** `Cache-Control`
- **Value:** `public, max-age=31536000, immutable`

---

*Last Updated: October 2024*
*Repository: Bryvn01/EasyCart*
