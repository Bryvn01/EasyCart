const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

const router = express.Router();

const categories = [
  { name: 'Electronics' },
  { name: 'Fashion' },
  { name: 'Home & Living' },
  { name: 'Food & Beverages' },
  { name: 'Health & Beauty' },
  { name: 'Sports & Fitness' },
  { name: 'Groceries' }
];

const products = [
  {
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
    name: "Fresh Sukuma Wiki - 1 Bunch",
    price: 20,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
    category: "Groceries",
    description: "Fresh collard greens, locally grown, rich in vitamins and minerals",
    stock: 150,
    rating: 4.7,
    brand: "Local Farm",
    weight: "250g"
  },
  {
    name: "Brookside Milk - 500ml",
    price: 60,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    category: "Groceries",
    description: "Fresh pasteurized whole milk, rich in calcium and protein",
    stock: 80,
    rating: 4.6,
    brand: "Brookside",
    weight: "500ml"
  }
];

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