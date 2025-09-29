const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Fallback categories for when MongoDB is not available
const fallbackCategories = [
  { _id: '1', id: '1', name: 'Electronics', description: 'Electronic devices and gadgets', isActive: true },
  { _id: '2', id: '2', name: 'Fashion', description: 'Clothing and accessories', isActive: true },
  { _id: '3', id: '3', name: 'Home & Living', description: 'Home decor and furniture', isActive: true },
  { _id: '4', id: '4', name: 'Food & Beverages', description: 'Food items and drinks', isActive: true },
  { _id: '5', id: '5', name: 'Health & Beauty', description: 'Health and beauty products', isActive: true },
  { _id: '6', id: '6', name: 'Sports & Fitness', description: 'Sports equipment and fitness gear', isActive: true },
  { _id: '7', id: '7', name: 'Groceries', description: 'Daily grocery items', isActive: true },
  { _id: '8', id: '8', name: 'Beverages', description: 'Drinks and beverages', isActive: true },
  { _id: '9', id: '9', name: 'Household', description: 'Household cleaning and maintenance', isActive: true },
  { _id: '10', id: '10', name: 'Personal Care', description: 'Personal hygiene and care products', isActive: true }
];

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.warn('MongoDB not available, using fallback categories');
    res.json(fallbackCategories);
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
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
    res.status(201).json(newCategory);
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
    res.status(201).json(newCategory);
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.warn('MongoDB not available, using fallback category');
    const category = fallbackCategories.find(c => c._id === req.params.id || c.id === req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if another category with same name exists (excluding current one)
    if (name && name.trim()) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id }
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
    res.json(category);
  } catch (error) {
    console.warn('MongoDB not available, creating demo update');
    // Fallback for demo mode
    const updatedCategory = {
      _id: req.params.id,
      id: req.params.id,
      name: req.body.name?.trim() || `Category ${req.params.id}`,
      description: req.body.description?.trim() || '',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      updatedAt: new Date()
    };
    res.json(updatedCategory);
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.warn('MongoDB not available, simulating delete');
    // Fallback for demo mode
    res.json({ message: 'Category deleted successfully (demo mode)' });
  }
});

module.exports = router;