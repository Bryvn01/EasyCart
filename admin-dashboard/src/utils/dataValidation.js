/**
 * Data Validation and Sanitization Utilities
 * Ensures data integrity and prevents rendering errors
 */

/**
 * Safely parse a number with fallback
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Fallback value
 * @returns {number} - Parsed number or default
 */
export const safeParseFloat = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
};

/**
 * Safely parse an integer with fallback
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Fallback value
 * @returns {number} - Parsed integer or default
 */
export const safeParseInt = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
};

/**
 * Ensure value is an array
 * @param {any} value - Value to check
 * @param {Array} defaultValue - Fallback array
 * @returns {Array} - Value as array or default
 */
export const ensureArray = (value, defaultValue = []) => {
  return Array.isArray(value) ? value : defaultValue;
};

/**
 * Safely get a nested property from an object
 * @param {Object} obj - Source object
 * @param {string} path - Dot-notation path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Fallback value
 * @returns {any} - Property value or default
 */
export const safeGet = (obj, path, defaultValue = null) => {
  try {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }

    return result === undefined ? defaultValue : result;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Format currency for Kenyan Shillings
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'KES') => {
  const safeAmount = safeParseFloat(amount, 0);
  return `${currency} ${safeAmount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Validate and sanitize dashboard stats data
 * @param {Object} data - Raw stats data from API
 * @returns {Object} - Validated and sanitized stats
 */
export const validateDashboardStats = (data) => {
  if (!data || typeof data !== 'object') {
    return getEmptyDashboardStats();
  }

  return {
    total_sales: safeParseFloat(data.total_sales, 0),
    transaction_count: safeParseInt(data.transaction_count, 0),
    avg_transaction: safeParseFloat(data.avg_transaction, 0),
    cash_sales: safeParseFloat(data.cash_sales, 0),
    card_sales: safeParseFloat(data.card_sales, 0),
    mobile_money_sales: safeParseFloat(data.mobile_money_sales, 0),
    sales_trend: ensureArray(data.sales_trend, []).map(item => ({
      date: item.date || '',
      total: safeParseFloat(item.total, 0),
    })),
    hourly_sales: ensureArray(data.hourly_sales, []).map(item => ({
      hour: item.hour || '',
      total: safeParseFloat(item.total, 0),
    })),
    top_products: ensureArray(data.top_products, []).map(item => ({
      product__name: item.product__name || 'Unknown Product',
      product__sku: item.product__sku || 'N/A',
      total_quantity: safeParseFloat(item.total_quantity, 0),
      total_revenue: safeParseFloat(item.total_revenue, 0),
    })),
  };
};

/**
 * Get empty dashboard stats structure
 * @returns {Object} - Empty stats object with all fields
 */
export const getEmptyDashboardStats = () => ({
  total_sales: 0,
  transaction_count: 0,
  avg_transaction: 0,
  cash_sales: 0,
  card_sales: 0,
  mobile_money_sales: 0,
  sales_trend: [],
  hourly_sales: [],
  top_products: [],
});

/**
 * Validate and sanitize session data
 * @param {Object} session - Raw session data from API
 * @returns {Object} - Validated session
 */
export const validateSession = (session) => {
  if (!session || typeof session !== 'object') {
    return null;
  }

  return {
    ...session,
    total_sales: safeParseFloat(session.total_sales, 0),
    cash_amount: safeParseFloat(session.cash_amount, 0),
    card_amount: safeParseFloat(session.card_amount, 0),
    mobile_money_amount: safeParseFloat(session.mobile_money_amount, 0),
  };
};

/**
 * Sanitize string for CSV export
 * @param {string} value - Value to sanitize
 * @returns {string} - Sanitized value
 */
export const sanitizeCSV = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // Escape quotes and wrap in quotes if contains special characters
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
};

/**
 * Validate date string
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} - True if valid date
 */
export const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

/**
 * Truncate string to maximum length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} - Truncated string
 */
export const truncateString = (str, maxLength = 50, suffix = '...') => {
  if (!str || str.length <= maxLength) return str || '';
  return str.substring(0, maxLength - suffix.length) + suffix;
};

const dataValidationUtils = {
  safeParseFloat,
  safeParseInt,
  ensureArray,
  safeGet,
  formatCurrency,
  validateDashboardStats,
  getEmptyDashboardStats,
  validateSession,
  sanitizeCSV,
  isValidDate,
  truncateString,
};

export default dataValidationUtils;
