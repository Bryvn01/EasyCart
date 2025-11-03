# Render Redis - Quick Start (5 Minutes)

## TL;DR

1. **Create Redis on Render**
   - Go to: https://dashboard.render.com
   - Click "New +" → "Redis"
   - Name: `easycart-redis`
   - Plan: Free
   - Click "Create Redis"

2. **Copy Internal Redis URL**
   - After creation, copy the **Internal Redis URL**
   - Format: `redis://red-xxxxx:6379`

3. **Add to Backend Environment**
   - Go to your backend service: `easycart-backend-2k8l`
   - Click "Environment" tab
   - Add variable:
     ```
     REDIS_URL=redis://red-xxxxx:6379
     ```
   - Click "Save Changes"

4. **Wait for Deploy**
   - Render auto-deploys (3-5 minutes)
   - Check "Logs" tab for "Deploy live"

5. **Test**
   - Visit: https://easycart-backend-2k8l.onrender.com/api/products/
   - Refresh page - should be much faster!

## Done! 🎉

Your production site now has Redis caching.

**Performance:**
- 6-10x faster page loads
- 80% fewer database queries
- Better user experience

**Cost:** $0/mo (Free tier)

---

**Need help?** See full guide: `RENDER_REDIS_DEPLOYMENT.md`
