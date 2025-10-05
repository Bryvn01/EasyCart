# EasyCart MongoDB Configuration - Quick Reference

## 🚀 Quick Test Commands

### Test Node.js Backend MongoDB Connection
```bash
cd backend
node test_mongodb_connection.js
```

### Test Django + MongoDB (PyMongo)
```bash
cd backend
python test_django_mongodb.py
```

### Seed MongoDB with 37 Products
```bash
cd backend
curl -X POST http://localhost:5000/api/seed
# Or directly:
node routes/seed.js
```

### Test Products API
```bash
# Local
curl http://localhost:5000/api/products | jq '.pagination.total'

# Production
curl https://easycart-backend.onrender.com/api/products | jq '.pagination.total'
```

## 🔧 Environment Variables

### Node.js Backend (.env)
```bash
# MongoDB Atlas (REQUIRED)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-frontend.onrender.com

# Auth
JWT_SECRET=<your_jwt_secret>
```

### Frontend (.env.production)
```bash
# Point to Node.js backend (port 5000)
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
```

## ⚠️ Common Issues

### Issue: 0 Products Returned
**Solution:** Database not seeded
```bash
curl -X POST http://localhost:5000/api/seed
```

### Issue: MongoDB Connection Error
**Solutions:**
1. Check MONGO_URI format (must include `/easycart` database name)
2. Verify credentials in MongoDB Atlas
3. Add `0.0.0.0/0` to IP whitelist in Atlas
4. Check network connectivity

### Issue: Wrong Database
**Problem:** URI points to `admin` or `test` database
**Solution:** Ensure URI contains `/easycart?`:
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority
                                                    ^^^^^^^^
```

### Issue: Django Product.objects.count() Returns Wrong Number
**Explanation:** Django uses SQLite/PostgreSQL, NOT MongoDB
**Solution:** Use Node.js backend for products:
```javascript
// Node.js/MongoDB - CORRECT
const Product = require('./models/Product');
const count = await Product.countDocuments();
```

```python
# Django/SQLite - WRONG for MongoDB products
from apps.products.models import Product
count = Product.objects.count()  # Queries SQLite, not MongoDB!
```

## ✅ Expected Results

### After Seeding Database
- **Total Products:** 37
- **Collections:** products, categories, users
- **Database Name:** easycart
- **API Response:** `{ success: true, data: [...], pagination: { total: 37 } }`

### Connection States
| State | Code | Meaning |
|-------|------|---------|
| Connected | 1 | Successfully connected to MongoDB |
| Disconnected | 0 | Not connected |
| Connecting | 2 | Connection in progress |

## 📊 Backend Architecture

```
Frontend → Node.js Backend (port 5000) → MongoDB Atlas (easycart.products)
                                          ✅ 37 products

Frontend → Django Backend (port 8000) → SQLite/PostgreSQL (Django models)
                                         ⚠️  Separate database
```

## 🔍 Debug Logs

With the enhanced logging, you'll see:
```
🔍 [DEBUG] Fetching products from MongoDB
📊 [DEBUG] Database: easycart
🔗 [DEBUG] Connection state: 1 (1=connected, 0=disconnected)
✅ [DEBUG] Retrieved 20 products (Total in DB: 37)
📦 [DEBUG] First product: Unga Maize Flour 2kg - KES 180
✅ [DEBUG] CORRECT: Expected 37 products found in database
```

## 📝 Verification Checklist

Run through this checklist:

- [ ] **Node.js Backend Running:** `http://localhost:5000/api/health` returns `{"status":"OK"}`
- [ ] **MONGO_URI Configured:** Check with `echo $MONGO_URI` or `.env` file
- [ ] **Database Name Correct:** URI contains `/easycart?` not `/admin` or `/?`
- [ ] **MongoDB Connected:** Test script shows "✅ Successfully connected"
- [ ] **Products Seeded:** `Product.countDocuments()` returns 37
- [ ] **API Working:** `/api/products` returns JSON with products
- [ ] **Frontend Configured:** `REACT_APP_API_URL` points to Node.js backend
- [ ] **CORS Configured:** No CORS errors in browser console

## 🎯 Final Tests

### Browser Console Test
```javascript
// Test from your React app in browser
fetch('https://easycart-backend.onrender.com/api/products')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Products:', data.pagination.total);
    console.log('📦 First product:', data.data[0].name);
  })
  .catch(err => console.error('❌ Error:', err));
```

### Expected Output
```
✅ Products: 37
📦 First product: Unga Maize Flour 2kg
```

## 📚 Documentation

For full audit details, see: `MONGODB_DJANGO_AUDIT.md`

## 🆘 Support

If tests fail:
1. Run test scripts and check error messages
2. Verify environment variables in Render dashboard
3. Check MongoDB Atlas connection settings
4. Review backend logs for error details
5. Test API endpoints with curl or Postman

---

Generated for EasyCart MongoDB Configuration Audit
