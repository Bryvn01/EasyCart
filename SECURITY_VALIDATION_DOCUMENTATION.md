# Security & Input Validation Documentation

## Overview

EasyCart implements comprehensive security measures including:
- Input validation and sanitization
- Protection against common web vulnerabilities
- Rate limiting and abuse prevention
- Security event logging and monitoring

## Security Features

### 1. Input Validation & Sanitization

#### XSS Protection
```javascript
// Automatically removes script tags and event handlers
const sanitized = sanitizeString('<script>alert("XSS")</script>Hello');
// Result: "Hello"
```

#### MongoDB Injection Protection
```javascript
// Removes MongoDB operators from input
const sanitized = sanitizeMongoInput({
  username: 'admin',
  $where: 'malicious code'
});
// Result: { username: 'admin' }
// $where is removed and security event logged
```

#### Prototype Pollution Prevention
```javascript
// Blocks dangerous keys
const sanitized = sanitizeObject({
  __proto__: { admin: true },
  normalKey: 'normalValue'
});
// Result: { normalKey: 'normalValue' }
```

### 2. Rate Limiting

#### Global Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to all API endpoints
- Excludes health check endpoints

#### Authentication Rate Limiting
- 5 login attempts per 15 minutes per IP
- Only counts failed attempts
- Prevents brute force attacks

#### Registration Rate Limiting
- 3 registrations per hour per IP
- Prevents account spam
- Helps detect automated attacks

#### Write Operation Rate Limiting
- 50 write operations per 15 minutes per IP
- Applies to POST, PUT, PATCH, DELETE
- Protects against data manipulation attacks

#### Upload Rate Limiting
- 10 file uploads per hour per IP
- Prevents storage abuse
- Configurable size limits

#### Search Rate Limiting
- 30 search requests per minute per IP
- Prevents search abuse
- Protects database resources

### 3. Security Headers

#### Helmet.js Configuration
```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
})
```

Provides:
- Content Security Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- Strict-Transport-Security (HSTS)

### 4. Request Size Limits

- Maximum request size: 10MB
- Prevents memory exhaustion attacks
- Configurable per route

## Validation Schemas

### Pre-built Validators

```javascript
const { validationSchemas } = require('./middleware/validation');

// Email validation
validationSchemas.email('test@example.com'); // true

// Phone validation
validationSchemas.phone('+1234567890'); // true

// MongoDB ID validation
validationSchemas.mongoId('507f1f77bcf86cd799439011'); // true

// URL validation
validationSchemas.url('https://example.com'); // true

// Price validation (non-negative number)
validationSchemas.price(10.99); // true

// Quantity validation (non-negative integer)
validationSchemas.quantity(5); // true

// Alphanumeric validation
validationSchemas.alphanumeric('abc123'); // true
```

### Custom Validation

```javascript
const { validateInput } = require('./middleware/validation');

// Define validation schema
const productSchema = {
  name: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 100
  },
  price: {
    required: true,
    schema: 'price',
    min: 0,
    max: 1000000
  },
  quantity: {
    required: true,
    schema: 'quantity'
  },
  email: {
    required: false,
    schema: 'email'
  },
  description: {
    type: 'string',
    maxLength: 500,
    validate: (value) => {
      if (value.includes('spam')) {
        return 'Description contains prohibited content';
      }
    }
  }
};

// Apply to route
router.post('/products', 
  validateInput(productSchema),
  asyncHandler(async (req, res) => {
    // req.body is validated and sanitized
    const product = await Product.create(req.body);
    res.json(product);
  })
);
```

## Applying Security Middleware

### Global Security (Applied to All Routes)

In `server.js`:
```javascript
// Security headers
app.use(helmet());

// Request size limit
app.use(validateRequestSize(10));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));

// MongoDB injection protection
app.use(mongoSanitize());

// Input sanitization
app.use(sanitizeInput);

// Global rate limiting
app.use(globalRateLimiter);
```

### Route-Specific Security

```javascript
const { 
  authRateLimiter, 
  uploadRateLimiter,
  validateInput 
} = require('../middleware');

// Authentication routes with strict rate limiting
router.post('/login', 
  authRateLimiter,
  validateInput(loginSchema),
  asyncHandler(loginController)
);

// File upload with rate limiting
router.post('/upload',
  uploadRateLimiter,
  validateRequestSize(5), // 5MB limit
  uploadController
);

// Search with rate limiting
router.get('/search',
  searchRateLimiter,
  sanitizeSearchQuery,
  searchController
);
```

## Security Event Logging

### Automatic Security Event Logging

The system automatically logs:
- MongoDB injection attempts
- Request size violations
- Rate limit violations
- Validation failures
- Authentication failures

### Manual Security Event Logging

```javascript
const logger = require('../utils/logger');

logger.logSecurityEvent('Suspicious activity detected', 'high', {
  userId: req.user.id,
  action: 'bulk_delete_attempt',
  ip: req.ip,
  count: 1000
});
```

### Security Event Levels
- **high**: Critical security events (sent to monitoring in production)
- **medium**: Warning-level security events
- **low**: Informational security events

## Common Vulnerabilities & Protection

### 1. SQL/NoSQL Injection
**Protection:**
- MongoDB query sanitization
- Input validation
- Parameterized queries (Mongoose)

**Example Attack Blocked:**
```javascript
// Malicious input
{ username: { $ne: null } }

// After sanitization
{ username: {} }
```

### 2. Cross-Site Scripting (XSS)
**Protection:**
- Input sanitization (removes scripts)
- Content Security Policy headers
- Output encoding

**Example Attack Blocked:**
```javascript
// Malicious input
<script>steal_cookies()</script>

// After sanitization
""
```

### 3. Cross-Site Request Forgery (CSRF)
**Protection:**
- CORS configuration
- Token-based authentication
- SameSite cookie attributes

### 4. Brute Force Attacks
**Protection:**
- Rate limiting on authentication
- Account lockout after failed attempts
- IP-based rate limiting

### 5. Denial of Service (DoS)
**Protection:**
- Request size limits
- Rate limiting
- Slow-down middleware
- Connection limits

### 6. Prototype Pollution
**Protection:**
- Sanitization removes dangerous keys
- Object property validation
- Safe object merging

### 7. Path Traversal
**Protection:**
- Input validation
- Safe path joining
- Whitelist approach for file access

## Best Practices

### 1. Always Validate User Input
```javascript
// ✅ Good
router.post('/user', 
  validateInput(userSchema),
  controller
);

// ❌ Bad
router.post('/user', controller);
```

### 2. Use Rate Limiting Appropriately
```javascript
// ✅ Good - Strict limits on sensitive operations
router.post('/login', authRateLimiter, controller);

// ✅ Good - Relaxed limits on reads
router.get('/products', globalRateLimiter, controller);
```

### 3. Sanitize Before Validation
The middleware automatically:
1. Sanitizes input (removes dangerous content)
2. Validates input (checks format and constraints)
3. Passes clean data to controller

### 4. Log Security Events
```javascript
// Always log suspicious activity
if (failedAttempts > 5) {
  logger.logSecurityEvent('Multiple failed login attempts', 'high', {
    username,
    ip: req.ip,
    attempts: failedAttempts
  });
}
```

### 5. Use HTTPS in Production
```javascript
// Force HTTPS (in production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

## Testing Security

### Test Input Validation
```javascript
describe('Product API Security', () => {
  test('rejects invalid price', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'Test', price: -10 })
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toContain('Validation');
  });

  test('sanitizes MongoDB operators', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: { $ne: null } })
      .expect(400);
  });

  test('enforces rate limits', async () => {
    // Make multiple requests
    for (let i = 0; i < 100; i++) {
      await request(app).get('/api/products');
    }
    
    // 101st request should be rate limited
    const response = await request(app)
      .get('/api/products')
      .expect(429);
  });
});
```

## Monitoring & Alerts

### Metrics to Monitor
1. **Rate limit violations**: Track IPs hitting rate limits
2. **Validation failures**: High failure rate may indicate attack
3. **Authentication failures**: Monitor for brute force attempts
4. **Security events**: Track logged security events
5. **Request patterns**: Unusual patterns may indicate scanning

### Setting Up Alerts
```javascript
// Example: Alert on multiple security events
const securityEventCount = {};

function checkSecurityThreshold(ip) {
  securityEventCount[ip] = (securityEventCount[ip] || 0) + 1;
  
  if (securityEventCount[ip] > 10) {
    // Send alert (email, Slack, PagerDuty, etc.)
    alertSecurityTeam({
      type: 'security_threshold_exceeded',
      ip,
      count: securityEventCount[ip]
    });
  }
}
```

## Configuration

### Environment Variables
```bash
# Rate limiting (optional overrides)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100            # Max requests per window

# Request size limits
MAX_REQUEST_SIZE_MB=10

# Security
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
```

### Customizing Rate Limits
```javascript
// In middleware/rateLimiter.js
const customRateLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  // ... other options
});
```

## Security Checklist

- [x] Input validation on all endpoints
- [x] Input sanitization (XSS, injection)
- [x] Rate limiting implemented
- [x] Request size limits enforced
- [x] Security headers configured
- [x] CORS properly configured
- [x] Authentication required for sensitive operations
- [x] Error messages don't leak sensitive info
- [x] Logging includes security events
- [x] Dependencies regularly updated
- [ ] HTTPS enforced (configure in production)
- [ ] Security monitoring service integrated
- [ ] Regular security audits scheduled
- [ ] Penetration testing conducted

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
