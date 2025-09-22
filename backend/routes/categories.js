const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).select('-__v').sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Fallback to in-memory categories when MongoDB is unavailable
    const fallbackCategories = [
      { _id: "1", name: 'Electronics', description: 'Electronic devices and gadgets' },
      { _id: "2", name: 'Fashion', description: 'Clothing and accessories' },
      { _id: "3", name: 'Home & Living', description: 'Home decor and furniture' },
      { _id: "4", name: 'Food & Beverages', description: 'Food items and drinks' },
      { _id: "5", name: 'Health & Beauty', description: 'Health and beauty products' },
      { _id: "6", name: 'Sports & Fitness', description: 'Sports equipment and fitness gear' },
      { _id: "7", name: 'Groceries', description: 'Daily grocery items' }
    ];
    
    res.json(fallbackCategories);
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const newCategory = new Category({
      name,
      description: description || ''
    });
    
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

module.exports = router;