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
  // This happens when Django's ImageField prepends /media/ to full URLs
  if (decodedUrl.includes('/media/https:') || decodedUrl.includes('/media/http:')) {
    // Extract the actual URL after /media/, handling both https:// and http://
    const match = decodedUrl.match(/\/media\/(https?:\/?\/?[^"'\s]+)/);
    if (match) {
      let cleanUrl = match[1];
      // Fix malformed protocol (https:/ -> https://)
      cleanUrl = cleanUrl.replace(/^(https?):\/([^/])/, '$1://$2');
      return cleanUrl;
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
 * Get product image URL with fallback
 * @param {Object} product - Product object
 * @param {string} fallback - Fallback image URL
 * @returns {string} - Image URL or fallback
 */
export const getProductImageUrl = (product, fallback = '/placeholder.png') => {
  if (!product) return fallback;
  
  const imageUrl = product.image || product.image_url;
  const normalized = normalizeImageUrl(imageUrl);
  
  return normalized || fallback;
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
  getProductImageUrl,
  preloadImage
};

export default imageUtils;
