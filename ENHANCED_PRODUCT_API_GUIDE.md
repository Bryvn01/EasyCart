# EasyCart Enhanced Product API Documentation

## 🚀 Overview

The EasyCart backend has been significantly enhanced with advanced product management features, including:

- **Enhanced Product Model** with SKU, variants, SEO fields, and multi-image support
- **Advanced Product Controller** with filtering, search, pagination, and inventory management
- **Image Management System** with Cloudinary integration and Sharp optimization
- **Real-Time Updates** via Socket.io for inventory and price changes
- **RBAC** for admin endpoints

---

## 📋 API Endpoints

### Product Endpoints

#### Get All Products (Public)
```http
GET /api/products
```

**Query Parameters:**
- `search` - Search across name, description, brand, SKU, tags
- `category` - Filter by category
- `brand` - Filter by brand
- `min_price` - Minimum price
- `max_price` - Maximum price
- `rating` - Minimum rating
- `tags` - Comma-separated tags
- `isActive` - Filter by active status (true/false)
- `isFeatured` - Filter by featured status (true/false)
- `inStock` - Filter by stock availability (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort` - Sort field (default: -createdAt)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Products retrieved successfully",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Get Single Product (Public)
```http
GET /api/products/:id
```
- Supports both MongoDB ID and slug

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 299.99,
  "comparePrice": 399.99,
  "costPerItem": 150.00,
  "category": "Electronics",
  "brand": "BrandName",
  "sku": "PRD-12345",
  "stock": 100,
  "manageStock": true,
  "lowStockThreshold": 10,
  "images": [
    {
      "url": "https://cloudinary.com/image1.jpg",
      "alt": "Product image",
      "isPrimary": true
    }
  ],
  "variants": [
    {
      "name": "Size",
      "options": ["Small", "Medium", "Large"]
    }
  ],
  "weight": "1.5kg",
  "dimensions": "30x20x10 cm",
  "tags": ["electronics", "gadgets"],
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "isActive": true,
  "isFeatured": false
}
```

#### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
```
- Same body structure as Create Product

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id?permanent=false
Authorization: Bearer <admin_token>
```
- By default, performs soft delete (sets isActive to false)
- Use `?permanent=true` for permanent deletion

#### Update Stock (Admin Only)
```http
PATCH /api/products/:id/stock
Authorization: Bearer <admin_token>

{
  "stock": 50,
  "operation": "increment" // or "decrement" or omit for direct set
}
```

#### Bulk Update Products (Admin Only)
```http
PATCH /api/products/bulk
Authorization: Bearer <admin_token>

{
  "productIds": ["id1", "id2", "id3"],
  "updateData": {
    "isActive": false,
    "isFeatured": true
  }
}
```

#### Get Low Stock Products (Public)
```http
GET /api/products/inventory/low-stock
```

#### Get Out of Stock Products (Public)
```http
GET /api/products/inventory/out-of-stock
```

---

### Image Upload Endpoints

#### Upload Single Image (Admin Only)
```http
POST /api/upload/image
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- image: <file>
```

**Response:**
```json
{
  "success": true,
  "url": "https://cloudinary.com/optimized-image.webp",
  "publicId": "easycart/products/xyz123",
  "message": "Image uploaded successfully"
}
```

#### Upload Multiple Images (Admin Only)
```http
POST /api/upload/images
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- images: <file1>
- images: <file2>
- images: <file3>
```

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "url": "https://cloudinary.com/image1.webp",
      "publicId": "easycart/products/abc123",
      "alt": "",
      "isPrimary": true
    }
  ],
  "count": 3,
  "message": "3 image(s) uploaded successfully"
}
```

#### Delete Image (Admin Only)
```http
DELETE /api/upload/image/:publicId
Authorization: Bearer <admin_token>
```

---

## 🔄 Real-Time Events (Socket.io)

### Client Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join admin room (for admin users)
socket.emit('joinAdmin');

// Listen for product stock updates
socket.on('productStockUpdate', (data) => {
  console.log('Stock updated:', data);
  // data: { productId, stock, isLowStock, inStock }
});

// Listen for low stock alerts (admin only)
socket.on('lowStockAlert', (data) => {
  console.log('Low stock alert:', data);
  // data: { productId, productName, stock, threshold, timestamp }
});

// Listen for price updates
socket.on('productPriceUpdate', (data) => {
  console.log('Price updated:', data);
  // data: { productId, price, comparePrice, discountPercentage, timestamp }
});

// Listen for product updates
socket.on('productUpdate', (data) => {
  console.log('Product updated:', data);
  // data: { action: 'created'|'updated'|'deleted', product, timestamp }
});

// Listen for inventory alerts (admin only)
socket.on('inventoryAlert', (data) => {
  console.log('Inventory alert:', data);
});
```

---

## 🗄️ Product Model Schema

### Core Fields
- `name` (String, required) - Product name
- `description` (String, required) - Product description
- `slug` (String, unique) - Auto-generated URL-friendly slug
- `sku` (String, unique) - Auto-generated or custom SKU

### Pricing
- `price` (Number, required) - Current price
- `comparePrice` (Number) - Original price for discount display
- `costPerItem` (Number) - Cost per item for profit calculation

### Inventory
- `stock` (Number, required) - Current stock level
- `manageStock` (Boolean) - Whether to track stock
- `lowStockThreshold` (Number) - Threshold for low stock alerts

### Images
- `images` (Array of Objects)
  - `url` (String) - Image URL
  - `alt` (String) - Alt text for accessibility
  - `isPrimary` (Boolean) - Whether this is the primary image
- `image` (String) - Legacy field for backward compatibility

### Classification
- `category` (String, required) - Product category
- `brand` (String, required) - Product brand
- `tags` (Array of Strings) - Search tags

### Variants
- `variants` (Array of Objects)
  - `name` (String) - Variant name (e.g., "Size", "Color")
  - `options` (Array of Strings) - Variant options

### SEO
- `metaTitle` (String) - SEO title
- `metaDescription` (String) - SEO description

### Additional
- `weight` (String) - Product weight
- `dimensions` (String) - Product dimensions
- `rating` (Number) - Product rating
- `reviewCount` (Number) - Number of reviews

### Status
- `isActive` (Boolean) - Whether product is active
- `isFeatured` (Boolean) - Whether product is featured

### Virtual Fields (Computed)
- `inStock` - Whether product is in stock
- `discountPercentage` - Calculated discount percentage
- `isLowStock` - Whether stock is below threshold

---

## 🔧 Environment Configuration

Add these variables to your `.env` file:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/easycart

# JWT
JWT_SECRET=your-secret-key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Port
PORT=5000
```

---

## 🎨 Admin Dashboard Integration

### Example: Fetch Products with Enhanced Filters
```javascript
import { adminAPI } from '../services/api';

const fetchProducts = async () => {
  const response = await adminAPI.getProducts({
    search: 'laptop',
    category: 'Electronics',
    min_price: 500,
    max_price: 2000,
    inStock: 'true',
    page: 1,
    limit: 20
  });
  
  const products = response.data.data;
  const pagination = response.data.pagination;
};
```

### Example: Upload Multiple Images
```javascript
import { adminAPI } from '../services/api';

const uploadProductImages = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  
  const response = await adminAPI.uploadImages(formData);
  const images = response.data.images;
  
  // Use images in product creation/update
  await adminAPI.createProduct({
    name: 'New Product',
    // ... other fields
    images: images
  });
};
```

### Example: Update Stock with Real-Time Notification
```javascript
import { adminAPI } from '../services/api';

const updateProductStock = async (productId, quantity, operation) => {
  const response = await adminAPI.updateStock(productId, quantity, operation);
  
  // Socket.io will automatically broadcast the update to all connected clients
  // Admins will receive a lowStockAlert if stock falls below threshold
};
```

---

## 📊 Migration from Old API

### Response Format Changes
**Old Format:**
```json
{
  "results": [...],
  "count": 100,
  "next": "?page=2",
  "previous": null
}
```

**New Format:**
```json
{
  "success": true,
  "data": [...],
  "message": "Products retrieved successfully",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Backward Compatibility
The API maintains backward compatibility:
- Single `image` field is auto-synced with primary image in `images` array
- Old query parameters still work
- Legacy response format accessible via `response.data.data` or `response.data`

---

## 🧪 Testing

### Manual Testing with cURL

**Get Products:**
```bash
curl -X GET "http://localhost:5000/api/products?search=laptop&category=Electronics&page=1&limit=10"
```

**Create Product (Admin):**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "price": 99.99,
    "category": "Electronics",
    "brand": "TestBrand",
    "stock": 50
  }'
```

**Upload Image (Admin):**
```bash
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

---

## 🔒 Security Features

- **RBAC**: Admin-only endpoints protected with JWT middleware
- **Input Validation**: All inputs validated and sanitized
- **Rate Limiting**: API rate limiting to prevent abuse
- **Image Validation**: File type, size, and dimension validation
- **Unique Constraints**: SKU and slug uniqueness enforced
- **CORS**: Configured for specific frontend origins

---

## 📈 Performance Optimizations

- **Database Indexing**: Comprehensive indexes on commonly queried fields
- **Image Optimization**: Automatic WebP conversion and resizing
- **Pagination**: Efficient pagination with skip/limit
- **Lean Queries**: Use `.lean()` for read-only operations
- **Caching**: Ready for Redis integration

---

## 🆘 Troubleshooting

### Images Not Uploading
1. Check Cloudinary credentials in `.env`
2. Verify file size is under 5MB
3. Ensure file format is JPG, PNG, or WebP
4. Check admin token is valid

### Products Not Appearing
1. Verify MongoDB connection
2. Check `isActive` filter
3. Ensure pagination parameters are correct
4. Check search/filter criteria

### Socket.io Not Connecting
1. Verify FRONTEND_URL in `.env`
2. Check CORS configuration
3. Ensure Socket.io client is properly initialized
4. Check network/firewall settings

---

## 🎓 Best Practices

1. **Always upload images first**, then use URLs in product creation
2. **Use SKU for inventory tracking** instead of just IDs
3. **Set appropriate lowStockThreshold** for each product
4. **Use tags for better searchability**
5. **Fill SEO fields** for better search engine ranking
6. **Use comparePrice** to show discounts
7. **Enable manageStock** for accurate inventory tracking

---

For more information, see the source code in:
- `backend/models/Product.js`
- `backend/controllers/productController.js`
- `backend/utils/imageUpload.js`
- `backend/utils/cloudinary.js`
