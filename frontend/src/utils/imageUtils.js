/**
 * Image utilities for handling various image URL formats
 */

/**
 * Normalize image URL to handle Cloudinary, backend media URLs, and malformed URLs
 * @param {string} imageUrl - Original image URL
 * @returns {string} - Normalized image URL
 */
export const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Decode URL-encoded characters (e.g., %3A -> :)
  let decodedUrl = imageUrl;
  try {
    decodedUrl = decodeURIComponent(imageUrl);
  } catch (e) {
    // If decoding fails, use original URL
    decodedUrl = imageUrl;
  }

  // Fix malformed URLs like "/media/https:/..." or "/media/http:/..."
  if (decodedUrl.includes('/media/http')) {
    const match = decodedUrl.match(/\/media\/(https?:.+)/);
    if (match) {
      return match[1].replace(/^(https?):(\/)?(\/)?/, '$1://');
    }
  }

  // Use decoded URL for further checks
  imageUrl = decodedUrl;

  // If it's already a full URL (http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it starts with a slash, it's a relative path from backend
  if (imageUrl.startsWith('/')) {
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://easycart-j6ue.onrender.com/api';
    const baseUrl = apiBaseUrl.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  }

  // Otherwise, assume it's a relative path
  return imageUrl;
};

/**
 * Check if URL is a valid Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if valid Cloudinary URL
 */
const isCloudinaryUrl = (url) => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    // Exact match for Cloudinary domains (no partial matches)
    return hostname === 'res.cloudinary.com' || 
           hostname === 'cloudinary.com' ||
           /^[a-zA-Z0-9-]+\.cloudinary\.com$/.test(hostname);
  } catch (e) {
    return false;
  }
};

/**
 * Apply Cloudinary transformations to optimize image delivery
 * @param {string} imageUrl - Original Cloudinary image URL
 * @param {Object} options - Transformation options
 * @param {number} options.width - Target width in pixels
 * @param {number} options.height - Target height in pixels
 * @param {string} options.quality - Quality setting ('auto', 'best', 'good', 'eco', 'low' or 1-100)
 * @param {string} options.format - Format ('auto', 'webp', 'jpg', 'png')
 * @param {string} options.crop - Crop mode ('fill', 'fit', 'scale', 'thumb')
 * @param {boolean} options.progressive - Enable progressive loading
 * @returns {string} - Optimized image URL
 */
export const applyCloudinaryTransformations = (imageUrl, options = {}) => {
  if (!isCloudinaryUrl(imageUrl)) {
    return imageUrl;
  }

  const {
    width = 400,
    height = 400,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    progressive = true,
  } = options;

  // Build transformation string
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `f_${format}`,
    `q_${quality}`,
  ];

  if (progressive) {
    transformations.push('fl_progressive');
  }

  // Add lossy compression for smaller file sizes
  transformations.push('fl_lossy');

  const transformString = transformations.join(',');

  // Insert transformations into Cloudinary URL
  return imageUrl.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * Get product image URL with fallback and optional Cloudinary transformations
 * @param {Object} product - Product object
 * @param {Object|string} optionsOrFallback - Transformation options object or fallback string (for backward compatibility)
 * @param {string} fallback - Fallback image URL (when options is provided)
 * @returns {string} - Image URL or fallback
 */
export const getProductImageUrl = (product, optionsOrFallback = {}, fallback = '/placeholder.png') => {
  // Backward compatibility: if second arg is a string, it's the fallback
  let options = {};
  let finalFallback = fallback;
  
  if (typeof optionsOrFallback === 'string') {
    finalFallback = optionsOrFallback;
  } else {
    options = optionsOrFallback || {};
  }

  if (!product) return finalFallback;

  const imageUrl = product.image || product.image_url;
  const normalized = normalizeImageUrl(imageUrl);

  if (!normalized) return finalFallback;

  // Apply Cloudinary transformations if it's a Cloudinary URL and options provided
  if (isCloudinaryUrl(normalized) && Object.keys(options).length > 0) {
    return applyCloudinaryTransformations(normalized, options);
  }

  return normalized;
};

/**
 * Generate responsive image sizes for srcset
 * @param {string} imageUrl - Base image URL
 * @param {Array<number>} sizes - Array of widths to generate
 * @returns {string} - srcset string
 */
export const generateSrcSet = (imageUrl, sizes = [320, 640, 768, 1024, 1280]) => {
  if (!isCloudinaryUrl(imageUrl)) {
    return '';
  }

  return sizes
    .map(size => {
      const url = applyCloudinaryTransformations(imageUrl, {
        width: size,
        height: size,
        quality: 'auto',
        format: 'auto',
      });
      return `${url} ${size}w`;
    })
    .join(', ');
};

/**
 * Preload an image for better performance
 * @param {string} url - Image URL to preload
 * @returns {Promise} - Resolves when image is loaded
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

const imageUtils = {
  normalizeImageUrl,
  applyCloudinaryTransformations,
  getProductImageUrl,
  generateSrcSet,
  preloadImage,
  isCloudinaryUrl
};

export default imageUtils;
