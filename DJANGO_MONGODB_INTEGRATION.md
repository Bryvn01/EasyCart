# Django REST Framework + MongoDB Atlas Integration Guide

## Overview

EasyCart now uses **Django REST Framework** as the backend API server, fetching product data directly from **MongoDB Atlas** using **PyMongo**. This architecture provides:

- ✅ Django REST Framework for robust API endpoints
- ✅ MongoDB Atlas for flexible product database
- ✅ PyMongo for direct MongoDB access
- ✅ JWT authentication with refresh tokens
- ✅ Clean JSON responses with proper serialization
- ✅ Pagination, filtering, and search capabilities
- ✅ CORS configuration for frontend integration
- ✅ Health check endpoint with database status

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│          REACT_APP_API_URL → Django Backend                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│          Django REST Framework Backend (Port 8000)          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Endpoints:                                         │    │
│  │  • /api/products/        → MongoDB (products)      │    │
│  │  • /api/products/<id>/   → MongoDB (single)        │    │
│  │  • /api/products/categories/ → MongoDB (categories)│   │
│  │  • /api/auth/login/      → JWT authentication      │    │
│  │  • /api/auth/register/   → User registration       │    │
│  │  • /api/auth/token/refresh/ → Refresh JWT tokens   │    │
│  │  • /api/health/          → Health check + DB status│   │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Technology Stack:                                           │
│  • Django 3.2.x LTS                                         │
│  • Django REST Framework 3.15+                              │
│  • djangorestframework-simplejwt 5.3+                       │
│  • PyMongo 3.12+ (MongoDB driver)                           │
│  • django-cors-headers (CORS support)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ PyMongo Connection
┌─────────────────────────────────────────────────────────────┐
│             MongoDB Atlas (easycart database)               │
│  Collections:                                                │
│  • products     (Kenyan products with images)               │
│  • categories   (Product categories)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         Django ORM Database (SQLite/PostgreSQL)             │
│  Used for:                                                  │
│  • User authentication                                      │
│  • Django admin panel                                       │
│  • Sessions and permissions                                 │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables

### Required Configuration

Create a `.env` file in the `backend/` directory:

```bash
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/easycart?retryWrites=true&w=majority

# Django Security
SECRET_KEY=your-strong-secret-key-here
DEBUG=False

# CORS Configuration (Frontend URLs)
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Allowed Hosts
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Optional: PostgreSQL (for production Django models)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

### Environment Variable Details

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGO_URI` | ✅ Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/easycart` |
| `SECRET_KEY` | ✅ Yes | Django secret key | `django-insecure-change-me-in-production` |
| `FRONTEND_URL` | ⚠️ Recommended | Frontend URL for CORS | `https://easycart.com` |
| `CORS_ALLOWED_ORIGINS` | ⚠️ Recommended | Comma-separated allowed origins | `https://easycart.com,https://admin.easycart.com` |
| `DEBUG` | ⚠️ Recommended | Enable/disable debug mode | `False` (production) |
| `ALLOWED_HOSTS` | ⚠️ Recommended | Allowed hosts for Django | `easycart.com,.render.com` |

## API Endpoints

### Products API

#### 1. List Products with Filters
```
GET /api/products/
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `page_size` - Results per page (default: 20)
- `category` - Filter by category name (e.g., `Groceries`, `Electronics`)
- `search` - Search in name and description
- `price_min` - Minimum price filter
- `price_max` - Maximum price filter
- `ordering` - Sort field (prefix with `-` for descending, e.g., `-price`, `name`)

**Example Requests:**
```bash
# Get first page of products
curl https://api.easycart.com/api/products/

# Filter by category
curl https://api.easycart.com/api/products/?category=Electronics

# Search for products
curl https://api.easycart.com/api/products/?search=flour

# Price range filter
curl https://api.easycart.com/api/products/?price_min=100&price_max=500

# Combine filters
curl https://api.easycart.com/api/products/?category=Groceries&price_max=1000&ordering=-price
```

**Response Format:**
```json
{
  "count": 37,
  "next": true,
  "previous": false,
  "results": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Unga wa Dola Maize Flour 2kg",
      "price": 210,
      "description": "Premium maize flour for making traditional Ugali",
      "image_url": "https://res.cloudinary.com/.../jogoo.jpg",
      "category": "Groceries",
      "brand": "Dola",
      "stock": 150,
      "sku": "PRD-1234567890-abc123-unga-wa-do",
      "slug": "unga-wa-dola-maize-flour-2kg"
    }
  ]
}
```

#### 2. Get Single Product
```
GET /api/products/<id>/
```

**Example:**
```bash
curl https://api.easycart.com/api/products/507f1f77bcf86cd799439011/
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Unga wa Dola Maize Flour 2kg",
  "price": 210,
  "description": "Premium maize flour for making traditional Ugali, a Kenyan staple.",
  "image_url": "https://res.cloudinary.com/.../jogoo.jpg",
  "category": "Groceries",
  "brand": "Dola",
  "stock": 150,
  "sku": "PRD-1234567890-abc123-unga-wa-do",
  "slug": "unga-wa-dola-maize-flour-2kg"
}
```

### Categories API

#### List Categories
```
GET /api/products/categories/
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Groceries",
    "description": "Fresh produce, pantry staples, and everyday essentials",
    "slug": "groceries"
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "name": "Electronics",
    "description": "Latest phones, TVs, computers, and gadgets",
    "slug": "electronics"
  }
]
```

### Authentication API

#### 1. Register User
```
POST /api/auth/register/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### 2. Login
```
POST /api/auth/login/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### 3. Refresh Token
```
POST /api/auth/token/refresh/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Health Check API

```
GET /api/health/
```

**Response:**
```json
{
  "status": "healthy",
  "service": "easycart-backend",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "database": "easycart",
    "mongodb_version": "7.0.0",
    "products_count": 37
  }
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file with MongoDB URI:
```bash
cp .env.example .env
# Edit .env and add your MONGO_URI
```

### 3. Run Migrations (for Django models)

```bash
python manage.py migrate
```

### 4. Create Superuser (optional, for Django admin)

```bash
python manage.py createsuperuser
```

### 5. Test MongoDB Connection

```bash
python test_mongodb_integration.py
```

Expected output:
```
✅ MongoDB connection successful!
   Database: easycart
   MongoDB Version: 7.0.0
   Products Count: 37

✅ All tests passed! Django + MongoDB integration is working correctly.
```

### 6. Start Development Server

```bash
python manage.py runserver
```

Server runs at: `http://localhost:8000`

### 7. Test API Endpoints

```bash
# Health check
curl http://localhost:8000/api/health/

# List products
curl http://localhost:8000/api/products/

# Get product by ID (replace with actual ID)
curl http://localhost:8000/api/products/507f1f77bcf86cd799439011/

# List categories
curl http://localhost:8000/api/products/categories/
```

## Frontend Integration

### Update Frontend Configuration

In your React frontend, set the API base URL:

**`.env` file:**
```bash
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
```

**`src/services/api.js`:**
```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example: Fetch Products in React

```javascript
import { useState, useEffect } from 'react';
import api from './services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/');
        setProducts(response.data.results);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="product-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <img src={product.image_url} alt={product.name} />
          <h3>{product.name}</h3>
          <p>KES {product.price}</p>
          <button>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
```

## Deployment on Render

### 1. Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `easycart-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn ecommerce.wsgi:application --bind 0.0.0.0:$PORT`

### 2. Set Environment Variables

Add these in Render dashboard:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/easycart?retryWrites=true&w=majority
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=easycart-backend.onrender.com,.render.com
FRONTEND_URL=https://easycart-frontend.onrender.com
CORS_ALLOWED_ORIGINS=https://easycart-frontend.onrender.com,https://easycart-admin.onrender.com
```

### 3. Deploy

Render will automatically deploy on every push to the main branch.

## MongoDB Atlas Setup

### 1. Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user with password
4. Whitelist IP addresses (0.0.0.0/0 for development)

### 2. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `easycart`

Example:
```
mongodb+srv://username:password@cluster0.mongodb.net/easycart?retryWrites=true&w=majority
```

### 3. Seed Database (Optional)

If using Node.js seeding script:
```bash
cd backend
node routes/seed.js
```

Or use MongoDB Compass/Atlas UI to import data.

## Logging and Monitoring

### Application Logs

MongoDB connection logs appear on startup:
```
🚀 MongoDB Atlas connected successfully!
   Database: easycart
   MongoDB Version: 7.0.0
   Products Count: 37
```

### Health Check Monitoring

Monitor the `/api/health/` endpoint:
- Returns 200 OK when healthy
- Returns 500 when MongoDB is disconnected
- Includes database status in response

### Production Monitoring

- Use Render's built-in logs
- Set up external monitoring (e.g., Datadog, New Relic)
- Monitor `/api/health/` endpoint with uptime services

## Troubleshooting

### MongoDB Connection Errors

**Error:** `MONGO_URI not configured`
- **Solution**: Add `MONGO_URI` to `.env` file

**Error:** `Connection failed: connection refused`
- **Solution**: Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)

**Error:** `Authentication failed`
- **Solution**: Verify username/password in connection string

### CORS Errors

**Error:** `No 'Access-Control-Allow-Origin' header`
- **Solution**: Add frontend URL to `CORS_ALLOWED_ORIGINS` in `.env`

### API Errors

**Error:** `404 Not Found`
- **Solution**: Check URL path (use `/api/products/` not `/products/`)

**Error:** `500 Internal Server Error`
- **Solution**: Check server logs for details

## Testing

### Run Integration Tests

```bash
cd backend
python test_mongodb_integration.py
```

### Manual API Testing

Use curl or Postman:

```bash
# Test products endpoint
curl http://localhost:8000/api/products/

# Test with filters
curl "http://localhost:8000/api/products/?category=Electronics&price_max=30000"

# Test health check
curl http://localhost:8000/api/health/
```

## Security Best Practices

1. ✅ **Never commit `.env` file** - Use `.env.example` as template
2. ✅ **Use strong SECRET_KEY** - Generate with `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`
3. ✅ **Set DEBUG=False in production** - Prevents sensitive info leaks
4. ✅ **Restrict CORS origins** - Only allow trusted frontend domains
5. ✅ **Use HTTPS in production** - Enable SSL/TLS on Render
6. ✅ **Rotate JWT tokens** - Use refresh tokens for security
7. ✅ **Validate all inputs** - Price range validation prevents injection
8. ✅ **Use environment variables** - Never hardcode credentials

## Support and Documentation

- **GitHub**: [Bryvn01/EasyCart](https://github.com/Bryvn01/EasyCart)
- **Django REST Framework**: [Official Docs](https://www.django-rest-framework.org/)
- **MongoDB Atlas**: [Documentation](https://www.mongodb.com/docs/atlas/)
- **PyMongo**: [API Reference](https://pymongo.readthedocs.io/)

## License

MIT License - See LICENSE file for details
