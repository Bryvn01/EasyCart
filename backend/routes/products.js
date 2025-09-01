const express = require('express');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all products with filtering
router.get('/', async (req, res) => {
  try {
    const { search, category, min_price, max_price, brand, ordering, page = 1, page_size = 12 } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (min_price) query.price = { ...query.price, $gte: parseFloat(min_price) };
    if (max_price) query.price = { ...query.price, $lte: parseFloat(max_price) };
    
    let sort = {};
    if (ordering) {
      const field = ordering.startsWith('-') ? ordering.slice(1) : ordering;
      const direction = ordering.startsWith('-') ? -1 : 1;
      sort[field] = direction;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(page_size);
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(page_size));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      results: products,
      count: total,
      next: skip + products.length < total ? `?page=${parseInt(page) + 1}` : null,
      previous: page > 1 ? `?page=${parseInt(page) - 1}` : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// Create product (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;