const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/brands', productController.getBrands);
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