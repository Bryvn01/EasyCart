# Railway Free Tier Setup Guide
# Solutions for handling database sleep issues

## Problem
Railway's free tier databases sleep after 5-10 minutes of inactivity, causing:
- Deployment failures
- First request after sleep takes 3-5 seconds
- Connection timeout errors

## Solutions Implemented

### 1. Database Retry Logic ✅

**Health checks now retry automatically:**
- 2 retry attempts with exponential backoff
- Tolerates slower wake-up times (up to 5 seconds)
- Reports "degraded" status during wake-up

**Location:** `backend/utils/health_checks.py`

### 2. Keep-Alive Command ✅

**Prevents database from sleeping:**

```powershell
# Run locally to keep Railway DB awake
cd C:\EasyCart\backend
python manage.py keep_db_alive
```

**Options:**
- Default: Pings every 5 minutes
- Custom interval: `python manage.py keep_db_alive --interval 180` (3 minutes)

**Location:** `backend/apps/core/management/commands/keep_db_alive.py`

### 3. Retry Decorator for Critical Operations ✅

**Usage in your code:**

```python
from utils.db_wrapper import retry_on_db_error, wake_database

# Option 1: Decorator for functions
@retry_on_db_error(max_retries=3, delay=2)
def get_products():
    return Product.objects.all()

# Option 2: Explicit wake before critical operations
def process_order(order_id):
    wake_database()  # Ensures DB is awake
    order = Order.objects.get(id=order_id)
    # ... process order
```

**Location:** `backend/utils/db_wrapper.py`

## Recommended Configuration

### For Local Development

Keep Railway DB awake while developing:

```powershell
# Terminal 1: Run Django server
cd C:\EasyCart\backend
python manage.py runserver

# Terminal 2: Keep DB alive
python manage.py keep_db_alive
```

### For Production (Render Deployment)

Update your environment variables on Render:

```env
# Increased timeouts for Railway free tier
HEALTHCHECK_DB_DEGRADED_MS=1000
HEALTHCHECK_DB_UNHEALTHY_MS=5000
HEALTHCHECK_DB_RETRIES=2

# Database connection settings
CONN_MAX_AGE=0  # Don't pool connections (they timeout during sleep)
DB_CONNECT_TIMEOUT=10
```

## Alternative: External Keep-Alive Services

### Option A: UptimeRobot (Free)
1. Go to https://uptimerobot.com/
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://easycart-backend-2k8l.onrender.com/api/health/`
   - Interval: 5 minutes
3. This pings your API, which pings Railway DB

### Option B: Cron-job.org (Free)
1. Go to https://cron-job.org/
2. Create job:
   - URL: `https://easycart-backend-2k8l.onrender.com/api/health/`
   - Interval: Every 5 minutes
3. Keeps DB awake via health checks

### Option C: GitHub Actions (Free)
Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Railway DB Alive
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping health endpoint
        run: curl -f https://easycart-backend-2k8l.onrender.com/api/health/
```

## Cost Comparison

| Solution | Cost | Reliability | Setup Difficulty |
|----------|------|-------------|------------------|
| **Railway Free + Keep-Alive** | $0/month | 95% | Easy |
| **Railway Free + UptimeRobot** | $0/month | 98% | Very Easy |
| **Railway Paid** | $5-10/month | 99.9% | Easy |
| **Render PostgreSQL** | $7/month | 99.9% | Medium |
| **Supabase Free** | $0/month | 99% | Medium |

## Best Practices for Railway Free Tier

### 1. Update Your Backend Settings

**backend/ecommerce/settings.py:**

```python
# Railway-optimized database settings
DATABASES = {
    "default": {
        # ... existing config ...
        "CONN_MAX_AGE": 0,  # Don't pool - connections timeout
        "OPTIONS": {
            "connect_timeout": 10,  # Allow time for wake-up
            "options": "-c statement_timeout=30000",
        }
    }
}
```

### 2. Add Retry to Critical Views

**Example: Product list view**

```python
from utils.db_wrapper import retry_on_db_error

class ProductListView(APIView):
    @retry_on_db_error(max_retries=2)
    def get(self, request):
        products = Product.objects.all()
        # ... rest of code
```

### 3. Monitor Health Status

Check your health endpoint regularly:

```powershell
curl https://easycart-backend-2k8l.onrender.com/api/health/
```

Expected response when DB is waking:
```json
{
  "status": "degraded",
  "checks": {
    "database": {
      "status": "degraded",
      "response_time_ms": 2500,
      "message": "Database response degraded (2500ms, waking from sleep)",
      "retries": 1
    }
  }
}
```

## Migration to Paid Tier (When Ready)

When you're ready to upgrade:

### Railway Paid ($5-10/month)
```bash
railway login
railway link
railway database upgrade
```

### Or Render PostgreSQL ($7/month)
Follow the guide in `RENDER_DATABASE_SETUP.md`

## Troubleshooting

### Database still timing out?

1. **Increase retries:**
   ```env
   HEALTHCHECK_DB_RETRIES=3
   ```

2. **Increase timeout:**
   ```python
   # settings.py
   "OPTIONS": {
       "connect_timeout": 15,  # Increase to 15 seconds
   }
   ```

3. **Check Railway dashboard:**
   - Database might be over quota
   - Check error logs

### Keep-alive not working?

1. **Check if script is running:**
   ```powershell
   # Should show python process
   Get-Process python
   ```

2. **Check logs:**
   ```powershell
   python manage.py keep_db_alive --interval 60
   ```

3. **Use external service:**
   Set up UptimeRobot instead

## Summary

✅ **Implemented:**
- Health check retry logic
- Keep-alive management command
- Database retry decorator
- Increased timeout thresholds

🎯 **Recommended:**
- Use UptimeRobot for production (easiest, free)
- Run keep_db_alive during local development
- Upgrade to paid tier when budget allows

📊 **Current Status:**
- Railway free tier: Works with workarounds
- Deployment: Will succeed after DB wake-up
- User experience: ~1-3 second delay on first request after sleep
