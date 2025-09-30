# MongoDB Atlas Migration - Code Changes Summary

## Overview
This document summarizes the exact code changes made to migrate EasyCart backend from SQLite to MongoDB Atlas using Djongo.

## Files Modified

### 1. `backend/requirements.txt`

**Added dependencies:**
```txt
djongo==1.3.6
pymongo==3.12.3
```

**Complete updated requirements.txt:**
```txt
psycopg2-binary==2.9.9
Django>=4.2
python-decouple
djangorestframework
djangorestframework-simplejwt
django-cors-headers
django-filter
Pillow
requests
django-sslserver
django-extensions
redis
django-redis
djongo==1.3.6
pymongo==3.12.3
```

### 2. `backend/ecommerce/settings.py`

**Changed database configuration (lines 87-115):**

**BEFORE:**
```python
DATABASES = {
    'default': {
        'ENGINE': config('DB_ENGINE', default='django.db.backends.sqlite3'),
        'NAME': config('DB_NAME', default=str(BASE_DIR / 'db.sqlite3')),
        'USER': config('DB_USER', default=''),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default=''),
        'PORT': config('DB_PORT', default=''),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"
        } if config('DB_ENGINE', default='').endswith('mysql') else {},
    }
}
```

**AFTER:**
```python
# MongoDB Configuration
MONGO_URI = config('MONGO_URI', default='')

if MONGO_URI:
    # Use MongoDB with Djongo when MONGO_URI is provided
    DATABASES = {
        'default': {
            'ENGINE': 'djongo',
            'CLIENT': {
                'host': MONGO_URI,
            },
            'NAME': 'easycart',
        }
    }
else:
    # Fallback to SQLite for local development without MongoDB
    DATABASES = {
        'default': {
            'ENGINE': config('DB_ENGINE', default='django.db.backends.sqlite3'),
            'NAME': config('DB_NAME', default=str(BASE_DIR / 'db.sqlite3')),
            'USER': config('DB_USER', default=''),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': config('DB_HOST', default=''),
            'PORT': config('DB_PORT', default=''),
            'OPTIONS': {
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"
            } if config('DB_ENGINE', default='').endswith('mysql') else {},
        }
    }
```

### 3. `backend/.env.example`

**Added MongoDB configuration section:**

```env
# MongoDB Configuration (for Django with Djongo)
# Use this for MongoDB Atlas connection
# Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://easycart:easycart2024@easycart.abc123.mongodb.net/?retryWrites=true&w=majority
```

**Updated production checklist:**
```env
# --- PRODUCTION CHECKLIST ---
# 1. Set DEBUG=False
# 2. Set a strong SECRET_KEY
# 3. Set ALLOWED_HOSTS to your real domains
# 4. Set CORS_ALLOWED_ORIGINS to your frontend domains
# 5. Use secure email credentials
# 6. Set MONGO_URI to your MongoDB Atlas connection string
# 7. Never commit your real .env to version control!
```

## Installation Instructions

### 1. Install Dependencies

```bash
cd backend
pip install djongo==1.3.6 pymongo==3.12.3
```

Or install all dependencies:
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create or update `backend/.env` with your MongoDB Atlas connection string:

```env
MONGO_URI=mongodb+srv://easycart:your-password@your-cluster.mongodb.net/?retryWrites=true&w=majority
```

**Important:**
- Replace `your-password` with your actual MongoDB Atlas password
- Replace `your-cluster` with your actual cluster address
- Database name is automatically set to "easycart"

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Start the Server

```bash
python manage.py runserver
```

## Key Features

1. **Automatic Fallback**: If `MONGO_URI` is not set, the system automatically falls back to SQLite
2. **Database Name**: Hardcoded to "easycart" as specified in requirements
3. **Version Compatibility**: 
   - Djongo 1.3.6 (compatible with Django 4.x)
   - PyMongo 3.12.3 (required for Djongo 1.3.6)
4. **Environment-based Configuration**: Uses python-decouple for secure configuration management

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a free cluster
3. Create database user: `easycart` / `your-password`
4. Whitelist IP addresses (0.0.0.0/0 for development, specific IPs for production)
5. Get connection string from "Connect" → "Connect your application"
6. Add the connection string to your `.env` file as `MONGO_URI`

## Testing the Connection

```python
# Test if MongoDB is connected
from django.conf import settings
print(settings.DATABASES['default']['ENGINE'])
# Should print: 'djongo'
```

## Troubleshooting

### Issue: "No module named 'djongo'"
**Solution:** Run `pip install djongo==1.3.6 pymongo==3.12.3`

### Issue: Connection timeout
**Solution:** 
- Verify IP is whitelisted in MongoDB Atlas
- Check connection string format
- Ensure cluster is running

### Issue: Authentication failed
**Solution:**
- Verify username and password in connection string
- Check database user exists in MongoDB Atlas
- Ensure user has read/write permissions

## Documentation

See `backend/MONGODB_SETUP.md` for detailed setup and troubleshooting guide.
