# Render Dashboard Manual Actions Guide

## Overview

This guide provides detailed step-by-step instructions for performing the manual consolidation actions in the Render dashboard. Since we cannot access the dashboard directly from code, these steps must be performed manually.

## Prerequisites

- Access to Render dashboard (https://render.com/dashboard)
- Admin/owner access to the EasyCart project
- 30-45 minutes of time
- Notepad/text editor for documenting environment variables

## Part 1: Inventory and Verification

### Step 1.1: Log In and Locate Services

1. **Open browser and go to:** https://render.com/dashboard
2. **Log in** with your Render credentials
3. **Search for services:**
   - In the search box, type "easycart"
   - Note all backend services that appear

### Step 1.2: Document All Backend Services

Create a list of all backend services found:

```
Service Name: ___________________________
URL: _____________________________________
Status: (Active/Suspended/Other)
Branch: __________________________________
Last Deployed: ___________________________
```

Repeat for each backend service found.

### Step 1.3: Identify Primary Service

✅ **Primary Service to Keep:** `easycart-backend-0u8r`
- URL should be: `https://easycart-backend-0u8r.onrender.com`
- This is the service that will remain after consolidation

❌ **Services to Retire:**
- `easycart-j6ue` (if exists)
- `easycart-backend-d3b90j3e5dus73cc8bjg` (if exists)
- Any other backend services not named easycart-backend-0u8r

## Part 2: Verify Branch Configuration

### Step 2.1: Check easycart-backend-0u8r Configuration

1. **Click on** `easycart-backend-0u8r` service
2. **Go to** "Settings" tab
3. **Click** "Build & Deploy" section
4. **Verify:**
   ```
   ✅ Branch: main
   ✅ Auto-Deploy: Yes
   ✅ Root Directory: backend
   ```
5. **If incorrect:**
   - Click "Edit"
   - Change Branch to `main`
   - Set Root Directory to `backend`
   - Enable Auto-Deploy
   - Click "Save Changes"

### Step 2.2: Check Other Backend Services (if exist)

For each other backend service (j6ue, d3b90j3e5dus73cc8bjg):

1. **Click on** the service
2. **Go to** "Settings" tab
3. **Click** "Build & Deploy" section
4. **Document:**
   - Current branch: _______
   - Auto-deploy: _______
   - Root directory: _______

## Part 3: Environment Variable Synchronization

### Step 3.1: Export Variables from easycart-j6ue

⚠️ **Critical Step - Do Not Skip**

1. **Click on** `easycart-j6ue` service (if exists)
2. **Go to** "Environment" tab
3. **Document ALL environment variables:**

```
Variable Name                | Variable Value
----------------------------|------------------
MONGODB_URI                 | [copy full value]
SECRET_KEY                  | [copy full value]
JWT_SECRET                  | [copy full value]
CLOUDINARY_URL              | [copy full value]
DEBUG                       | [copy full value]
ALLOWED_HOSTS               | [copy full value]
CORS_ALLOWED_ORIGINS        | [copy full value]
DJANGO_SETTINGS_MODULE      | [copy full value]
WEB_CONCURRENCY             | [copy full value]
PYTHON_VERSION              | [copy full value]
[any other variables]       | [copy full value]
```

**Save this list** - you'll need it in the next step.

### Step 3.2: Compare with easycart-backend-0u8r

1. **Click on** `easycart-backend-0u8r` service
2. **Go to** "Environment" tab
3. **Compare** with the list from Step 3.1
4. **Identify missing variables** (variables in j6ue but not in 0u8r)

### Step 3.3: Add Missing Variables to easycart-backend-0u8r

For each missing variable:

1. **In easycart-backend-0u8r** Environment tab
2. **Click** "Add Environment Variable" button
3. **Enter:**
   - Key: [variable name from list]
   - Value: [variable value from list]
4. **Click** "Save"
5. **Repeat** for all missing variables

**Critical Variables to Verify:**
- ✅ MONGODB_URI (must be present)
- ✅ CLOUDINARY_URL (recommended)
- ✅ SECRET_KEY (must be present)
- ✅ JWT_SECRET (must be present)
- ✅ CORS_ALLOWED_ORIGINS (must include frontend URLs)
- ✅ ALLOWED_HOSTS (must include backend domain)

### Step 3.4: Verify CORS and ALLOWED_HOSTS

**ALLOWED_HOSTS should include:**
```
easycart-backend-0u8r.onrender.com,.onrender.com
```

**CORS_ALLOWED_ORIGINS should include:**
```
https://easycart-1-752r.onrender.com,https://easycart-admin.onrender.com
```

If these are incorrect:
1. Click "Edit" next to the variable
2. Update the value
3. Click "Save"

## Part 4: Manual Redeployment

### Step 4.1: Clear Cache and Redeploy easycart-backend-0u8r

1. **In easycart-backend-0u8r** service page
2. **Click** "Manual Deploy" button (top right)
3. **Select** "Clear build cache & deploy"
4. **Click** "Deploy"
5. **Wait** for deployment to complete (typically 5-10 minutes)

**What to watch for:**
- Build logs should show successful pip install
- Migration should run without errors
- Static files should be collected
- Gunicorn should start successfully

### Step 4.2: Monitor Deployment Logs

1. **Click** "Logs" tab
2. **Watch for:**
   - ✅ "Installing dependencies..."
   - ✅ "Running migrations..."
   - ✅ "Collecting static files..."
   - ✅ "Starting gunicorn..."
   - ✅ "Listening at: http://0.0.0.0:PORT"

**If errors occur:**
- Check environment variables are correct
- Verify MONGODB_URI is valid
- Check ALLOWED_HOSTS includes service domain
- Review error messages and fix accordingly

### Step 4.3: Verify Service is Live

1. **Service status** should show "Live" (green)
2. **Last deploy** should show current time
3. **No error messages** in recent logs

## Part 5: Testing Endpoints

### Step 5.1: Test from Command Line

Open terminal and run these tests:

```bash
# Health check
curl https://easycart-backend-0u8r.onrender.com/api/health/

# Expected response:
# {"status": "healthy", "service": "easycart-backend", "version": "1.0.0"}

# Products API
curl https://easycart-backend-0u8r.onrender.com/api/products/

# Should return JSON array of products

# Categories API
curl https://easycart-backend-0u8r.onrender.com/api/products/categories/

# Should return JSON array of categories

# Cloudinary test (if CLOUDINARY_URL is set)
curl https://easycart-backend-0u8r.onrender.com/api/test-cloudinary/

# Should return: {"secure_url": "https://res.cloudinary.com/..."}
```

**Record test results:**
- [ ] Health check: PASS / FAIL
- [ ] Products API: PASS / FAIL
- [ ] Categories API: PASS / FAIL
- [ ] Cloudinary test: PASS / FAIL

### Step 5.2: Test from Browser

1. **Open browser** and visit:
   ```
   https://easycart-backend-0u8r.onrender.com/api/health/
   ```
2. **Should see:** JSON response with status "healthy"

3. **Visit:**
   ```
   https://easycart-backend-0u8r.onrender.com/api/products/
   ```
4. **Should see:** JSON array of products

## Part 6: Update Frontend and Admin

### Step 6.1: Update Frontend Service

1. **Locate** `easycart-1-752r` or `easycart-frontend` service
2. **Go to** "Environment" tab
3. **Find or add** `REACT_APP_API_URL` variable
4. **Set value to:**
   ```
   https://easycart-backend-0u8r.onrender.com/api
   ```
5. **Click** "Save"
6. **Redeploy** frontend service:
   - Manual Deploy → Clear build cache & deploy
   - Wait for completion

### Step 6.2: Update Admin Dashboard Service

1. **Locate** `easycart-admin` service
2. **Go to** "Environment" tab
3. **Find or add** `REACT_APP_API_URL` variable
4. **Set value to:**
   ```
   https://easycart-backend-0u8r.onrender.com/api
   ```
5. **Click** "Save"
6. **Redeploy** admin service:
   - Manual Deploy → Clear build cache & deploy
   - Wait for completion

### Step 6.3: Test Frontend and Admin

1. **Visit frontend URL:**
   - Should load without errors
   - Should display products
   - Should be able to browse categories

2. **Visit admin URL:**
   - Should load without errors
   - Should be able to log in
   - Should display dashboard stats

## Part 7: Retire Redundant Services

⚠️ **Only proceed if all tests in Parts 5 and 6 passed**

### Step 7.1: Delete easycart-j6ue (if exists)

1. **Click on** `easycart-j6ue` service
2. **Go to** "Settings" tab
3. **Scroll to bottom**
4. **Click** "Delete Service" (red button)
5. **Confirm** by typing service name
6. **Click** "Yes, delete this service"

### Step 7.2: Delete easycart-backend-d3b90j3e5dus73cc8bjg (if exists)

1. **Click on** service
2. **Go to** "Settings" tab
3. **Scroll to bottom**
4. **Click** "Delete Service" (red button)
5. **Confirm** by typing service name
6. **Click** "Yes, delete this service"

### Step 7.3: Verify Only One Backend Remains

1. **Search** for "easycart" in dashboard
2. **Verify** only these services exist:
   - ✅ easycart-backend-0u8r (backend)
   - ✅ easycart-frontend or easycart-1-752r (frontend)
   - ✅ easycart-admin (admin dashboard)

## Part 8: Final Verification

### Step 8.1: Complete Test Suite

Run all tests again to ensure everything works:

```bash
# Health check
curl https://easycart-backend-0u8r.onrender.com/api/health/

# Products
curl https://easycart-backend-0u8r.onrender.com/api/products/

# Categories
curl https://easycart-backend-0u8r.onrender.com/api/products/categories/

# Test frontend (in browser)
# Visit: https://easycart-1-752r.onrender.com
# Should load and display products

# Test admin (in browser)
# Visit: https://easycart-admin.onrender.com
# Should load and allow login
```

### Step 8.2: Check for CORS Errors

1. **Open browser console** (F12)
2. **Visit frontend URL**
3. **Look for CORS errors** in console
4. **If CORS errors appear:**
   - Go back to backend Environment tab
   - Verify CORS_ALLOWED_ORIGINS includes frontend URL
   - Redeploy backend
   - Test again

### Step 8.3: Test Authentication

1. **Visit frontend**
2. **Click** "Register" or "Sign Up"
3. **Create test account**
4. **Verify** registration works
5. **Log in** with test account
6. **Verify** login works

### Step 8.4: Test Full User Flow

1. **Browse products**
2. **Add to cart**
3. **View cart**
4. **Test checkout** (don't complete payment)
5. **Verify** all steps work without errors

## Troubleshooting Common Issues

### Issue: Service Won't Deploy

**Possible causes:**
- Environment variable missing or incorrect
- MONGODB_URI is invalid
- Build command failed

**Solutions:**
1. Check deployment logs for specific error
2. Verify all environment variables are set
3. Test MONGODB_URI from MongoDB Atlas
4. Ensure requirements.txt hasn't changed

### Issue: CORS Errors

**Symptoms:** Frontend console shows "blocked by CORS policy"

**Solutions:**
1. Verify CORS_ALLOWED_ORIGINS in backend
2. Ensure it includes frontend URL (with https://)
3. Check for trailing slashes (remove them)
4. Redeploy backend after fixing

### Issue: 404 Not Found

**Symptoms:** API endpoints return 404

**Solutions:**
1. Verify URL is correct
2. Check ALLOWED_HOSTS includes backend domain
3. Ensure service is on main branch
4. Verify root directory is set to "backend"

### Issue: Database Connection Error

**Symptoms:** "Could not connect to MongoDB" or similar

**Solutions:**
1. Verify MONGODB_URI is correct
2. Check MongoDB Atlas allows Render IPs (0.0.0.0/0)
3. Test connection string from MongoDB Atlas
4. Check database user has correct permissions

## Success Checklist

Mark each item when verified:

- [ ] Only easycart-backend-0u8r backend service exists
- [ ] easycart-backend-0u8r is on main branch
- [ ] All environment variables are configured
- [ ] Health check returns success
- [ ] Products API returns data
- [ ] Categories API returns data
- [ ] Frontend loads without errors
- [ ] Frontend can connect to backend
- [ ] Admin dashboard loads without errors
- [ ] Admin can connect to backend
- [ ] No CORS errors in browser console
- [ ] Authentication works (register/login)
- [ ] Cart functionality works
- [ ] No error messages in service logs

## Completion

Congratulations! Backend consolidation is complete.

**What you've accomplished:**
- ✅ Single production backend service
- ✅ Consistent environment variables
- ✅ All endpoints functional
- ✅ Frontend and admin properly configured
- ✅ Redundant services retired

**Next steps:**
1. Update documentation (see POST_CONSOLIDATION_CLEANUP.md)
2. Inform team of new backend URL
3. Monitor service for 24-48 hours
4. Remove temporary test endpoints if desired

**Production Backend URL:**
```
https://easycart-backend-0u8r.onrender.com/
```

---

**Document Version:** 1.0  
**Estimated Completion Time:** 30-45 minutes  
**Last Updated:** Now ready for use
