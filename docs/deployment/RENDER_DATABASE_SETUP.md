# Render PostgreSQL Database Setup & Migration Guide

## Step 1: Create Render PostgreSQL Database

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click "New +" → Select "PostgreSQL"**
3. **Configure Database:**
   - **Name:** `easycart-db`
   - **Database:** `easycart` (auto-created)
   - **User:** `easycart_user` (auto-created)
   - **Region:** Choose closest to your backend service (e.g., Oregon, Frankfurt)
   - **Plan:** Starter ($7/month) - includes:
     - 256 MB RAM
     - 1 GB SSD Storage
     - Always-on (no sleeping)
     - Automatic backups
4. **Click "Create Database"**
5. **Wait 2-3 minutes** for provisioning

## Step 2: Get Database Credentials

After creation, you'll see:
- **Internal Database URL** (for Render services): `postgresql://...`
- **External Database URL** (for local access): `postgresql://...`
- **PSQL Command** for direct connection
- Individual credentials: Host, Port, Database, Username, Password

**Save these credentials** - you'll need them for migration.

## Step 3: Export Data from Railway

### Option A: Using Railway CLI (Recommended)

```powershell
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Export database
railway db dump > railway_backup.sql
```

### Option B: Using pg_dump Directly

```powershell
# Get Railway credentials from your Railway dashboard
# Then run:
pg_dump -h metro.proxy.rlwy.net -p 30088 -U postgres -d railway --clean --if-exists > railway_backup.sql
# Enter password when prompted
```

### Option C: From Render Backend (Fallback)

If Railway database is sleeping and you can't connect:

```powershell
# Use Django to export data
cd C:\EasyCart\backend
python manage.py dumpdata --natural-foreign --natural-primary --exclude contenttypes --exclude auth.Permission > data_backup.json
```

## Step 4: Import Data to Render Database

### Method 1: Using psql (Best for SQL dumps)

```powershell
# Get the External Database URL from Render dashboard
# Format: postgresql://user:password@host/database

# Import the backup
psql "postgresql://easycart_user:PASSWORD@HOST/easycart" < railway_backup.sql
```

### Method 2: Using Django (Best for JSON dumps)

```powershell
# Update .env with Render credentials temporarily
cd C:\EasyCart\backend

# Run migrations to create tables
python manage.py migrate

# Load data
python manage.py loaddata data_backup.json
```

## Step 5: Link Database to Render Backend Service

1. **Go to your Render Backend Service**
2. **Navigate to "Environment" tab**
3. **Add Database Link:**
   - Click "Link Database"
   - Select `easycart-db`
   - This automatically adds `DATABASE_URL` environment variable

4. **Remove old Railway variables** (if they exist):
   - Delete `DB_HOST`
   - Delete `DB_PORT`
   - Delete `DB_NAME`
   - Delete `DB_USER`
   - Delete `DB_PASSWORD`

   *The `DATABASE_URL` from the linked database will be used instead*

## Step 6: Update settings.py for Production

Your settings.py already has good database configuration. Just ensure it can use `DATABASE_URL`:

```python
# In settings.py, update DATABASES section to:
import dj_database_url

DATABASES = {
    "default": dj_database_url.config(
        default=f"postgresql://{config('DB_USER')}:{config('DB_PASSWORD')}@{config('DB_HOST')}:{config('DB_PORT')}/{config('DB_NAME')}",
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

## Step 7: Verify Migration

After deploying:

```bash
# Check database connection
curl https://easycart-backend-2k8l.onrender.com/api/health/

# Should return:
{
  "status": "healthy",
  "database": "healthy",
  ...
}
```

## Step 8: Test Your Application

1. **Frontend:** https://easycart-frontend-wj9x.onrender.com
2. **Admin Dashboard:** https://easycart-admin-dashboard.onrender.com
3. **Check:**
   - User login works
   - Products display correctly
   - Orders are visible in admin
   - M-Pesa integration functional

## Step 9: Cleanup (After Verification)

**Keep Railway for 1-2 weeks** as backup, then:
1. Go to Railway dashboard
2. Delete the database (or downgrade to free tier for future testing)

## Troubleshooting

### Connection Timeout
```python
# Increase timeout in settings.py
"OPTIONS": {
    "connect_timeout": 30,
}
```

### SSL Required Error
```python
# Add SSL mode
"OPTIONS": {
    "sslmode": "require",
}
```

### Migration Fails
```bash
# Reset migrations (CAREFUL - only if empty database)
python manage.py migrate --fake-initial
```

## Cost Breakdown

- **Render PostgreSQL Starter:** $7/month
- **Automatic daily backups:** Included
- **99.9% uptime SLA:** Included
- **No sleeping:** Always-on database

## Next Steps After Setup

1. ✅ Set up automated backups schedule
2. ✅ Configure database monitoring alerts
3. ✅ Document connection credentials securely
4. ✅ Update team documentation
5. ✅ Test disaster recovery process
