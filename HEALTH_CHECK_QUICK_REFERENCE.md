# Health Check Quick Reference

## Available Endpoints

### Node.js Backend (Port 5000)

| Endpoint | Purpose | Response Time | Status Codes |
|----------|---------|---------------|--------------|
| `GET /api/health` | Comprehensive health check | < 100ms | 200 (healthy), 503 (unhealthy) |

### Django Backend (Port 8000)

| Endpoint | Purpose | Response Time | Status Codes |
|----------|---------|---------------|--------------|
| `GET /api/health/` | Comprehensive health check | < 100ms | 200 (healthy), 503 (unhealthy) |
| `GET /api/health/live/` | Kubernetes liveness probe | < 50ms | 200 (alive) |
| `GET /api/health/ready/` | Kubernetes readiness probe | < 100ms | 200 (ready), 503 (not ready) |

## Quick Test Commands

### Local Testing

```bash
# Test Node.js health endpoint
curl http://localhost:5000/api/health | jq

# Test Django health endpoint
curl http://localhost:8000/api/health/ | jq

# Test Django liveness probe
curl http://localhost:8000/api/health/live/ | jq

# Test Django readiness probe
curl http://localhost:8000/api/health/ready/ | jq
```

### Production Testing

```bash
# Replace with your production URL
export BACKEND_URL="https://api.easycart.com"

# Test health
curl $BACKEND_URL/api/health | jq

# Check if service is UP
curl -s $BACKEND_URL/api/health | jq -r '.status'

# Check database status
curl -s $BACKEND_URL/api/health | jq '.components.database.status'
```

## Response Fields

### Node.js Health Response

```json
{
  "status": "UP|DOWN",              // Overall status
  "service": "easycart-nodejs-backend",
  "version": "1.0.0",
  "timestamp": "ISO8601",
  "uptime": {
    "seconds": 3600,
    "readable": "1h 0m 0s"
  },
  "components": {
    "database": {
      "status": "UP|DOWN",
      "details": {
        "state": "connected|disconnected|connecting|disconnecting",
        "database": "easycart",
        "collections": 5,
        "dataSize": "15MB"
      }
    },
    "memory": {
      "status": "UP|WARNING",
      "details": {
        "heapUsed": "45MB",
        "heapTotal": "120MB",
        "external": "19MB",
        "usage": "38%"
      }
    }
  },
  "responseTime": "12ms"
}
```

### Django Health Response

```json
{
  "status": "UP|DOWN",
  "service": "easycart-django-backend",
  "version": "1.0.0",
  "timestamp": "ISO8601",
  "components": {
    "database": {
      "status": "UP|DOWN",
      "details": {
        "status": "connected|disconnected",
        "database": "easycart",
        "mongodb_version": "7.0.0",
        "products_count": 150
      }
    },
    "python": {
      "status": "UP",
      "details": {
        "version": "3.12.3",
        "implementation": "cpython"
      }
    }
  },
  "responseTime": "45ms"
}
```

## Status Interpretation

| Status | Meaning | HTTP Code | Action Required |
|--------|---------|-----------|-----------------|
| UP | All components healthy | 200 | None |
| DOWN | One or more components unhealthy | 503 | Investigate immediately |
| WARNING | Component degraded but functional | 200 | Monitor closely |

## Common Issues

### Database Shows DOWN

**Check:**
```bash
# Verify MongoDB connection string
echo $MONGO_URI

# Test MongoDB connection directly
mongosh "$MONGO_URI" --eval "db.adminCommand('ping')"
```

**Fix:**
- Verify MONGO_URI is set correctly
- Check MongoDB Atlas whitelist
- Verify network connectivity

### Memory Shows WARNING

**Check:**
```bash
# Check current memory status
curl -s http://localhost:5000/api/health | jq '.components.memory'
```

**Fix:**
- Restart the service
- Increase container memory limits
- Check for memory leaks

### Health Endpoint Returns 503

**Diagnosis:**
```bash
# Get detailed error information
curl -i http://localhost:5000/api/health | jq
```

**Common Causes:**
1. Database connection lost
2. Service starting up
3. High memory usage (>90%)

## Monitoring Integration

### Prometheus

```yaml
scrape_configs:
  - job_name: 'easycart-health'
    metrics_path: '/api/health'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:5000', 'localhost:8000']
```

### Kubernetes

```yaml
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

### Load Balancer (AWS ALB)

```
Health Check Path: /api/health
Healthy Threshold: 2
Unhealthy Threshold: 3
Timeout: 5 seconds
Interval: 30 seconds
Success Codes: 200
```

## Testing

### Run Tests

```bash
cd backend

# Run smoke tests
npm test

# Run health check integration tests
npx jest tests/health.integration.test.js --forceExit

# Run all tests
npm run test:all
```

### Test Coverage

- ✅ Health endpoint returns correct structure
- ✅ Health endpoint returns quickly (< 2s)
- ✅ Database health is reported correctly
- ✅ Memory health is reported correctly
- ✅ Status codes are correct (200/503)

## Development

### Adding New Health Components

**Node.js Example:**

```javascript
// In backend/routes/health.js
const newComponent = {
  status: 'UP',
  details: {
    // Component-specific details
  }
};

healthResponse.components.newComponent = newComponent;
```

**Django Example:**

```python
# In backend/apps/products/health_views.py
def check_new_component():
    try:
        # Check component
        return {
            'status': 'UP',
            'details': {
                # Component-specific details
            }
        }
    except Exception as e:
        return {
            'status': 'DOWN',
            'details': {
                'error': str(e)
            }
        }
```

## Support

For issues or questions:
1. Check the main documentation: `HEALTH_CHECK_ENHANCEMENT_PHASE1.md`
2. Review application logs
3. Check GitHub issues
4. Contact the development team
