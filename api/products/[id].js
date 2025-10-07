// Vercel Serverless Function: Get/Update/Delete Product by ID
// Endpoint: /api/products/[id]

const mongoose = require('mongoose');
const { connectToDatabase } = require('../_utils/mongodb');
const { setCorsHeaders } = require('../_utils/cors');
const { requireAdmin } = require('../_utils/auth');

// Import models
const getProductModel = () => {
  try {
    return mongoose.model('Product');
  } catch (error) {
    return require('../../backend/models/Product');
  }
};

// Fallback products for when MongoDB is not available
const fallbackProducts = [
  {
    _id: '1',
    id: '1',
    name: 'iPhone 14 Pro',
    description: 'Latest iPhone with advanced camera system',
    price: 120000,
    category: '1',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80',
    stock: 15,
    rating: 4.8,
    isActive: true,
    isFeatured: true,
    tags: ['electronics', 'smartphone', 'apple'],
    createdAt: new Date('2024-01-01')
  }
  // ... other fallback products
];

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  try {
    // Connect to database
    await connectToDatabase();

    const { id } = req.query;

    if (req.method === 'GET') {
      return await getProductById(req, res, id);
    } else if (req.method === 'PUT') {
      return await updateProduct(req, res, id);
    } else if (req.method === 'DELETE') {
      return await deleteProduct(req, res, id);
    } else if (req.method === 'PATCH') {
      return await updateProduct(req, res, id);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Product endpoint error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Get single product by ID
 */
async function getProductById(req, res, id) {
  try {
    const Product = getProductModel();
    
    // Try to find by ID first, then by slug
    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    
    // Return fallback product
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      console.log('MongoDB not available, using fallback product');
      const product = fallbackProducts.find(p => p._id === id || p.id === id);
      
      if (product) {
        return res.status(200).json({
          success: true,
          message: 'Product retrieved successfully (fallback)',
          data: product
        });
      }
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    throw error;
  }
}

/**
 * Update product (admin only)
 */
async function updateProduct(req, res, id) {
  try {
    // Require admin authentication
    await requireAdmin(req);

    const Product = getProductModel();
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Update fields
    const updateFields = [
      'name', 'description', 'price', 'comparePrice', 'costPerItem',
      'category', 'brand', 'sku', 'stock', 'manageStock', 'lowStockThreshold',
      'images', 'image', 'variants', 'weight', 'dimensions', 'tags',
      'metaTitle', 'metaDescription', 'isActive', 'isFeatured'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    console.log('✅ Product updated:', product.name);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.message === 'Admin access required' || error.message === 'Invalid token' || error.message === 'No token provided') {
      return res.status(error.message === 'Admin access required' ? 403 : 401).json({ 
        success: false, 
        message: error.message 
      });
    }
    throw error;
  }
}

/**
 * Delete product (admin only)
 */
async function deleteProduct(req, res, id) {
  try {
    // Require admin authentication
    await requireAdmin(req);

    const Product = getProductModel();
    
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    console.log('✅ Product deleted:', product.name);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.message === 'Admin access required' || error.message === 'Invalid token' || error.message === 'No token provided') {
      return res.status(error.message === 'Admin access required' ? 403 : 401).json({ 
        success: false, 
        message: error.message 
      });
    }
    throw error;
  }
}
