const express = require('express');
const router = express.Router();
const { upload, processImage, optimizeForWeb } = require('../utils/imageUpload');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { adminAuth } = require('../middleware/auth');

/**
 * Upload single image
 * @route POST /api/upload/image
 */
router.post('/image', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Check if Cloudinary is configured
    const useCloudinary = process.env.CLOUDINARY_URL ||
                          (process.env.CLOUDINARY_CLOUD_NAME &&
                           process.env.CLOUDINARY_API_KEY &&
                           process.env.CLOUDINARY_API_SECRET);

    if (useCloudinary) {
      // Optimize image before uploading to Cloudinary
      const optimizedBuffer = await optimizeForWeb(req.file.buffer);
      const base64Image = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;

      // Upload to Cloudinary
      const result = await uploadImage(base64Image, {
        folder: 'easycart/products',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }
        ]
      });

      res.json({
        success: true,
        url: result.url,
        file_url: result.url,
        publicId: result.publicId,
        message: 'Image uploaded successfully to Cloudinary'
      });
    } else {
      // Fallback to base64 encoding if Cloudinary is not configured
      const optimizedBuffer = await optimizeForWeb(req.file.buffer);
      const base64Image = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;

      res.json({
        success: true,
        url: base64Image,
        file_url: base64Image,
        message: 'Image uploaded successfully (base64)'
      });
    }
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Upload multiple images
 * @route POST /api/upload/images
 */
router.post('/images', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    // Check if Cloudinary is configured
    const useCloudinary = process.env.CLOUDINARY_URL ||
                          (process.env.CLOUDINARY_CLOUD_NAME &&
                           process.env.CLOUDINARY_API_KEY &&
                           process.env.CLOUDINARY_API_SECRET);

    const uploadedImages = [];

    for (const file of req.files) {
      try {
        if (useCloudinary) {
          // Optimize and upload to Cloudinary
          const optimizedBuffer = await optimizeForWeb(file.buffer);
          const base64Image = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;

          const result = await uploadImage(base64Image, {
            folder: 'easycart/products',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' }
            ]
          });

          uploadedImages.push({
            url: result.url,
            publicId: result.publicId,
            alt: req.body.alt || '',
            isPrimary: uploadedImages.length === 0
          });
        } else {
          // Fallback to base64
          const optimizedBuffer = await optimizeForWeb(file.buffer);
          const base64Image = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;

          uploadedImages.push({
            url: base64Image,
            alt: req.body.alt || '',
            isPrimary: uploadedImages.length === 0
          });
        }
      } catch (error) {
        console.error('Error uploading individual file:', error);
        // Continue with other files
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload any images'
      });
    }

    res.json({
      success: true,
      images: uploadedImages,
      count: uploadedImages.length,
      message: `${uploadedImages.length} image(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Delete image from Cloudinary
 * @route DELETE /api/upload/image/:publicId
 */
router.delete('/image/:publicId', adminAuth, async (req, res) => {
  try {
    const { publicId } = req.params;

    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await deleteImage(decodedPublicId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof require('multer').MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB per image.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 images per upload.'
      });
    }
  }
  res.status(400).json({
    success: false,
    message: error.message
  });
});

module.exports = router;
