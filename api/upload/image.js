// Vercel Serverless Function: Image Upload
// Endpoint: /api/upload/image
// Note: This function expects base64 encoded images in the request body
// For multipart/form-data, you'll need to use a different approach or middleware

const { setCorsHeaders } = require('../_utils/cors');
const { requireAdmin } = require('../_utils/auth');
const { connectToDatabase } = require('../_utils/mongodb');

// Import cloudinary utilities
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL);
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

    const { image, alt } = req.body;

    if (!image) {
      return res.status(400).json({ 
        success: false,
        message: 'No image data provided' 
      });
    }

    // Check if Cloudinary is configured
    const useCloudinary = process.env.CLOUDINARY_URL || 
                          (process.env.CLOUDINARY_CLOUD_NAME && 
                           process.env.CLOUDINARY_API_KEY && 
                           process.env.CLOUDINARY_API_SECRET);

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
      
      return res.json({ 
        success: true,
        url: result.secure_url,
        file_url: result.secure_url,
        publicId: result.public_id,
        message: 'Image uploaded successfully to Cloudinary' 
      });
    } else {
      // Fallback to returning base64 if Cloudinary is not configured
      return res.json({ 
        success: true,
        url: image,
        file_url: image,
        message: 'Image uploaded successfully (base64)' 
      });
    }
  } catch (error) {
    console.error('Image upload error:', error);
    
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
