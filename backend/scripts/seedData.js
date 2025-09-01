const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
require('dotenv').config();

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
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await Category.insertMany(categories);
    await Product.insertMany(products);
    
    const adminExists = await User.findOne({ email: 'admin@easycart.com' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@easycart.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin created: admin@easycart.com / admin123');
    }
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();