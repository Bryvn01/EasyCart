/**
 * Security Tests
 * Tests for input validation, sanitization, and security middleware
 */

const { sanitizeString, sanitizeMongoInput, validationSchemas } = require('../middleware/validation');
const { sanitizeLogData } = require('../middleware/requestLogger');

describe('Security Tests', () => {
  describe('Input Sanitization', () => {
    test('should remove script tags from input', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello';
      const sanitized = sanitizeString(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('Hello');
    });

    test('should remove event handlers from input', () => {
      const maliciousInput = '<div onclick="alert(\'XSS\')">Click me</div>';
      const sanitized = sanitizeString(maliciousInput);
      expect(sanitized).not.toContain('onclick');
    });

    test('should remove javascript: protocol', () => {
      const maliciousInput = 'javascript:alert("XSS")';
      const sanitized = sanitizeString(maliciousInput);
      expect(sanitized).not.toContain('javascript:');
    });

    test('should handle non-string input gracefully', () => {
      expect(sanitizeString(123)).toBe(123);
      expect(sanitizeString(null)).toBe(null);
      expect(sanitizeString(undefined)).toBe(undefined);
    });
  });

  describe('MongoDB Injection Protection', () => {
    test('should remove MongoDB operators', () => {
      const maliciousInput = {
        username: 'admin',
        $where: 'this.password === "password"'
      };
      const sanitized = sanitizeMongoInput(maliciousInput);
      expect(sanitized).toHaveProperty('username');
      expect(sanitized).not.toHaveProperty('$where');
    });

    test('should remove nested MongoDB operators', () => {
      const maliciousInput = {
        user: {
          name: 'test',
          $gt: 'admin'
        }
      };
      const sanitized = sanitizeMongoInput(maliciousInput);
      expect(sanitized.user).toHaveProperty('name');
      expect(sanitized.user).not.toHaveProperty('$gt');
    });

    test('should handle prototype pollution attempts', () => {
      const maliciousInput = {
        '__proto__': { admin: true },
        'constructor': { prototype: { admin: true } },
        'normalKey': 'normalValue'
      };
      const sanitized = sanitizeMongoInput(maliciousInput);
      expect(Object.keys(sanitized)).not.toContain('__proto__');
      expect(Object.keys(sanitized)).not.toContain('constructor');
      expect(sanitized).toHaveProperty('normalKey');
    });
  });

  describe('Validation Schemas', () => {
    test('should validate email correctly', () => {
      expect(validationSchemas.email('test@example.com')).toBe(true);
      expect(validationSchemas.email('invalid-email')).toBe(false);
      expect(validationSchemas.email('test@')).toBe(false);
    });

    test('should validate MongoDB ID correctly', () => {
      expect(validationSchemas.mongoId('507f1f77bcf86cd799439011')).toBe(true);
      expect(validationSchemas.mongoId('invalid-id')).toBe(false);
      expect(validationSchemas.mongoId('123')).toBe(false);
    });

    test('should validate phone numbers', () => {
      expect(validationSchemas.phone('+1234567890')).toBe(true);
      expect(validationSchemas.phone('123-456-7890')).toBe(true);
      expect(validationSchemas.phone('invalid')).toBe(false);
    });

    test('should validate prices', () => {
      expect(validationSchemas.price(10.99)).toBe(true);
      expect(validationSchemas.price(0)).toBe(true);
      expect(validationSchemas.price(-10)).toBe(false);
      expect(validationSchemas.price('invalid')).toBe(false);
    });

    test('should validate quantities', () => {
      expect(validationSchemas.quantity(10)).toBe(true);
      expect(validationSchemas.quantity(0)).toBe(true);
      expect(validationSchemas.quantity(-1)).toBe(false);
      expect(validationSchemas.quantity(10.5)).toBe(false);
    });

    test('should validate URLs', () => {
      expect(validationSchemas.url('https://example.com')).toBe(true);
      expect(validationSchemas.url('http://example.com')).toBe(true);
      expect(validationSchemas.url('invalid-url')).toBe(false);
    });
  });

  describe('Log Data Sanitization', () => {
    test('should sanitize sensitive fields', () => {
      const data = {
        username: 'testuser',
        password: 'secret123',
        token: 'jwt-token',
        email: 'test@example.com'
      };
      const sanitized = sanitizeLogData(data);
      expect(sanitized.username).toBe('testuser');
      expect(sanitized.password).toBe('***REDACTED***');
      expect(sanitized.token).toBe('***REDACTED***');
      expect(sanitized.email).toBe('test@example.com');
    });

    test('should sanitize authorization headers', () => {
      const data = {
        authorization: 'Bearer token123',
        'content-type': 'application/json'
      };
      const sanitized = sanitizeLogData(data);
      expect(sanitized.authorization).toBe('***REDACTED***');
      expect(sanitized['content-type']).toBe('application/json');
    });
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully', () => {
      expect(() => {
        sanitizeString(undefined);
      }).not.toThrow();
    });

    test('should handle circular references', () => {
      const obj = { a: 1 };
      obj.self = obj;
      const result = sanitizeMongoInput(obj);
      expect(result).toHaveProperty('a');
      expect(result.a).toBe(1);
      // Circular reference should be replaced with empty object
      expect(result.self).toEqual({});
    });
  });
});
