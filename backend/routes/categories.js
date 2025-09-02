const express = require('express');
const router = express.Router();

// In-memory categories for now (can be moved to database later)
let categories = [
  { id: 1, name: 'Electronics', description: 'Electronic devices and gadgets' },
  { id: 2, name: 'Fashion', description: 'Clothing and accessories' },
  { id: 3, name: 'Home & Living', description: 'Home decor and furniture' },
  { id: 4, name: 'Food & Beverages', description: 'Food items and drinks' },
  { id: 5, name: 'Health & Beauty', description: 'Health and beauty products' },
  { id: 6, name: 'Sports & Fitness', description: 'Sports equipment and fitness gear' },
  { id: 7, name: 'Groceries', description: 'Daily grocery items' }
];

// Get all categories
router.get('/', (req, res) => {
  res.json(categories);
});

// Create new category
router.post('/', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  const newCategory = {
    id: categories.length + 1,
    name,
    description: description || ''
  };
  
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

// Update category
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  const categoryIndex = categories.findIndex(cat => cat.id === parseInt(id));
  
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  categories[categoryIndex] = {
    ...categories[categoryIndex],
    name: name || categories[categoryIndex].name,
    description: description || categories[categoryIndex].description
  };
  
  res.json(categories[categoryIndex]);
});

// Delete category
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const categoryIndex = categories.findIndex(cat => cat.id === parseInt(id));
  
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  categories.splice(categoryIndex, 1);
  res.json({ message: 'Category deleted successfully' });
});

module.exports = router;