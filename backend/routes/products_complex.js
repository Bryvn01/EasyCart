const express = require('express');
const router = express.Router();

// Try to use MongoDB Product model, fallback to in-memory
let Product;
let useDatabase = true;
let inMemoryProducts = [];

try {
  Product = require('../models/Product');
} catch (error) {
  console.log('Database model not available, using in-memory storage');
  useDatabase = false;
  
  // Sample in-memory products for testing
  inMemoryProducts = [
    {
      _id: '1',
      name: 'iPhone 14 Pro',
      price: 120000,
      stock: 15,
      category: 'Electronics',
      description: 'Latest iPhone with advanced camera system',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      rating: 4.8,
      brand: 'Apple',
      isActive: true
    },
    {
      _id: '2',
      name: 'Nike Air Max',
      price: 8500,
      stock: 30,
      category: 'Fashion',
      description: 'Comfortable running shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      rating: 4.5,
      brand: 'Nike',
      isActive: true
    }
  ];
}

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const search = req.query.search;
    
    if (useDatabase) {
      // Use MongoDB
      let query = { isActive: true };
      
      if (category) {
        query.category = category;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      const skip = (page - 1) * limit;
      
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const totalCount = await Product.countDocuments(query);
      
      res.json({
        results: products,
        count: totalCount,
        next: skip + limit < totalCount ? `?page=${page + 1}` : null,
        previous: page > 1 ? `?page=${page - 1}` : null,
        pages: Math.ceil(totalCount / limit)
      });
    } else {
      // Use in-memory products
      let filteredProducts = inMemoryProducts.filter(p => p.isActive);
      
      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      
      if (search) {
        const searchTerm = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
        );
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      res.json({
        results: paginatedProducts,
        count: filteredProducts.length,
        next: endIndex < filteredProducts.length ? `?page=${page + 1}` : null,
        previous: page > 1 ? `?page=${page - 1}` : null,
        pages: Math.ceil(filteredProducts.length / limit)
      });
    }
  } catch (error) {
    console.error('Products GET error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    if (useDatabase) {
      const product = await Product.findById(req.params.id);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } else {
      const product = inMemoryProducts.find(p => p._id === req.params.id && p.isActive);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    }
  } catch (error) {
    console.error('Products GET/:id error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, price, stock, category, description, image, brand, weight } = req.body;
    
    if (!name || !price || !category || !description) {
      return res.status(400).json({ message: 'Name, price, category, and description are required' });
    }
    
    if (useDatabase) {
      const product = new Product({
        name,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        category,
        description,
        image: image || 'https://via.placeholder.com/400',
        brand: brand || 'Generic',
        weight: weight || '',
        rating: 4.5
      });
      
      const savedProduct = await product.save();
      res.status(201).json(savedProduct);
    } else {
      const newProduct = {
        _id: String(Math.max(...inMemoryProducts.map(p => parseInt(p._id)), 0) + 1),
        name,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        category,
        description,
        image: image || 'https://via.placeholder.com/400',
        brand: brand || 'Generic',
        weight: weight || '',
        rating: 4.5,
        isActive: true
      };
      
      inMemoryProducts.push(newProduct);
      res.status(201).json(newProduct);
    }
  } catch (error) {
    console.error('Products POST error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, price, stock, category, description, image, brand, weight } = req.body;
    
    if (useDatabase) {
      const updateData = {};
      if (name) updateData.name = name;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (stock !== undefined) updateData.stock = parseInt(stock);
      if (category) updateData.category = category;
      if (description) updateData.description = description;
      if (image) updateData.image = image;
      if (brand) updateData.brand = brand;
      if (weight !== undefined) updateData.weight = weight;
      
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } else {
      const productIndex = inMemoryProducts.findIndex(p => p._id === req.params.id);
      
      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const product = inMemoryProducts[productIndex];
      if (name) product.name = name;
      if (price !== undefined) product.price = parseFloat(price);
      if (stock !== undefined) product.stock = parseInt(stock);
      if (category) product.category = category;
      if (description) product.description = description;
      if (image) product.image = image;
      if (brand) product.brand = brand;
      if (weight !== undefined) product.weight = weight;
      
      res.json(product);
    }
  } catch (error) {
    console.error('Products PUT error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete product (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    if (useDatabase) {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json({ message: 'Product deleted successfully' });
    } else {
      const productIndex = inMemoryProducts.findIndex(p => p._id === req.params.id);
      
      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      inMemoryProducts[productIndex].isActive = false;
      res.json({ message: 'Product deleted successfully' });
    }
  } catch (error) {
    console.error('Products DELETE error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;