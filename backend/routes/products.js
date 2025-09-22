const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { search, category, min_price, max_price, page = 1, page_size = 12, limit } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    // Search filter
    if (search) {
      const searchTerm = search;
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    // Price filters
    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }
    
    // Handle limit parameter for featured products
    if (limit) {
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('-__v');
      
      return res.json({
        results: products,
        count: products.length
      });
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const pageSize = parseInt(page_size);
    const skip = (pageNum - 1) * pageSize;
    
    const totalCount = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select('-__v');
    
    res.json({
      results: products,
      count: totalCount,
      next: skip + pageSize < totalCount ? `?page=${pageNum + 1}` : null,
      previous: pageNum > 1 ? `?page=${pageNum - 1}` : null
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Get query parameters for fallback
    const { search, category, min_price, max_price, page = 1, page_size = 12, limit } = req.query;
    
    // Fallback to in-memory products when MongoDB is unavailable
    const fallbackProducts = [
      {
        _id: "1",
        name: "Samsung Galaxy A54 5G",
        price: 45000,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
        category: "Electronics",
        description: "6.4-inch Super AMOLED display, 50MP triple camera, 5000mAh battery",
        stock: 25,
        rating: 4.6,
        brand: "Samsung"
      },
      {
        _id: "2",
        name: "Apple iPhone 14",
        price: 95000,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
        category: "Electronics",
        description: "Latest iPhone with A15 Bionic chip, advanced camera system",
        stock: 15,
        rating: 4.8,
        brand: "Apple"
      },
      {
        _id: "3",
        name: "HP Laptop 15-inch",
        price: 65000,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
        category: "Electronics",
        description: "Intel Core i5, 8GB RAM, 512GB SSD, perfect for work and study",
        stock: 12,
        rating: 4.4,
        brand: "HP"
      },
      {
        _id: "4",
        name: "Men's Cotton T-Shirt",
        price: 1200,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        category: "Fashion",
        description: "100% cotton, comfortable fit, available in multiple colors",
        stock: 100,
        rating: 4.3,
        brand: "Generic"
      },
      {
        _id: "5",
        name: "Women's Denim Jeans",
        price: 2500,
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
        category: "Fashion",
        description: "High-quality denim, perfect fit, classic blue color",
        stock: 75,
        rating: 4.5,
        brand: "Fashion Brand"
      },
      {
        _id: "6",
        name: "Fresh Sukuma Wiki - 1 Bunch",
        price: 20,
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
        category: "Groceries",
        description: "Fresh collard greens, locally grown, rich in vitamins and minerals",
        stock: 150,
        rating: 4.7,
        brand: "Local Farm"
      },
      {
        _id: "7",
        name: "Brookside Milk - 500ml",
        price: 60,
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
        category: "Groceries",
        description: "Fresh pasteurized whole milk, rich in calcium and protein",
        stock: 80,
        rating: 4.6,
        brand: "Brookside"
      },
      {
        _id: "8",
        name: "Coffee Table",
        price: 12000,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
        category: "Home & Living",
        description: "Modern wooden coffee table, perfect for any living room",
        stock: 8,
        rating: 4.6,
        brand: "Home Furniture"
      }
    ];
    
    // Apply filters to fallback data
    let filteredProducts = [...fallbackProducts];
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Category filter
    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Price filters
    if (min_price) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= parseFloat(min_price)
      );
    }
    
    if (max_price) {
      filteredProducts = filteredProducts.filter(product =>
        product.price <= parseFloat(max_price)
      );
    }
    
    // Handle limit for featured products
    if (limit) {
      return res.json({
        results: filteredProducts.slice(0, parseInt(limit)),
        count: filteredProducts.length
      });
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const pageSize = parseInt(page_size);
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
      results: paginatedProducts,
      count: filteredProducts.length,
      next: endIndex < filteredProducts.length ? `?page=${pageNum + 1}` : null,
      previous: pageNum > 1 ? `?page=${pageNum - 1}` : null
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select('-__v');
    
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, price, stock, category, description, image, brand, weight } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }
    
    const newProduct = new Product({
      name,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      brand: brand || 'Generic',
      weight: weight || '',
      rating: 4.5
    });
    
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const product = await Product.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;