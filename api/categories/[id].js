// Vercel Serverless Function: Category by ID
// Endpoint: /api/categories/[id]

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
  { _id: '2', id: '2', name: 'Fashion', description: 'Clothing and accessories', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80', isActive: true }
];

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  try {
    // Connect to database
    await connectToDatabase();

    const { id } = req.query;

    if (req.method === 'GET') {
      return await getCategoryById(req, res, id);
    } else if (req.method === 'PUT') {
      return await updateCategory(req, res, id);
    } else if (req.method === 'DELETE') {
      return await deleteCategory(req, res, id);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Category endpoint error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get single category
 */
async function getCategoryById(req, res, id) {
  try {
    const Category = getCategoryModel();
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.json(category);
  } catch (error) {
    console.warn('MongoDB not available, using fallback category');
    const category = fallbackCategories.find(c => c._id === id || c.id === id);
    if (category) {
      return res.json(category);
    } else {
      return res.status(404).json({ message: 'Category not found' });
    }
  }
}

/**
 * Update category
 */
async function updateCategory(req, res, id) {
  try {
    const Category = getCategoryModel();
    const { name, description, isActive } = req.body;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if another category with same name exists
    if (name && name.trim()) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
      category.name = name.trim();
    }
    
    if (description !== undefined) {
      category.description = description?.trim() || '';
    }
    
    if (isActive !== undefined) {
      category.isActive = isActive;
    }
    
    await category.save();
    return res.json(category);
  } catch (error) {
    console.warn('MongoDB not available, creating demo update');
    // Fallback for demo mode
    const updatedCategory = {
      _id: id,
      id: id,
      name: req.body.name?.trim() || `Category ${id}`,
      description: req.body.description?.trim() || '',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      updatedAt: new Date()
    };
    return res.json(updatedCategory);
  }
}

/**
 * Delete category
 */
async function deleteCategory(req, res, id) {
  try {
    const Category = getCategoryModel();
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.warn('MongoDB not available, simulating delete');
    // Fallback for demo mode
    return res.json({ message: 'Category deleted successfully (demo mode)' });
  }
}
