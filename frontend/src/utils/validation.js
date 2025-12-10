/**
 * Input validation and sanitization utilities for frontend
 */

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10,15}$/;
  // eslint-disable-next-line no-useless-escape
  return re.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateLength = (value, min, max) => {
  const length = value ? value.toString().length : 0;
  return length >= min && length <= max;
};

export const validateNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Alias for validateNumber
export const validateNumeric = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
};

// Validate price (must be non-negative)
export const validatePrice = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= 0;
};
