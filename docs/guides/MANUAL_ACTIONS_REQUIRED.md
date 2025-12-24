# 🎯 MANUAL ACTION REQUIRED - Step-by-Step Guide

## ✅ What Was Done Automatically

I've successfully integrated the new security features into your codebase:

1. ✅ **Updated M-Pesa Gateway** - Now uses instance methods with environment awareness
2. ✅ **Added Rate Limiting** - Payment endpoints protected (10 requests/min)
3. ✅ **Enhanced Health Checks** - New comprehensive monitoring endpoints
4. ✅ **Added Metrics Endpoint** - Staff-only performance metrics

**Files Modified:**
- `backend/apps/payments/views.py` - M-Pesa gateway and rate limiting
- `backend/ecommerce/urls.py` - Health checks and metrics endpoints

---

## 🚀 REQUIRED MANUAL ACTIONS

### **STEP 0: Rotate Your Redis Credential (Upstash)** ⏱️ 5–10 minutes

Your current `REDIS_URL` is a managed Upstash Redis URL (`rediss://...upstash.io`). Since it was printed in terminal output during diagnostics, **rotate it now**.

**A) Rotate in Upstash**
1. Sign in to the Upstash Console.
2. Open your Redis database (the one used by EasyCart).
3. Go to the database **Details** / **Security** section (wording varies).
4. Click **Rotate password** / **Reset password** (or equivalent).
5. Copy the newly generated **Redis connection string** (TLS `rediss://...`).

**B) Update your app**
1. Open `backend/.env` and replace `REDIS_URL=...` with the new value.
2. Restart the server (`python manage.py runserver`) and re-test `/api/health/`.

**C) (Recommended) Align Redis region with your app**
- If Redis is far from your app region, cache round-trips can take 1–3 seconds.
- For production performance, place Redis in the same region/network as the app.

**D) If you are using Upstash REST (optional)**
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are for Upstash's REST API.
- This Django project uses `REDIS_URL` via `django-redis` (Redis protocol), so these REST vars are **not required** unless you have a separate service using them.
- If you do use REST elsewhere, rotate the REST token in Upstash (Console → your Redis DB → REST API / Tokens → Regenerate/Rotate), then update that service’s environment variables.

### **STEP 1: Update Environment Variables** ⏱️ 5 minutes

Edit your `.env` file (create if it doesn't exist):

```bash
cd backend
cp .env.example .env
# Then edit .env
```

**Add these NEW variables (and fill real values):**

```bash
# M-Pesa Security Configuration
MPESA_ENVIRONMENT=sandbox
MPESA_VERIFY_SIGNATURES=True

# Generate webhook secret (run this in terminal):
# python -c "import secrets; print(secrets.token_hex(32))"
MPESA_WEBHOOK_SECRET=your-generated-secret-here

# Optional but HIGHLY RECOMMENDED for production
SENTRY_DSN=your-sentry-dsn-here

# Health check thresholds (milliseconds)
# These control when /api/health/ reports degraded/unhealthy for slow dependencies.
HEALTHCHECK_DB_DEGRADED_MS=250
HEALTHCHECK_DB_UNHEALTHY_MS=2000
HEALTHCHECK_CACHE_DEGRADED_MS=250
HEALTHCHECK_CACHE_UNHEALTHY_MS=10000

# Redis
# Dev: use local Redis for fast cache checks
# Prod: use a Redis instance close to your app (same region) for low latency
REDIS_URL=redis://localhost:6379/1

**Where to get the required values (quick reference):**

- `SECRET_KEY`: generate yourself (never reuse between envs)
    - PowerShell: `python -c "import secrets; print(secrets.token_urlsafe(64))"`
- `DEBUG`: `True` for dev, `False` for prod
- `ALLOWED_HOSTS`: your domain(s) and/or app service hostnames
- `DB_*`: your Postgres provider or local Postgres settings
- `CORS_ALLOWED_ORIGINS`: your frontend URL(s)
- `TWILIO_*`: Twilio Console → Account SID/Auth Token/Numbers
- `SENTRY_DSN`: Sentry project settings → DSN
- `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET`: Safaricom Daraja portal app credentials
- `MPESA_PASSKEY` / `MPESA_SHORTCODE`: from Safaricom (Daraja) for your paybill/till
- `MPESA_CALLBACK_URL`: must be a publicly reachable HTTPS URL in production
- `MPESA_WEBHOOK_SECRET`: generate locally (see below)
- `REDIS_URL`: Upstash Console (or your Redis provider) connection string
```

**How to generate MPESA_WEBHOOK_SECRET:**

```powershell
# In PowerShell:
python -c "import secrets; print(secrets.token_hex(32))"
# Copy the output to your .env file
```

---

### **STEP 2: Verify Environment Setup** ⏱️ 2 minutes

```powershell
# Activate virtual environment (you already did this)
cd C:\EasyCart\backend
.\venv\Scripts\Activate.ps1

# Verify new modules are accessible
python -c "from utils.logging_filters import PIIMaskingFilter; print('✅ Logging filters OK')"
python -c "from utils.health_checks import HealthCheckView; print('✅ Health checks OK')"
python -c "from apps.throttling import PaymentRateThrottle; print('✅ Throttling OK')"
python -c "from utils.cache_helpers import CacheManager; print('✅ Cache helpers OK')"
```

**Expected output:** Four ✅ messages

**If you get import errors:** The files are already created in the correct locations, so this should work.

---

### **STEP 3: Test Health Check Endpoint** ⏱️ 2 minutes

Start your development server:

```powershell
python manage.py runserver
```

In a new terminal, test the health check:

```powershell
# Test comprehensive health check
curl http://localhost:8000/api/health/

# Or in PowerShell:
Invoke-WebRequest -Uri "http://localhost:8000/api/health/" | Select-Object -ExpandProperty Content
```

**Expected response (note on Redis latency):**
- If you use **local Redis** (`redis://localhost:6379/1`), cache should typically be a few milliseconds.
- If you use **remote managed Redis** (Upstash `rediss://...`), cache can be **slow** (1s+) depending on region and plan; `/api/health/` may show `cache: degraded`.

Example response:
```json
{
    "status": "degraded",
  "timestamp": 1734278400,
    "response_time_ms": 1715.2,
  "checks": {
        "database": {"status": "healthy", "response_time_ms": 5.1},
        "cache": {"status": "degraded", "response_time_ms": 1500.0},
    "disk": {"status": "healthy", "free_percent": 45.2}
  }
}
```

---

### **STEP 4: Test PII Masking in Logs** ⏱️ 3 minutes

Open Django shell:

```powershell
python manage.py shell
```

Run these tests:

```python
import logging
logger = logging.getLogger(__name__)

# Test 1: Phone number masking
logger.info("Customer phone: +254712345678")
# Expected in logs: +254****5678

# Test 2: Email masking
logger.info("User email: john.doe@example.com")
# Expected in logs: jo***@example.com

# Test 3: M-Pesa environment
from apps.payments.gateways.mpesa_gateway import MPesaGateway
gateway = MPesaGateway()
print(f"M-Pesa Environment: {gateway.environment}")
# Expected: sandbox

# Exit shell
exit()
```

**Check your logs:**
```powershell
# View last 20 lines of logs
Get-Content backend\logs\django.log -Tail 20
```

**You should see masked PII**, not full phone numbers/emails!

---

### **STEP 5: Test Rate Limiting** ⏱️ 3 minutes

Test that login rate limiting works:

```powershell
# Try to login 10 times with wrong password
for ($i=1; $i -le 10; $i++) {
    Write-Host "Attempt $i"
    Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login/" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"email":"test@test.com","password":"wrong"}' `
        -UseBasicParsing
}
```

**Expected:** After 5 attempts, you should get `429 Too Many Requests`

---

### **STEP 6: Run Security Audit** ⏱️ 5 minutes

**Install security tools (if not already installed):**

```powershell
pip install bandit safety
```

**Run security scans:**

```powershell
cd backend

# 1. Code security scan
bandit -r . -f json -o security_report.json

# 2. Dependency vulnerabilities
safety check

# 3. View results
notepad security_report.json
```

**Expected:**
- Bandit: 0 high severity issues
- Safety: No critical vulnerabilities

---

### **STEP 7: Test M-Pesa Integration** ⏱️ 5 minutes

**IMPORTANT:** Only test in sandbox mode!

In Django shell:

```python
from apps.payments.gateways.mpesa_gateway import MPesaGateway
from apps.payments.models import Payment
from apps.orders.models import Order
from django.contrib.auth import get_user_model

User = get_user_model()

# Get a test user and order (adjust IDs as needed)
user = User.objects.first()
order = Order.objects.filter(user=user).first()

# If you have an order, test M-Pesa initialization
if order:
    gateway = MPesaGateway()
    print(f"Environment: {gateway.environment}")
    print(f"Base URL: {gateway.BASE_URL}")
    # Expected: Environment: sandbox, Base URL: https://sandbox.safaricom.co.ke

exit()
```

---

## 🔍 VERIFICATION CHECKLIST

After completing the steps above, verify:

- [ ] ✅ Environment variables set in `.env`
- [ ] ✅ Health check returns 200 OK with component status
- [ ] ✅ Logs show masked PII (not full phone numbers)
- [ ] ✅ Rate limiting blocks requests after threshold
- [ ] ✅ Security audit shows 0 critical issues
- [ ] ✅ M-Pesa gateway uses correct environment (sandbox)
- [ ] ✅ No import errors when importing new modules

---

## 🎓 OPTIONAL: Additional Testing

### Test Cache Performance

```python
# In Django shell
from utils.cache_helpers import CacheManager, get_cache_stats

# Test cache
def expensive_operation():
    return "Computed value"

# First call - cache miss
result1 = CacheManager.get_or_set(
    key='test_key',
    default_fn=expensive_operation,
    ttl=CacheManager.TTL_MEDIUM
)
print(f"First call: {result1}")

# Second call - cache hit
result2 = CacheManager.get_or_set(
    key='test_key',
    default_fn=expensive_operation,
    ttl=CacheManager.TTL_MEDIUM
)
print(f"Second call (from cache): {result2}")

# Check cache stats
stats = get_cache_stats()
print(f"Cache stats: {stats}")

exit()
```

### Test Correlation IDs

```powershell
# Make a request and check for correlation ID in response
Invoke-WebRequest -Uri "http://localhost:8000/api/products/" | Select-Object Headers

# You should see X-Correlation-ID in the response headers
```

---

## 🚨 TROUBLESHOOTING

### Issue: Import Error for new modules

**Solution:**
```powershell
# Ensure you're in the backend directory
cd C:\EasyCart\backend

# Check if files exist
Test-Path utils\logging_filters.py
Test-Path utils\health_checks.py
Test-Path apps\throttling.py

# All should return: True
```

### Issue: Health check returns 500 error

**Solution:**
```powershell
# Check if Redis is running (required for cache check)
redis-cli ping
# Expected: PONG

# If Redis not installed/running, the health check will show cache as "degraded"
# This is OK for development, but cache will be faster with Redis
```

### Issue: Rate limiting doesn't work

**Solution:**
```powershell
# Verify Redis cache is configured
python manage.py shell
>>> from django.core.cache import cache
>>> cache.set('test', 'value')
>>> cache.get('test')
# Expected: 'value'
```

### Issue: PII still visible in logs

**Solution:**
Check `backend/ecommerce/settings.py` - the LOGGING configuration should have:
```python
'filters': {
    'pii_masking': {'()': 'utils.logging_filters.PIIMaskingFilter'},
}
```

This is already configured in the updated settings.py.

---

## 📊 NEXT STEPS AFTER VERIFICATION

### This Week:
1. ⏳ **Deploy to Staging** - Test in production-like environment
2. ⏳ **Configure Sentry** - Add error monitoring
3. ⏳ **Load Testing** - Verify performance under load
4. ⏳ **Team Review** - Have team members test new features

### Before Production:
1. ⏳ **Complete Pre-Production Checklist** - See `PRE_PRODUCTION_CHECKLIST.md`
2. ⏳ **Switch M-Pesa to Production** - Update `MPESA_ENVIRONMENT=production`
3. ⏳ **Configure Monitoring** - Set up alerts and dashboards
4. ⏳ **Backup Plan** - Document rollback procedures

---

## 📞 NEED HELP?

**Reference Documentation:**
- Full details: [SECURITY_REFACTORING_SUMMARY.md](SECURITY_REFACTORING_SUMMARY.md)
- Integration guide: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- Deployment: [PRE_PRODUCTION_CHECKLIST.md](PRE_PRODUCTION_CHECKLIST.md)

**Common Questions:**

**Q: Can I skip Redis for development?**
A: Yes, but cache checks will show "degraded". Install Redis for full features:
```powershell
# Using Chocolatey (Windows)
choco install redis-64
redis-server
```

**Q: How do I test in production mode locally?**
A: Set `DEBUG=False` in `.env`, but ensure you have:
- Secret key configured
- Allowed hosts set
- Static files collected: `python manage.py collectstatic`

**Q: When should I enable M-Pesa production mode?**
A: Only after:
- All tests pass in sandbox
- Load testing complete
- Production credentials obtained from Safaricom
- Webhook URL configured and accessible

---

## ✅ YOU'RE READY WHEN:

- [x] All manual steps completed above
- [x] Health check returns healthy status
- [x] Security audit passes
- [x] PII masking verified in logs
- [x] Rate limiting tested and working
- [x] Team has reviewed changes

**Status:** Once verified, you're ready for staging deployment! 🚀

---

**Created:** December 15, 2025
**Last Updated:** Auto-generated after implementation
**Version:** 1.0
