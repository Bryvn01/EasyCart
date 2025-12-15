# ✅ Pre-Production Security Checklist

## Environment Configuration

### Required Environment Variables
- [ ] `SECRET_KEY` - Strong, random key (min 50 chars)
- [ ] `DEBUG=False` in production
- [ ] `ALLOWED_HOSTS` - Explicit domain list (no wildcards)
- [ ] `MPESA_ENVIRONMENT=production` (when ready)
- [ ] `MPESA_VERIFY_SIGNATURES=True`
- [ ] `MPESA_WEBHOOK_SECRET` - Generated secure secret
- [ ] `SENTRY_DSN` - Error monitoring configured
- [ ] `REDIS_URL` - Redis connection string
- [ ] `DATABASE_URL` or DB_* variables configured

### Security Headers (Verify in settings.py)
- [ ] `SECURE_SSL_REDIRECT=True`
- [ ] `SESSION_COOKIE_SECURE=True`
- [ ] `CSRF_COOKIE_SECURE=True`
- [ ] `SECURE_HSTS_SECONDS=31536000`
- [ ] `SECURE_HSTS_INCLUDE_SUBDOMAINS=True`
- [ ] `SECURE_HSTS_PRELOAD=True`
- [ ] `SECURE_CONTENT_TYPE_NOSNIFF=True`
- [ ] `X_FRAME_OPTIONS='DENY'`

### CORS Configuration
- [ ] `CORS_ALLOWED_ORIGINS` - Explicit allowlist only
- [ ] No `CORS_ALLOW_ALL_ORIGINS=True` in production
- [ ] `CORS_ALLOW_CREDENTIALS=True`
- [ ] `CSRF_TRUSTED_ORIGINS` matches CORS origins

---

## Security Audit

### Code Security
- [ ] Run `bandit -r backend/ --skip B101,B104`
- [ ] Run `safety check` on requirements.txt
- [ ] Run `pip-audit` for dependency vulnerabilities
- [ ] No hardcoded credentials in code
- [ ] No debug print statements in production code
- [ ] All secrets in environment variables

### Authentication & Authorization
- [ ] JWT tokens expire appropriately (60 min access, 7 day refresh)
- [ ] Refresh token rotation enabled
- [ ] Strong password validation active
- [ ] 2FA available for admin users
- [ ] Rate limiting on login endpoints (5/5min)
- [ ] Rate limiting on registration (3/hour)

### Payment Security
- [ ] M-Pesa using production environment
- [ ] Webhook signature verification enabled
- [ ] Payment rate limiting active (10/min)
- [ ] Payment callbacks logged to audit trail
- [ ] No PII in payment logs
- [ ] HTTPS only for payment endpoints

### Data Protection
- [ ] PII masking filters active in logging
- [ ] Audit logging enabled for sensitive operations
- [ ] Log rotation configured
- [ ] Logs stored securely with restricted access
- [ ] No passwords/secrets in logs

---

## Performance Optimization

### Caching
- [ ] Redis cache configured and accessible
- [ ] Cache hit rate >70% for product listings
- [ ] Cache invalidation on data updates
- [ ] Cache TTLs appropriate for data types

### Database
- [ ] Connection pooling enabled (`CONN_MAX_AGE=600`)
- [ ] Database health checks enabled
- [ ] Indexes on frequently queried columns
- [ ] N+1 queries eliminated (use select_related/prefetch_related)

### Static Files
- [ ] Static files collected: `python manage.py collectstatic`
- [ ] WhiteNoise compression enabled
- [ ] CDN configured for media files (Cloudinary)

---

## Monitoring & Observability

### Health Checks
- [ ] `/api/health/` endpoint returns 200
- [ ] `/api/health/ready/` for load balancer
- [ ] `/api/health/live/` for container orchestration
- [ ] Health checks test database, cache, disk space

### Error Tracking
- [ ] Sentry configured with valid DSN
- [ ] Test Sentry integration
- [ ] Error alerts configured
- [ ] PII scrubbing enabled in Sentry

### Logging
- [ ] Application logs: `logs/django.log`
- [ ] Audit logs: `logs/audit.log`
- [ ] Log aggregation service configured (ELK/CloudWatch)
- [ ] Log retention policy defined
- [ ] Correlation IDs in all logs

### Metrics
- [ ] `/api/metrics/` endpoint accessible to staff
- [ ] Cache statistics available
- [ ] Database connection stats available
- [ ] APM configured (optional but recommended)

---

## Testing

### Functional Tests
- [ ] All unit tests passing: `pytest`
- [ ] Integration tests for payment flow
- [ ] API endpoints return expected responses
- [ ] Authentication flow works correctly
- [ ] Cart/order creation successful

### Security Tests
- [ ] SQL injection tests negative
- [ ] XSS injection tests negative
- [ ] CSRF protection active (except API)
- [ ] Rate limiting triggers correctly
- [ ] Unauthorized access returns 401/403

### Load Tests
- [ ] API handles expected concurrent users
- [ ] Database connections don't exceed pool
- [ ] Cache reduces database load
- [ ] Response times <200ms for cached endpoints
- [ ] No memory leaks during sustained load

### Payment Tests
- [ ] M-Pesa sandbox payments successful
- [ ] Webhook callbacks processed correctly
- [ ] Failed payments handled gracefully
- [ ] Payment status updates in real-time
- [ ] Rate limiting prevents payment spam

---

## Infrastructure

### Server Configuration
- [ ] Gunicorn workers configured (CPU cores * 2 + 1)
- [ ] Nginx/reverse proxy configured
- [ ] SSL certificates valid and auto-renewing
- [ ] Firewall rules restrict unnecessary ports
- [ ] SSH key-only authentication

### Database
- [ ] Automated backups configured
- [ ] Backup restoration tested
- [ ] Connection limits appropriate
- [ ] SSL connections to database (if remote)
- [ ] Read replicas for scaling (if needed)

### Redis
- [ ] Persistence enabled (if needed)
- [ ] Max memory policy configured
- [ ] Password protected
- [ ] Monitoring configured

---

## Deployment

### Pre-Deployment
- [ ] All tests passing in staging
- [ ] Database migrations tested
- [ ] Static files collected
- [ ] Environment variables configured
- [ ] Rollback plan documented
- [ ] Maintenance page ready

### Deployment Steps
- [ ] Deploy during low-traffic period
- [ ] Run migrations: `python manage.py migrate`
- [ ] Collect static: `python manage.py collectstatic --noinput`
- [ ] Restart application servers
- [ ] Clear cache: `python manage.py shell -c "from django.core.cache import cache; cache.clear()"`
- [ ] Verify health check: `curl https://api.domain.com/api/health/`

### Post-Deployment
- [ ] Monitor error rates (should be <0.1%)
- [ ] Check response times (should be <200ms)
- [ ] Verify cache hit rate (should be >70%)
- [ ] Test critical user flows
- [ ] Monitor Sentry for new errors
- [ ] Check payment processing works

---

## Compliance

### Data Protection (Kenya DPA 2019)
- [ ] PII collection minimized
- [ ] PII processing lawful and transparent
- [ ] Data subject rights documented
- [ ] Data breach notification procedure
- [ ] Privacy policy updated
- [ ] Cookie consent implemented (if applicable)

### PCI DSS (Payment Card Industry)
- [ ] No card data stored (using M-Pesa)
- [ ] Payment gateway PCI compliant
- [ ] Secure transmission (HTTPS only)
- [ ] Access logs for payment systems
- [ ] Regular security testing

### GDPR (for international users)
- [ ] Right to access implemented
- [ ] Right to deletion implemented
- [ ] Data portability available
- [ ] Consent management

---

## Documentation

### Developer Documentation
- [ ] README.md updated with new features
- [ ] API documentation updated
- [ ] Environment variables documented (.env.example)
- [ ] Deployment guide created
- [ ] Troubleshooting guide available

### Operations Documentation
- [ ] Runbook for common issues
- [ ] Incident response plan
- [ ] Escalation procedures
- [ ] Contact information current

---

## Security Scanning

### Automated Scans
```bash
# Run all security checks
cd backend

# 1. Code security
bandit -r . --skip B101,B104 -f json -o security_report.json

# 2. Dependency vulnerabilities
safety check

# 3. Python code quality
black --check .
flake8 .

# 4. Test coverage
pytest --cov=. --cov-report=html

# 5. Docker security (if using containers)
docker scan your-image:latest
```

### Expected Results
- [ ] Bandit: 0 high severity issues
- [ ] Safety: 0 vulnerabilities
- [ ] Flake8: <10 warnings (none critical)
- [ ] Test coverage: >80%

---

## Final Verification

### Production Smoke Tests
```bash
# 1. Health check
curl https://api.domain.com/api/health/

# 2. Authentication
curl -X POST https://api.domain.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 3. Product listing (should be cached)
curl https://api.domain.com/api/products/

# 4. Rate limiting (should block after limit)
for i in {1..10}; do
  curl -X POST https://api.domain.com/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

---

## Sign-Off

### Development Team
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Security checklist complete

**Developer:** _________________ **Date:** _________

### Security Team
- [ ] Security audit passed
- [ ] Vulnerability scan clean
- [ ] PII protection verified
- [ ] Compliance requirements met

**Security Lead:** _________________ **Date:** _________

### Operations Team
- [ ] Infrastructure ready
- [ ] Monitoring configured
- [ ] Backup/restore tested
- [ ] Runbooks updated

**DevOps Lead:** _________________ **Date:** _________

---

## Rollback Procedure

If issues detected post-deployment:

1. **Immediate Actions**
   - Enable maintenance mode
   - Revert to previous deployment
   - Restore database from last backup (if needed)
   - Clear cache

2. **Communication**
   - Notify stakeholders
   - Update status page
   - Document issue in incident log

3. **Post-Mortem**
   - Identify root cause
   - Document lessons learned
   - Update deployment checklist

---

**Production Ready When:**
- ✅ All checklist items complete
- ✅ All sign-offs obtained
- ✅ Zero critical security issues
- ✅ Staging environment mirrors production
- ✅ Rollback plan tested

**Document Version:** 1.0
**Last Updated:** December 15, 2025
