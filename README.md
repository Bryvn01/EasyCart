Microsoft Windows [Version 10.0.19045.6456]
(c) Microsoft Corporation. All rights reserved.

C:\Users\hp>cd c:\easycart\backend

c:\EasyCart\backend>python manage.py migrate
Traceback (most recent call last):
  File "c:\EasyCart\backend\manage.py", line 22, in <module>
    main()
  File "c:\EasyCart\backend\manage.py", line 18, in main
    execute_from_command_line(sys.argv)
  File "C:\Users\hp\AppData\Local\Programs\Python\Python312\Lib\site-packages\django\core\management\__init__.py", line 419, in execute_from_command_line
    utility.execute()
  File "C:\Users\hp\AppData\Local\Programs\Python\Python312\Lib\site-packages\django\core\management\__init__.py", line 395, in execute
    django.setup()
  File "C:\Users\hp\AppData\Local\Programs\Python\Python312\Lib\site-packages\django\__init__.py", line 24, in setup
    apps.populate(settings.INSTALLED_APPS)
  File "C:\Users\hp\AppData\Local\Programs\Python\Python312\Lib\site-packages\django\apps\registry.py", line 91, in populate
    app_config = AppConfig.create(entry)
                 ^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\hp\AppData\Local\Programs\Python\Python312\Lib\site-packages\django\apps\config.py", line 224, in create
    import_module(entry)
  File "C:\Users\hp\AppData\Local\Programs\Python\Python312\Lib\importlib\__init__.py", line 90, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1387, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1360, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1324, in _find_and_load_unlocked
ModuleNotFoundError: No module named 'simple_history'

c:\EasyCart\backend># EasyCart - E-Commerce Web Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)

![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![Django](https://img.shields.io/badge/django-4.2+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-14+-blue.svg)

A complete e-commerce solution with a React frontend and Django REST Framework backend, featuring PostgreSQL for production data, JWT authentication, Cloudinary image support, and production-ready deployment on Render.

---


## 🏥 Health Check Enhancement (Latest)

**Enhanced health monitoring for production deployments!**

Django backend includes comprehensive health check endpoints with:
- ✅ **Component-based Health Reporting**: Database, memory, and runtime monitoring
- ✅ **Kubernetes Support**: Liveness and readiness probes
- ✅ **Detailed Status Information**: Uptime, response time, version info
- ✅ **Load Balancer Ready**: Proper HTTP status codes (200/503)

**📚 Health Check Documentation:**
- [Health Check Enhancement Guide](HEALTH_CHECK_ENHANCEMENT_PHASE1.md) - Complete implementation details
- [Quick Reference](HEALTH_CHECK_QUICK_REFERENCE.md) - Commands and examples
- [Architecture Diagram](HEALTH_CHECK_ARCHITECTURE.md) - Visual overview

**Endpoints:**
- Django: `GET /api/health/` (port 8000)
- Django Liveness: `GET /api/health/live/` (Kubernetes)
- Django Readiness: `GET /api/health/ready/` (Kubernetes)

---


## 🔧 Products Display Fix (Latest)

**Issue**: Products not displaying on frontend?
**Quick Fix**: Ensure backend is running on Django (port 8000), environment variables are set, and database is seeded.

**Key Checks:**
- Frontend `.env` must use port **8000** (Django backend)
- Backend must be connected to PostgreSQL (production) or SQLite (dev)
- Run validation: `python manage.py check` and `python manage.py seed_products`

📚 **Documentation:**
- [Quick Start Guide](QUICKSTART_PRODUCTS_FIX.md) - 5-minute fix
- [Complete Fix Details](PRODUCTS_DISPLAY_FIX.md) - Full documentation
- [Seeding Guide](DATABASE_SEEDING_GUIDE.md) - Database setup

---


## 🎉 Latest Updates (v4.0)

**Django REST Framework + PostgreSQL Production Integration Complete!**

- ✅ **Django REST Framework Backend**: Robust API with DRF (port 8000)
- ✅ **PostgreSQL Integration**: Products and users stored in PostgreSQL (production)
- ✅ **JWT Authentication**: Login, register, and refresh token endpoints
- ✅ **Clean JSON Serialization**: Proper id, name, price, description, image_url, category fields
- ✅ **Advanced Filtering**: Category, price range, and search filters with pagination
- ✅ **CORS Configuration**: Frontend URL environment variable support
- ✅ **Health Check Endpoint**: Database connection status monitoring
- ✅ **Startup Logging**: Database connection verification on server start

**📚 Documentation:**
- [Django Integration Guide](DJANGO_MONGODB_INTEGRATION.md) - Setup guide (update for PostgreSQL)
- [Enhanced Product API Guide](ENHANCED_PRODUCT_API_GUIDE.md) - API reference
- [Admin Dashboard Integration](ADMIN_DASHBOARD_INTEGRATION_GUIDE.md) - Frontend integration
- [Implementation Summary](IMPLEMENTATION_COMPLETE_SUMMARY.md) - Complete overview


## 🔒 Role-Based Permissions (Admin & API)

EasyCart now supports robust role-based permissions for all admin and API operations. User roles are enforced both in the Django admin and via API endpoints.

**User Roles:**
- `superadmin`: Full access to all admin and API features, including user management and role assignment.
- `manager`: Can manage products, categories, and orders, but cannot assign roles or manage superadmins.
- `editor`: Can create, update, and delete products and categories, but cannot manage users or roles.
- `viewer`: Read-only access to products and categories.

**How Permissions Work:**
- All users are assigned a role (`role` field on User model).
- Role is visible and editable in Django admin (by superadmin/manager only).
- API endpoints for products and categories enforce minimum role requirements:
   - **Create/Update/Delete**: Requires `editor` or higher
   - **Read**: Allowed for all roles
- User registration via API always defaults to `viewer` unless created by a superadmin/manager.
- Custom permission classes (`IsRoleOrReadOnly`, etc.) are used in DRF views for granular control.

**Admin Workflow:**
- Superadmins can assign or change roles for any user in Django admin.
- Managers can assign roles up to `editor`.
- Editors and viewers cannot change roles.
- All role changes are audit-logged (see audit logging section).

**API Example:**
```json
{
   "id": 1,
   "username": "admin",
   "email": "admin@example.com",
   "role": "superadmin",
   ...
}
```

See also: [ADMIN_DASHBOARD_GUIDE.md](ADMIN_DASHBOARD_GUIDE.md) for dashboard usage and [ADMIN_DASHBOARD_API_FIX_SUMMARY.md](ADMIN_DASHBOARD_API_FIX_SUMMARY.md) for API details.

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
- PostgreSQL (production)
- SQLite (development)


**Infrastructure:**
- Cloudinary CDN for image hosting (optional)
- Render for deployment


## 📋 Prerequisites

- Python 3.10+
- PostgreSQL (for production)
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
python -m venv .venv
. .venv/Scripts/activate  # On Windows
# Or: source .venv/bin/activate  # On Mac/Linux
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL URI and Django settings:
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=easycart
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_HOST=localhost
# DB_PORT=5432
# SECRET_KEY=<your_django_secret_key>
# FRONTEND_URL=http://localhost:3000

# Run migrations (for Django models)
python manage.py migrate

# Create superuser (for Django admin)
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


### 4. Seed Products to Database

**Important:** The application requires products in the database to display on the homepage.

```bash
cd backend
python manage.py seed_products
```

Expected output:
```
✓ Connected to PostgreSQL: easycart
✓ Cloudinary configured (or using placeholders)
✓ Seeding complete!
   - Successfully created: 40+ products
   - Total in database: 40+
```

**Note:** The seed script is idempotent - running it multiple times won't create duplicates.

### 5. Verify Setup

Check that products are in MongoDB and images are accessible:

```bash
cd backend
python test_mongodb_integration.py
```

Expected output:
```
✅ MongoDB connection successful!
   Database: easycart
   Products Count: 40+
```


**Test the API directly:**
```bash
# Local testing
curl http://localhost:8000/api/products/

# Production testing
curl https://easycart-j6ue.onrender.com/api/products/
```

Verify the response includes products with both `image` and `image_url` fields.

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
# PostgreSQL (production)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

# Django Security
SECRET_KEY=<your_django_secret_key>
DEBUG=False

# CORS (Frontend URLs)
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Allowed Hosts
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
```


**Frontend (.env):**
```env
# For Local Development:
REACT_APP_API_URL=http://localhost:8000/api

# For Production (Render):
REACT_APP_API_URL=https://easycart-j6ue.onrender.com/api
```

**Important Notes:**
- The backend API runs on **port 8000** (Django REST Framework)
- Ensure `REACT_APP_API_URL` matches your deployed backend URL for production
- For Vercel deployment, set `NEXT_PUBLIC_API_URL` in the Vercel dashboard
- Both environment variables should point to the same backend API endpoint


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
   - **Start Command**: `gunicorn ecommerce.wsgi:application`
   - **Root Directory**: `backend`
4. Add environment variables:
   - `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` (PostgreSQL)
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

### PostgreSQL Setup

1. Create a PostgreSQL database (locally or on a managed service)
2. Create a database user with password
3. Add connection details to your backend `.env` file
4. Run migrations: `python manage.py migrate`
5. Seed products: `python manage.py seed_products`

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
python manage.py seed_products
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
- Check PostgreSQL connection if seeding fails
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
- PostgreSQL connection variables (see backend `.env`)

**Optional (for Cloudinary):**
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Troubleshooting


**PostgreSQL Connection Issues:**
- Ensure PostgreSQL is running locally or your connection string is correct
- Check that `DB_NAME`, `DB_USER`, `DB_PASSWORD`, etc. are set in your `.env` file

**Cloudinary Not Working:**
- If Cloudinary credentials are missing, the script will use source URLs directly
- This is perfectly fine for development and testing

**Products Not Appearing:**
- Check the console output for errors
- Verify MongoDB connection
- Ensure the Product model is correctly defined


**Script Comparison:**

| Feature | `seed_products` (Django) | `seedKenyaProducts.js` (legacy) |
|---------|--------------------------|------------------------|
| Clears existing data | ✅ Yes | ❌ No (non-destructive) |
| Data source | Django fixtures/ORM | External JSON file |
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
# Backend tests
cd backend
python manage.py test

# Test API endpoints
curl http://localhost:8000/api/products
curl http://localhost:8000/api/health

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
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn ecommerce.wsgi:application`
5. Add environment variables in Render Dashboard:
   - `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` (PostgreSQL)
   - `SECRET_KEY` (strong random string)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (optional)
   - `FRONTEND_URL` (your frontend URL)

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


If you're migrating from the old Django or Node.js backend:

1. **Read**: [DJANGO_DEPRECATION_NOTICE.md](DJANGO_DEPRECATION_NOTICE.md)
2. **Export data**: Use Django's dumpdata if needed
3. **Import to PostgreSQL**: Use Django ORM or fixtures
4. **Update frontend**: Ensure API URLs point to Django backend
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

#### No Products Displaying on Homepage

**Symptoms:** Homepage is blank or shows "No products available"

**Solutions:**
1. **Seed the database:**
   ```bash
   cd backend
   python manage.py seed_products
   ```

2. **Verify API URL is correct:**
   - Check `frontend/.env` has: `REACT_APP_API_URL=http://localhost:8000/api`
   - For production: `REACT_APP_API_URL=https://easycart-j6ue.onrender.com/api`
   - For Vercel: Set `NEXT_PUBLIC_API_URL` in Vercel dashboard

3. **Test backend API directly:**
   ```bash
   curl http://localhost:8000/api/products/
   # or for production:
   curl https://easycart-j6ue.onrender.com/api/products/
   ```
   Should return JSON with products array

4. **Check MongoDB connection:**
   ```bash
   cd backend
   python test_mongodb_integration.py
   ```

#### Product Images Not Rendering

**Symptoms:** Products display but images show placeholder boxes or 404 errors

**Solutions:**
1. **Verify image field mapping:**
   - Backend API should return both `image` and `image_url` fields
   - Check API response: `curl http://localhost:8000/api/products/ | jq '.[0]'`

2. **Check Cloudinary configuration (optional):**
   - Images work with placeholder URLs by default
   - For Cloudinary: Set `CLOUDINARY_URL` in backend `.env`
   - Format: `cloudinary://api_key:api_secret@cloud_name`

3. **Verify image URLs in MongoDB:**
   - Images should be full URLs starting with `https://`
   - Run seed script again if images are missing: `python manage.py seed_products --clear`

4. **Frontend fallback is working:**
   - ProductList component shows 📦 emoji when image fails
   - Check browser console for 404 image errors

#### API URL Misconfigurations

**For local development:**
- Backend runs on: `http://localhost:8000`
- Frontend API URL: `http://localhost:8000/api`

**For production:**
- Backend deployed at: `https://easycart-j6ue.onrender.com`
- Frontend API URL: `https://easycart-j6ue.onrender.com/api`
- Set in Vercel dashboard or `.env` file

**Vercel-specific:**
- Use `NEXT_PUBLIC_API_URL` instead of `REACT_APP_API_URL` for Next.js
- Set in: Vercel Dashboard → Project Settings → Environment Variables

See [FRONTEND_ERROR_HANDLING_GUIDE.md](FRONTEND_ERROR_HANDLING_GUIDE.md) for complete troubleshooting steps.

---


**Note**: This is a demo application. For production use, ensure proper security configurations and testing.

## Monitoring & Observability

- **Backend logs:** See `backend/logs/django.log` or use `docker compose logs backend`.
- **Frontend errors:** Use browser console (F12 > Console tab).
- **Optional:** Integrate Sentry for error tracking (see `docs/monitoring.md`).

#
# EasyCart Security, Rate Limiting, and DevOps Documentation
#

## Security & Rate Limiting
- All API endpoints are protected by global rate limiting (100 requests/min/IP) using `django-ratelimit`.
- Login endpoint is protected with 5 attempts/min/IP to prevent brute-force attacks.
- Security headers (HSTS, X-Frame-Options, XSS, etc.) and SSL are enforced in production.
- JWT authentication and role-based permissions are used for all sensitive endpoints.
- Audit logging is enabled via `django-simple-history` and rotating log files.
- Input is sanitized to prevent injection and path traversal.
- Automated security scanning (Bandit) is run in CI.
- CSRF protection and CORS restrictions are enabled.
- File upload limits are enforced.

## DevOps & CI/CD
- GitHub Actions CI runs lint, tests, coverage, and Bandit security scan on every push.
- Docker and Docker Compose are used for local and production deployments.
- Monitoring and logging are documented in `docs/monitoring.md`.
- All environment variables are managed via `.env` and documented in `ENVIRONMENT_VARIABLES_QUICK_REFERENCE.md`.

## GitHub Usage
- All changes are committed and pushed to the `main` branch.
- Pull requests are recommended for major features or fixes.
- CI status must be green before merging.

---

For more details, see:
- `docs/SECURITY.md` (security best practices)
- `docs/monitoring.md` (monitoring/logging)
- `ENVIRONMENT_VARIABLES_QUICK_REFERENCE.md` (env vars)
- `.github/workflows/ci.yml` (CI/CD config)
- `backend/ecommerce/settings.py` (Django settings)
- `README.md` (project overview)