const express = require('express');
const router = express.Router();

// Simple users API (mock data for testing)
let users = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    role: 'user',
    phone: '+254700000001',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    username: 'janesmith',
    role: 'user',
    phone: '+254700000002',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: '3',
    name: 'Admin User',
    email: 'admin@easycart.com',
    username: 'admin',
    role: 'admin',
    phone: '+254700000000',
    isActive: true,
    createdAt: new Date()
  }
];

// Get all users
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    
    let filteredUsers = users.filter(u => u.isActive);
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm) ||
        u.username.toLowerCase().includes(searchTerm)
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
      results: paginatedUsers,
      count: filteredUsers.length,
      next: endIndex < filteredUsers.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      pages: Math.ceil(filteredUsers.length / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single user
router.get('/:id', (req, res) => {
  try {
    const user = users.find(u => u._id === req.params.id && u.isActive);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.patch('/:id', (req, res) => {
  try {
    const { name, email, role, phone } = req.body;
    const userIndex = users.findIndex(u => u._id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[userIndex];
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone) user.phone = phone;
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (soft delete)
router.delete('/:id', (req, res) => {
  try {
    const userIndex = users.findIndex(u => u._id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    users[userIndex].isActive = false;
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;