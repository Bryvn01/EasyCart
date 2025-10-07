// Vercel Serverless Function: Get All Products
// Endpoint: /api/products (GET)
// Also handles POST for creating products (admin only)

const mongoose = require('mongoose');
const { connectToDatabase } = require('./_utils/mongodb');
const { setCorsHeaders } = require('./_utils/cors');
const { requireAdmin } = require('./_utils/auth');

// Import models
const getProductModel = () => {
  try {
    return mongoose.model('Product');
  } catch (error) {
    return require('../backend/models/Product');
  }
};

const getCategoryModel = () => {
  try {
    return mongoose.model('Category');
  } catch (error) {
    return require('../backend/models/Category');
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
  },
  {
    _id: '2',
    id: '2',
    name: 'Samsung Galaxy S23',
    description: 'Premium Android smartphone with excellent display',
    price: 95000,
    category: '1',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
    stock: 20,
    rating: 4.7,
    isActive: true,
    isFeatured: true,
    tags: ['electronics', 'smartphone', 'samsung'],
    createdAt: new Date('2024-01-02')
  },
  {
    _id: '3',
    id: '3',
    name: 'Nike Air Max',
    description: 'Comfortable running shoes',
    price: 12500,
    category: '6',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    stock: 30,
    rating: 4.5,
    isActive: true,
    isFeatured: true,
    tags: ['fashion', 'shoes', 'sports'],
    createdAt: new Date('2024-01-03')
  },
  {
    _id: '4',
    id: '4',
    name: 'Denim Jacket',
    description: 'Classic denim jacket for all seasons',
    price: 4500,
    category: '2',
    brand: 'Levis',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    stock: 25,
    rating: 4.6,
    isActive: true,
    isFeatured: true,
    tags: ['fashion', 'jacket', 'denim'],
    createdAt: new Date('2024-01-04')
  },
  {
    _id: '5',
    id: '5',
    name: 'MacBook Pro 14"',
    description: 'Powerful laptop for professionals',
    price: 250000,
    category: '1',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    stock: 8,
    rating: 4.9,
    isActive: true,
    isFeatured: true,
    tags: ['electronics', 'laptop', 'apple'],
    createdAt: new Date('2024-01-05')
  },
  {
    _id: '6',
    id: '6',
    name: 'Organic Coffee Beans',
    description: 'Premium organic coffee beans from Kenya',
    price: 1200,
    category: '7',
    brand: 'Java House',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    stock: 50,
    rating: 4.7,
    isActive: true,
    isFeatured: true,
    tags: ['groceries', 'coffee', 'organic'],
    createdAt: new Date('2024-01-06')
  },
  {
    _id: '7',
    id: '7',
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat for fitness enthusiasts',
    price: 2500,
    category: '6',
    brand: 'Lululemon',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
    stock: 35,
    rating: 4.4,
    isActive: true,
    isFeatured: true,
    tags: ['sports', 'fitness', 'yoga'],
    createdAt: new Date('2024-01-07')
  },
  {
    _id: '8',
    id: '8',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling wireless headphones',
    price: 18000,
    category: '1',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    stock: 40,
    rating: 4.6,
    isActive: true,
    isFeatured: true,
    tags: ['electronics', 'audio', 'headphones'],
    createdAt: new Date('2024-01-08')
  }
];

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  try {
    // Connect to database
    await connectToDatabase();

    if (req.method === 'GET') {
      return await getAllProducts(req, res);
    } else if (req.method === 'POST') {
      return await createProduct(req, res);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products endpoint error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Get all products with filtering and pagination
 */
async function getAllProducts(req, res) {
  try {
    const Product = getProductModel();
    
    const {
      search,
      category,
      brand,
      min_price,
      max_price,
      rating,
      tags,
      isActive,
      isFeatured,
      inStock,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    // Search across multiple fields
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (brand) query.brand = brand;

    // Filter by price range
    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }

    if (rating) query.rating = { $gte: parseFloat(rating) };

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }

    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (inStock === 'true') query.stock = { $gt: 0 };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    };

    console.log(`✅ Retrieved ${products.length} products (Total: ${total})`);

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
      results: products,
      count: total,
      next: pagination.hasNextPage,
      previous: pagination.hasPrevPage,
      pagination
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Return fallback products
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      console.log('MongoDB not available, using fallback products');
      const { page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      
      const paginatedProducts = fallbackProducts.slice(skip, skip + limitNum);
      const total = fallbackProducts.length;
      const totalPages = Math.ceil(total / limitNum);
      
      return res.status(200).json({
        success: true,
        message: 'Products retrieved successfully (fallback)',
        data: paginatedProducts,
        results: paginatedProducts,
        count: total,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      });
    }
    
    throw error;
  }
}

/**
 * Create new product (admin only)
 */
async function createProduct(req, res) {
  try {
    // Require admin authentication
    await requireAdmin(req);

    const Product = getProductModel();
    const Category = getCategoryModel();

    const {
      name,
      description,
      price,
      comparePrice,
      costPerItem,
      category,
      brand,
      sku,
      stock,
      manageStock,
      lowStockThreshold,
      images,
      image,
      variants,
      weight,
      dimensions,
      tags,
      metaTitle,
      metaDescription,
      isActive,
      isFeatured
    } = req.body;

    // Validation
    if (!name || !description || !price || !category || !brand) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, description, price, category, and brand are required' 
      });
    }

    // Validate category
    const categoryExists = await Category.findOne({ name: category, isActive: true });
    if (!categoryExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid category. Please select a valid category.' 
      });
    }

    // Check for duplicate SKU
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product with this SKU already exists' 
        });
      }
    }

    // Prepare images array
    let imagesArray = [];
    if (images && Array.isArray(images)) {
      imagesArray = images.map((img, index) => ({
        url: img.url || img,
        alt: img.alt || name,
        isPrimary: img.isPrimary || index === 0
      }));
    } else if (image) {
      imagesArray = [{
        url: image,
        alt: name,
        isPrimary: true
      }];
    }

    // Create product
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      costPerItem: costPerItem ? parseFloat(costPerItem) : undefined,
      category: category.trim(),
      brand: brand.trim(),
      sku: sku?.trim(),
      stock: parseInt(stock) || 0,
      manageStock: manageStock !== undefined ? manageStock : true,
      lowStockThreshold: parseInt(lowStockThreshold) || 10,
      images: imagesArray,
      variants: variants || [],
      weight: weight?.trim(),
      dimensions: dimensions?.trim(),
      tags: tags || [],
      metaTitle: metaTitle?.trim() || name,
      metaDescription: metaDescription?.trim() || description,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false
    });

    await product.save();

    console.log('✅ Product created:', product.name);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.message === 'Admin access required' || error.message === 'Invalid token' || error.message === 'No token provided') {
      return res.status(error.message === 'Admin access required' ? 403 : 401).json({ 
        success: false, 
        message: error.message 
      });
    }
    throw error;
  }
}
