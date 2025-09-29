const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
  weight: { type: String, trim: true },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  isActive: { type: Boolean, default: true },
  tags: { type: [String], default: [] },
}, { timestamps: true });

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);