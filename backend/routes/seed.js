const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

const router = express.Router();

const categories = [
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Fashion', description: 'Clothing and accessories' },
  { name: 'Home & Living', description: 'Home decor and furniture' },
  { name: 'Food & Beverages', description: 'Food items and drinks' },
  { name: 'Health & Beauty', description: 'Health and beauty products' },
  { name: 'Sports & Fitness', description: 'Sports equipment and fitness gear' },
  { name: 'Groceries', description: 'Daily grocery items' }
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
    name: "Sony WH-1000XM4 Headphones",
    price: 18000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: "Electronics",
    description: "Industry-leading noise canceling wireless headphones",
    stock: 30,
    rating: 4.7,
    brand: "Sony"
  },
  {
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
    name: "Nike Air Max Sneakers",
    price: 8500,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    category: "Fashion",
    description: "Comfortable running shoes with Air Max technology",
    stock: 50,
    rating: 4.6,
    brand: "Nike"
  },
  {
    name: "Elegant Handbag",
    price: 3500,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    category: "Fashion",
    description: "Stylish leather handbag, perfect for any occasion",
    stock: 25,
    rating: 4.4,
    brand: "Fashion Accessories"
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
  },
  {
    name: "Organic Bananas - 1kg",
    price: 120,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
    category: "Groceries",
    description: "Fresh organic bananas, perfect for snacking or smoothies",
    stock: 200,
    rating: 4.5,
    brand: "Organic Farm",
    weight: "1kg"
  },
  {
    name: "Bread - Whole Wheat",
    price: 85,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    category: "Groceries",
    description: "Fresh whole wheat bread, baked daily",
    stock: 40,
    rating: 4.4,
    brand: "Local Bakery",
    weight: "400g"
  },
  {
    name: "Coffee Table",
    price: 12000,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    category: "Home & Living",
    description: "Modern wooden coffee table, perfect for any living room",
    stock: 8,
    rating: 4.6,
    brand: "Home Furniture"
  },
  {
    name: "Decorative Cushions Set",
    price: 2800,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    category: "Home & Living",
    description: "Set of 4 decorative cushions, multiple colors available",
    stock: 20,
    rating: 4.3,
    brand: "Home Decor"
  },
  {
    name: "Vitamin C Tablets",
    price: 800,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400",
    category: "Health & Beauty",
    description: "High-quality Vitamin C supplements, 60 tablets",
    stock: 100,
    rating: 4.5,
    brand: "HealthPlus"
  },
  {
    name: "Face Moisturizer",
    price: 1500,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
    category: "Health & Beauty",
    description: "Hydrating face moisturizer with SPF protection",
    stock: 60,
    rating: 4.4,
    brand: "BeautyGlow"
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