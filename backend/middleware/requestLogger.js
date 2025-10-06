/**
 * Request/Response Logging Middleware
 * Logs all incoming requests and outgoing responses with timing
 */

const logger = require('../utils/logger');

/**
 * Request ID generator
 */
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.id = generateRequestId();
  req.startTime = Date.now();

  // Log request
  logger.info('Incoming Request', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    userId: req.user?.id
  });

  // Intercept response to log when it's sent
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    
    logger.logResponse(req, res, duration, {
      requestId: req.id,
      userId: req.user?.id,
      contentLength: res.get('content-length')
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Performance monitoring middleware
 */
const performanceMonitor = (req, res, next) => {
  req.performanceMarks = {
    start: Date.now()
  };

  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - req.performanceMarks.start;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        requestId: req.id,
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        userId: req.user?.id
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Sanitize sensitive data from logs
 */
const sanitizeLogData = (data) => {
  const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'cookie'];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '***REDACTED***';
    }
  });

  return sanitized;
};

module.exports = {
  requestLogger,
  performanceMonitor,
  sanitizeLogData,
  generateRequestId
};
