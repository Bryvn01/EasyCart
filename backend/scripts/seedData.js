const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany();
    await Category.deleteMany();

    // Insert categories
    const categories = await Category.insertMany([
      { name: 'Electronics', description: 'Latest gadgets and devices' },
      { name: 'Clothing', description: 'Fashion and apparel' },
      { name: 'Home & Garden', description: 'Home improvement and decor' },
      { name: 'Food & Beverages', description: 'Food and drinks' },
      { name: 'Health & Beauty', description: 'Health and beauty products' },
      { name: 'Sports & Fitness', description: 'Sports and fitness equipment' },
      { name: 'Groceries', description: 'Fresh groceries and essentials' }
    ]);

    // Insert products with real category references  
    await Product.insertMany([
      {
        name: 'Wireless Bluetooth Headphones',
        price: 79.99,
        category: 'Electronics',
        description: 'High-quality noise canceling headphones',
        image: '/images/headphones.jpg',
        stock: 25,
        brand: 'JBL',
        rating: 4.5
      },
      {
        name: 'Cotton T-Shirt',
        price: 19.99,
        category: 'Clothing',
        description: 'Comfortable everyday t-shirt',
        image: '/images/tshirt.jpg',
        stock: 100,
        brand: 'Generic',
        rating: 4.2
      },
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
      }
    ]);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();