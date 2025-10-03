# Django Backend Deprecation Notice

## ⚠️ IMPORTANT NOTICE

**The Django backend is now deprecated in favor of the unified Node.js/Express backend.**

---

## 🔄 Migration Status

As of the latest update, EasyCart has consolidated all backend functionality into a single Node.js/Express API with MongoDB. This provides:

- **Unified Architecture**: Single backend technology stack
- **Better Performance**: MongoDB for flexible product data
- **Real-Time Features**: Socket.io for live updates
- **Modern Tooling**: Latest Node.js ecosystem
- **Easier Deployment**: Single backend to deploy and maintain

---

## 📊 What This Means

### Django Backend (`/backend/apps/`)
- ❌ **Status**: Deprecated
- 📦 **Files**: Kept for reference but not actively used
- 🔧 **Maintenance**: No new features will be added
- 🗑️ **Removal**: Will be removed in a future release

### Node.js Backend (`/backend/*.js`)
- ✅ **Status**: Active and primary
- 🎯 **Purpose**: All API requests should use this backend
- 🚀 **Features**: Full product management, authentication, file uploads
- 📡 **Port**: 5000 (configurable via PORT env variable)

---

## 🔀 Migration Guide

### For Developers

If you have custom Django code or modifications:

1. **Identify Custom Features**: List any custom Django models, views, or serializers
2. **Port to Node.js**: Recreate functionality in Express/MongoDB
3. **Test Thoroughly**: Ensure all features work with new backend
4. **Update Frontend**: Point all API calls to Node.js backend (port 5000)

### For Deployment

1. **Environment Variables**: Update `.env` to use MongoDB connection string
2. **Start Command**: Use `npm start` in `/backend` directory
3. **Database**: Migrate data from PostgreSQL/SQLite to MongoDB if needed
4. **Remove Django**: Can remove Django dependencies from deployment

---

## 🗄️ Data Migration

If you have existing data in Django/PostgreSQL:

### Option 1: Manual Export/Import
```bash
# Export from Django (if applicable)
python manage.py dumpdata products > products.json

# Import to MongoDB (create migration script)
node scripts/migrate-from-django.js
```

### Option 2: Fresh Start
- The Node.js backend includes seed scripts
- Use `/api/seed` endpoints to populate with sample data
- Manually re-create products via admin dashboard

---

## 📁 File Structure

### Deprecated (Django)
```
backend/
├── apps/
│   ├── accounts/      # ❌ Deprecated - Use Node.js auth
│   └── products/      # ❌ Deprecated - Use Node.js products API
├── ecommerce/         # ❌ Django settings
├── manage.py          # ❌ Django management
└── requirements.txt   # ❌ Python dependencies
```

### Active (Node.js)
```
backend/
├── controllers/       # ✅ API Controllers
├── models/           # ✅ Mongoose Models
├── routes/           # ✅ Express Routes
├── middleware/       # ✅ Auth & Validation
├── utils/            # ✅ Helpers (Cloudinary, Image Processing)
├── server.js         # ✅ Main Server File
├── socket.js         # ✅ Real-Time Features
└── package.json      # ✅ Node.js Dependencies
```

---

## 🔗 API Endpoints

### Old (Django) - Deprecated
```
http://localhost:8000/api/products/
http://localhost:8000/api/accounts/
```

### New (Node.js) - Active
```
http://localhost:5000/api/products/
http://localhost:5000/api/auth/
http://localhost:5000/api/upload/
http://localhost:5000/api/categories/
```

---

## 🛠️ Configuration

### Django `.env` Variables (No Longer Needed)
```env
# ❌ Deprecated
DB_ENGINE=django.db.backends.postgresql
DB_NAME=...
DB_USER=...
SECRET_KEY=<your_django_secret_key>
```

### Node.js `.env` Variables (Required)
```env
# ✅ Required
PORT=5000
MONGO_URI=mongodb://localhost:27017/easycart
JWT_SECRET=<your_jwt_secret>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
FRONTEND_URL=http://localhost:3000
```

---

## 📞 Support

If you need help migrating:
1. Check the implementation guides:
   - `ENHANCED_PRODUCT_API_GUIDE.md`
   - `ADMIN_DASHBOARD_INTEGRATION_GUIDE.md`
2. Review the Node.js backend code
3. Open an issue on GitHub

---

## ⏰ Timeline

- **Now**: Django backend deprecated, Node.js is primary
- **1-2 months**: Test period for Node.js backend
- **3+ months**: Remove Django code entirely (if no issues)

---

## ✅ Checklist for Complete Migration

- [x] Node.js backend fully functional
- [x] Product API with enhanced features
- [x] Authentication working
- [x] File upload with Cloudinary
- [x] Real-time updates via Socket.io
- [x] Admin dashboard updated to use new API
- [ ] All data migrated to MongoDB
- [ ] Frontend fully tested with new backend
- [ ] Django code removed from repository

---

**Last Updated**: 2025-01-03

For questions or concerns, please open an issue in the GitHub repository.
