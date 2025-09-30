# MongoDB Atlas Setup Guide for EasyCart

This guide explains how to configure EasyCart backend to use MongoDB Atlas instead of SQLite.

## Prerequisites

1. MongoDB Atlas account (create one at https://cloud.mongodb.com)
2. Python 3.8 or higher
3. pip package manager

## Installation Steps

### 1. Install Required Dependencies

```bash
pip install djongo==1.3.6 pymongo==3.12.3
```

Or install all dependencies from requirements.txt:

```bash
pip install -r requirements.txt
```

### 2. Set Up MongoDB Atlas

1. Go to https://cloud.mongodb.com and sign in
2. Create a new cluster (free tier is available)
3. Create a database user:
   - Username: `easycart`
   - Password: `easycart2024` (or your preferred password)
4. Whitelist IP addresses:
   - For development: Add your current IP
   - For production: Add `0.0.0.0/0` (all IPs) or specific server IPs
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (should look like: `mongodb+srv://easycart:<password>@cluster0.mongodb.net/`)

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory (or update your existing one):

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://easycart:easycart2024@your-cluster.mongodb.net/?retryWrites=true&w=majority

# Other required settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Important Notes:**
- Replace `your-cluster` with your actual MongoDB Atlas cluster address
- Replace `easycart2024` with your actual database password
- The database name `easycart` is automatically configured in settings.py

### 4. Database Configuration

The settings.py file now supports two configurations:

**With MongoDB (when MONGO_URI is set):**
```python
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'CLIENT': {
            'host': MONGO_URI,
        },
        'NAME': 'easycart',
    }
}
```

**Without MongoDB (fallback to SQLite):**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### 5. Run Migrations

After setting up MongoDB, run Django migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

Create an admin user for Django admin panel:

```bash
python manage.py createsuperuser
```

### 7. Run the Server

```bash
python manage.py runserver
```

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Check that your IP is whitelisted in MongoDB Atlas
2. Verify your connection string is correct
3. Ensure your database user credentials are correct
4. Check that your cluster is running

### Import Errors

If you get "No module named 'djongo'" error:
```bash
pip install djongo==1.3.6 pymongo==3.12.3
```

### Migration Issues

If migrations fail:
1. Delete the `migrations` folders in your apps (except `__init__.py`)
2. Run `python manage.py makemigrations` again
3. Run `python manage.py migrate`

## Production Deployment

For production environments:

1. Set `DEBUG=False` in your .env file
2. Use a strong `SECRET_KEY`
3. Restrict `ALLOWED_HOSTS` to your domain(s)
4. Use environment-specific MongoDB connection strings
5. Never commit your `.env` file to version control

### Example Production .env

```env
DEBUG=False
SECRET_KEY=your-very-strong-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
MONGO_URI=mongodb+srv://easycart:production-password@cluster0.mongodb.net/?retryWrites=true&w=majority
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Compatibility Notes

- **Djongo Version**: 1.3.6 is compatible with Django 3.x and 4.x
- **PyMongo Version**: 3.12.3 is required for Djongo 1.3.6
- **Database Name**: Hardcoded to "easycart" in settings.py
- **Auto-failback**: If MONGO_URI is not set, the system falls back to SQLite

## Additional Resources

- [Djongo Documentation](https://www.djongomapper.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Django Documentation](https://docs.djangoproject.com/)
