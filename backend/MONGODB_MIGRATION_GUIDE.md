# MongoDB Configuration Guide for Django 4.x

## Overview

This project has been upgraded to **Django 4.2.x LTS** for better security, performance, and long-term support. The database configuration now uses standard Django ORM backends (SQLite, PostgreSQL, MySQL) while maintaining optional MongoDB support via PyMongo.

## Why the Change?

- **Djongo Compatibility**: The original `djongo` library (v1.3.6) is not compatible with Django 4.x
- **Maintenance**: Djongo is no longer actively maintained
- **Stability**: Standard Django ORM provides better stability and ecosystem support
- **Flexibility**: PyMongo can be used directly for MongoDB-specific features when needed

## Current Database Setup

### Default Configuration (SQLite)
For local development and testing, the app uses SQLite by default:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Production Configuration (PostgreSQL/MySQL)
For production, you can use PostgreSQL or MySQL:
```bash
# .env configuration
DB_ENGINE=django.db.backends.postgresql
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432
```

### MongoDB Support (Optional)
MongoDB can be used alongside the primary database via PyMongo:

1. **Set MONGO_URI in .env**:
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

2. **Validate MongoDB Connection**:
```bash
python validate_mongodb_config.py
```

3. **Use PyMongo Directly in Code**:
```python
from django.conf import settings
from pymongo import MongoClient

# In your views or services
if settings.MONGO_URI:
    client = MongoClient(settings.MONGO_URI)
    db = client.get_database()
    collection = db['your_collection']
    # Perform MongoDB operations
```

## Migration Strategy

### Option 1: Continue with Django ORM (Recommended)
- Use PostgreSQL or MySQL for production
- All Django models work out of the box
- Best for typical e-commerce applications
- No migration from MongoDB needed

### Option 2: Hybrid Approach
- Use Django ORM for auth, sessions, admin
- Use PyMongo directly for specific features requiring MongoDB
- Example: Product reviews, logs, analytics

### Option 3: Full MongoDB Migration
If you need full MongoDB support with Django 4.x:

1. Use **Mongoengine** (ODM for MongoDB):
```bash
pip install mongoengine
```

2. Configure in settings:
```python
from mongoengine import connect
connect('your_database', host=settings.MONGO_URI)
```

3. Define models using Mongoengine instead of Django ORM

## Validation and Testing

### 1. Validate MongoDB Connection
```bash
cd backend
python validate_mongodb_config.py
```

### 2. Run Migrations
```bash
python manage.py migrate
```

### 3. Run Tests
```bash
python manage.py test
```

### 4. Create Sample Data
```bash
python manage.py createsuperuser
```

## CI/CD Configuration

The CI pipeline now uses Django 4.2.x:
- Tests run with SQLite (in-memory database)
- Production deployments should use PostgreSQL/MySQL
- MongoDB is optional and configured via environment variables

## Environment Variables

Required for basic operation:
```bash
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

Optional for MongoDB:
```bash
MONGO_URI=mongodb+srv://...
```

Database configuration (for PostgreSQL/MySQL):
```bash
DB_ENGINE=django.db.backends.postgresql
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
```

## Troubleshooting

### Tests Failing
If tests fail with database errors:
1. Ensure Django 4.2+ is installed: `python -c "import django; print(django.get_version())"`
2. Run migrations: `python manage.py migrate`
3. Check database permissions

### MongoDB Connection Issues
1. Verify MONGO_URI is correct
2. Check IP whitelist in MongoDB Atlas
3. Verify credentials
4. Run validation script: `python validate_mongodb_config.py`

### Missing Dependencies
Install required packages:
```bash
# Option 1: From requirements.txt
pip install -r requirements.txt

# Option 2: System packages (Ubuntu/Debian)
sudo apt-get install python3-django python3-pymongo
```

## Support

For issues or questions:
1. Check Django 4.2 documentation: https://docs.djangoproject.com/en/4.2/
2. PyMongo documentation: https://pymongo.readthedocs.io/
3. Open an issue in the repository
