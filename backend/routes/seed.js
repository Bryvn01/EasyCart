const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const categories = require('../data/categories');
const products = require('../data/products');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    await Category.insertMany(categories);
    await Product.insertMany(products);
    
    // Create admin user
    await User.deleteOne({ email: 'admin@easycart.com' });
    const admin = new User({
      email: 'admin@easycart.com',
      password: 'admin123',
      name: 'Admin User',
      username: 'admin',
      role: 'admin',
      is_admin: true
    });
    await admin.save();
    
    // Create test user
    await User.deleteOne({ email: 'test@easycart.com' });
    const testUser = new User({
      email: 'test@easycart.com',
      password: 'test123',
      name: 'Test User',
      username: 'testuser'
    });
    await testUser.save();
    
    res.json({ message: 'Database seeded successfully', products: products.length, categories: categories.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;