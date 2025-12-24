/**
 * Format price values consistently across the application
 * Prevents floating-point precision issues and ensures consistent display
 *
 * @param {number|string} price - The price value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted price string with fixed decimal places
 */
export const formatPrice = (price, decimals = 2) => {
  // Handle null, undefined, or empty values
  if (price === null || price === undefined || price === '') {
    return '0.00';
  }

  // Convert string to number if needed
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Check if conversion resulted in NaN
  if (isNaN(numPrice)) {
    return '0.00';
  }

  // Return formatted price with fixed decimal places
  return numPrice.toFixed(decimals);
};

/**
 * Format price with currency symbol (KSh)
 *
 * @param {number|string} price - The price value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted price string with currency symbol
 */
export const formatPriceWithCurrency = (price, decimals = 2) => {
  return `KSh ${formatPrice(price, decimals)}`;
};

/**
 * Format price with locale-specific formatting
 *
 * @param {number|string} price - The price value to format
 * @returns {string} Formatted price string with thousands separators
 */
export const formatPriceLocale = (price) => {
  // Handle null, undefined, or empty values
  if (price === null || price === undefined || price === '') {
    return '0.00';
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return '0.00';
  }

  return numPrice.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
