const Product = require('../models/Product');
const Category = require('../models/Category');

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

/**
 * Standard response format helper
 */
const sendResponse = (res, statusCode, success, data, message, pagination = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

/**
 * Products-specific response format helper (DRF-compatible)
 * Includes both 'data' and 'results' keys for compatibility
 */
const sendProductsResponse = (res, statusCode, success, products, message, pagination = null) => {
  const response = {
    success,
    message,
    data: products,
    results: products,  // DRF-compatible key
    count: pagination ? pagination.total : products.length,  // DRF-compatible total count
    next: pagination ? pagination.hasNextPage : false,
    previous: pagination ? pagination.hasPrevPage : false
  };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

/**
 * Get all products with advanced filtering, search, and pagination
 * @route GET /api/products
 */
exports.getAllProducts = async (req, res) => {
  try {
    // Debug logging for MongoDB connection
    const mongoose = require('mongoose');
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    const state = mongoose.connection.readyState;
    console.log('🔍 [DEBUG] Fetching products from MongoDB');
    console.log('📊 [DEBUG] Database:', mongoose.connection.name || 'Unknown');
    console.log(`🔗 [DEBUG] Connection state: ${state} (${connectionStates[state]})`);

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

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by brand
    if (brand) {
      query.brand = brand;
    }

    // Filter by price range
    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }

    // Filter by rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Filter by tags (supports multiple tags separated by comma)
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Filter by featured status
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    // Filter by stock availability
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    };

    // Debug logging for results
    console.log(`✅ [DEBUG] Retrieved ${products.length} products (Total in DB: ${total})`);
    console.log('📦 [DEBUG] First product:', products[0] ? `${products[0].name} - KES ${products[0].price}` : 'No products found');
    if (total === 37) {
      console.log('✅ [DEBUG] CORRECT: Expected 37 products found in database');
    } else if (total === 0) {
      console.log('⚠️  [DEBUG] WARNING: 0 products found - database may not be seeded');
    }

    return sendProductsResponse(res, 200, true, products, 'Products retrieved successfully', pagination);
  } catch (error) {
    console.error('❌ [DEBUG] Error fetching products:', error.name, '-', error.message);

    // Return fallback products when MongoDB is unavailable
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      console.log('⚠️  [DEBUG] MongoDB not available, using fallback products (8 items)');
      const { page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Simple pagination for fallback data
      const paginatedProducts = fallbackProducts.slice(skip, skip + limitNum);
      const total = fallbackProducts.length;
      const totalPages = Math.ceil(total / limitNum);

      const pagination = {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      };

      return sendProductsResponse(res, 200, true, paginatedProducts, 'Products retrieved successfully (fallback)', pagination);
    }

    // For other errors, return error response with proper format
    return sendResponse(res, 500, false, null, error.message || 'Failed to fetch products');
  }
};

/**
 * Get single product by ID or slug
 * @route GET /api/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by ID first, then by slug
    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return sendResponse(res, 404, false, null, 'Product not found');
    }

    return sendResponse(res, 200, true, product, 'Product retrieved successfully');
  } catch (error) {
    console.error('Error fetching product:', error);

    // Return fallback product when MongoDB is unavailable
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      console.log('MongoDB not available, using fallback product');
      const { id } = req.params;
      const product = fallbackProducts.find(p => p._id === id || p.id === id);

      if (product) {
        return sendResponse(res, 200, true, product, 'Product retrieved successfully (fallback)');
      }
      return sendResponse(res, 404, false, null, 'Product not found');
    }

    return sendResponse(res, 500, false, null, error.message);
  }
};

/**
 * Create new product
 * @route POST /api/products
 */
exports.createProduct = async (req, res) => {
  try {
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
      return sendResponse(res, 400, false, null, 'Name, description, price, category, and brand are required');
    }

    // Validate category exists
    const categoryExists = await Category.findOne({ name: category, isActive: true });
    if (!categoryExists) {
      return sendResponse(res, 400, false, null, 'Invalid category. Please select a valid category.');
    }

    // Check for duplicate SKU if provided
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return sendResponse(res, 400, false, null, 'Product with this SKU already exists');
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
      // Support legacy single image field
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
      metaDescription: metaDescription?.trim() || description.substring(0, 160),
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false
    });

    await product.save();

    return sendResponse(res, 201, true, product, 'Product created successfully');
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 11000) {
      return sendResponse(res, 400, false, null, 'Product with this SKU or slug already exists');
    }
    return sendResponse(res, 500, false, null, error.message);
  }
};

/**
 * Update product
 * @route PUT /api/products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return sendResponse(res, 404, false, null, 'Product not found');
    }

    // Validate category if being updated
    if (updateData.category && updateData.category !== product.category) {
      const categoryExists = await Category.findOne({ name: updateData.category, isActive: true });
      if (!categoryExists) {
        return sendResponse(res, 400, false, null, 'Invalid category. Please select a valid category.');
      }
    }

    // Check for duplicate SKU if being updated
    if (updateData.sku && updateData.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: updateData.sku });
      if (existingProduct) {
        return sendResponse(res, 400, false, null, 'Product with this SKU already exists');
      }
    }

    // Handle images update
    if (updateData.images) {
      updateData.images = updateData.images.map((img, index) => ({
        url: img.url || img,
        alt: img.alt || product.name,
        isPrimary: img.isPrimary || (index === 0 && !updateData.images.some(i => i.isPrimary))
      }));
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== '_id' && key !== '__v') {
        product[key] = updateData[key];
      }
    });

    await product.save();

    return sendResponse(res, 200, true, product, 'Product updated successfully');
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 11000) {
      return sendResponse(res, 400, false, null, 'Product with this SKU or slug already exists');
    }
    return sendResponse(res, 500, false, null, error.message);
  }
};

/**
 * Delete product (soft delete by setting isActive to false)
 * @route DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === 'true') {
      // Permanent deletion
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return sendResponse(res, 404, false, null, 'Product not found');
      }
      return sendResponse(res, 200, true, null, 'Product permanently deleted');
    } else {
      // Soft delete
      const product = await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      if (!product) {
        return sendResponse(res, 404, false, null, 'Product not found');
      }
      return sendResponse(res, 200, true, product, 'Product deactivated successfully');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return sendResponse(res, 500, false, null, error.message);
  }
};

/**
 * Update product stock
 * @route PATCH /api/products/:id/stock
 */
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation } = req.body;

    if (stock === undefined && !operation) {
      return sendResponse(res, 400, false, null, 'Stock value or operation is required');
    }

    const product = await Product.findById(id);
    if (!product) {
      return sendResponse(res, 404, false, null, 'Product not found');
    }

    // Handle different operations
    if (operation === 'increment') {
      product.stock += parseInt(stock) || 0;
    } else if (operation === 'decrement') {
      product.stock = Math.max(0, product.stock - (parseInt(stock) || 0));
    } else {
      product.stock = parseInt(stock);
    }

    await product.save();

    // Emit real-time update via Socket.io if available
    try {
      const { getIO } = require('../socket');
      const io = getIO();
      io.emit('productStockUpdate', {
        productId: product._id,
        stock: product.stock,
        isLowStock: product.isLowStock,
        inStock: product.inStock
      });
    } catch (error) {
      console.log('Socket.io not available for real-time update');
    }

    return sendResponse(res, 200, true, product, 'Stock updated successfully');
  } catch (error) {
    console.error('Error updating stock:', error);
    return sendResponse(res, 500, false, null, error.message);
  }
};

/**
 * Bulk update products
 * @route PATCH /api/products/bulk
 */
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updateData } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return sendResponse(res, 400, false, null, 'Product IDs array is required');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return sendResponse(res, 400, false, null, 'Update data is required');
    }

    // Prevent updating certain fields in bulk
    const restrictedFields = ['sku', 'slug', '_id', '__v'];
    restrictedFields.forEach(field => delete updateData[field]);

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );

    return sendResponse(res, 200, true, {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }, `${result.modifiedCount} products updated successfully`);
  } catch (error) {
    console.error('Error bulk updating products:', error);
    return sendResponse(res, 500, false, null, error.message);
  }
};

/**
 * Get products with low stock
 * @route GET /api/products/inventory/low-stock
 */
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      manageStock: true,
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      stock: { $gt: 0 }
    }).sort('stock');

    return sendResponse(res, 200, true, products, 'Low stock products retrieved successfully');
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return sendResponse(res, 500, false, null, error.message);
  }
};

/**
 * Get out of stock products
 * @route GET /api/products/inventory/out-of-stock
 */
exports.getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      manageStock: true,
      isActive: true,
      stock: 0
    }).sort('-updatedAt');

    return sendResponse(res, 200, true, products, 'Out of stock products retrieved successfully');
  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    return sendResponse(res, 500, false, null, error.message);
  }
};
