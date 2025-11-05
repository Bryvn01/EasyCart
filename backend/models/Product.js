const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true, trim: true },

  // SKU & Inventory Management
  sku: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  stock: { type: Number, required: true, default: 0, min: 0 },
  manageStock: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 10, min: 0 },

  // Pricing
  price: { type: Number, required: true, min: 0, index: true },
  comparePrice: { type: Number, min: 0 },
  costPerItem: { type: Number, min: 0 },

  // Categories & Classification
  category: { type: String, required: true, trim: true, index: true },
  brand: { type: String, required: true, trim: true, index: true },
  tags: { type: [String], default: [], index: true },

  // Images (Enhanced: Array of image objects)
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],
  // Legacy single image field (for backward compatibility)
  image: { type: String },

  // Product Variants
  variants: [{
    name: { type: String, required: true }, // e.g., "Size", "Color"
    options: [{ type: String }] // e.g., ["Small", "Medium", "Large"]
  }],

  // SEO Fields
  slug: { type: String, unique: true, sparse: true, index: true },
  metaTitle: { type: String, trim: true },
  metaDescription: { type: String, trim: true },

  // Additional Details
  weight: { type: String, trim: true },
  dimensions: { type: String, trim: true },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },

  // Status
  isActive: { type: Boolean, default: true, index: true },
  isFeatured: { type: Boolean, default: false, index: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: Check if product is in stock
productSchema.virtual('inStock').get(function() {
  if (!this.manageStock) return true;
  return this.stock > 0;
});

// Virtual: Calculate discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

// Virtual: Check if stock is low
productSchema.virtual('isLowStock').get(function() {
  if (!this.manageStock) return false;
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

// Pre-save middleware: Generate slug from name
productSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Generate SKU if not provided
  if (!this.sku) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.sku = `PRD-${timestamp}-${random}`.toUpperCase();
  }

  // Ensure at least one image is marked as primary
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }

  // Sync legacy image field with primary image
  if (this.images && this.images.length > 0) {
    const primaryImage = this.images.find(img => img.isPrimary) || this.images[0];
    this.image = primaryImage.url;
  }

  next();
});

// Indexes for better search and filter performance
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ slug: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Product', productSchema);
