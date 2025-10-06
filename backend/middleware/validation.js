/**
 * Comprehensive Input Validation and Sanitization Middleware
 * Protects against injection attacks, XSS, and malicious input
 */

const { ValidationError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Sanitize string input to prevent XSS
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove potential script tags and event handlers
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\b(javascript|data|vbscript):/gi, '')
    .trim();
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj, seen = new WeakSet()) => {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  // Handle circular references
  if (seen.has(obj)) {
    return {};
  }
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, seen));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Don't allow prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitized[key] = sanitizeObject(obj[key], seen);
    }
  }
  return sanitized;
};

/**
 * MongoDB injection protection
 * Prevents NoSQL injection by removing/escaping MongoDB operators
 */
const sanitizeMongoInput = (obj, seen = new WeakSet()) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle circular references
  if (seen.has(obj)) {
    return {};
  }
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeMongoInput(item, seen));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Don't allow prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      // Remove keys that start with $ (MongoDB operators)
      if (key.startsWith('$')) {
        logger.logSecurityEvent('MongoDB Injection Attempt', 'high', {
          key,
          value: obj[key]
        });
        continue;
      }
      sanitized[key] = sanitizeMongoInput(obj[key], seen);
    }
  }
  return sanitized;
};

/**
 * Input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeObject(req.body);
      req.body = sanitizeMongoInput(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
      req.query = sanitizeMongoInput(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Input sanitization error', error, {
      path: req.path,
      method: req.method
    });
    next(error);
  }
};

/**
 * Validation schemas
 */
const validationSchemas = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  phone: (value) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(value);
  },
  
  mongoId: (value) => {
    const mongoIdRegex = /^[a-fA-F0-9]{24}$/;
    return mongoIdRegex.test(value);
  },
  
  alphanumeric: (value) => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(value);
  },
  
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  price: (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num < Number.MAX_SAFE_INTEGER;
  },

  quantity: (value) => {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0 && num < 1000000;
  }
};

/**
 * Generic validation middleware factory
 */
const validateInput = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field] || req.query[field] || req.params[field];

      // Required field check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip validation if field is optional and not provided
      if (!rules.required && !value) {
        continue;
      }

      // Type validation
      if (rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
          continue;
        }
      }

      // Min/Max length for strings
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }

      // Min/Max value for numbers
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }

      // Custom validation
      if (rules.validate && typeof rules.validate === 'function') {
        const customError = rules.validate(value);
        if (customError) {
          errors.push(customError);
        }
      }

      // Predefined schema validation
      if (rules.schema && validationSchemas[rules.schema]) {
        if (!validationSchemas[rules.schema](value)) {
          errors.push(`${field} is not a valid ${rules.schema}`);
        }
      }
    }

    if (errors.length > 0) {
      logger.logSecurityEvent('Validation Failed', 'medium', {
        path: req.path,
        errors
      });
      throw new ValidationError('Validation failed', errors);
    }

    next();
  };
};

/**
 * Request size limit validation
 */
const validateRequestSize = (maxSizeInMB = 10) => {
  return (req, res, next) => {
    const contentLength = req.get('content-length');
    
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      
      if (sizeInMB > maxSizeInMB) {
        logger.logSecurityEvent('Request Size Exceeded', 'medium', {
          path: req.path,
          size: `${sizeInMB.toFixed(2)}MB`,
          limit: `${maxSizeInMB}MB`
        });
        
        return res.status(413).json({
          success: false,
          error: {
            message: `Request size exceeds limit of ${maxSizeInMB}MB`,
            statusCode: 413
          }
        });
      }
    }
    
    next();
  };
};

/**
 * SQL injection protection for search queries
 */
const sanitizeSearchQuery = (req, res, next) => {
  if (req.query.search || req.body.search) {
    const search = req.query.search || req.body.search;
    
    // Remove SQL keywords and special characters
    const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'EXEC', 'EXECUTE', '--', ';'];
    const sanitized = String(search);
    
    for (const keyword of sqlKeywords) {
      if (sanitized.toUpperCase().includes(keyword)) {
        logger.logSecurityEvent('SQL Injection Attempt', 'high', {
          path: req.path,
          query: search
        });
        
        throw new ValidationError('Invalid search query');
      }
    }
  }
  
  next();
};

module.exports = {
  sanitizeInput,
  sanitizeString,
  sanitizeObject,
  sanitizeMongoInput,
  validateInput,
  validateRequestSize,
  sanitizeSearchQuery,
  validationSchemas
};
