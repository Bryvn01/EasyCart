# Redis Production Deployment Checklist

## 📋 Pre-Deployment

- [x] Redis installed locally
- [x] Redis tested locally (`python manage.py test_redis`)
- [x] Code committed to GitHub
- [x] Backend running on Render
- [ ] Ready to add Redis to production

## 🚀 Deployment Steps

### Step 1: Create Redis Instance (2 minutes)

- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Redis"
- [ ] Configure:
  - Name: `easycart-redis`
  - Region: Oregon (US West)
  - Plan: Free (or Starter $7/mo)
  - Maxmemory Policy: allkeys-lru
- [ ] Click "Create Redis"
- [ ] Wait for status: "Available" (green)

### Step 2: Get Redis URL (1 minute)

- [ ] Click on "easycart-redis" instance
- [ ] Find "Internal Redis URL"
- [ ] Copy URL (format: `redis://red-xxxxx:6379`)
- [ ] Keep this tab open

### Step 3: Configure Backend (2 minutes)

- [ ] Go to backend service: `easycart-backend-2k8l`
- [ ] Click "Environment" tab (left sidebar)
- [ ] Click "Add Environment Variable"
- [ ] Add:
  ```
  Key: REDIS_URL
  Value: redis://red-xxxxx:6379
  ```
- [ ] Click "Save Changes"

### Step 4: Wait for Deploy (3-5 minutes)

- [ ] Click "Logs" tab
- [ ] Watch deployment progress
- [ ] Wait for: "Build successful"
- [ ] Wait for: "Deploy live"
- [ ] Check for errors (should be none)

### Step 5: Verify (2 minutes)

- [ ] Open: https://easycart-backend-2k8l.onrender.com/api/products/
- [ ] Page loads successfully
- [ ] Refresh page (should be faster)
- [ ] Open: https://easycart-frontend-wj9x.onrender.com/
- [ ] Homepage loads successfully
- [ ] Browse products (should be fast)

## ✅ Post-Deployment Verification

### Check Redis Metrics

- [ ] Dashboard → easycart-redis → "Metrics"
- [ ] Memory usage: < 25MB (free tier)
- [ ] Connected clients: 1-5
- [ ] Commands/sec: > 0 (shows activity)

### Check Backend Logs

- [ ] Dashboard → easycart-backend → "Logs"
- [ ] Search for "cache" or "Redis"
- [ ] Should see cache hit messages
- [ ] No Redis connection errors

### Performance Test

- [ ] Open DevTools (F12) → Network tab
- [ ] Visit: https://easycart-frontend-wj9x.onrender.com/
- [ ] First load time: _____ ms
- [ ] Refresh page
- [ ] Second load time: _____ ms (should be 50-80% faster)

## 📊 Expected Results

### Before Redis
- Homepage: 2000-3000ms
- API calls: 500-800ms
- Database queries: 50+ per page

### After Redis
- Homepage: 300-500ms ✅
- API calls: 50-100ms ✅
- Database queries: 5-10 per page ✅

## 🎯 Success Criteria

- [ ] Redis status: "Available"
- [ ] Backend status: "Live"
- [ ] Frontend status: "Live"
- [ ] No errors in logs
- [ ] Pages load faster
- [ ] Redis metrics show activity

## 🐛 Troubleshooting

### Redis Not Connecting

**Symptom:** Backend logs show "Redis connection failed"

**Fix:**
1. Check REDIS_URL is correct
2. Verify Redis status is "Available"
3. Redeploy backend: "Manual Deploy" → "Clear build cache & deploy"

### Backend Won't Deploy

**Symptom:** Deploy fails with errors

**Fix:**
1. Check logs for specific error
2. Verify all environment variables are set
3. Check GitHub repo has latest code

### Site Still Slow

**Symptom:** No performance improvement

**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check Redis metrics (should show activity)
3. Wait 5 minutes for cache to warm up

## 💰 Cost Summary

### Current Setup (Free)
- Backend: $0/mo
- Frontend: $0/mo
- PostgreSQL: $0/mo
- Redis: $0/mo
- **Total: $0/mo**

### Recommended Production
- Backend Starter: $7/mo
- Frontend: $0/mo
- PostgreSQL: $0/mo
- Redis Starter: $7/mo
- **Total: $14/mo**

## 📞 Support

**Render Status:** https://status.render.com
**Render Docs:** https://render.com/docs/redis
**Support:** support@render.com

## 🎉 Completion

Once all checkboxes are checked, your Redis integration is complete!

**Estimated Total Time:** 10-15 minutes
**Difficulty:** Easy
**Impact:** 6-10x performance improvement

---

**Next Steps:**
1. Monitor Redis usage for 24 hours
2. Check metrics daily
3. Upgrade to paid tier when traffic increases
4. Celebrate your faster site! 🚀
