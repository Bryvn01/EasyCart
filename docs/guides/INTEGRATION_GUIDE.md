# 🚀 Quick Integration Guide

## Integrating New Security Features

### 1. Add Health Check URLs

Add these endpoints to your `backend/ecommerce/urls.py`:

```python
from django.urls import path
from utils.health_checks import (
    HealthCheckView,
    ReadinessCheckView,
    LivenessCheckView,
    MetricsView
)

urlpatterns = [
    # ... existing patterns ...

    # Health check endpoints
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
    path('api/health/ready/', ReadinessCheckView.as_view(), name='readiness-check'),
    path('api/health/live/', LivenessCheckView.as_view(), name='liveness-check'),
    path('api/metrics/', MetricsView.as_view(), name='metrics'),
]
```

### 2. Apply Rate Limiting to Payment Endpoints

In your `backend/apps/payments/views.py`, add throttle classes:

```python
from rest_framework.decorators import throttle_classes
from apps.throttling import PaymentRateThrottle

class PaymentView(APIView):
    throttle_classes = [PaymentRateThrottle]

    def post(self, request):
        # Your payment logic
        pass
```

### 3. Update M-Pesa View to Use New Gateway

In `backend/apps/payments/views.py`, update M-Pesa initialization:

```python
from apps.payments.gateways.mpesa_gateway import MPesaGateway

def initiate_payment(request):
    # OLD: MPesaGateway.initiate_stk_push(payment, phone)
    # NEW: Create instance first
    gateway = MPesaGateway()
    result = gateway.initiate_stk_push(payment, phone_number)
```

### 4. Use Cache Helpers in Views

Example for product listing with caching:

```python
from utils.cache_helpers import CacheManager, invalidate_product_cache

def get_products(request):
    cache_key = CacheManager.generate_key('products', 'list', category=request.GET.get('category'))

    def fetch_products():
        return Product.objects.filter(is_active=True).select_related('category')

    products = CacheManager.get_or_set(
        key=cache_key,
        default_fn=fetch_products,
        ttl=CacheManager.TTL_MEDIUM,
        tags=['products']
    )

    return Response(ProductSerializer(products, many=True).data)

# When product is updated
def update_product(request, pk):
    product = Product.objects.get(pk=pk)
    # ... update logic ...
    product.save()

    # Invalidate cache
    invalidate_product_cache(product_id=pk)
```

### 5. Use Security Helpers

```python
from utils.security_helpers import mask_phone_number, mask_email
import logging

logger = logging.getLogger(__name__)

def send_otp(phone_number):
    # Logs will automatically mask PII due to filters,
    # but for extra safety use mask functions explicitly
    logger.info(f"Sending OTP to {mask_phone_number(phone_number)}")
```

### 6. Environment Variables

Update your `.env` file with:

```bash
# M-Pesa Security
MPESA_ENVIRONMENT=sandbox
MPESA_VERIFY_SIGNATURES=True
MPESA_WEBHOOK_SECRET=<generate-random-secret>

# Optional but recommended
SENTRY_DSN=<your-sentry-dsn>
```

### 7. Generate Webhook Secret

```bash
# In Python shell
python manage.py shell
>>> import secrets
>>> secrets.token_hex(32)
'<copy this value to MPESA_WEBHOOK_SECRET>'
```

### 8. Test Health Checks

```bash
# Local testing
curl http://localhost:8000/api/health/ | jq

# Expected response
{
  "status": "healthy",
  "timestamp": 1734278400.123,
  "response_time_ms": 15.2,
  "checks": {
    "database": {"status": "healthy", "response_time_ms": 5.1},
    "cache": {"status": "healthy", "response_time_ms": 2.3},
    "disk": {"status": "healthy", "free_percent": 45.2}
  }
}
```

### 9. Kubernetes/Docker Configuration

If deploying with Kubernetes, update your deployment YAML:

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: backend
    image: your-image:latest
    livenessProbe:
      httpGet:
        path: /api/health/live/
        port: 8000
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /api/health/ready/
        port: 8000
      initialDelaySeconds: 10
      periodSeconds: 5
```

### 10. Monitoring Setup

For Sentry integration (already configured):

```bash
# Install Sentry SDK (already in requirements.txt)
pip install sentry-sdk

# In .env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Test Sentry
python manage.py shell
>>> import sentry_sdk
>>> sentry_sdk.capture_message("Test message from EasyCart")
```

---

## Testing the Implementation

### Security Tests

```bash
# 1. Test PII masking
python manage.py shell
>>> import logging
>>> logger = logging.getLogger(__name__)
>>> logger.info("User phone: +254712345678")
# Check logs/django.log - should show: +254****5678

# 2. Test rate limiting
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' \
  --repeat 10
# Should get 429 Too Many Requests after 5 attempts

# 3. Test M-Pesa environment
python manage.py shell
>>> from apps.payments.gateways.mpesa_gateway import MPesaGateway
>>> gateway = MPesaGateway()
>>> print(gateway.environment)
# Should print: sandbox

# 4. Test cache
python manage.py shell
>>> from utils.cache_helpers import get_cache_stats
>>> get_cache_stats()
# Should return: {'hits': 0, 'misses': 0, 'hit_rate': 0.0}
```

### Performance Tests

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/products/

# Check cache hit rate
curl http://localhost:8000/api/metrics/ \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq '.cache'
```

---

## Troubleshooting

### Issue: Health check fails with cache error

**Solution:** Ensure Redis is running

```bash
# Start Redis
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis:alpine
```

### Issue: PII still visible in logs

**Solution:** Ensure logging filters are applied

```python
# In settings.py, verify:
LOGGING = {
    'filters': {
        'pii_masking': {'()': 'utils.logging_filters.PIIMaskingFilter'},
    },
    'handlers': {
        'console': {
            'filters': ['pii_masking'],
        },
    },
}
```

### Issue: Rate limiting not working

**Solution:** Check Redis cache is accessible

```bash
python manage.py shell
>>> from django.core.cache import cache
>>> cache.set('test', 'value')
>>> cache.get('test')
# Should return: 'value'
```

### Issue: M-Pesa still using sandbox in production

**Solution:** Set environment variable correctly

```bash
# In .env
MPESA_ENVIRONMENT=production  # NOT 'prod' or 'live'

# Verify
python manage.py shell
>>> from django.conf import settings
>>> settings.MPESA_ENVIRONMENT
# Should print: 'production'
```

---

## Migration Path

### Gradual Rollout (Recommended)

1. **Week 1: Deploy to staging**
   - Test all endpoints
   - Verify logging works correctly
   - Test payment flow in sandbox

2. **Week 2: Enable monitoring**
   - Add health checks to load balancer
   - Set up log aggregation
   - Configure Sentry alerts

3. **Week 3: Production deployment**
   - Deploy during low-traffic period
   - Monitor error rates closely
   - Keep rollback plan ready

4. **Week 4: Enable M-Pesa production**
   - Switch `MPESA_ENVIRONMENT=production`
   - Enable signature verification
   - Test with small real transactions

---

## Success Verification

### ✅ Checklist

- [ ] Health check returns 200 OK
- [ ] Logs show masked PII (e.g., +254****1234)
- [ ] Rate limiting blocks excessive requests
- [ ] Cache hit rate >50% for product listings
- [ ] M-Pesa environment matches deployment stage
- [ ] Correlation IDs present in logs
- [ ] Sentry receiving errors (test with intentional error)
- [ ] Metrics endpoint accessible to staff

---

**Ready to Deploy?** Review the main [SECURITY_REFACTORING_SUMMARY.md](SECURITY_REFACTORING_SUMMARY.md) for complete details.
