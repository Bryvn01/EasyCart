const Product = require('../models/Product');
const Category = require('../models/Category');

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
 * Get all products with advanced filtering, search, and pagination
 * @route GET /api/products
 */
exports.getAllProducts = async (req, res) => {
  try {
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

    return sendResponse(res, 200, true, products, 'Products retrieved successfully', pagination);
  } catch (error) {
    console.error('Error fetching products:', error);
    return sendResponse(res, 500, false, null, error.message);
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
