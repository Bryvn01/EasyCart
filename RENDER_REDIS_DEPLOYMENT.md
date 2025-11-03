# Deploy Redis to Render - Step-by-Step Guide

## Overview
This guide will help you add Redis to your EasyCart production deployment on Render.

## Step 1: Create Redis Instance on Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Log in to your account

2. **Create New Redis**
   - Click "New +" button (top right)
   - Select "Redis"

3. **Configure Redis Instance**
   ```
   Name: easycart-redis
   Region: Oregon (US West) - Same as your backend
   Plan: Free (25MB, 10 connections)
        OR
        Starter ($7/mo, 256MB, 25 connections) - Recommended for production
   
   Maxmemory Policy: allkeys-lru (evict least recently used keys)
   ```

4. **Create Redis**
   - Click "Create Redis"
   - Wait 2-3 minutes for provisioning

5. **Copy Connection Details**
   After creation, you'll see:
   - **Internal Redis URL**: `redis://red-xxxxx:6379` (use this)
   - **External Redis URL**: `rediss://red-xxxxx:6379` (for external access)
   
   Copy the **Internal Redis URL** - you'll need it next.

## Step 2: Add Redis URL to Backend Environment

1. **Go to Your Backend Service**
   - Dashboard → Select "easycart-backend-2k8l" (or your backend service name)

2. **Add Environment Variable**
   - Click "Environment" tab (left sidebar)
   - Click "Add Environment Variable"
   
   ```
   Key: REDIS_URL
   Value: redis://red-xxxxx:6379
   ```
   
   (Paste the Internal Redis URL you copied)

3. **Save Changes**
   - Click "Save Changes"
   - Render will automatically redeploy your backend (takes 3-5 minutes)

## Step 3: Verify Deployment

1. **Check Deploy Logs**
   - Go to "Logs" tab
   - Look for successful deployment messages
   - Should see: "Build successful" and "Deploy live"

2. **Test Redis Connection**
   - Open your backend URL: https://easycart-backend-2k8l.onrender.com/admin/
   - If it loads without errors, Redis is working!

3. **Check Cache Performance**
   - Visit: https://easycart-backend-2k8l.onrender.com/api/products/
   - First load: Hits database
   - Refresh page: Served from cache (much faster)

## Step 4: Monitor Redis Usage

1. **View Redis Metrics**
   - Dashboard → Select "easycart-redis"
   - Click "Metrics" tab
   - Monitor:
     - Memory usage
     - Connected clients
     - Commands per second

2. **Free Tier Limits**
   - Memory: 25MB
   - Connections: 10 concurrent
   - Bandwidth: Unlimited
   
   If you exceed limits, upgrade to Starter plan ($7/mo).

## Step 5: Update Frontend (Optional)

Your frontend doesn't need changes - it connects to the backend API, which now uses Redis internally.

But if you want to update CSP for production:

1. **Edit frontend/public/index.html**
   - Already done - includes production backend URL in CSP

2. **Redeploy Frontend**
   - Render auto-deploys on git push
   - Or manually: Dashboard → easycart-frontend → "Manual Deploy"

## Troubleshooting

### Redis Connection Failed

**Check Environment Variable:**
```bash
# In Render Shell (Dashboard → Backend → Shell)
echo $REDIS_URL
```

Should output: `redis://red-xxxxx:6379`

**Check Redis Status:**
- Dashboard → easycart-redis
- Status should be "Available" (green)

### Backend Not Using Redis

**Check Logs:**
- Dashboard → Backend → Logs
- Search for "Redis" or "cache"
- Should see: "Redis connection successful"

**Force Redeploy:**
- Dashboard → Backend → "Manual Deploy" → "Clear build cache & deploy"

### Out of Memory (Free Tier)

**Symptoms:**
- Cache misses increase
- Logs show "OOM" errors

**Solutions:**
1. Reduce cache timeouts in `settings.py`:
   ```python
   TIMEOUT_SHORT = 180  # 3 minutes (was 5)
   TIMEOUT_MEDIUM = 900  # 15 minutes (was 30)
   ```

2. Upgrade to Starter plan ($7/mo, 256MB)

### Too Many Connections

**Symptoms:**
- "max number of clients reached" error

**Solutions:**
1. Reduce connection pool in `settings.py`:
   ```python
   "CONNECTION_POOL_KWARGS": {"max_connections": 5}  # was 50
   ```

2. Upgrade to Starter plan (25 connections)

## Cost Breakdown

### Free Tier (Recommended for Testing)
- Redis: $0/mo (25MB, 10 connections)
- Backend: $0/mo (750 hours)
- Frontend: $0/mo (100GB bandwidth)
- **Total: $0/mo**

### Production Tier (Recommended for Live Site)
- Redis Starter: $7/mo (256MB, 25 connections)
- Backend Starter: $7/mo (512MB RAM)
- Frontend: $0/mo (100GB bandwidth)
- **Total: $14/mo**

## Performance Expectations

### Before Redis
- Homepage load: 2-3 seconds
- API response: 500-800ms
- Database queries: 50+ per page

### After Redis
- Homepage load: 300-500ms (6x faster)
- API response: 50-100ms (8x faster)
- Database queries: 5-10 per page (80% reduction)

## Next Steps

1. ✅ Create Redis instance on Render
2. ✅ Add REDIS_URL to backend environment
3. ✅ Wait for auto-deploy (3-5 minutes)
4. ✅ Test production site
5. ✅ Monitor Redis metrics
6. 🔲 Upgrade to paid tier when ready (optional)

## Verification Checklist

- [ ] Redis instance created and "Available"
- [ ] REDIS_URL added to backend environment
- [ ] Backend redeployed successfully
- [ ] Production site loads without errors
- [ ] API responses are faster
- [ ] Redis metrics show activity

## Support

If you encounter issues:
1. Check Render status: https://status.render.com
2. Review logs: Dashboard → Service → Logs
3. Render docs: https://render.com/docs/redis
4. Contact support: support@render.com

---

**Estimated Setup Time:** 10 minutes
**Difficulty:** Easy
**Cost:** Free (or $7/mo for production)
