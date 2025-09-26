const express = require('express');
const router = express.Router();

// Simple orders API (mock data for testing)
let orders = [
  {
    _id: '1',
    orderNumber: 'ORD-001',
    totalAmount: 45000,
    status: 'pending',
    createdAt: new Date(),
    user: { _id: '1', name: 'John Doe', email: 'john@example.com' },
    items: [
      { product: { name: 'iPhone 14 Pro', price: 45000 }, quantity: 1 }
    ]
  },
  {
    _id: '2',
    orderNumber: 'ORD-002',
    totalAmount: 25000,
    status: 'completed',
    createdAt: new Date(),
    user: { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    items: [
      { product: { name: 'Nike Air Max', price: 8500 }, quantity: 3 }
    ]
  }
];

// Get all orders
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    
    let filteredOrders = orders;
    
    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    res.json({
      results: paginatedOrders,
      count: filteredOrders.length,
      next: endIndex < filteredOrders.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      pages: Math.ceil(filteredOrders.length / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', (req, res) => {
  try {
    const order = orders.find(o => o._id === req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.patch('/:id', (req, res) => {
  try {
    const { status } = req.body;
    const orderIndex = orders.findIndex(o => o._id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (status) {
      orders[orderIndex].status = status;
    }
    
    res.json(orders[orderIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;