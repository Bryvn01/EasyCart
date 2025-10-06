# Error Handling & Logging Documentation

## Overview

EasyCart implements a comprehensive error handling and logging system that provides:
- Structured logging across the application
- Centralized error handling
- Request/response logging
- Error tracking and monitoring
- Security event logging

## Architecture

### Backend Components

#### 1. Logger Service (`utils/logger.js`)
Provides structured logging with different log levels:
- **ERROR**: Critical errors that need attention
- **WARN**: Warning conditions
- **INFO**: Informational messages
- **DEBUG**: Debug information (development only)

#### 2. Error Handler Middleware (`middleware/errorHandler.js`)
Centralized error handling with:
- Custom error classes
- Automatic error type detection
- Consistent error responses
- Production vs development error details

#### 3. Request Logger Middleware (`middleware/requestLogger.js`)
Logs all HTTP requests and responses:
- Request details (method, URL, IP, user agent)
- Response details (status code, duration)
- Performance monitoring
- Unique request IDs

### Frontend Components

#### 1. Error Boundary (`components/ErrorBoundary.js`)
React error boundary that:
- Catches component errors
- Displays user-friendly fallback UI
- Tracks errors to backend
- Provides recovery options

#### 2. Error Logger Service (`services/errorLogger.js`)
Frontend error tracking:
- Global error handlers
- Unhandled promise rejection handling
- API error logging
- Component error logging

## Usage

### Backend Logging

#### Basic Logging
```javascript
const logger = require('../utils/logger');

// Info level
logger.info('User logged in', { userId: '123', email: 'user@example.com' });

// Warning level
logger.warn('Slow database query', { duration: '2500ms', query: 'findUsers' });

// Error level
logger.error('Database connection failed', error, { 
  database: 'mongodb',
  attempt: 3 
});

// Debug level (development only)
logger.debug('Request payload', { data: req.body });
```

#### HTTP Request Logging
```javascript
// Automatically logged by middleware
// Each request gets:
// - Unique request ID
// - Timestamp
// - Method, URL, path
// - IP address and user agent
// - Response time and status code
```

#### Security Event Logging
```javascript
logger.logSecurityEvent('Failed login attempt', 'high', {
  username: req.body.username,
  ip: req.ip,
  attempts: 5
});
```

### Error Handling

#### Using Custom Error Classes
```javascript
const { 
  ValidationError, 
  AuthenticationError, 
  NotFoundError 
} = require('../middleware/errorHandler');

// Validation error
throw new ValidationError('Invalid input', ['Email is required', 'Password too short']);

// Authentication error
throw new AuthenticationError('Invalid credentials');

// Not found error
throw new NotFoundError('Product');
```

#### Async Error Handling
```javascript
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new NotFoundError('Product');
  }
  res.json(product);
}));
```

### Frontend Error Handling

#### Using Error Boundary
```jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponents />
    </ErrorBoundary>
  );
}
```

#### Manual Error Logging
```javascript
import errorLogger from './services/errorLogger';

// Log API error
try {
  const response = await fetch('/api/products');
  if (!response.ok) {
    errorLogger.logApiError('/api/products', 
      new Error('Failed to fetch'), 
      response.status
    );
  }
} catch (error) {
  errorLogger.logError({
    type: 'fetchError',
    message: error.message
  });
}
```

## Log Formats

### Development Format (Human Readable)
```
[2024-01-15T10:30:45.123Z] INFO: User logged in
{
  "userId": "123",
  "email": "user@example.com"
}
```

### Production Format (JSON)
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "message": "User logged in",
  "environment": "production",
  "userId": "123",
  "email": "user@example.com"
}
```

## Error Response Format

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "message": "Product not found",
    "statusCode": 404,
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "timestamp": "2024-01-15T10:30:45.123Z",
    "details": [
      "Email is required",
      "Password must be at least 6 characters"
    ]
  }
}
```

### Development Error Response (includes stack trace)
```json
{
  "success": false,
  "error": {
    "message": "Product not found",
    "statusCode": 404,
    "timestamp": "2024-01-15T10:30:45.123Z",
    "stack": "Error: Product not found\n    at..."
  }
}
```

## Integration with Error Tracking Services

### Sentry Integration (Optional)

#### Backend Setup
```javascript
// In utils/logger.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Set global error tracker
global.errorTracker = Sentry;
```

#### Frontend Setup
```javascript
// In services/errorLogger.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

## Monitoring and Alerts

### Key Metrics to Monitor
- Error rate (errors per minute)
- Error types distribution
- Failed API requests
- Slow requests (> 1 second)
- Security events

### Alert Conditions
- Error rate exceeds threshold
- Critical security events
- Service health check failures
- Database connection failures

## Best Practices

### 1. Always Use Structured Logging
✅ **Good**
```javascript
logger.info('Order created', { orderId, userId, total });
```

❌ **Bad**
```javascript
console.log('Order created: ' + orderId);
```

### 2. Include Context in Errors
✅ **Good**
```javascript
logger.error('Payment failed', error, {
  orderId: order.id,
  amount: order.total,
  gateway: 'stripe'
});
```

❌ **Bad**
```javascript
console.error('Payment failed');
```

### 3. Use Appropriate Log Levels
- **DEBUG**: Detailed information for debugging
- **INFO**: Normal application events
- **WARN**: Warning conditions (potential issues)
- **ERROR**: Error conditions (actual problems)

### 4. Don't Log Sensitive Information
```javascript
// Automatically sanitized by requestLogger
const sanitizedData = sanitizeLogData(req.body);
logger.info('User data', sanitizedData);
```

### 5. Use Async Error Handling
Always use `asyncHandler` wrapper for async routes to catch errors properly.

## Performance Considerations

### Log Levels in Production
- Set `NODE_ENV=production` to disable DEBUG logs
- Use structured JSON format for easier parsing
- Consider log aggregation services

### Request Logging
- Logs are written asynchronously
- Minimal performance impact
- Request IDs help trace issues

### Error Tracking
- Errors sent to tracking service asynchronously
- No blocking of user requests
- Rate limiting to prevent overwhelming services

## Troubleshooting

### No Logs Appearing
1. Check `NODE_ENV` setting
2. Verify logger is imported correctly
3. Check console output in development
4. Verify file permissions in production

### Errors Not Being Caught
1. Ensure error handler middleware is last
2. Use `asyncHandler` for async routes
3. Check error is being thrown, not returned
4. Verify middleware order in server.js

### Performance Issues from Logging
1. Reduce log verbosity in production
2. Use log aggregation service
3. Implement log rotation
4. Consider sampling for high-traffic endpoints

## Testing Error Handling

### Test Error Responses
```javascript
const request = require('supertest');
const app = require('../server');

test('returns 404 for non-existent product', async () => {
  const response = await request(app)
    .get('/api/products/invalid-id')
    .expect(404);
    
  expect(response.body.success).toBe(false);
  expect(response.body.error.message).toContain('not found');
});
```

### Test Error Logging
```javascript
test('logs security events', () => {
  const logSpy = jest.spyOn(logger, 'logSecurityEvent');
  
  // Trigger security event
  sanitizeMongoInput({ $where: 'malicious' });
  
  expect(logSpy).toHaveBeenCalledWith(
    'MongoDB Injection Attempt',
    'high',
    expect.any(Object)
  );
});
```

## Additional Resources

- [Express Error Handling Guide](https://expressjs.com/en/guide/error-handling.html)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Structured Logging Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)
