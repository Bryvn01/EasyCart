# API Integration Guide

This document explains how the EasyCart frontend fetches data from the backend API instead of using mock data.

## Overview

The frontend has been updated to fetch real data from the backend API endpoints. The dependency on `mockData.js` has been completely removed.

## Environment Configuration

### .env File

Create a `.env` file in the `frontend/` directory with the following content:

```bash
# React Configuration
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true

# API Configuration
# For local development: http://localhost:8000/api
# For production: https://easycart-backend-0u8r.onrender.com/api
REACT_APP_API_URL=http://localhost:8000/api
```

**Important:** Change `REACT_APP_API_URL` based on your environment:
- **Local Development:** `http://localhost:8000/api`
- **Production:** `https://easycart-backend-0u8r.onrender.com/api`

## Components

### 1. ProductList Component

**Location:** `frontend/src/components/ProductList.jsx`

**Features:**
- Fetches products from `${REACT_APP_API_URL}/products/`
- Displays loading spinner while fetching
- Shows error message if API request fails
- Displays each product with:
  - Product image (with fallback icon)
  - Product name
  - Category
  - Price (formatted with KES currency)
  - Stock status
  - Description
  - Add to Cart button (disabled when out of stock)

**Usage:**

```jsx
import ProductList from '../components/ProductList';

function MyPage() {
  return (
    <div>
      <h1>Products</h1>
      <ProductList />
    </div>
  );
}
```

### 2. CategoryList Component

**Location:** `frontend/src/components/CategoryList.jsx`

**Features:**
- Fetches categories from `${REACT_APP_API_URL}/categories/`
- Displays loading skeleton while fetching
- Shows error message if API request fails (with fallback categories)
- Interactive category selection
- Two display modes:
  - Horizontal button list
  - Grid view with icons

**Usage:**

```jsx
import React, { useState } from 'react';
import CategoryList from '../components/CategoryList';

function MyPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div>
      <h1>Categories</h1>
      <CategoryList 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
    </div>
  );
}
```

### 3. CategoryNav Component

**Location:** `frontend/src/components/CategoryNav.js`

**Features:**
- Updated to fetch categories from API instead of using hardcoded list
- Displays loading skeleton while fetching
- Fallback to default categories if API fails
- Horizontal scrollable category navigation

**Usage:**

```jsx
import CategoryNav from '../components/CategoryNav';

function MyPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div>
      <CategoryNav 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
    </div>
  );
}
```

## Existing Pages Already Using API

### Products Page

**Location:** `frontend/src/pages/Products.js`

This page already uses the API through the `productsAPI` service:
- Fetches products with filters (category, search, price range, sorting)
- Fetches categories for the filter dropdown
- Handles loading and error states
- Supports pagination and filtering

**API Calls:**
```javascript
import { productsAPI } from '../services/api';

// Fetch products
const response = await productsAPI.getProducts(params);

// Fetch categories
const response = await productsAPI.getCategories();
```

### Homepage

**Location:** `frontend/src/components/Homepage.js`

The homepage fetches products and displays them in sections:
- Flash Sales
- Grocery Essentials
- Category-specific sections

## API Service

**Location:** `frontend/src/services/api.js`

The centralized API service provides methods for all API endpoints:

```javascript
import { productsAPI, ordersAPI, authAPI } from '../services/api';

// Products
const products = await productsAPI.getProducts(params);
const product = await productsAPI.getProduct(id);
const categories = await productsAPI.getCategories();

// Orders
const cart = await ordersAPI.getCart();
await ordersAPI.addToCart({ product_id, quantity });

// Auth
await authAPI.login(credentials);
await authAPI.register(userData);
```

## API Endpoints

The backend provides the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products/` | GET | List all products (supports filtering, search, sorting) |
| `/api/products/:id/` | GET | Get single product details |
| `/api/categories/` | GET | List all categories |
| `/api/orders/cart/` | GET | Get user's cart |
| `/api/orders/cart/add/` | POST | Add item to cart |
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |

## Error Handling

All components implement proper error handling:

1. **Loading State:** Shows a spinner or skeleton while fetching
2. **Error State:** Displays user-friendly error message
3. **Empty State:** Shows message when no data is available
4. **Retry Mechanism:** Provides button to retry failed requests

Example error handling:

```jsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/products/`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

## Testing the Integration

1. **Start the backend server:**
   ```bash
   cd backend
   npm start  # or python manage.py runserver
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Verify API calls:**
   - Open browser DevTools → Network tab
   - You should see requests to `/api/products/` and `/api/categories/`
   - Check the responses contain actual data from your database

## Removed Files

- ❌ `frontend/src/services/mockData.js` - Deleted (no longer needed)

## Migration Checklist

- [x] Delete `mockData.js` file
- [x] Remove all imports of `mockData`, `mockProducts`, `mockCategories`
- [x] Create `.env` file with `REACT_APP_API_URL`
- [x] Update `CategoryNav.js` to fetch from API
- [x] Create `ProductList.jsx` component
- [x] Create `CategoryList.jsx` component
- [x] Verify all pages use API instead of mock data
- [x] Test loading states
- [x] Test error handling
- [x] Update documentation

## Troubleshooting

### Issue: API requests failing

**Solution:** Check that:
1. Backend server is running
2. `REACT_APP_API_URL` in `.env` is correct
3. CORS is properly configured in backend
4. Network tab shows correct URL being called

### Issue: Empty data returned

**Solution:** 
1. Verify backend has data (run seed script if needed)
2. Check API response in Network tab
3. Verify response format matches expected structure

### Issue: Environment variable not working

**Solution:**
1. Restart the React development server after changing `.env`
2. Ensure variable name starts with `REACT_APP_`
3. Check that `.env` file is in the `frontend/` directory

## Best Practices

1. **Always use the centralized API service** (`frontend/src/services/api.js`) instead of direct axios calls
2. **Handle loading and error states** in all components that fetch data
3. **Use environment variables** for API URLs (never hardcode)
4. **Implement retry logic** for failed requests when appropriate
5. **Show user-friendly messages** instead of technical error details
6. **Use fallback data** for non-critical features like categories

## Future Enhancements

- [ ] Add pagination support in ProductList
- [ ] Implement caching to reduce API calls
- [ ] Add real-time updates using WebSockets
- [ ] Implement optimistic UI updates for better UX
- [ ] Add request debouncing for search functionality
