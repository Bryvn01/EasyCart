const sharp = require('sharp');
const multer = require('multer');
const path = require('path');

/**
 * Multer configuration for image uploads
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allowed image formats
  const allowedFormats = /jpeg|jpg|png|webp/;
  const extname = allowedFormats.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFormats.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Max 5 files per request
  },
  fileFilter: fileFilter
});

/**
 * Process and optimize image using Sharp
 * @param {Buffer} buffer - Image buffer
 * @param {object} options - Processing options
 * @returns {Promise<object>} Processed image data
 */
const processImage = async (buffer, options = {}) => {
  try {
    const {
      width = 1200,
      height = 1200,
      quality = 80,
      format = 'webp',
      fit = 'inside'
    } = options;

    const processedBuffer = await sharp(buffer)
      .resize(width, height, { fit, withoutEnlargement: true })
      .toFormat(format, { quality })
      .toBuffer();

    return {
      buffer: processedBuffer,
      format,
      size: processedBuffer.length
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

/**
 * Generate multiple image sizes (thumbnail, medium, large)
 * @param {Buffer} buffer - Original image buffer
 * @returns {Promise<object>} Object containing different image sizes
 */
const generateImageSizes = async (buffer) => {
  try {
    const sizes = {
      thumbnail: { width: 150, height: 150, fit: 'cover' },
      medium: { width: 600, height: 600, fit: 'inside' },
      large: { width: 1200, height: 1200, fit: 'inside' }
    };

    const results = {};

    for (const [name, dimensions] of Object.entries(sizes)) {
      const processed = await processImage(buffer, {
        width: dimensions.width,
        height: dimensions.height,
        fit: dimensions.fit
      });
      results[name] = processed;
    }

    return results;
  } catch (error) {
    console.error('Error generating image sizes:', error);
    throw new Error(`Failed to generate image sizes: ${error.message}`);
  }
};

/**
 * Validate image dimensions
 * @param {Buffer} buffer - Image buffer
 * @param {object} requirements - Dimension requirements
 * @returns {Promise<boolean>} Validation result
 */
const validateImageDimensions = async (buffer, requirements = {}) => {
  try {
    const { minWidth = 300, minHeight = 300, maxWidth = 5000, maxHeight = 5000 } = requirements;

    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;

    if (width < minWidth || height < minHeight) {
      throw new Error(`Image dimensions must be at least ${minWidth}x${minHeight}px`);
    }

    if (width > maxWidth || height > maxHeight) {
      throw new Error(`Image dimensions must not exceed ${maxWidth}x${maxHeight}px`);
    }

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Convert image to base64
 * @param {Buffer} buffer - Image buffer
 * @returns {string} Base64 encoded string
 */
const convertToBase64 = (buffer, mimetype = 'image/webp') => {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};

/**
 * Extract image metadata
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<object>} Image metadata
 */
const getImageMetadata = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
      space: metadata.space,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw new Error(`Failed to extract image metadata: ${error.message}`);
  }
};

/**
 * Optimize image for web
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<Buffer>} Optimized image buffer
 */
const optimizeForWeb = async (buffer) => {
  try {
    return await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error(`Failed to optimize image: ${error.message}`);
  }
};

module.exports = {
  upload,
  processImage,
  generateImageSizes,
  validateImageDimensions,
  convertToBase64,
  getImageMetadata,
  optimizeForWeb
};
