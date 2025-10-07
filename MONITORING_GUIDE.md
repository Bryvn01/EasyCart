# 📊 Production Monitoring & Alerting Guide

## Overview

This guide provides comprehensive monitoring strategies and alerting configurations for the EasyCart application after the Products page API integration merge.

---

## 1. Real-Time Monitoring Setup

### Backend Health Monitoring

#### Render Dashboard Monitoring

**Access:** https://dashboard.render.com

**Key Metrics to Watch:**

1. **Service Status**
   - Location: Services → easycart-backend → Overview
   - Monitor: Status badge (should be "Live")
   - Alert on: Status changes to "Failed" or "Suspended"

2. **Response Times**
   - Location: Services → easycart-backend → Metrics
   - Monitor: Average response time
   - Threshold: >2000ms sustained
   - Alert: If 95th percentile >3000ms

3. **Memory Usage**
   - Location: Services → easycart-backend → Metrics
   - Monitor: Memory consumption
   - Threshold: >80% of allocated memory
   - Alert: If sustained for >5 minutes

4. **CPU Usage**
   - Location: Services → easycart-backend → Metrics
   - Monitor: CPU utilization
   - Threshold: >80% sustained
   - Alert: If sustained for >10 minutes

#### Custom Health Check Endpoint

**Endpoint:** `GET /api/health`

**Expected Response:**
```json
{
  "status": "OK",
  "message": "EasyCart API is running",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

**Monitoring Script:**

```bash
#!/bin/bash
# Save as: scripts/health-check.sh

BACKEND_URL="https://easycart-backend.onrender.com"
WEBHOOK_URL="your-slack-webhook-url"  # Optional

check_health() {
    response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/health")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" != "200" ]; then
        echo "❌ Health check failed! Status: $http_code"
        echo "Response: $body"
        
        # Send alert to Slack (optional)
        if [ -n "$WEBHOOK_URL" ]; then
            curl -X POST "$WEBHOOK_URL" \
                -H 'Content-Type: application/json' \
                -d "{\"text\":\"🚨 EasyCart Backend Health Check Failed (Status: $http_code)\"}"
        fi
        
        return 1
    else
        echo "✅ Health check passed"
        return 0
    fi
}

# Run continuously (every 5 minutes)
while true; do
    check_health
    sleep 300
done
```

### Frontend Monitoring

#### Browser Console Monitoring

**What to Monitor:**

1. **API Call Errors**
   ```javascript
   // Add to frontend/src/services/api.js
   api.interceptors.response.use(
     response => response,
     error => {
       // Log to monitoring service
       if (window.location.hostname !== 'localhost') {
         console.error('API Error:', {
           url: error.config?.url,
           status: error.response?.status,
           message: error.message,
           timestamp: new Date().toISOString()
         });
         
         // Send to error tracking service (e.g., Sentry)
         // Sentry.captureException(error);
       }
       return Promise.reject(error);
     }
   );
   ```

2. **Network Failures**
   - Watch for: `ERR_CONNECTION_REFUSED`
   - Watch for: `CORS errors`
   - Watch for: Timeout errors

3. **JavaScript Errors**
   - Watch for: Unhandled promise rejections
   - Watch for: React component errors
   - Watch for: Type errors

#### Real User Monitoring (RUM)

**Using Web Vitals:**

Frontend already includes web-vitals. Monitor these metrics:

```javascript
// frontend/src/index.js (already configured)
import { reportWebVitals } from './reportWebVitals';

// Send to analytics endpoint
reportWebVitals(console.log);
```

**Key Metrics:**
- **LCP (Largest Contentful Paint):** <2.5s is good
- **FID (First Input Delay):** <100ms is good
- **CLS (Cumulative Layout Shift):** <0.1 is good
- **FCP (First Contentful Paint):** <1.8s is good
- **TTFB (Time to First Byte):** <600ms is good

---

## 2. Error Log Analysis

### Backend Error Patterns

#### MongoDB Connection Errors

**Log Pattern:**
```
MongoDB connection error: MongoServerError
```

**Possible Causes:**
- MongoDB Atlas cluster is down
- Network issues
- Authentication failure
- IP whitelist issue

**Action Items:**
- [ ] Check MongoDB Atlas status
- [ ] Verify MONGO_URI environment variable
- [ ] Check IP whitelist settings
- [ ] Review network logs

#### API Request Errors

**Log Pattern:**
```
Error fetching products: [error details]
```

**Possible Causes:**
- Database query failure
- Invalid query parameters
- Timeout
- Memory issues

**Action Items:**
- [ ] Review query parameters in logs
- [ ] Check database indexes
- [ ] Verify data integrity
- [ ] Optimize slow queries

### Frontend Error Patterns

#### CORS Errors

**Error Message:**
```
Access to XMLHttpRequest at 'https://easycart-backend.onrender.com/api/products' 
from origin 'https://easycart-1-752r.onrender.com' has been blocked by CORS policy
```

**Solution:**
```bash
# Backend server.js
const allowedOrigins = [
  'https://easycart-1-752r.onrender.com',
  'https://easycart-frontend-zge5.onrender.com',
  'https://easycart-admin.onrender.com'
];
```

#### Network Timeout Errors

**Error Message:**
```
timeout of 30000ms exceeded
```

**Action Items:**
- [ ] Check backend response times
- [ ] Verify backend is not sleeping (free tier)
- [ ] Increase timeout in api.js if needed
- [ ] Optimize backend queries

---

## 3. Performance Monitoring

### Backend Performance Metrics

#### Response Time Tracking

**Install and Configure:**

```javascript
// backend/middleware/performance.js
const responseTime = require('response-time');

app.use(responseTime((req, res, time) => {
  // Log slow requests
  if (time > 2000) {
    console.warn(`Slow request: ${req.method} ${req.url} - ${time}ms`);
  }
  
  // Send to monitoring service
  // metrics.recordResponseTime(req.url, time);
}));
```

**Key Metrics:**
- Average response time: <1000ms
- 95th percentile: <2000ms
- 99th percentile: <3000ms

#### Database Query Performance

**Add Query Timing:**

```javascript
// backend/controllers/productController.js
exports.getProducts = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const products = await Product.find(query).limit(limit);
    
    const queryTime = Date.now() - startTime;
    if (queryTime > 1000) {
      console.warn(`Slow query: getProducts - ${queryTime}ms`);
    }
    
    res.json(products);
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Frontend Performance Metrics

#### Lighthouse Audits

**Run regularly:**

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://easycart-1-752r.onrender.com/products \
  --output json \
  --output html \
  --output-path ./reports/lighthouse-products

# View report
open ./reports/lighthouse-products.report.html
```

**Target Scores:**
- Performance: >70 (Good), >90 (Excellent)
- Accessibility: >90
- Best Practices: >90
- SEO: >90

#### Bundle Size Monitoring

**Check bundle size:**

```bash
cd frontend
npm run build

# Analyze bundle
npx source-map-explorer 'build/static/js/*.js'
```

**Target Sizes:**
- Main bundle: <500KB
- Vendor bundle: <1MB
- Total JS: <1.5MB

---

## 4. Automated Alerting Setup

### UptimeRobot Configuration

**Free tier:** 50 monitors, 5-minute intervals

**Setup:**

1. Sign up at https://uptimerobot.com
2. Add monitors:

   **Monitor 1: Backend Health**
   - Type: HTTP(s)
   - URL: https://easycart-backend.onrender.com/api/health
   - Interval: 5 minutes
   - Alert Contacts: Email, Slack

   **Monitor 2: Frontend**
   - Type: HTTP(s)
   - URL: https://easycart-1-752r.onrender.com
   - Interval: 5 minutes
   - Alert Contacts: Email, Slack

   **Monitor 3: Products API**
   - Type: HTTP(s) - Keyword
   - URL: https://easycart-backend.onrender.com/api/products
   - Keyword: "results"
   - Interval: 5 minutes
   - Alert Contacts: Email, Slack

### Slack Webhook Integration

**Setup:**

1. Create Slack webhook at https://api.slack.com/messaging/webhooks
2. Add to environment variables:
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. Create notification function:

```javascript
// backend/utils/notifications.js
const axios = require('axios');

const sendSlackAlert = async (message, severity = 'warning') => {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  
  const emoji = {
    error: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };
  
  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `${emoji[severity]} ${message}`,
      channel: '#alerts',
      username: 'EasyCart Monitor'
    });
  } catch (error) {
    console.error('Failed to send Slack alert:', error.message);
  }
};

module.exports = { sendSlackAlert };
```

4. Use in error handlers:

```javascript
// backend/server.js
const { sendSlackAlert } = require('./utils/notifications');

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  sendSlackAlert(`MongoDB connection error: ${err.message}`, 'error');
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  sendSlackAlert(`Unhandled error: ${err.message}`, 'error');
  res.status(500).json({ error: 'Internal server error' });
});
```

### Email Alerts

**Using Nodemailer:**

```javascript
// backend/utils/email.js
const nodemailer = require('nodemailer');

const sendAlert = async (subject, message) => {
  if (!process.env.EMAIL_HOST) return;
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  await transporter.sendMail({
    from: '"EasyCart Alerts" <alerts@easycart.com>',
    to: 'team@easycart.com',
    subject,
    text: message,
    html: `<p>${message}</p>`
  });
};

module.exports = { sendAlert };
```

---

## 5. Continuous Monitoring Checklist

### Daily Checks

- [ ] Review Render service status (all green)
- [ ] Check error logs for new patterns
- [ ] Verify response times are normal
- [ ] Check MongoDB Atlas metrics
- [ ] Review UptimeRobot alerts (should be 0)

### Weekly Checks

- [ ] Run production verification script
- [ ] Review performance metrics trends
- [ ] Check database storage usage
- [ ] Review API usage patterns
- [ ] Analyze slow query logs
- [ ] Check SSL certificate expiry
- [ ] Review security alerts

### Monthly Checks

- [ ] Run full Lighthouse audit
- [ ] Review user feedback and support tickets
- [ ] Analyze error trends (increasing/decreasing)
- [ ] Check for outdated dependencies
- [ ] Review and update monitoring thresholds
- [ ] Test disaster recovery procedures
- [ ] Update documentation

---

## 6. Alert Response Procedures

### Critical Alerts (Immediate Response Required)

**Alert: Backend Down**
1. Check Render service status
2. Review recent deployments
3. Check error logs for root cause
4. Restart service if needed
5. Notify team on Slack
6. Escalate if not resolved in 15 minutes

**Alert: Database Connection Lost**
1. Check MongoDB Atlas status
2. Verify network connectivity
3. Check environment variables
4. Review IP whitelist
5. Restart backend service
6. Monitor for reconnection

### Warning Alerts (Response within 1 hour)

**Alert: High Response Times**
1. Check current load on services
2. Review recent changes
3. Check database query performance
4. Consider scaling up if persistent
5. Optimize slow queries

**Alert: Increased Error Rate**
1. Review error logs for patterns
2. Check for deployment correlation
3. Verify API changes haven't broken clients
4. Roll back if necessary
5. Document issue for follow-up

### Info Alerts (Response within 4 hours)

**Alert: Memory Usage High**
1. Review current traffic levels
2. Check for memory leaks
3. Monitor trend over time
4. Plan capacity upgrade if needed

---

## 7. Monitoring Dashboard Setup

### Custom Dashboard Template

Create a simple HTML dashboard for team visibility:

```html
<!-- monitoring-dashboard.html -->
<!DOCTYPE html>
<html>
<head>
  <title>EasyCart Monitoring Dashboard</title>
  <meta http-equiv="refresh" content="60">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .status { padding: 20px; margin: 10px 0; border-radius: 8px; }
    .status.ok { background-color: #d4edda; color: #155724; }
    .status.warning { background-color: #fff3cd; color: #856404; }
    .status.error { background-color: #f8d7da; color: #721c24; }
    .metric { display: inline-block; margin: 10px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>🚀 EasyCart Status Dashboard</h1>
  
  <h2>Service Status</h2>
  <div class="status ok">
    ✅ Backend: <span id="backend-status">Checking...</span>
  </div>
  <div class="status ok">
    ✅ Frontend: <span id="frontend-status">Checking...</span>
  </div>
  
  <h2>Performance Metrics</h2>
  <div class="metric">
    <strong>Response Time:</strong> <span id="response-time">-</span>ms
  </div>
  <div class="metric">
    <strong>Products Count:</strong> <span id="products-count">-</span>
  </div>
  <div class="metric">
    <strong>Last Updated:</strong> <span id="last-updated">-</span>
  </div>
  
  <script>
    async function checkStatus() {
      try {
        const start = Date.now();
        const response = await fetch('https://easycart-backend.onrender.com/api/products');
        const data = await response.json();
        const responseTime = Date.now() - start;
        
        document.getElementById('backend-status').textContent = 'Live';
        document.getElementById('response-time').textContent = responseTime;
        document.getElementById('products-count').textContent = data.count || 0;
        document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
      } catch (error) {
        document.getElementById('backend-status').textContent = 'Error: ' + error.message;
      }
    }
    
    checkStatus();
    setInterval(checkStatus, 60000); // Update every minute
  </script>
</body>
</html>
```

---

## 8. Metrics to Track

### Business Metrics

- Total products viewed per day
- Search queries per day
- Most searched terms
- Category popularity
- Average products per page view
- Bounce rate on products page

### Technical Metrics

- API requests per minute/hour/day
- Average response time
- Error rate (%)
- Cache hit rate (if implemented)
- Database query times
- Memory usage
- CPU usage

### User Experience Metrics

- Page load time
- Time to interactive
- Products displayed successfully (%)
- Image load success rate
- Filter usage frequency
- Pagination click-through rate

---

## 9. Reporting Templates

### Daily Status Report

```markdown
# Daily Status Report - [Date]

## Service Health
- Backend: ✅ Up (99.9% uptime)
- Frontend: ✅ Up (100% uptime)
- Database: ✅ Healthy

## Performance
- Avg Response Time: 850ms
- API Requests: 12,450
- Errors: 3 (0.02%)

## Issues
- None reported

## Actions Taken
- Routine monitoring completed
- No interventions required
```

### Weekly Performance Report

```markdown
# Weekly Performance Report - [Week of Date]

## Summary
- Total API Requests: 85,234
- Average Response Time: 920ms
- Uptime: 99.8%

## Top Issues
1. Slow queries on category filter (2 instances)
2. Image loading timeout (5 instances)

## Improvements Made
- Optimized product query with index
- Increased image timeout to 10s

## Next Week Focus
- Monitor query performance
- Review image CDN configuration
```

---

## 🎯 Quick Reference

### Critical Endpoints to Monitor

| Endpoint | Expected Response | Alert Threshold |
|----------|-------------------|-----------------|
| /api/health | 200 OK | Response time >5s |
| /api/products | 200 OK with JSON | Error rate >1% |
| /api/categories | 200 OK with array | Response time >2s |
| Frontend / | 200 OK | Response time >3s |

### Alert Contacts

| Type | Contact | Use For |
|------|---------|---------|
| Critical | Slack #alerts | Immediate issues |
| Warning | Email team@easycart.com | Non-urgent issues |
| Info | Weekly report | Trending data |

### Useful Commands

```bash
# Check backend health
curl https://easycart-backend.onrender.com/api/health

# Test products API
curl https://easycart-backend.onrender.com/api/products

# Run full verification
./scripts/verify-production.sh

# Check service logs
# Navigate to Render Dashboard → Service → Logs
```

---

**Last Updated:** [Current Date]  
**Maintained by:** EasyCart DevOps Team
