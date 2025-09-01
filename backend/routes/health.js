const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EasyCart API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;