/**
 * Input validation and sanitization utilities
 */

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const validateProduct = (formData) => {
  const errors = {};

  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = 'Product name is required';
  } else if (formData.name.length > 200) {
    errors.name = 'Product name must be less than 200 characters';
  }

  if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
    errors.price = 'Valid price is required';
  } else if (parseFloat(formData.price) > 10000000) {
    errors.price = 'Price must be less than 10,000,000';
  }

  if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
    errors.stock = 'Valid stock quantity is required';
  } else if (parseInt(formData.stock) > 1000000) {
    errors.stock = 'Stock must be less than 1,000,000';
  }

  if (!formData.category || (typeof formData.category === 'string' && formData.category.trim().length === 0)) {
    errors.category = 'Category is required';
  }

  if (formData.description && formData.description.length > 2000) {
    errors.description = 'Description must be less than 2000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCategory = (formData) => {
  const errors = {};

  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = 'Category name is required';
  } else if (formData.name.length > 100) {
    errors.name = 'Category name must be less than 100 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
