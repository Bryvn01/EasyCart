const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { adminAuth } = require('../middleware/auth');
const Category = require('../models/Category');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: { results: categories } });
  } catch (error) {
    console.warn('MongoDB not available, using fallback categories');
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
    res.json({ success: true, data: { results: fallbackCategories } });
  }
});
router.get('/inventory/low-stock', productController.getLowStockProducts);
router.get('/inventory/out-of-stock', productController.getOutOfStockProducts);
router.get('/:id', productController.getProductById);

// Protected routes (admin only)
router.post('/', adminAuth, productController.createProduct);
router.put('/:id', adminAuth, productController.updateProduct);
router.delete('/:id', adminAuth, productController.deleteProduct);
router.patch('/:id/stock', adminAuth, productController.updateStock);
router.patch('/bulk', adminAuth, productController.bulkUpdateProducts);

module.exports = router;