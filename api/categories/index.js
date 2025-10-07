// Vercel Serverless Function: Categories
// Endpoint: /api/categories (GET all, POST create)

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
  { _id: '0', id: '0', name: 'Staples', description: 'Essential Kenyan food staples and basics', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80', isActive: true },
  { _id: '1', id: '1', name: 'Electronics', description: 'Electronic devices and gadgets', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80', isActive: true },
  { _id: '2', id: '2', name: 'Fashion', description: 'Clothing and accessories', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80', isActive: true },
  { _id: '3', id: '3', name: 'Home & Living', description: 'Home decor and furniture', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80', isActive: true },
  { _id: '4', id: '4', name: 'Food & Beverages', description: 'Food items and drinks', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80', isActive: true },
  { _id: '5', id: '5', name: 'Health & Beauty', description: 'Health and beauty products', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80', isActive: true },
  { _id: '6', id: '6', name: 'Sports & Fitness', description: 'Sports equipment and fitness gear', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80', isActive: true },
  { _id: '7', id: '7', name: 'Groceries', description: 'Daily grocery items', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80', isActive: true },
  { _id: '8', id: '8', name: 'Beverages', description: 'Drinks and beverages', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80', isActive: true },
  { _id: '9', id: '9', name: 'Household', description: 'Household cleaning and maintenance', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', isActive: true },
  { _id: '10', id: '10', name: 'Personal Care', description: 'Personal hygiene and care products', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80', isActive: true }
];

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  try {
    // Connect to database
    await connectToDatabase();

    if (req.method === 'GET') {
      return await getAllCategories(req, res);
    } else if (req.method === 'POST') {
      return await createCategory(req, res);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Categories endpoint error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get all categories
 */
async function getAllCategories(req, res) {
  try {
    const Category = getCategoryModel();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.json(categories);
  } catch (error) {
    console.warn('MongoDB not available, using fallback categories');
    return res.json(fallbackCategories);
  }
}

/**
 * Create new category
 */
async function createCategory(req, res) {
  try {
    const Category = getCategoryModel();
    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    const newCategory = new Category({
      name: name.trim(),
      description: description?.trim() || ''
    });
    
    await newCategory.save();
    return res.status(201).json(newCategory);
  } catch (error) {
    console.warn('MongoDB not available, creating demo category');
    // Fallback for demo mode
    const newCategory = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      name: req.body.name?.trim() || '',
      description: req.body.description?.trim() || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return res.status(201).json(newCategory);
  }
}
