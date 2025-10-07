// Vercel Serverless Function: Multiple Images Upload
// Endpoint: /api/upload/images
// Note: This function expects an array of base64 encoded images in the request body

const { setCorsHeaders } = require('../_utils/cors');
const { requireAdmin } = require('../_utils/auth');
const { connectToDatabase } = require('../_utils/mongodb');

// Import cloudinary utilities
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    // Connect to database and require admin
    await connectToDatabase();
    await requireAdmin(req);

    const { images, alt } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No image data provided or invalid format' 
      });
    }

    if (images.length > 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Maximum 5 images allowed per upload' 
      });
    }

    // Check if Cloudinary is configured
    const useCloudinary = process.env.CLOUDINARY_URL || 
                          (process.env.CLOUDINARY_CLOUD_NAME && 
                           process.env.CLOUDINARY_API_KEY && 
                           process.env.CLOUDINARY_API_SECRET);

    const uploadedImages = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        if (useCloudinary) {
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(image, {
            folder: 'easycart/products',
            resource_type: 'image',
            quality: 'auto:good',
            fetch_format: 'auto',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' }
            ]
          });
          
          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: alt || '',
            isPrimary: i === 0
          });
        } else {
          // Fallback to base64
          uploadedImages.push({
            url: image,
            alt: alt || '',
            isPrimary: i === 0
          });
        }
      } catch (error) {
        console.error('Error uploading individual image:', error);
        // Continue with other images
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to upload any images' 
      });
    }

    return res.json({ 
      success: true,
      images: uploadedImages,
      count: uploadedImages.length,
      message: `${uploadedImages.length} image(s) uploaded successfully` 
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    
    // Handle auth errors
    if (error.message === 'Admin access required' || error.message === 'Invalid token' || error.message === 'No token provided') {
      return res.status(error.message === 'Admin access required' ? 403 : 401).json({ 
        success: false, 
        message: error.message 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
