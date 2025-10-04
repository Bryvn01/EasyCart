const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
// Supports both CLOUDINARY_URL (single string) and individual env vars
if (process.env.CLOUDINARY_URL) {
  // CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  // Fallback to individual environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Upload image to Cloudinary
 * @param {string} base64Data - Base64 encoded image data or file path
 * @param {object} options - Upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadImage = async (base64Data, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'easycart/products',
      resource_type: 'image',
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options
    };

    const result = await cloudinary.uploader.upload(base64Data, defaultOptions);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<object>} Deletion result
 */
const deleteImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return {
      success: true,
      deleted: result.deleted,
      deletedCount: Object.keys(result.deleted).length
    };
  } catch (error) {
    console.error('Cloudinary batch deletion error:', error);
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

/**
 * Get image transformation URL
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Transformation options
 * @returns {string} Transformed image URL
 */
const getTransformedUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
};

/**
 * Generate multiple sizes for a given image
 * @param {string} publicId - Cloudinary public ID
 * @returns {object} Object containing URLs for different sizes
 */
const generateImageSizes = (publicId) => {
  return {
    thumbnail: getTransformedUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
    small: getTransformedUrl(publicId, { width: 300, height: 300, crop: 'fill' }),
    medium: getTransformedUrl(publicId, { width: 600, height: 600, crop: 'fit' }),
    large: getTransformedUrl(publicId, { width: 1200, height: 1200, crop: 'fit' }),
    original: getTransformedUrl(publicId)
  };
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  deleteImages,
  getTransformedUrl,
  generateImageSizes
};
