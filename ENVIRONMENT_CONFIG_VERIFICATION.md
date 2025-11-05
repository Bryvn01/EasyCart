# 🔧 Environment Configuration Verification

## Overview

This guide ensures all environment variables are correctly configured across all services after the Products page API integration merge.

---

## Configuration Checklist

### ✅ Backend (Node.js) - Render Service

**Service Name:** `easycart-backend`
**URL:** https://easycart-backend.onrender.com

#### Required Environment Variables

| Variable | Required | Example Value | Status | Notes |
|----------|----------|---------------|--------|-------|
| `PORT` | ✅ | `5000` | [ ] Set | Auto-set by Render |
| `MONGO_URI` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/easycart` | [ ] Set | **Critical** - MongoDB Atlas connection |
| `JWT_SECRET` | ✅ | `your-super-secret-jwt-key-here` | [ ] Set | Generate secure random string |
| `FRONTEND_URL` | ✅ | `https://easycart-1-752r.onrender.com` | [ ] Set | Frontend origin for CORS |
| `NODE_ENV` | Recommended | `production` | [ ] Set | Set to `production` |
| `CLOUDINARY_URL` | Optional | `cloudinary://key:secret@cloud` | [ ] Set | For image uploads |
| `SLACK_WEBHOOK_URL` | Optional | `https://hooks.slack.com/...` | [ ] Set | For alerts |

#### Verification Steps

1. **Access Render Dashboard:**
   ```
   https://dashboard.render.com
   → Services → easycart-backend → Environment
   ```

2. **Check MONGO_URI:**
   ```bash
   # Test MongoDB connection
   curl https://easycart-backend.onrender.com/api/health
   # Should return: {"status": "OK", ...}
   ```

3. **Check CORS Configuration:**
   ```bash
   # Test CORS headers
   curl -H "Origin: https://easycart-1-752r.onrender.com" \
        -H "Access-Control-Request-Method: GET" \
        -I https://easycart-backend.onrender.com/api/products
   # Should include: Access-Control-Allow-Origin header
   ```

4. **Verify Environment in Logs:**
   - Navigate to: Render Dashboard → easycart-backend → Logs
   - Look for: `Server running on port 5000`
   - Look for: `MongoDB connected`

---

### ✅ Frontend (React) - Render Static Site

**Service Name:** `easycart-frontend`
**URL:** https://easycart-1-752r.onrender.com

#### Required Environment Variables

| Variable | Required | Example Value | Status | Notes |
|----------|----------|---------------|--------|-------|
| `REACT_APP_API_URL` | ✅ | `https://easycart-backend.onrender.com/api` | [ ] Set | **No trailing slash** |
| `NODE_VERSION` | ✅ | `18.17.0` | [ ] Set | Node.js version |
| `REACT_APP_SITE_NAME` | Optional | `EasyCart` | [ ] Set | Site branding |
| `DISABLE_ESLINT_PLUGIN` | Optional | `true` | [ ] Set | Prevent build warnings |
| `SKIP_PREFLIGHT_CHECK` | Optional | `true` | [ ] Set | Skip compatibility check |

#### Verification Steps

1. **Access Render Dashboard:**
   ```
   https://dashboard.render.com
   → Static Sites → easycart-frontend → Environment
   ```

2. **Check API URL Format:**
   ```bash
   # Correct format (no trailing slash):
   REACT_APP_API_URL=https://easycart-backend.onrender.com/api ✅

   # Incorrect formats:
   REACT_APP_API_URL=https://easycart-backend.onrender.com/api/ ❌
   REACT_APP_API_URL=https://easycart-backend.onrender.com ❌
   ```

3. **Verify in Browser:**
   - Open: https://easycart-1-752r.onrender.com
   - Open DevTools Console (F12)
   - Look for: `API Configuration: { baseURL: "..." }`
   - Verify: URL matches configured value

4. **Test API Connection:**
   - Navigate to Products page
   - Open DevTools Network tab
   - Verify: Requests go to correct backend URL
   - Check: Status 200 for `/api/products`

---

### ✅ Admin Dashboard (React) - Render Static Site

**Service Name:** `easycart-admin`
**URL:** https://easycart-admin.onrender.com

#### Required Environment Variables

| Variable | Required | Example Value | Status | Notes |
|----------|----------|---------------|--------|-------|
| `REACT_APP_API_URL` | ✅ | `https://easycart-backend.onrender.com/api` | [ ] Set | Same as frontend |
| `NODE_VERSION` | ✅ | `18.17.0` | [ ] Set | Node.js version |
| `REACT_APP_SITE_NAME` | Optional | `EasyCart Admin` | [ ] Set | Admin branding |

#### Verification Steps

1. **Access Render Dashboard:**
   ```
   https://dashboard.render.com
   → Static Sites → easycart-admin → Environment
   ```

2. **Verify API Connection:**
   - Open: https://easycart-admin.onrender.com
   - Login with admin credentials
   - Verify: Dashboard loads data
   - Check Network tab: API calls succeed

---

## MongoDB Atlas Configuration

### Database Connection

**Cluster:** [Your cluster name]
**Database:** `easycart`
**Connection String:** `mongodb+srv://...`

#### Verification Checklist

- [ ] Cluster is running (not paused)
- [ ] Database user exists with correct permissions
- [ ] Database user password is correct
- [ ] Network access IP whitelist includes:
  - [ ] `0.0.0.0/0` (Allow all) OR
  - [ ] Render IP ranges (if using dedicated IPs)
- [ ] Database `easycart` exists
- [ ] Collection `products` has data
- [ ] Connection string is correct in `MONGO_URI`

#### Test Connection

```bash
# From backend container or local machine with mongo shell:
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/easycart"

# Or test via API:
curl https://easycart-backend.onrender.com/api/products
# Should return products data
```

---

## Cloudinary Configuration (Optional)

### If Using Cloudinary for Images

**Dashboard:** https://cloudinary.com/console

#### Environment Variable

```bash
# Format:
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Example:
CLOUDINARY_URL=cloudinary://123456789012345:abcdefg_hijklmn@your-cloud-name
```

#### Verification Steps

1. **Check Cloudinary Dashboard:**
   - Login to Cloudinary console
   - Navigate to: Dashboard → Account Details
   - Copy: Cloud Name, API Key, API Secret
   - Verify: Matches values in CLOUDINARY_URL

2. **Test Image Upload (if implemented):**
   ```bash
   # Test via admin dashboard or API endpoint
   # Upload should return Cloudinary URL:
   # https://res.cloudinary.com/your-cloud-name/image/upload/...
   ```

3. **Verify Image Loading:**
   - Visit Products page
   - Check: Images with Cloudinary URLs load
   - Verify: No broken image icons

---

## Environment File Templates

### Backend `.env` (Development)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/easycart
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/easycart

# Security
JWT_SECRET=your-local-jwt-secret-here

# CORS
FRONTEND_URL=http://localhost:3000,http://localhost:3001

# Optional: Cloudinary
CLOUDINARY_URL=cloudinary://key:secret@cloud

# Optional: Monitoring
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Frontend `.env` (Development)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Build Configuration
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true

# Optional
REACT_APP_SITE_NAME=EasyCart
```

### Production `.env.example`

```bash
# Backend (easycart-backend on Render)
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/easycart
JWT_SECRET=<generate-secure-random-string>
FRONTEND_URL=https://easycart-1-752r.onrender.com
CLOUDINARY_URL=cloudinary://key:secret@cloud

# Frontend (easycart-frontend on Render)
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
NODE_VERSION=18.17.0
REACT_APP_SITE_NAME=EasyCart

# Admin (easycart-admin on Render)
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
NODE_VERSION=18.17.0
REACT_APP_SITE_NAME=EasyCart Admin
```

---

## Common Configuration Issues

### Issue 1: CORS Errors

**Symptom:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Cause:** Frontend URL not in `FRONTEND_URL` environment variable

**Solution:**
```bash
# Add frontend URL to backend FRONTEND_URL
FRONTEND_URL=https://easycart-1-752r.onrender.com,https://easycart-frontend-zge5.onrender.com
```

### Issue 2: API Connection Failed

**Symptom:**
```
Network Error: Unable to connect to server
```

**Causes:**
- Backend is down or sleeping (free tier)
- Incorrect `REACT_APP_API_URL`
- HTTPS/HTTP mismatch

**Solutions:**
```bash
# 1. Check backend is running:
curl https://easycart-backend.onrender.com/api/health

# 2. Verify frontend API URL (no trailing slash):
REACT_APP_API_URL=https://easycart-backend.onrender.com/api ✅

# 3. Ensure HTTPS in production:
REACT_APP_API_URL=https://... (not http://)
```

### Issue 3: MongoDB Connection Failed

**Symptom:**
```
MongoServerError: Authentication failed
```

**Causes:**
- Wrong username/password
- IP not whitelisted
- Incorrect database name

**Solutions:**
```bash
# 1. Verify connection string format:
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE

# 2. Check IP whitelist in MongoDB Atlas:
Network Access → Add IP Address → 0.0.0.0/0

# 3. Verify database user permissions:
Database Access → Edit User → Read/Write to any database
```

### Issue 4: Images Not Loading

**Symptom:** Products show placeholder emoji instead of images

**Causes:**
- Missing `CLOUDINARY_URL`
- Invalid image URLs in database
- CORS issues with image host

**Solutions:**
```bash
# 1. Check Cloudinary configuration:
CLOUDINARY_URL=cloudinary://...

# 2. Verify image URLs in database:
# Should be either:
# - Full Cloudinary URL: https://res.cloudinary.com/...
# - Relative path: /images/products/...

# 3. Test image URL directly:
curl -I https://res.cloudinary.com/your-cloud/image/upload/...
```

---

## Security Best Practices

### ✅ Do's

- ✅ Use strong, randomly generated JWT_SECRET
- ✅ Use environment variables (never hardcode)
- ✅ Set NODE_ENV=production in production
- ✅ Use HTTPS for all URLs
- ✅ Whitelist specific origins for CORS
- ✅ Rotate secrets regularly
- ✅ Use MongoDB Atlas network access control
- ✅ Enable MongoDB Atlas IP whitelist

### ❌ Don'ts

- ❌ Commit `.env` files to git
- ❌ Share secrets in chat/email
- ❌ Use weak or default secrets
- ❌ Allow CORS from `*` (all origins)
- ❌ Use HTTP in production
- ❌ Expose sensitive data in logs
- ❌ Use same secrets across environments

---

## Verification Commands

### Quick Health Check

```bash
#!/bin/bash
# Save as: scripts/check-env.sh

echo "🔍 Environment Configuration Check"
echo ""

# Backend Health
echo "1️⃣  Backend Health:"
curl -s https://easycart-backend.onrender.com/api/health | jq .

# Products API
echo ""
echo "2️⃣  Products API:"
curl -s https://easycart-backend.onrender.com/api/products?page_size=1 | jq '.count'

# Frontend
echo ""
echo "3️⃣  Frontend:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://easycart-1-752r.onrender.com

# Admin
echo ""
echo "4️⃣  Admin Dashboard:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://easycart-admin.onrender.com

echo ""
echo "✅ Check complete!"
```

### Detailed Verification

```bash
#!/bin/bash
# Save as: scripts/verify-env.sh

echo "🔧 Detailed Environment Verification"
echo ""

# Check CORS
echo "1️⃣  CORS Configuration:"
curl -s -I -H "Origin: https://easycart-1-752r.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     https://easycart-backend.onrender.com/api/products | grep -i "access-control"

# Check API Response Format
echo ""
echo "2️⃣  API Response Format:"
curl -s https://easycart-backend.onrender.com/api/products?page_size=1 | jq 'keys'

# Check MongoDB Connection
echo ""
echo "3️⃣  MongoDB Connection:"
response=$(curl -s https://easycart-backend.onrender.com/api/products)
count=$(echo $response | jq '.count')
if [ "$count" -gt "0" ]; then
  echo "✅ Connected - $count products found"
else
  echo "❌ Issue - No products found"
fi

echo ""
echo "✅ Verification complete!"
```

---

## Post-Configuration Steps

After configuring all environment variables:

1. **Restart Services:**
   - Navigate to Render Dashboard
   - Click "Manual Deploy" → "Clear build cache & deploy"
   - Wait for deployment to complete

2. **Run Verification Script:**
   ```bash
   ./scripts/verify-production.sh
   ```

3. **Check Logs:**
   - Review backend logs for connection messages
   - Verify no environment variable errors
   - Check for successful MongoDB connection

4. **Test Key Features:**
   - [ ] Homepage loads
   - [ ] Products page displays data
   - [ ] Search works
   - [ ] Pagination works
   - [ ] Add to cart works

5. **Monitor for 24 Hours:**
   - Watch for errors in logs
   - Monitor response times
   - Check for user reports

---

## Support

**Documentation:**
- [POST_MERGE_VERIFICATION.md](POST_MERGE_VERIFICATION.md)
- [MONITORING_GUIDE.md](MONITORING_GUIDE.md)
- [SETUP.md](SETUP.md)

**Render Documentation:**
- https://render.com/docs/environment-variables
- https://render.com/docs/deploy-react

**MongoDB Atlas:**
- https://docs.atlas.mongodb.com/

**Troubleshooting:**
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if exists
- GitHub Issues: https://github.com/Bryvn01/EasyCart/issues

---

**Last Updated:** [Current Date]
**Version:** 1.0
