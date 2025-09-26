const express = require('express');
const router = express.Router();

// Simple in-memory products storage for testing
let products = [
  {
    id: 1,
    _id: '1',
    name: 'iPhone 14 Pro',
    price: 120000,
    stock: 15,
    category: 'Electronics',
    description: 'Latest iPhone with advanced camera system',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    rating: 4.8,
    brand: 'Apple',
    isActive: true,
    weight: '200g'
  },
  {
    id: 2,
    _id: '2',
    name: 'Nike Air Max',
    price: 8500,
    stock: 30,
    category: 'Fashion',
    description: 'Comfortable running shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    rating: 4.5,
    brand: 'Nike',
    isActive: true,
    weight: '300g'
  },
  {
    id: 3,
    _id: '3',
    name: 'MacBook Pro M2',
    price: 250000,
    stock: 8,
    category: 'Electronics',
    description: 'Professional laptop with M2 chip',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=400',
    rating: 4.9,
    brand: 'Apple',
    isActive: true,
    weight: '1.4kg'
  }
];

let nextId = 4;

// Get all products with filtering and pagination
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const search = req.query.search;
    
    let filteredProducts = products.filter(p => p.isActive);
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
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
  } catch (error) {
    console.error('Products GET error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    const product = products.find(p => 
      (p.id == req.params.id || p._id === req.params.id) && p.isActive
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Products GET/:id error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new product
router.post('/', (req, res) => {
  try {
    const { name, price, stock, category, description, image, brand, weight } = req.body;
    
    if (!name || !price || !category || !description) {
      return res.status(400).json({ 
        message: 'Name, price, category, and description are required' 
      });
    }
    
    const newProduct = {
      id: nextId,
      _id: String(nextId),
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
    
    products.push(newProduct);
    nextId++;
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Products POST error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update product
router.put('/:id', (req, res) => {
  try {
    const { name, price, stock, category, description, image, brand, weight } = req.body;
    
    const productIndex = products.findIndex(p => 
      p.id == req.params.id || p._id === req.params.id
    );
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[productIndex];
    
    if (name) product.name = name;
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category) product.category = category;
    if (description) product.description = description;
    if (image) product.image = image;
    if (brand) product.brand = brand;
    if (weight !== undefined) product.weight = weight;
    
    res.json(product);
  } catch (error) {
    console.error('Products PUT error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product (soft delete)
router.delete('/:id', (req, res) => {
  try {
    const productIndex = products.findIndex(p => 
      p.id == req.params.id || p._id === req.params.id
    );
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    products[productIndex].isActive = false;
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Products DELETE error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;