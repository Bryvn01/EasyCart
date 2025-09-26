const express = require('express');
const router = express.Router();

// Simple admin dashboard stats (mock data for testing)
router.get('/dashboard', (req, res) => {
  try {
    // Mock dashboard data
    res.json({
      stats: {
        totalUsers: 45,
        totalProducts: 25,
        totalOrders: 123,
        pendingOrders: 8,
        totalRevenue: 2450000
      },
      recentOrders: [
        {
          _id: '1',
          orderNumber: 'ORD-001',
          totalAmount: 45000,
          status: 'pending',
          createdAt: new Date(),
          user: { name: 'John Doe', email: 'john@example.com' }
        },
        {
          _id: '2',
          orderNumber: 'ORD-002',
          totalAmount: 25000,
          status: 'completed',
          createdAt: new Date(),
          user: { name: 'Jane Smith', email: 'jane@example.com' }
        }
      ],
      monthlySales: [
        { _id: { year: 2025, month: 1 }, totalSales: 450000, orderCount: 25 },
        { _id: { year: 2025, month: 2 }, totalSales: 380000, orderCount: 22 },
        { _id: { year: 2025, month: 3 }, totalSales: 520000, orderCount: 28 }
      ],
      topProducts: [
        { name: 'iPhone 14 Pro', totalSold: 15, totalRevenue: 1800000 },
        { name: 'Nike Air Max', totalSold: 25, totalRevenue: 212500 }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;