const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get all orders (admin) or user's orders
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    
    let query = {};
    
    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }
    
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalCount = await Order.countDocuments(query);
    
    res.json({
      results: orders,
      count: totalCount,
      next: skip + limit < totalCount ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      pages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }
    
    const order = await Order.findOne(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price image brand');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    // Validate items and calculate total
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    const order = new Order({
      user: req.user._id,
      items: validatedItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash',
      notes
    });
    
    const savedOrder = await order.save();
    await savedOrder.populate('items.product', 'name price image');
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { status, deliveryDate, notes } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (deliveryDate) updateData.deliveryDate = deliveryDate;
    if (notes !== undefined) updateData.notes = notes;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email').populate('items.product', 'name price image');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;