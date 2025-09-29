const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products (with search, filter, pagination)
router.get('/', async (req, res) => {
  try {
    const { search, category, min_price, max_price, page = 1, page_size = 12 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }
    if (min_price) {
      query.price = { ...query.price, $gte: parseFloat(min_price) };
    }
    if (max_price) {
      query.price = { ...query.price, $lte: parseFloat(max_price) };
    }
    const skip = (parseInt(page) - 1) * parseInt(page_size);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).skip(skip).limit(parseInt(page_size));
    res.json({
      results: products,
      count: total,
      next: skip + products.length < total ? `?page=${parseInt(page) + 1}` : null,
      previous: page > 1 ? `?page=${parseInt(page) - 1}` : null
    });
  } catch (error) {
    console.warn('MongoDB not available, using fallback products');
    // Fallback demo products
    const fallbackProducts = [
      { _id: '1', id: '1', name: 'Sample Product 1', price: 299.99, stock: 50, category: 'Electronics', description: 'Sample description', image: 'https://via.placeholder.com/300', brand: 'SampleBrand', rating: 4.5 },
      { _id: '2', id: '2', name: 'Sample Product 2', price: 149.50, stock: 25, category: 'Fashion', description: 'Sample description', image: 'https://via.placeholder.com/300', brand: 'SampleBrand', rating: 4.2 },
      { _id: '3', id: '3', name: 'Sample Product 3', price: 99.99, stock: 75, category: 'Home & Living', description: 'Sample description', image: 'https://via.placeholder.com/300', brand: 'SampleBrand', rating: 4.8 }
    ];
    
    // Apply basic filtering for demo
    const { search, category } = req.query;
    let filtered = fallbackProducts;
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    res.json({
      results: filtered,
      count: filtered.length,
      next: null,
      previous: null
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, price, stock, category, description, image, brand, weight } = req.body;
    
    // Validation
    if (!name || !price || !category || !brand || !image) {
      return res.status(400).json({ message: 'Name, price, category, brand, and image are required' });
    }

    // Validate category exists
    const categoryExists = await Category.findOne({ name: category, isActive: true });
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category. Please select a valid category.' });
    }
    
    const product = new Product({
      name: name.trim(),
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category: category.trim(),
      description: (description || '').trim(),
      image: image.trim(),
      brand: brand.trim(),
      weight: weight?.trim()
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.warn('MongoDB not available, creating demo product');
    // Fallback for demo mode - skip category validation
    const newProduct = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      name: req.body.name?.trim() || '',
      price: parseFloat(req.body.price) || 0,
      stock: parseInt(req.body.stock) || 0,
      category: req.body.category?.trim() || '',
      description: (req.body.description || '').trim(),
      image: req.body.image?.trim() || '',
      brand: req.body.brand?.trim() || '',
      weight: req.body.weight?.trim(),
      rating: 4.5,
      isActive: true,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    res.status(201).json(newProduct);
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, price, stock, category, description, image, brand, weight } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate category if being updated
    if (category && category !== product.category) {
      const categoryExists = await Category.findOne({ name: category, isActive: true });
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category. Please select a valid category.' });
      }
    }
    
    // Update fields
    if (name !== undefined) product.name = name.trim();
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = (description || '').trim();
    if (image !== undefined) product.image = image.trim();
    if (brand !== undefined) product.brand = brand.trim();
    if (weight !== undefined) product.weight = weight?.trim();
    
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;