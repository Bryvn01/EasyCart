# Admin Dashboard - Enhanced Product Management Integration Guide

## 🎯 Overview

This guide explains how to integrate the enhanced product API features into the admin dashboard.

---

## 📦 Required npm Packages

```bash
cd admin-dashboard
npm install socket.io-client
```

---

## 🔌 Socket.io Integration

### Create Socket Service

Create `admin-dashboard/src/services/socket.js`:

```javascript
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isAdmin = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        if (this.isAdmin) {
          this.joinAdminRoom();
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }
    return this.socket;
  }

  joinAdminRoom() {
    if (this.socket) {
      this.socket.emit('joinAdmin');
      this.isAdmin = true;
      console.log('Joined admin room');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isAdmin = false;
    }
  }

  onProductStockUpdate(callback) {
    if (this.socket) {
      this.socket.on('productStockUpdate', callback);
    }
  }

  onLowStockAlert(callback) {
    if (this.socket) {
      this.socket.on('lowStockAlert', callback);
    }
  }

  onProductPriceUpdate(callback) {
    if (this.socket) {
      this.socket.on('productPriceUpdate', callback);
    }
  }

  onProductUpdate(callback) {
    if (this.socket) {
      this.socket.on('productUpdate', callback);
    }
  }

  onInventoryAlert(callback) {
    if (this.socket) {
      this.socket.on('inventoryAlert', callback);
    }
  }
}

export default new SocketService();
```

### Use Socket in App.js

```javascript
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import socketService from './services/socket';
import toast from 'react-hot-toast';

function App() {
  useEffect(() => {
    // Connect socket when user is authenticated
    const token = localStorage.getItem('admin_token');
    if (token) {
      const socket = socketService.connect();
      socketService.joinAdminRoom();

      // Listen for low stock alerts
      socketService.onLowStockAlert((data) => {
        toast.error(
          `Low Stock Alert: ${data.productName} - Only ${data.stock} left!`,
          { duration: 5000 }
        );
      });

      // Listen for inventory alerts
      socketService.onInventoryAlert((data) => {
        toast.warning(data.message || 'Inventory Alert', { duration: 4000 });
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <Router>
      {/* Your app routes */}
    </Router>
  );
}

export default App;
```

---

## 🖼️ Enhanced Product Form Fields

### Add New Form State

Update your `formData` state in `Products.js`:

```javascript
const [formData, setFormData] = useState({
  // Basic fields (existing)
  name: '',
  description: '',
  category: '',
  brand: '',

  // Pricing (enhanced)
  price: '',
  comparePrice: '',
  costPerItem: '',

  // Inventory (enhanced)
  stock: '',
  sku: '',
  manageStock: true,
  lowStockThreshold: 10,

  // Images (enhanced - now array)
  images: [],

  // SEO (new)
  metaTitle: '',
  metaDescription: '',

  // Variants (new)
  variants: [],

  // Additional (new)
  weight: '',
  dimensions: '',
  tags: [],

  // Status
  isActive: true,
  isFeatured: false
});
```

### Multi-Image Upload Component

Add this to your product form:

```javascript
// State for multiple images
const [imageFiles, setImageFiles] = useState([]);
const [imagePreviews, setImagePreviews] = useState([]);

// Handle multiple image selection
const handleMultipleImageUpload = async (e) => {
  const files = Array.from(e.target.files);

  if (files.length > 5) {
    toast.error('Maximum 5 images allowed');
    return;
  }

  // Create previews
  const previews = await Promise.all(
    files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    })
  );

  setImageFiles(files);
  setImagePreviews(previews);
};

// Upload images when form is submitted
const uploadImages = async () => {
  if (imageFiles.length === 0) return [];

  setUploading(true);
  try {
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    const response = await adminAPI.uploadImages(formData);
    return response.data.images;
  } catch (error) {
    toast.error('Failed to upload images');
    return [];
  } finally {
    setUploading(false);
  }
};

// JSX for image upload in form
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Product Images (Max 5)
  </label>

  {/* Image Previews */}
  {imagePreviews.length > 0 && (
    <div className="grid grid-cols-5 gap-2 mb-3">
      {imagePreviews.map((preview, index) => (
        <div key={index} className="relative">
          <img
            src={preview}
            alt={`Preview ${index + 1}`}
            className="h-20 w-20 object-cover rounded border"
          />
          <button
            type="button"
            onClick={() => {
              setImageFiles(prev => prev.filter((_, i) => i !== index));
              setImagePreviews(prev => prev.filter((_, i) => i !== index));
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
          {index === 0 && (
            <span className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs px-1 rounded">
              Primary
            </span>
          )}
        </div>
      ))}
    </div>
  )}

  {/* File Input */}
  <input
    type="file"
    multiple
    accept="image/jpeg,image/png,image/webp"
    onChange={handleMultipleImageUpload}
    className="w-full"
    disabled={uploading}
  />
  <p className="text-xs text-gray-500 mt-1">
    Upload up to 5 images. First image will be the primary image.
  </p>
</div>
```

### Enhanced Form Fields JSX

Add these fields to your product form:

```javascript
{/* SKU */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    SKU (Optional - Auto-generated if empty)
  </label>
  <input
    type="text"
    className="w-full border border-gray-300 rounded-md px-3 py-2"
    value={formData.sku}
    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
    placeholder="PRD-12345"
  />
</div>

{/* Compare Price */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Compare at Price (Original Price)
  </label>
  <input
    type="number"
    step="0.01"
    min="0"
    className="w-full border border-gray-300 rounded-md px-3 py-2"
    value={formData.comparePrice}
    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
    placeholder="399.99"
  />
  <p className="text-xs text-gray-500 mt-1">
    Shows discount if higher than current price
  </p>
</div>

{/* Low Stock Threshold */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Low Stock Threshold
  </label>
  <input
    type="number"
    min="0"
    className="w-full border border-gray-300 rounded-md px-3 py-2"
    value={formData.lowStockThreshold}
    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
    placeholder="10"
  />
  <p className="text-xs text-gray-500 mt-1">
    Get alerts when stock falls below this number
  </p>
</div>

{/* Tags */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Tags (comma-separated)
  </label>
  <input
    type="text"
    className="w-full border border-gray-300 rounded-md px-3 py-2"
    value={formData.tags.join(', ')}
    onChange={(e) => setFormData({
      ...formData,
      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
    })}
    placeholder="electronics, gadgets, new-arrival"
  />
</div>

{/* SEO Meta Title */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    SEO Meta Title
  </label>
  <input
    type="text"
    className="w-full border border-gray-300 rounded-md px-3 py-2"
    value={formData.metaTitle}
    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
    placeholder="Will use product name if empty"
  />
</div>

{/* SEO Meta Description */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    SEO Meta Description
  </label>
  <textarea
    rows="2"
    className="w-full border border-gray-300 rounded-md px-3 py-2"
    value={formData.metaDescription}
    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
    placeholder="SEO description for search engines..."
  />
</div>

{/* Featured Status */}
<div className="flex items-center">
  <input
    type="checkbox"
    id="isFeatured"
    checked={formData.isFeatured}
    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
    className="h-4 w-4 text-blue-600 rounded"
  />
  <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
    Featured Product
  </label>
</div>
```

### Update Form Submit Handler

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setUploading(true);

  try {
    // Upload images first
    const uploadedImages = await uploadImages();

    // Prepare product data
    const productData = {
      ...formData,
      images: uploadedImages.length > 0 ? uploadedImages : formData.images,
      // Ensure backward compatibility with single image field
      image: uploadedImages.length > 0 ? uploadedImages[0].url : formData.image
    };

    if (editingProduct) {
      await adminAPI.updateProduct(editingProduct._id || editingProduct.id, productData);
      toast.success('Product updated successfully');
    } else {
      await adminAPI.createProduct(productData);
      toast.success('Product created successfully');
    }

    closeModal();
    fetchProducts();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to save product');
  } finally {
    setUploading(false);
  }
};
```

---

## 📊 Inventory Dashboard Widget

Create a new component `InventoryAlerts.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { AlertTriangle, Package } from 'lucide-react';

const InventoryAlerts = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryStatus();

    // Refresh every 5 minutes
    const interval = setInterval(fetchInventoryStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchInventoryStatus = async () => {
    try {
      const [lowStock, outOfStock] = await Promise.all([
        adminAPI.getLowStockProducts(),
        adminAPI.getOutOfStockProducts()
      ]);

      setLowStockProducts(lowStock.data.data || []);
      setOutOfStockProducts(outOfStock.data.data || []);
    } catch (error) {
      console.error('Failed to fetch inventory status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading inventory alerts...</div>;

  return (
    <div className="space-y-4">
      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-800">
              Low Stock Alert ({lowStockProducts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {lowStockProducts.slice(0, 5).map(product => (
              <div key={product._id} className="flex justify-between text-sm">
                <span className="text-gray-700">{product.name}</span>
                <span className="text-yellow-600 font-medium">
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Out of Stock Alert */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Package className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-800">
              Out of Stock ({outOfStockProducts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {outOfStockProducts.slice(0, 5).map(product => (
              <div key={product._id} className="text-sm text-gray-700">
                {product.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800">All products are well-stocked! 🎉</p>
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
```

---

## 🔍 Enhanced Search & Filter

Update your product list page with enhanced filtering:

```javascript
const [filters, setFilters] = useState({
  search: '',
  category: '',
  brand: '',
  minPrice: '',
  maxPrice: '',
  minRating: '',
  inStock: '',
  isFeatured: ''
});

const fetchProducts = async () => {
  const params = {
    page: currentPage,
    limit: itemsPerPage,
    ...filters
  };

  // Remove empty filters
  Object.keys(params).forEach(key => {
    if (params[key] === '') delete params[key];
  });

  const response = await adminAPI.getProducts(params);
  // Handle response...
};

// JSX for filters
<div className="grid grid-cols-4 gap-4 mb-4">
  <input
    type="text"
    placeholder="Search products..."
    value={filters.search}
    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
    className="border rounded px-3 py-2"
  />

  <select
    value={filters.category}
    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
    className="border rounded px-3 py-2"
  >
    <option value="">All Categories</option>
    {categories.map(cat => (
      <option key={cat.id} value={cat.name}>{cat.name}</option>
    ))}
  </select>

  <select
    value={filters.inStock}
    onChange={(e) => setFilters({ ...filters, inStock: e.target.value })}
    className="border rounded px-3 py-2"
  >
    <option value="">All Stock Status</option>
    <option value="true">In Stock</option>
    <option value="false">Out of Stock</option>
  </select>

  <button
    onClick={() => setFilters({
      search: '', category: '', brand: '', minPrice: '',
      maxPrice: '', minRating: '', inStock: '', isFeatured: ''
    })}
    className="border rounded px-3 py-2 bg-gray-100 hover:bg-gray-200"
  >
    Clear Filters
  </button>
</div>
```

---

## 🚀 Quick Start Checklist

- [ ] Install `socket.io-client` package
- [ ] Create socket service file
- [ ] Integrate socket in App.js
- [ ] Update API service with new endpoints
- [ ] Add multi-image upload state and handlers
- [ ] Add new form fields (SKU, SEO, variants, etc.)
- [ ] Update form submit handler
- [ ] Create InventoryAlerts component
- [ ] Add to dashboard
- [ ] Enhance search/filter UI
- [ ] Test all features

---

## 🎨 UI/UX Improvements

### Product Card Enhancement

Show discount percentage and stock status:

```javascript
<div className="bg-white rounded-lg shadow p-4">
  {/* Product Image */}
  <img src={product.images?.[0]?.url || product.image} alt={product.name} />

  {/* Badges */}
  <div className="flex gap-2 mt-2">
    {product.discountPercentage > 0 && (
      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
        {product.discountPercentage}% OFF
      </span>
    )}
    {product.isFeatured && (
      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
        Featured
      </span>
    )}
    {product.isLowStock && (
      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
        Low Stock
      </span>
    )}
    {!product.inStock && (
      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
        Out of Stock
      </span>
    )}
  </div>

  {/* Product Details */}
  <h3 className="font-semibold mt-2">{product.name}</h3>

  {/* Pricing */}
  <div className="flex items-center gap-2 mt-1">
    <span className="text-lg font-bold text-blue-600">
      KES {product.price}
    </span>
    {product.comparePrice && product.comparePrice > product.price && (
      <span className="text-sm text-gray-500 line-through">
        KES {product.comparePrice}
      </span>
    )}
  </div>

  {/* Stock */}
  <div className="text-sm text-gray-600 mt-1">
    Stock: {product.stock} units
  </div>
</div>
```

---

For complete implementation examples, see the enhanced API documentation in `ENHANCED_PRODUCT_API_GUIDE.md`.
