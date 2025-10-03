# Code Examples - API Integration

This document provides code examples for using the new API-integrated components.

## Quick Start

### 1. Basic ProductList Usage

```jsx
import React from 'react';
import ProductList from '../components/ProductList';

function ProductsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <ProductList />
    </div>
  );
}

export default ProductsPage;
```

### 2. Basic CategoryList Usage

```jsx
import React, { useState } from 'react';
import CategoryList from '../components/CategoryList';

function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <CategoryList 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      {selectedCategory && (
        <p className="mt-4">Selected category ID: {selectedCategory}</p>
      )}
    </div>
  );
}

export default CategoriesPage;
```

### 3. Combined Usage - Products with Category Filter

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryList from '../components/CategoryList';

function FilteredProducts() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = selectedCategory ? { category: selectedCategory } : {};
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/products/`,
          { params }
        );
        setProducts(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Shop by Category</h1>
      
      {/* Category Filter */}
      <CategoryList 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Products Display */}
      <div className="mt-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">KES {product.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilteredProducts;
```

### 4. Using the Centralized API Service

Instead of direct axios calls, use the centralized API service:

```jsx
import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import CategoryList from '../components/CategoryList';

function BestPracticeExample() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {};
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        
        const response = await productsAPI.getProducts(params);
        const productsData = response.data.results || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      <CategoryList 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="mt-8">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No products found.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary font-semibold mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    KES {product.price?.toLocaleString()}
                  </p>
                  <button className="w-full mt-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BestPracticeExample;
```

### 5. Updating CategoryNav (Existing Component)

The existing `CategoryNav` component has been updated to fetch from API:

```jsx
import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

const CategoryNav = ({ onSelectCategory, selectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productsAPI.getCategories();
        const categoriesData = response.data.results || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories
        setCategories([
          { id: 1, name: 'Groceries' },
          { id: 2, name: 'Electronics' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ... rest of component
};
```

## Environment Setup

### .env File

Create this file in the `frontend/` directory:

```bash
# React Configuration
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true

# API Configuration
REACT_APP_API_URL=http://localhost:8000/api
```

### For Production

```bash
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
```

## API Service Reference

Located at `frontend/src/services/api.js`:

```javascript
import { productsAPI, ordersAPI, authAPI } from '../services/api';

// Get all products
const response = await productsAPI.getProducts();

// Get products with filters
const response = await productsAPI.getProducts({
  category: 'Electronics',
  search: 'phone',
  ordering: 'price',
  price_min: 1000,
  price_max: 50000
});

// Get single product
const response = await productsAPI.getProduct(productId);

// Get categories
const response = await productsAPI.getCategories();

// Get user cart
const response = await ordersAPI.getCart();

// Add to cart
await ordersAPI.addToCart({ product_id: 123, quantity: 2 });
```

## Common Patterns

### 1. Loading State

```jsx
const [loading, setLoading] = useState(true);

if (loading) {
  return <div>Loading...</div>;
}
```

### 2. Error Handling

```jsx
const [error, setError] = useState(null);

try {
  // API call
} catch (err) {
  setError(err.message);
}

if (error) {
  return <div className="text-red-500">{error}</div>;
}
```

### 3. Empty State

```jsx
if (products.length === 0) {
  return <div>No products found</div>;
}
```

## Testing

The test file (`src/__tests__/Products.test.js`) shows how to mock API calls:

```javascript
import * as api from '../services/api';

jest.mock('../services/api');

beforeEach(() => {
  const mockProducts = {
    data: {
      results: [
        { id: 1, name: 'Test Product', price: 100 }
      ]
    }
  };
  
  api.productsAPI.getProducts.mockResolvedValue(mockProducts);
});
```

## Migration from Mock Data

**Before (with mockData.js):**
```jsx
import { mockProducts, mockCategories } from '../services/mockData';

function MyComponent() {
  const [products] = useState(mockProducts);
  // ...
}
```

**After (with API):**
```jsx
import { productsAPI } from '../services/api';

function MyComponent() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await productsAPI.getProducts();
      setProducts(response.data.results || response.data);
    };
    fetchProducts();
  }, []);
  // ...
}
```

## Troubleshooting

### Issue: CORS errors

**Solution:** Ensure backend has CORS configured:
```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]
```

### Issue: 404 errors

**Solution:** Verify API URL in .env:
```bash
# Check the URL format
REACT_APP_API_URL=http://localhost:8000/api  # ✓ Correct
REACT_APP_API_URL=http://localhost:8000/api/ # ✗ Extra slash
```

### Issue: Data not displaying

**Solution:** Check response format in Network tab. Adjust code to handle both formats:
```jsx
const data = response.data.results || response.data;
```
