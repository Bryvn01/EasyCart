// Vercel Serverless Function: Get Product Categories
// Endpoint: /api/products/categories

const mongoose = require('mongoose');
const { connectToDatabase } = require('../_utils/mongodb');
const { setCorsHeaders } = require('../_utils/cors');

// Import Category model
const getCategoryModel = () => {
  try {
    return mongoose.model('Category');
  } catch (error) {
    return require('../../backend/models/Category');
  }
};

// Fallback categories
const fallbackCategories = [
  { _id: '0', id: '0', name: 'Staples', description: 'Essential Kenyan food staples and basics' },
  { _id: '1', id: '1', name: 'Electronics', description: 'Electronic devices and gadgets' },
  { _id: '2', id: '2', name: 'Fashion', description: 'Clothing and accessories' },
  { _id: '3', id: '3', name: 'Home & Living', description: 'Home decor and furniture' },
  { _id: '4', id: '4', name: 'Food & Beverages', description: 'Food items and drinks' },
  { _id: '5', id: '5', name: 'Health & Beauty', description: 'Health and beauty products' },
  { _id: '6', id: '6', name: 'Sports & Fitness', description: 'Sports equipment and fitness gear' },
  { _id: '7', id: '7', name: 'Groceries', description: 'Daily grocery items' },
  { _id: '8', id: '8', name: 'Beverages', description: 'Drinks and beverages' },
  { _id: '9', id: '9', name: 'Household', description: 'Household cleaning and maintenance' },
  { _id: '10', id: '10', name: 'Personal Care', description: 'Personal hygiene and care products' }
];

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();
    const Category = getCategoryModel();

    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    return res.status(200).json({ 
      success: true, 
      data: { results: categories } 
    });
  } catch (error) {
    console.warn('MongoDB not available, using fallback categories');
    return res.status(200).json({ 
      success: true, 
      data: { results: fallbackCategories } 
    });
  }
};
