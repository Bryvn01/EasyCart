import {
  validateEmail,
  validatePassword,
  validatePhone,
  sanitizeInput,
  validateRequired,
  validateNumeric,
  validatePrice
} from '../validation';

describe('validation utilities', () => {
  describe('validateEmail', () => {
    it('returns true for valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
      expect(validateEmail('user123@test-domain.com')).toBe(true);
    });

    it('returns false for invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('returns true for passwords with 8 or more characters', () => {
      expect(validatePassword('12345678')).toBe(true);
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('verylongpassword')).toBe(true);
    });

    it('returns false for passwords with less than 8 characters', () => {
      expect(validatePassword('1234567')).toBe(false);
      expect(validatePassword('pass')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('returns true for valid phone numbers', () => {
      expect(validatePhone('+254712345678')).toBe(true);
      expect(validatePhone('+12345678901')).toBe(true);
      expect(validatePhone('254712345678')).toBe(true);
      expect(validatePhone('+447911123456')).toBe(true);
    });

    it('returns false for invalid phone numbers', () => {
      expect(validatePhone('1')).toBe(false); // too short (only 1 digit)
      expect(validatePhone('0712345678')).toBe(false); // starts with 0
      expect(validatePhone('+0712345678')).toBe(false); // starts with +0
      expect(validatePhone('abc123456789')).toBe(false);
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('+12345678901234567')).toBe(false); // too long (more than 15 digits)
      expect(validatePhone('123456789012345678')).toBe(false); // too long
    });
  });

  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
      expect(sanitizeInput('<div>Content</div>')).toBe('divContent/div');
    });

    it('removes javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeInput('JAVASCRIPT:void(0)')).toBe('void(0)');
      expect(sanitizeInput('JavaScript:alert(1)')).toBe('alert(1)');
    });

    it('removes event handlers', () => {
      expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('onload=malicious()')).toBe('malicious()');
      expect(sanitizeInput('ONMOUSEOVER=bad()')).toBe('bad()');
    });

    it('trims whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
      expect(sanitizeInput('\n\ttest\n\t')).toBe('test');
    });

    it('returns non-string input as-is', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
      expect(sanitizeInput({ key: 'value' })).toEqual({ key: 'value' });
    });

    it('handles complex malicious input', () => {
      const malicious = '<img src=x onerror=alert(1)>';
      const result = sanitizeInput(malicious);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('onerror=');
    });

    it('preserves safe content', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World');
      expect(sanitizeInput('user@example.com')).toBe('user@example.com');
      expect(sanitizeInput('123-456-7890')).toBe('123-456-7890');
    });
  });

  describe('validateRequired', () => {
    it('returns true for non-empty values', () => {
      expect(validateRequired('hello')).toBe(true);
      expect(validateRequired('123')).toBe(true);
      expect(validateRequired(123)).toBe(true);
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(false)).toBe(true);
    });

    it('returns false for empty or missing values', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('validateNumeric', () => {
    it('returns true for valid numbers', () => {
      expect(validateNumeric(123)).toBe(true);
      expect(validateNumeric(0)).toBe(true);
      expect(validateNumeric(-456)).toBe(true);
      expect(validateNumeric(12.34)).toBe(true);
      expect(validateNumeric('789')).toBe(true);
    });

    it('returns false for non-numeric values', () => {
      expect(validateNumeric('abc')).toBe(false);
      expect(validateNumeric(NaN)).toBe(false);
      expect(validateNumeric(Infinity)).toBe(false);
      expect(validateNumeric(-Infinity)).toBe(false);
      expect(validateNumeric(undefined)).toBe(false);
      // Note: empty string and null coerce to 0, so they are technically numeric
      // If strict validation is needed, validateRequired should be used first
    });
  });

  describe('validatePrice', () => {
    it('returns true for valid prices', () => {
      expect(validatePrice(100)).toBe(true);
      expect(validatePrice(0)).toBe(true);
      expect(validatePrice(12.99)).toBe(true);
      expect(validatePrice('50.5')).toBe(true);
      expect(validatePrice('100')).toBe(true);
    });

    it('returns false for invalid prices', () => {
      expect(validatePrice(-10)).toBe(false);
      expect(validatePrice('abc')).toBe(false);
      expect(validatePrice(NaN)).toBe(false);
      expect(validatePrice(Infinity)).toBe(false);
      expect(validatePrice('')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(validatePrice(0.01)).toBe(true);
      expect(validatePrice('0')).toBe(true);
      expect(validatePrice(-0.01)).toBe(false);
    });
  });
});
