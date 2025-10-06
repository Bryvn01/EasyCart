# EasyCart - E-Commerce Web Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Django](https://img.shields.io/badge/django-3.2+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-7+-green.svg)

A complete e-commerce solution with React frontend and Django REST Framework backend, featuring MongoDB Atlas integration for product data, JWT authentication, and production-ready architecture.

---

## 🔧 Products Display Fix (Latest)

**Issue**: Products not displaying on frontend?  
**Quick Fix**: [See QUICKSTART_PRODUCTS_FIX.md](QUICKSTART_PRODUCTS_FIX.md)

**Key Changes:**
- Frontend `.env` must use port **5000** (Node.js backend), not 8000 (Django)
- Database name must be **easycart** in MONGO_URI
- Run validation: `node validate-setup.js`

📚 **Documentation:**
- [Quick Start Guide](QUICKSTART_PRODUCTS_FIX.md) - 5-minute fix
- [Complete Fix Details](PRODUCTS_DISPLAY_FIX.md) - Full documentation
- [Seeding Guide](SEEDING_GUIDE.md) - Database setup

---

## 🎉 Latest Updates (v3.0)

**Django REST Framework + MongoDB Atlas Integration Complete!**

- ✅ **Django REST Framework Backend**: Robust API with DRF (port 8000)
- ✅ **MongoDB Atlas Integration**: Products fetched via PyMongo from MongoDB
- ✅ **JWT Authentication**: Login, register, and refresh token endpoints
- ✅ **Clean JSON Serialization**: Proper id, name, price, description, image_url, category fields
- ✅ **Advanced Filtering**: Category, price range, and search filters with pagination
- ✅ **CORS Configuration**: Frontend URL environment variable support
- ✅ **Health Check Endpoint**: MongoDB connection status monitoring
- ✅ **Startup Logging**: MongoDB connection verification on server start

**📚 Documentation:**
- [Django MongoDB Integration Guide](DJANGO_MONGODB_INTEGRATION.md) - **NEW!** Complete setup guide
- [Enhanced Product API Guide](ENHANCED_PRODUCT_API_GUIDE.md) - API reference
- [Admin Dashboard Integration](ADMIN_DASHBOARD_INTEGRATION_GUIDE.md) - Frontend integration
- [Implementation Summary](IMPLEMENTATION_COMPLETE_SUMMARY.md) - Complete overview

## 🚀 Features

- **User Authentication**: JWT-based registration and login with djangorestframework-simplejwt
- **Product Catalog**: Browse products from MongoDB Atlas with advanced filters
- **Search & Filter**: Category filtering, price range, and full-text search
- **Shopping Cart**: Add/remove items with localStorage persistence (frontend)
- **Order Management**: Checkout flow with shipping and payment
- **Product Detail Pages**: Rich product information with descriptions and images
- **Responsive Design**: Mobile-first responsive UI with TailwindCSS/Material UI
- **RESTful API**: Clean, well-documented endpoints following REST principles
- **Pagination**: Efficient data loading with configurable page sizes
- **Error Handling**: Graceful error responses with proper HTTP status codes

## 🛠️ Tech Stack

**Frontend:**
- React 18+ with Hooks
- React Router for navigation
- Axios for API calls
- TailwindCSS / Material UI for styling
- Context API for state management
- localStorage for cart persistence

**Backend (Django REST Framework):**
- Django 3.2.x LTS
- Django REST Framework 3.15+
- PyMongo 3.12+ (MongoDB driver)
- djangorestframework-simplejwt (JWT auth)
- django-cors-headers (CORS support)
- django-filter (filtering support)
- Gunicorn (production server)

**Database:**
- MongoDB Atlas (products, categories)
- SQLite/PostgreSQL (Django auth, sessions)

**Infrastructure:**
- MongoDB Atlas for product data
- Cloudinary CDN for image hosting (optional)
- Render / Railway for deployment

## 📋 Prerequisites

- Python 3.8+
- MongoDB Atlas account (free tier available)
- Node.js 18+ (for frontend)
- npm or yarn
- Git
- Cloudinary account (optional, for image uploads)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Bryvn01/EasyCart.git
cd EasyCart
```

### 2. Backend Setup (Django REST Framework)
```bash
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and Django settings:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart
# SECRET_KEY=<your_django_secret_key>
# FRONTEND_URL=http://localhost:3000

# Run migrations (for Django models)
python manage.py migrate

# Create superuser (optional, for Django admin)
python manage.py createsuperuser

# Start the server
python manage.py runserver
# Server runs on http://localhost:8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Configure API URL
cp .env.example .env
# Edit .env:
# REACT_APP_API_URL=http://localhost:8000/api

# Start development server
npm start
# Frontend runs on http://localhost:3000
```

### 4. Verify MongoDB Connection

```bash
cd backend
python test_mongodb_integration.py
```

Expected output:
```
✅ MongoDB connection successful!
   Database: easycart
   Products Count: 37
```

## 📡 API Endpoints

### Products API

#### List Products with Filters
```
GET /api/products/
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `page_size` - Results per page (default: 20)
- `category` - Filter by category name (e.g., `Electronics`)
- `search` - Search in name and description
- `price_min` - Minimum price filter
- `price_max` - Maximum price filter
- `ordering` - Sort field (e.g., `-price`, `name`)

**Example:**
```bash
curl http://localhost:8000/api/products/?category=Electronics&price_max=30000
```

**Response:**
```json
{
  "count": 37,
  "next": true,
  "previous": false,
  "results": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Samsung Galaxy A14 128GB",
      "price": 24999,
      "description": "5G ready smartphone...",
      "image_url": "https://res.cloudinary.com/.../galaxy.jpg",
      "category": "Electronics",
      "brand": "Samsung",
      "stock": 28
    }
  ]
}
```

#### Get Single Product
```
GET /api/products/<id>/
```

#### List Categories
```
GET /api/products/categories/
```

### Authentication API

#### Register
```
POST /api/auth/register/
```
**Body:** `{ "email": "user@example.com", "password": "pass123", "first_name": "John", "last_name": "Doe" }`

#### Login
```
POST /api/auth/login/
```
**Body:** `{ "email": "user@example.com", "password": "pass123" }`

**Response:** Returns access and refresh JWT tokens

#### Refresh Token
```
POST /api/auth/token/refresh/
```
**Body:** `{ "refresh": "refresh_token_here" }`

### Health Check
```
GET /api/health/
```

Returns MongoDB connection status and database info.

**Full API documentation:** See [DJANGO_MONGODB_INTEGRATION.md](DJANGO_MONGODB_INTEGRATION.md)

# Setup environment variables
cp .env.example .env
# Edit .env to point to backend (http://localhost:5000)

# Start development server
npm start
```

### 4. Admin Dashboard Setup
```bash
cd admin-dashboard
npm install

# Start admin dashboard
npm start
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Dashboard: http://localhost:3001 (or configured port)

## 📁 Project Structure

```
EasyCart/
├── backend/                    # Django REST Framework API
│   ├── apps/
│   │   ├── products/           # Products app
│   │   │   ├── views.py        # Product API views (MongoDB)
│   │   │   ├── mongodb_utils.py # MongoDB connection utilities
│   │   │   ├── serializers.py  # DRF serializers
│   │   │   ├── models.py       # Django models (for ORM if needed)
│   │   │   └── urls.py         # Product endpoints
│   │   ├── accounts/           # Authentication app
│   │   │   ├── views.py        # JWT auth views
│   │   │   ├── serializers.py  # User serializers
│   │   │   └── urls.py         # Auth endpoints
│   │   └── orders/             # Orders app
│   ├── ecommerce/              # Django project settings
│   │   ├── settings.py         # Configuration
│   │   ├── urls.py             # URL routing
│   │   └── wsgi.py             # WSGI config
│   ├── manage.py               # Django management
│   ├── requirements.txt        # Python dependencies
│   └── test_mongodb_integration.py  # MongoDB tests
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   │   ├── Products.js     # Product listing with filters
│   │   │   ├── ProductDetail.js # Single product view
│   │   │   ├── Cart.js         # Shopping cart
│   │   │   └── Login.js        # Authentication
│   │   ├── context/            # React Context (auth, cart)
│   │   ├── services/           # API services
│   │   │   └── api.js          # Axios configuration
│   │   └── App.js              # Main app component
│   └── package.json
├── admin-dashboard/            # Admin React app (optional)
├── DJANGO_MONGODB_INTEGRATION.md      # Django setup guide
├── IMPLEMENTATION_SUMMARY.md           # Implementation details
└── README.md                           # This file
```
├── DJANGO_DEPRECATION_NOTICE.md           # Migration info
├── IMPLEMENTATION_COMPLETE_SUMMARY.md     # Overview
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority

# Django Security
SECRET_KEY=<your_django_secret_key>
DEBUG=False

# CORS (Frontend URLs)
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Allowed Hosts
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Optional: PostgreSQL for Django models
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:8000/api
# Production: https://easycart-backend.onrender.com/api
```

**Admin Dashboard (.env):**
```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 🚀 Deployment on Render

### Backend (Django)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd backend && gunicorn ecommerce.wsgi:application`
   - **Root Directory**: `backend`
4. Add environment variables:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `SECRET_KEY` - Django secret key
   - `DEBUG` - `False`
   - `ALLOWED_HOSTS` - Your Render domain
   - `CORS_ALLOWED_ORIGINS` - Frontend URL

### Frontend (React)

1. Create a Static Site on Render
2. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
3. Add environment variable:
   - `REACT_APP_API_URL` - Your backend API URL

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user with password
3. Whitelist IP addresses (0.0.0.0/0 for all IPs)
4. Get connection string and add to `MONGO_URI`
5. Use MongoDB Compass or seed script to populate data

## ☁️ Cloudinary Setup & Product Seeding

### Setting Up Cloudinary

EasyCart uses Cloudinary for cloud-based image storage and delivery. Follow these steps to set it up:

1. **Create a Cloudinary Account**
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Navigate to your Dashboard to get your credentials

2. **Configure Environment Variables**
   
   Add these to your `backend/.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
   CLOUDINARY_API_KEY=<your_cloudinary_api_key>
   CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   ```

3. **Verify Configuration**
   ```bash
   cd backend
   node -e "require('dotenv').config(); console.log('Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? 'Configured ✓' : 'Not configured ✗')"
   ```

### Seeding Products with Images

The project includes a comprehensive seed script that populates the database with authentic Kenyan supermarket products and uploads images to Cloudinary.

**Run the Seed Script:**
```bash
cd backend
npm run seed
# OR
node scripts/seedProducts.js
```

**Features:**
- ✅ Automatically uploads product images to Cloudinary
- ✅ Seeds 79+ authentic Kenyan products across multiple categories
- ✅ Works with or without Cloudinary (falls back to source URLs)
- ✅ Includes products from 15 categories: Staples, Beverages, Dairy, Bakery, Spreads, Snacks, Fresh Produce, Meat & Poultry, Household, Personal Care, Electronics, Fashion, and more
- ✅ Sets up categories and featured products

**Expected Output:**
```
🌱 Starting product seeding process...
📦 Connecting to MongoDB...
✅ Connected to MongoDB

🧹 Clearing existing products and categories...
✅ Cleared existing data

📁 Inserting categories...
✅ Inserted 15 categories

☁️  Cloudinary is configured - will upload images

🛒 Processing 79 products...

[1/79] Processing: Jogoo Maize Flour 2kg
   ⬆️  Uploading to Cloudinary...
   ✅ Uploaded successfully
   💾 Saved to database

...

📊 SEEDING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully seeded: 79 products
❌ Failed: 0 products
📁 Categories: 15
☁️  Cloudinary: Enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Product seeding completed successfully!
```

**Categories Included:**
- 🌾 **Staples**: Maize flour, rice, wheat flour, lentils, cooking oil (16 products)
- 🥛 **Dairy**: Fresh milk, yoghurt, butter (3 products)
- 🥤 **Beverages**: Tea, coffee, sodas, juices, water (11 products)
- 🍞 **Bakery**: Fresh bread and baked goods (1 product)
- 🧈 **Spreads**: Margarine and spreads (1 product)
- 🍿 **Snacks**: Instant noodles, crisps, biscuits (3 products)
- 🥬 **Fresh Produce**: Kale, tomatoes, onions, potatoes, bananas (5 products)
- 🍖 **Meat & Poultry**: Beef, chicken, fish (3 products)
- 🧼 **Household**: Detergents, soaps, cleaning products (10 products)
- 🧴 **Personal Care**: Toothpaste, sanitizers, beauty products (11 products)
- 📱 **Electronics**, 👕 **Fashion**, and more categories

**Troubleshooting:**
- If Cloudinary is not configured, the script will use source URLs directly
- Check MongoDB connection if seeding fails
- Ensure you have internet connection for image uploads
- Images are uploaded to the `products/` folder in Cloudinary

### Image Component Integration

The frontend uses the `ImageWithFallback` component for optimal image rendering:

**Features:**
- ⚡ Lazy loading for better performance
- 🎨 Skeleton loading states
- 🔄 Automatic fallback on error
- 📱 Responsive and mobile-optimized

**Usage:**
```jsx
import ImageWithFallback from './components/ImageWithFallback';

<ImageWithFallback
  src={product.image}
  alt={product.name}
  fallbackCategory="product"
  lazy
  showSkeleton
/>
```

## 🇰🇪 Kenyan Products Seeding

The project includes a dedicated seeding script specifically for Kenyan retail products. This script is **non-destructive** and designed to supplement existing product data.

### Purpose

The `seedKenyaProducts.js` script allows you to:
- ✅ Add authentic Kenyan retail products to your database
- ✅ Populate products from a curated JSON data file
- ✅ Optionally upload images to Cloudinary for optimal delivery
- ✅ Create necessary product categories automatically
- ✅ Skip products that already exist (safe to run multiple times)

### Quick Start

**Run the Kenyan Products Seed Script:**
```bash
cd backend
npm run seed:kenya
```

Or directly:
```bash
cd backend
node scripts/seedKenyaProducts.js
```

### Features

- **Non-Destructive**: Only adds new products; never deletes existing data
- **Data-Driven**: Products are loaded from `backend/data/products_kenya.json`
- **Smart Duplicate Detection**: Skips products that already exist (by name + brand)
- **Category Management**: Automatically creates missing categories
- **Cloudinary Support**: Uploads images to Cloudinary if configured (optional)
- **Fallback**: Uses source URLs if Cloudinary is not available
- **Detailed Logging**: Progress tracking with success/skip/fail counts

### Product Categories

The script includes 44 authentic Kenyan products across these categories:
- 🌾 **Staples**: Maize flour, sugar, rice, beans, etc.
- 🛒 **Groceries**: Cooking oil, milk, tea, margarine, seasonings
- 🥤 **Beverages**: Sodas, juices, tea, beer
- 🧼 **Household**: Cleaning products, detergents, disinfectants
- 💆 **Personal Care**: Soaps, lotions, shampoos, toiletries
- 📺 **Electronics**: TVs, kitchen appliances, fans
- 👕 **Fashion**: Shoes, bags, traditional fabrics

### Expected Output

```
🇰🇪 Starting Kenyan products seeding process...

📂 Loading products from data file...
✅ Loaded 44 products from JSON

📦 Connecting to MongoDB...
✅ Connected to MongoDB

📁 Processing categories...
   ➕ Created category: Staples
   ✓ Category already exists: Groceries
   ✓ Category already exists: Beverages
✅ Processed 7 categories

☁️  Cloudinary is configured - will upload images

🛒 Processing 44 products...

[1/44] Processing: Jogoo Maize Flour 2kg
   ⬆️  Uploading to Cloudinary...
   ✅ Uploaded successfully
   💾 Saved to database

[2/44] Processing: Kabras Sugar 2kg
   ⏭️  Product already exists, skipping

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SEEDING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully seeded: 40 products
⏭️  Skipped (already exist): 4 products
❌ Failed: 0 products
📁 Categories processed: 7
☁️  Cloudinary: Enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Kenyan products seeding completed successfully!

🔌 MongoDB connection closed
```

### Data File Location

Products are stored in: `backend/data/products_kenya.json`

This JSON file contains an array of product objects with the following structure:
```json
{
  "name": "Product Name",
  "brand": "Brand Name",
  "category": "Category",
  "price": 180,
  "description": "Product description",
  "sourceImageUrl": "https://...",
  "stock": 150,
  "tags": ["tag1", "tag2"]
}
```

### Environment Variables

**Required:**
- `MONGO_URI` or `MONGODB_URI`: MongoDB connection string

**Optional (for Cloudinary):**
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running locally or your Atlas connection string is correct
- Check that `MONGO_URI` is set in your `.env` file

**Cloudinary Not Working:**
- If Cloudinary credentials are missing, the script will use source URLs directly
- This is perfectly fine for development and testing

**Products Not Appearing:**
- Check the console output for errors
- Verify MongoDB connection
- Ensure the Product model is correctly defined

**Script Comparison:**

| Feature | `seedProducts.js` | `seedKenyaProducts.js` |
|---------|-------------------|------------------------|
| Clears existing data | ✅ Yes | ❌ No (non-destructive) |
| Data source | Inline JS array | External JSON file |
| Duplicate handling | Replaces all | Skips existing |
| Use case | Fresh database setup | Adding more products |

## 📚 API Documentation

### Quick Reference

**Product Endpoints:**
- `GET /api/products` - List products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `PATCH /api/products/:id/stock` - Update stock (admin)

**Image Upload:**
- `POST /api/upload/image` - Upload single image (admin)
- `POST /api/upload/images` - Upload multiple images (admin)

**Inventory:**
- `GET /api/products/inventory/low-stock` - Low stock products
- `GET /api/products/inventory/out-of-stock` - Out of stock products

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (auth required)

For complete API documentation, see [ENHANCED_PRODUCT_API_GUIDE.md](ENHANCED_PRODUCT_API_GUIDE.md)

## 🧪 Testing

```bash
# Verify backend syntax
cd backend
node -c server.js
node -c models/Product.js
node -c controllers/productController.js

# Start backend for testing
npm start

# Test API endpoints
curl http://localhost:5000/api/products
curl http://localhost:5000/api/health

# Frontend tests
cd frontend
npm test

# Admin dashboard tests
cd admin-dashboard
npm test
```

## 📦 Deployment

### Render.com Deployment

**Backend:**
1. Create new Web Service on Render
2. Connect GitHub repository
3. Build Command: `cd backend && npm install`
4. Start Command: `cd backend && npm start`
5. Add environment variables in Render Dashboard:
   - `PORT` (e.g., 5000)
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET` (strong random string)
   - `CLOUDINARY_URL` (cloudinary://api_key:api_secret@cloud_name)
   - `FRONTEND_URL` (your frontend URL)
   
   **Note**: For Cloudinary, you can use either:
   - `CLOUDINARY_URL` (single connection string - recommended)
   - Or individual variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Frontend:**
1. Create new Static Site on Render
2. Build Command: `cd frontend && npm install && npm run build`
3. Publish Directory: `frontend/build`

**Admin Dashboard:**
1. Create new Static Site on Render
2. Build Command: `cd admin-dashboard && npm install && npm run build`
3. Publish Directory: `admin-dashboard/build`

See deployment guides for detailed instructions.

## 🔄 Migration from Django

If you're migrating from the old Django backend:

1. **Read**: [DJANGO_DEPRECATION_NOTICE.md](DJANGO_DEPRECATION_NOTICE.md)
2. **Export data**: Use Django's dumpdata if needed
3. **Import to MongoDB**: Create migration script or manually re-create products
4. **Update frontend**: Already configured for Node.js backend
5. **Test thoroughly**: Ensure all features work

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

- Never commit `.env` files
- Use strong secret keys in production
- Enable HTTPS in production
- Regularly update dependencies

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.

### 🔍 Troubleshooting

If you're experiencing issues with product/category loading or other errors:

1. Check the [Frontend Error Handling Guide](FRONTEND_ERROR_HANDLING_GUIDE.md) for detailed diagnostics
2. Review error messages in browser console (F12)
3. Verify API endpoint configuration
4. Check backend service status if deployed
5. Ensure CORS settings are correct

**Common Issues:**
- **"Network error"** - Check API URL and backend availability
- **"CORS policy error"** - Verify frontend URL in backend CORS settings
- **"Server error"** - Check backend logs for details

See [FRONTEND_ERROR_HANDLING_GUIDE.md](FRONTEND_ERROR_HANDLING_GUIDE.md) for complete troubleshooting steps.

---

**Note**: This is a demo application. For production use, ensure proper security configurations and testing.