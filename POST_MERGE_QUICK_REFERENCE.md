# 🚀 Post-Merge Quick Reference Guide

## 📋 Quick Status Check

```bash
# Run automated verification
./scripts/verify-production.sh

# Quick health check
curl https://easycart-backend.onrender.com/api/health

# Check products count
curl https://easycart-backend.onrender.com/api/products | jq '.count'
```

---

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | https://easycart-backend.onrender.com | REST API server |
| **Frontend** | https://easycart-1-752r.onrender.com | User-facing site |
| **Admin Dashboard** | https://easycart-admin.onrender.com | Admin interface |
| **Health Check** | https://easycart-backend.onrender.com/api/health | API status |
| **Products API** | https://easycart-backend.onrender.com/api/products | Products endpoint |
| **Render Dashboard** | https://dashboard.render.com | Deployment platform |
| **MongoDB Atlas** | https://cloud.mongodb.com | Database |

---

## ✅ What to Check

### Daily (5 minutes)
- [ ] Backend health: `curl https://easycart-backend.onrender.com/api/health`
- [ ] Frontend loads: Visit https://easycart-1-752r.onrender.com
- [ ] Products display: Visit https://easycart-1-752r.onrender.com/products
- [ ] Check Slack #alerts for notifications

### Weekly (15 minutes)
- [ ] Run `./scripts/verify-production.sh`
- [ ] Review Render logs for errors
- [ ] Check response time metrics
- [ ] Review user feedback/support tickets
- [ ] Verify database storage usage

### Monthly (30 minutes)
- [ ] Run full regression tests
- [ ] Performance audit (Lighthouse)
- [ ] Security updates check
- [ ] Documentation review
- [ ] Analyze usage patterns

---

## 🐛 Common Issues & Quick Fixes

### Backend Unresponsive
```bash
# Check status
curl -I https://easycart-backend.onrender.com

# If 503 or timeout, backend may be sleeping (free tier)
# Wait 30 seconds and retry
sleep 30
curl https://easycart-backend.onrender.com/api/health
```

**Fix:** Upgrade to paid plan to avoid cold starts

### Products Not Loading
```bash
# Check API
curl https://easycart-backend.onrender.com/api/products

# Check count
curl https://easycart-backend.onrender.com/api/products | jq '.count'

# If count is 0, database needs seeding
```

**Fix:** Run seed script in backend:
```bash
npm run seed:kenya
```

### CORS Errors
**Symptom:** Browser console shows CORS policy error

**Fix:** Add frontend URL to backend `FRONTEND_URL` env var:
```bash
FRONTEND_URL=https://easycart-1-752r.onrender.com,https://easycart-frontend-zge5.onrender.com
```

### Images Not Loading
**Symptom:** Products show placeholder emoji

**Possible Causes:**
- Missing Cloudinary configuration
- Invalid image URLs
- Network issues

**Quick Check:**
```bash
# Test an image URL
curl -I https://res.cloudinary.com/your-cloud/image/upload/sample.jpg
```

**Fix:** Verify `CLOUDINARY_URL` in backend environment

---

## 📊 Key Metrics

### Performance Targets
- **Page Load:** < 2 seconds
- **API Response:** < 1 second
- **Search Response:** < 1 second
- **Error Rate:** < 1%

### Business Metrics
- **Products Count:** Should match database
- **Uptime:** > 99%
- **User Satisfaction:** Monitor feedback

---

## 🔧 Quick Commands

### Test All Features
```bash
# Pagination
curl "https://easycart-backend.onrender.com/api/products?page=2&page_size=10"

# Search
curl "https://easycart-backend.onrender.com/api/products?search=unga"

# Category Filter
curl "https://easycart-backend.onrender.com/api/products?category=1"

# Price Filter
curl "https://easycart-backend.onrender.com/api/products?price_min=100&price_max=1000"

# Sort
curl "https://easycart-backend.onrender.com/api/products?ordering=-price"
```

### Check Logs
```bash
# Navigate to Render Dashboard:
# Services → easycart-backend → Logs

# Or use Render CLI:
render logs easycart-backend --tail
```

### Restart Service
```bash
# Navigate to Render Dashboard:
# Services → easycart-backend → Manual Deploy → "Clear build cache & deploy"
```

---

## 📞 Who to Contact

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| **Critical** (Site down) | Slack #alerts | Immediate |
| **High** (Major bug) | Slack #engineering | 1 hour |
| **Medium** (Minor bug) | GitHub Issues | 1 day |
| **Low** (Enhancement) | GitHub Issues | Next sprint |

---

## 📚 Documentation Links

- **Full Verification:** [POST_MERGE_VERIFICATION.md](POST_MERGE_VERIFICATION.md)
- **Monitoring:** [MONITORING_GUIDE.md](MONITORING_GUIDE.md)
- **Environment Config:** [ENVIRONMENT_CONFIG_VERIFICATION.md](ENVIRONMENT_CONFIG_VERIFICATION.md)
- **Regression Tests:** [REGRESSION_TESTING_CHECKLIST.md](REGRESSION_TESTING_CHECKLIST.md)
- **Stakeholder Comms:** [STAKEHOLDER_COMMUNICATION.md](STAKEHOLDER_COMMUNICATION.md)

---

## 🎯 Success Criteria

✅ **All checks passing:**
- Backend health: 200 OK
- Products API: Returns data
- Pagination: Works
- Search: Works
- Filters: Work
- Frontend: Loads
- Response time: < 2s

---

## 🚨 Escalation Path

1. **Check Logs:** Render Dashboard → Logs
2. **Run Verification:** `./scripts/verify-production.sh`
3. **Post in Slack:** #engineering with error details
4. **Create Issue:** If bug confirmed
5. **Apply Hotfix:** If critical
6. **Document:** Update this guide with learnings

---

## 📝 Quick Notes

**Last PR Merged:** #121 - Products Page API Integration
**Date:** [Check git log]
**Status:** ✅ Production Ready
**Known Issues:** None currently

**Recent Changes:**
- Live API data integration
- Pagination (12 products/page)
- Enhanced search & filters
- Image fallback handling
- Error handling improvements

---

**Updated:** [Current Date]
**Maintainer:** EasyCart Team
