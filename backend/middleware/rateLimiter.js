/**
 * Enhanced Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Rate limit handler
 */
const rateLimitHandler = (req, res) => {
  logger.logSecurityEvent('Rate Limit Exceeded', 'medium', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent')
  });

  res.status(429).json({
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      statusCode: 429,
      retryAfter: res.get('Retry-After')
    }
  });
};

/**
 * Global rate limiter (general API protection)
 */
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/api/health/';
  }
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

/**
 * Rate limiter for registration
 */
const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: 'Too many accounts created from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

/**
 * Rate limiter for API write operations
 */
const writeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 write operations per windowMs
  message: 'Too many write requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Only apply to POST, PUT, PATCH, DELETE
    return !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  }
});

/**
 * Rate limiter for file uploads
 */
const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: 'Too many upload requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

/**
 * Rate limiter for search operations
 */
const searchRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 searches per minute
  message: 'Too many search requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

/**
 * Dynamic rate limiter based on user role
 */
const dynamicRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: (req) => {
      // Higher limits for authenticated admin users
      if (req.user?.role === 'admin') {
        return options.adminMax || 1000;
      }
      // Higher limits for authenticated regular users
      if (req.user) {
        return options.userMax || 200;
      }
      // Lower limits for anonymous users
      return options.anonymousMax || 100;
    },
    message: 'Rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
  });
};

/**
 * Slow down middleware for gradual rate limiting
 * Delays responses instead of blocking
 */
const slowDown = require('express-slow-down');

const apiSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  validate: { delayMs: false } // Disable deprecation warning
});

module.exports = {
  globalRateLimiter,
  authRateLimiter,
  registrationRateLimiter,
  writeRateLimiter,
  uploadRateLimiter,
  searchRateLimiter,
  dynamicRateLimiter,
  apiSlowDown
};
