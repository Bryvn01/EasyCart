const express = require('express');
const router = express.Router();


const Product = require('../models/Product');

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

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, price, stock, category, description, image, brand, weight } = req.body;
    if (!name || !price || !category || !brand || !image) {
      return res.status(400).json({ message: 'Name, price, category, brand, and image are required' });
    }
    const product = new Product({
      name,
      price,
      stock: stock || 0,
      category,
      description: description || '',
      image,
      brand,
      weight
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.category = category || product.category;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.weight = weight || product.weight;
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