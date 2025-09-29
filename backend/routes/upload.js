const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.memoryStorage(); // Store in memory for simplicity
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Upload image endpoint
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // In a real production environment, you would:
    // 1. Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Get the public URL
    // 3. Return that URL
    
    // For demo purposes, we'll convert to base64 data URL
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    res.json({ 
      url: base64Image,
      file_url: base64Image,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    }
  }
  res.status(400).json({ message: error.message });
});

module.exports = router;