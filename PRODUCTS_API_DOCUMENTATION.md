# Products API Documentation

## Overview

The Products API provides endpoints for fetching, filtering, and managing product data from MongoDB. The API uses a hybrid response format compatible with both Django REST Framework (DRF) and Express conventions.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://easycart-backend.onrender.com/api`

## Authentication

Most product endpoints are public and do not require authentication. Admin-only endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints


### 0. Add or Update Product Images (File Upload & Image URL)

**The API supports both file uploads and image URLs for product images.**

- To upload an image file, send as `multipart/form-data` with a file field named `image` (or `images` for multiple).
- To use an image URL, send as JSON with an `image_url` or `images` array containing URLs.
- Only one (file or URL) is used per image; if both are provided, file takes precedence.

**Frontend usage:**
- The product edit modal allows users to either upload a file or provide an image URL (not both).
- The frontend automatically chooses the correct API format.

**Example: Add product with image URL (JSON):**
```json
{
  "name": "Sample Product",
  "image_url": "https://example.com/image.jpg"
}
```

**Example: Add product with file upload (multipart/form-data):**
```
image: <file>
name: Sample Product
...
```

Fetch a paginated list of products with optional filtering, searching, and sorting.

**Endpoint**: `GET /api/products`

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 20 | Number of products per page |
| `search` | string | No | - | Search in name, description, brand, tags, and SKU |
| `category` | string | No | - | Filter by category ID |
| `brand` | string | No | - | Filter by brand name |
| `min_price` | number | No | - | Minimum price filter (in KES) |
| `max_price` | number | No | - | Maximum price filter (in KES) |
| `rating` | number | No | - | Minimum rating (0-5) |
| `tags` | string | No | - | Comma-separated tags to filter by |
| `isActive` | boolean | No | - | Filter by active status (true/false) |
| `isFeatured` | boolean | No | - | Filter by featured status (true/false) |
| `inStock` | boolean | No | - | Filter by stock availability (true/false) |
| `sort` | string | No | -createdAt | Sort field (prefix with `-` for descending) |

**Response Format**:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [...],           // Array of products (Express format)
  "results": [...],        // Array of products (DRF format)
  "count": 37,             // Total number of products
  "next": true,            // Has next page
  "previous": false,       // Has previous page
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 37,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Example Product Object**:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "507f1f77bcf86cd799439011",
  "name": "iPhone 14 Pro",
  "description": "Latest iPhone with advanced camera system",
  "price": 120000,
  "category": "1",
  "brand": "Apple",
  "image": "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80",
  "images": [
    {
      "url": "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80",
      "alt": "iPhone 14 Pro",
      "isPrimary": true
    }
  ],
  "stock": 15,
  "rating": 4.8,
  "reviewCount": 245,
  "isActive": true,
  "isFeatured": true,
  "tags": ["electronics", "smartphone", "apple"],
  "sku": "PRD-ABC123",
  "slug": "iphone-14-pro",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Example Requests**:

```bash
# Get first page of products
curl http://localhost:5000/api/products

# Search for "phone"
curl http://localhost:5000/api/products?search=phone

# Filter by category
curl http://localhost:5000/api/products?category=1

# Filter by price range (1000-50000 KES)
curl http://localhost:5000/api/products?min_price=1000&max_price=50000

# Combine filters with pagination
curl "http://localhost:5000/api/products?category=1&min_price=10000&page=1&limit=10&sort=-price"

# Filter by featured products only
curl http://localhost:5000/api/products?isFeatured=true

# Filter by products in stock
curl http://localhost:5000/api/products?inStock=true
```

---


### 2. Get Product by ID

Fetch a single product by its ID or slug.

**Endpoint**: `GET /api/products/:id`

**URL Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID (MongoDB ObjectId) or slug |

**Response Format**:

```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "iPhone 14 Pro",
    ...
  }
}
```

**Example Request**:

```bash
# By ID
curl http://localhost:5000/api/products/507f1f77bcf86cd799439011

# By slug
curl http://localhost:5000/api/products/iphone-14-pro
```

---

### 3. Get Categories

Fetch a list of product categories.

**Endpoint**: `GET /api/products/categories/`

**Response Format**:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "1",
        "id": "1",
        "name": "Electronics",
        "description": "Electronic devices and gadgets",
        "isActive": true
      },
      ...
    ]
  }
}
```

---

## Frontend Integration

### Using with React

The frontend uses the `useProducts` hook for easy integration:

```javascript
import { useProducts } from '../hooks/useProducts';

function ProductsPage() {
  const { products, loading, error, pagination } = useProducts({
    page: 1,
    pageSize: 12,
    search: 'phone',
    category: '1',
    priceRange: { min: '1000', max: '50000' },
    ordering: '-price'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### API Service

Or use the API service directly:

```javascript
import { productsAPI } from '../services/api';

// Get products
const response = await productsAPI.getProducts({
  page: 1,
  limit: 20,
  search: 'phone',
  category: '1'
});

// Access products
const products = response.data.results || response.data.data;
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (authentication required) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Fallback Behavior

When MongoDB is unavailable, the API automatically returns fallback products to ensure the application remains functional. The response will include a message indicating fallback mode:

```json
{
  "success": true,
  "message": "Products retrieved successfully (fallback)",
  ...
}
```

---

## Filtering Examples

### 1. Search Products

Search across name, description, brand, tags, and SKU:

```bash
curl "http://localhost:5000/api/products?search=samsung"
```

### 2. Category Filter

Filter products by category:

```bash
curl "http://localhost:5000/api/products?category=1"
```

### 3. Price Range Filter

Get products within a price range:

```bash
curl "http://localhost:5000/api/products?min_price=10000&max_price=50000"
```

### 4. Multiple Filters

Combine multiple filters:

```bash
curl "http://localhost:5000/api/products?category=1&min_price=10000&search=phone&sort=-price"
```

### 5. Featured Products Only

Get only featured products:

```bash
curl "http://localhost:5000/api/products?isFeatured=true"
```

---

## Sorting Options

Available sort fields (prefix with `-` for descending order):

- `name` - Sort by name
- `price` - Sort by price
- `rating` - Sort by rating
- `createdAt` - Sort by creation date (default: `-createdAt`)
- `stock` - Sort by stock quantity

**Examples**:

```bash
# Lowest price first
curl "http://localhost:5000/api/products?sort=price"

# Highest price first
curl "http://localhost:5000/api/products?sort=-price"

# Newest products first
curl "http://localhost:5000/api/products?sort=-createdAt"

# Highest rated first
curl "http://localhost:5000/api/products?sort=-rating"
```

---

## Performance Considerations

1. **Pagination**: Always use pagination for large datasets. Default limit is 20 items.
2. **Caching**: The API supports HTTP caching headers.
3. **Indexes**: The following fields are indexed for optimal query performance:
   - `name`, `description`, `brand`, `tags` (text index)
   - `category`, `brand`, `price`, `isActive`, `isFeatured`, `createdAt`
   - `sku` (unique), `slug` (unique)

---

## MongoDB Connection

The API connects to MongoDB using the `MONGO_URI` environment variable:

```bash
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/easycart

# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/easycart?retryWrites=true&w=majority
```

---

## Testing

### Backend Tests

Run the backend API tests:

```bash
cd backend
npm test -- tests/products-api.test.js
```

### Frontend Tests

Run the frontend hook tests:

```bash
cd frontend
npm test -- src/hooks/__tests__/useProducts.test.js
```

---

## Support

For issues or questions, please refer to:
- [GitHub Repository](https://github.com/Bryvn01/EasyCart)
- [STAKEHOLDER_COMMUNICATION.md](../STAKEHOLDER_COMMUNICATION.md)
- [ENVIRONMENT_CONFIG_VERIFICATION.md](../ENVIRONMENT_CONFIG_VERIFICATION.md)
