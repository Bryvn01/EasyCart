# Quick Start: MongoDB Atlas Setup

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
cd backend
pip install djongo==1.3.6 pymongo==3.12.3
```

### 2. Set Environment Variable
Create `backend/.env`:
```env
MONGO_URI=mongodb+srv://easycart:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
```

### 3. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Start Server
```bash
python manage.py runserver
```

## 📝 What Changed?

### backend/requirements.txt
```diff
+ djongo==1.3.6
+ pymongo==3.12.3
```

### backend/ecommerce/settings.py
```python
# MongoDB Configuration
MONGO_URI = config('MONGO_URI', default='')

if MONGO_URI:
    DATABASES = {
        'default': {
            'ENGINE': 'djongo',
            'CLIENT': {'host': MONGO_URI},
            'NAME': 'easycart',
        }
    }
else:
    # Falls back to SQLite
    DATABASES = {...}
```

### backend/.env.example
```diff
+ # MongoDB Configuration (for Django with Djongo)
+ MONGO_URI=mongodb+srv://easycart:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

## 🔧 Configuration

**Database Name:** `easycart` (hardcoded as required)  
**Fallback:** SQLite (when MONGO_URI is not set)  
**Engine:** Djongo 1.3.6 with PyMongo 3.12.3

## ✅ Verify Setup
```bash
python validate_mongodb_config.py
```

## 📚 Documentation
- **Setup Guide:** `backend/MONGODB_SETUP.md`
- **Migration Summary:** `MONGODB_MIGRATION.md`
- **Complete Summary:** `MONGODB_INTEGRATION_SUMMARY.md`

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection timeout | Check IP whitelist in MongoDB Atlas |
| Import error | `pip install djongo==1.3.6 pymongo==3.12.3` |
| Migration fails | Verify MONGO_URI is correct |

## 🔗 MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create user: `easycart` / `your-password`
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string
6. Add to `.env` as `MONGO_URI`

---
**Status:** ✅ Ready to use  
**Database:** easycart (MongoDB Atlas)
