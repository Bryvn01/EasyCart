// Vercel Serverless Function: Seed Database
// Endpoint: /api/seed

const mongoose = require('mongoose');
const { connectToDatabase } = require('./_utils/mongodb');
const { setCorsHeaders } = require('./_utils/cors');

// Import models
const getProductModel = () => {
  try {
    return mongoose.model('Product');
  } catch (error) {
    return require('../backend/models/Product');
  }
};

const getCategoryModel = () => {
  try {
    return mongoose.model('Category');
  } catch (error) {
    return require('../backend/models/Category');
  }
};

const getUserModel = () => {
  try {
    return mongoose.model('User');
  } catch (error) {
    return require('../backend/models/User');
  }
};

const categories = [
  { name: 'Staples', description: 'Essential Kenyan food staples and basics' },
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Fashion', description: 'Clothing and accessories' },
  { name: 'Home & Living', description: 'Home decor and furniture' },
  { name: 'Food & Beverages', description: 'Food items and drinks' },
  { name: 'Health & Beauty', description: 'Health and beauty products' },
  { name: 'Sports & Fitness', description: 'Sports equipment and fitness gear' },
  { name: 'Groceries', description: 'Daily grocery items' },
  { name: 'Beverages', description: 'Drinks and beverages' },
  { name: 'Household', description: 'Household cleaning and maintenance' },
  { name: 'Personal Care', description: 'Personal hygiene and care products' }
];

const products = [
  // Groceries
  {
    name: "Ajab All Purpose Flour 2kg",
    brand: "Ajab",
    category: "Groceries",
    price: 320,
    description: "Ajab All Purpose Flour 2kg - perfect for chapati, mandazi, and baking. Soft, high quality, and trusted by Kenyan families.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/13/287123/1.jpg?0732",
    stock: 100,
    tags: ["Top Seller", "Flash Sale"]
  },
  {
    name: "Mumias Sugar 1kg",
    brand: "Mumias",
    category: "Groceries",
    price: 220,
    description: "Mumias Sugar 1kg - Kenya's favorite sugar for tea and baking. Pure, sweet, and locally produced.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/41/287123/1.jpg?0732",
    stock: 120,
    tags: ["Top Seller"]
  },
  {
    name: "Fresh Fri Cooking Oil 3L",
    brand: "Fresh Fri",
    category: "Groceries",
    price: 950,
    description: "Fresh Fri Pure Cooking Oil 3L - cholesterol free, ideal for deep frying and cooking.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/77/287123/1.jpg?0732",
    stock: 60,
    tags: ["Flash Sale"]
  },
  // Electronics
  {
    name: "Bruhm 32\" Digital TV",
    brand: "Bruhm",
    category: "Electronics",
    price: 14500,
    description: "Bruhm 32-inch Digital TV - HD Ready, USB, HDMI, energy saving.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/30/287123/1.jpg?0732",
    stock: 20,
    tags: ["Top Seller", "Flash Sale"]
  },
  // Personal Care
  {
    name: "Geisha Bar Soap 125g",
    brand: "Geisha",
    category: "Personal Care",
    price: 70,
    description: "Geisha Bar Soap 125g - gentle on skin, long-lasting fragrance.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/26/287123/1.jpg?0732",
    stock: 100,
    tags: ["Top Seller"]
  }
];

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();

    const Product = getProductModel();
    const Category = getCategoryModel();
    const User = getUserModel();

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
    
    return res.json({ 
      message: 'Database seeded successfully', 
      products: products.length, 
      categories: categories.length 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ message: error.message });
  }
};
