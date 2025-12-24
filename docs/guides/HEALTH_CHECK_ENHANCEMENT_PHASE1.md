# Health Check Enhancement - Phase 1

This document describes the enhanced health check implementation for EasyCart microservices.

## Overview

The EasyCart application has been enhanced with comprehensive health check endpoints for both the Node.js/Express and Django backends. These endpoints provide detailed service health information including database connectivity, memory usage, and uptime statistics.

## Implementation Summary

### Node.js Backend (Express)

**Endpoint:** `GET /api/health`

**Features:**
- Component-based health reporting (database, memory)
- UP/DOWN/WARNING status levels
- Response time tracking
- Memory usage monitoring
- Service uptime reporting
- MongoDB connection status via Mongoose

**Example Response (Healthy):**
```json
{
  "status": "UP",
  "service": "easycart-nodejs-backend",
  "version": "1.0.0",
  "timestamp": "2025-10-06T09:25:40.471Z",
  "uptime": {
    "seconds": 3600,
    "readable": "1h 0m 0s"
  },
  "components": {
    "database": {
      "status": "UP",
      "details": {
        "state": "connected",
        "database": "easycart",
        "collections": 5,
        "dataSize": "15MB"
      }
    },
    "memory": {
      "status": "UP",
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

**Example Response (Unhealthy):**
```json
{
  "status": "DOWN",
  "service": "easycart-nodejs-backend",
  "version": "1.0.0",
  "timestamp": "2025-10-06T09:25:40.471Z",
  "uptime": {
    "seconds": 20,
    "readable": "20s"
  },
  "components": {
    "database": {
      "status": "DOWN",
      "details": {
        "state": "disconnected",
        "message": "Database connection is not active"
      }
    },
    "memory": {
      "status": "WARNING",
      "details": {
        "heapUsed": "110MB",
        "heapTotal": "120MB",
        "external": "19MB",
        "usage": "92%"
      }
    }
  },
  "responseTime": "1ms"
}
```

**HTTP Status Codes:**
- `200 OK`: All components are healthy (status: "UP")
- `503 Service Unavailable`: One or more components are unhealthy (status: "DOWN")

### Django Backend

**Endpoints:**

1. **Main Health Check:** `GET /api/health/`
2. **Liveness Probe:** `GET /api/health/live/`
3. **Readiness Probe:** `GET /api/health/ready/`

**Features:**
- Component-based health reporting (database, Python runtime)
- MongoDB connection monitoring
- Kubernetes-compatible liveness and readiness probes
- Response time tracking
- UP/DOWN status with proper HTTP status codes

**Main Health Check Response (Healthy):**
```json
{
  "status": "UP",
  "service": "easycart-django-backend",
  "version": "1.0.0",
  "timestamp": "2025-10-06T09:25:40.000Z",
  "components": {
    "database": {
      "status": "UP",
      "details": {
        "status": "connected",
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

**Liveness Probe Response:**
```json
{
  "status": "UP",
  "check": "liveness"
}
```

**Readiness Probe Response:**
```json
{
  "status": "UP",
  "check": "readiness",
  "database": "connected"
}
```

**HTTP Status Codes:**
- `200 OK`: Service is healthy/ready
- `503 Service Unavailable`: Service is unhealthy/not ready

## Changes Made

### Files Modified

1. **`backend/routes/health.js`**
   - Enhanced health endpoint with comprehensive monitoring
   - Added database health checking via Mongoose
   - Added memory usage monitoring
   - Added uptime tracking
   - Implemented component-based health reporting

2. **`backend/server.js`**
   - Removed duplicate health check endpoint
   - Health check now handled by the route module

3. **`backend/apps/products/health_views.py`** (NEW)
   - Created dedicated health views module
   - Implemented main health check endpoint
   - Implemented Kubernetes liveness probe
   - Implemented Kubernetes readiness probe

4. **`backend/ecommerce/urls.py`**
   - Updated to import health views from new module
   - Added liveness probe URL
   - Added readiness probe URL
   - Updated API root to include new endpoints

5. **`backend/tests/smoke.test.js`**
   - Updated test to accept both 'OK' and 'UP' status values

6. **`backend/tests/health.integration.test.js`** (NEW)
   - Comprehensive integration tests for health endpoints
   - Tests for response structure validation
   - Tests for component health reporting
   - Tests for response time
   - Tests for status code validation

## Testing

### Running Tests

```bash
# Run all tests
cd backend
npm run test:all

# Run only smoke tests
npm test

# Run only health check tests
npx jest tests/health.integration.test.js --forceExit
```

### Test Coverage

All tests are passing:
- ✅ 5 smoke tests (basic functionality)
- ✅ 4 health check integration tests (enhanced features)

## Usage

### For Monitoring Systems

Monitor the health endpoints to detect service issues:

**Node.js Backend:**
```bash
curl http://localhost:5000/api/health
```

**Django Backend:**
```bash
curl http://localhost:8000/api/health/
```

### For Kubernetes Deployments

Use the liveness and readiness probes in your Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: easycart-django
spec:
  template:
    spec:
      containers:
      - name: easycart-django
        image: easycart-django:latest
        ports:
        - containerPort: 8000
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

### For Load Balancers

Configure your load balancer to use the health endpoints:

- **Health Check Path:** `/api/health` (Node.js) or `/api/health/` (Django)
- **Expected Status:** `200 OK`
- **Timeout:** 2 seconds
- **Interval:** 30 seconds
- **Unhealthy Threshold:** 3 consecutive failures

## Success Criteria

✅ **All criteria met:**

1. Health endpoints return JSON health status (UP/DOWN) ✓
2. Health endpoints are accessible for liveness/readiness probes ✓
3. Database health is actively monitored ✓
4. Database health is visible in health response ✓
5. Proper HTTP status codes (200 for healthy, 503 for unhealthy) ✓
6. Response time tracking ✓
7. Comprehensive component-based health reporting ✓
8. All tests passing ✓

## Next Steps (Future Phases)

Potential enhancements for future phases:

1. **External Dependencies Monitoring**
   - Add health checks for external APIs
   - Add health checks for cache servers (Redis)
   - Add health checks for message queues

2. **Metrics Collection**
   - Add Prometheus-compatible metrics endpoint
   - Add custom business metrics
   - Add request rate metrics

3. **Advanced Monitoring**
   - Add circuit breaker status
   - Add dependency graph
   - Add historical health data

4. **Alerting Integration**
   - Add webhooks for health status changes
   - Add integration with monitoring services (Datadog, New Relic)
   - Add email/SMS alerts for critical failures

## Security Considerations

The health endpoints are currently **publicly accessible** by design to support Kubernetes probes and load balancer health checks. This follows best practices for health endpoints.

**Security Notes:**
- Health endpoints do not expose sensitive information
- Database connection strings and credentials are not included in responses
- Error messages are sanitized to prevent information disclosure
- Response times and memory usage are safe to expose for monitoring

## Troubleshooting

### Health Check Returns DOWN Status

**Symptoms:** Health endpoint returns 503 status code

**Possible Causes:**
1. Database connection lost
2. Memory usage too high (>90%)
3. Service startup in progress

**Solutions:**
- Check database connectivity
- Verify MONGO_URI environment variable
- Check application logs for errors
- Monitor memory usage

### Health Check Times Out

**Symptoms:** Health endpoint doesn't respond within timeout

**Possible Causes:**
1. Database query hanging
2. Server overloaded
3. Network issues

**Solutions:**
- Check database performance
- Scale up server resources
- Check network connectivity

## References

- [Spring Boot Actuator Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html) (inspiration)
- [Kubernetes Liveness and Readiness Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Health Check API Design Best Practices](https://microservices.io/patterns/observability/health-check-api.html)
