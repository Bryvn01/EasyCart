# EasyCart - E-Commerce Web Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![Django](https://img.shields.io/badge/django-4.2+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-13+-blue.svg)

A complete e-commerce solution with React frontend and Django REST Framework backend, featuring PostgreSQL database, JWT authentication, superadmin CRUD operations, and production deployment on Render.

## 🌍 Live Demo

- **Frontend**: https://easycart-frontend-wj9x.onrender.com/
- **Admin Dashboard**: https://easycart-admin-08xf.onrender.com/
- **Django Admin**: https://easycart-backend-2k8l.onrender.com/admin/
- **API**: https://easycart-backend-2k8l.onrender.com/api/

---

## ✨ Key Features

- 🛍️ **Full E-commerce Functionality** - Product catalog, cart, checkout, orders
- 👨‍💼 **Superadmin CRUD** - Complete product/category management with real-time sync
- 🔐 **JWT Authentication** - Secure user authentication with role-based permissions
- 📱 **Responsive Design** - Mobile-first React frontend with TailwindCSS
- 🖼️ **Image Management** - Cloudinary integration for optimized image delivery
- 💳 **Payment Integration** - M-Pesa payment gateway for Kenyan market
- 🔍 **Advanced Search** - Product filtering, search, and pagination
- 📄 **Admin Analytics** - Dashboard with sales metrics and inventory tracking


## 🔒 Role-Based Permissions

**User Roles:**
- `superadmin`: Full access to all admin and API features
- `manager`: Can manage products, categories, and orders
- `editor`: Can edit products and categories
- `viewer`: Read-only access

**Features:**
- JWT token authentication
- Role-based API permissions
- Django admin integration
- Secure endpoint protection


## 🚀 Superadmin CRUD Operations

**Admin Features:**
- Full CRUD for products, categories, and orders
- Bulk operations (delete, update stock)
- Real-time sync between Django admin and frontend
- Advanced filtering and search
- Image upload and management
- Inventory tracking and analytics

**Admin Endpoints:**
- `/api/products/admin/products/` - Product management
- `/api/products/admin/categories/` - Category management
- `/api/orders/admin/orders/` - Order management
## 🛠️ Tech Stack

**Backend:**
- Django 4.2+ with Django REST Framework
- PostgreSQL database
- JWT authentication (SimpleJWT)
- Cloudinary for media storage
- Celery for background tasks

**Frontend:**
- React 18+ with Hooks
- React Router for navigation
- Axios for API communication
- TailwindCSS for styling
- React Query for state management

**Deployment:**
- Backend: Render.com
- Frontend: Render.com Static Site
- Database: PostgreSQL on Render
- CDN: Cloudinary
## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 16+
- PostgreSQL 13+

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate  # On Windows
# Or: source .venv/bin/activate  # On Mac/Linux
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL settings:
# SECRET_KEY=<your_django_secret_key>
# DEBUG=True
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=easycart
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password
# DB_HOST=your_db_host
# DB_PORT=5432
# CORS_ALLOWED_ORIGINS=http://localhost:3000

# Run migrations
python manage.py migrate

python manage.py seed_products
python manage.py createsuperuser
python manage.py runserver
# Server runs on http://localhost:8000
```

### 2. Frontend Setup
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


### 3. Admin Dashboard Setup
```bash
cd admin-dashboard
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:8000/api

npm start
```

### 4. Seed Database

```bash
cd backend
python manage.py seed_products
```

This creates 37 authentic Kenyan products across 12 categories. The command is idempotent - safe to run multiple times.

### 5. Verify Setup

```bash
# Test API endpoints
curl http://localhost:8000/api/products/
curl http://localhost:8000/api/products/categories/
curl http://localhost:8000/api/health/
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

Returns PostgreSQL connection status and database info.



## 📁 Project Structure

```
EasyCart/
├── backend/              # Django REST API
│   ├── apps/
│   │   ├── accounts/     # User authentication
│   │   ├── products/     # Product management
│   │   ├── orders/       # Order processing
│   │   └── payments/     # Payment integration
│   ├── ecommerce/        # Django settings
│   └── requirements.txt
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── context/      # React context
│   └── package.json
├── admin-dashboard/      # Admin React app
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
# Django Settings
SECRET_KEY=<your_django_secret_key>
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost,yourdomain.com

# PostgreSQL Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Payment Gateway (M-Pesa)
MPESA_CONSUMER_KEY=<your_mpesa_consumer_key>
MPESA_CONSUMER_SECRET=<your_mpesa_consumer_secret>
MPESA_PASSKEY=<your_mpesa_passkey>
MPESA_CALLBACK_URL=http://localhost:8000/api/payments/mpesa/callback/
```

**Frontend (.env):**
```env
# Local Development
REACT_APP_API_URL=http://localhost:8000/api

# Production
REACT_APP_API_URL=https://your-backend-domain.com/api
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

### Database Setup

**PostgreSQL** (recommended for all environments):
1. Create PostgreSQL database
2. Update `.env` with connection details
3. Run: `python manage.py migrate`
4. Seed: `python manage.py seed_products`

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
   python -c "import os; from decouple import config; print('Cloudinary:', 'Configured ✓' if config('CLOUDINARY_CLOUD_NAME', default=None) else 'Not configured ✗')"
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
```
🌱 Starting product seeding process...
📦 Connecting to PostgreSQL...
✅ Connected to database

🧹 Clearing existing products and categories...
✅ Cleared existing data

📁 Creating categories...
✅ Created 15 categories

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



## 🔧 Environment Configuration

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
- Verify PostgreSQL connection
- Ensure the Product model is correctly defined


**Script Comparison:**

| Feature | `seed_products` (Django) | `seedKenyaProducts.js` (legacy) |
|---------|--------------------------|------------------------|
| Clears existing data | ✅ Yes | ❌ No (non-destructive) |
| Data source | Django fixtures/ORM | External JSON file |
| Duplicate handling | Replaces all | Skips existing |
| Use case | Fresh database setup | Adding more products |

## 📡 API Endpoints

### Public Endpoints
- `GET /api/products/` - List products with filtering
- `GET /api/products/{id}/` - Product details
- `GET /api/products/categories/` - List categories
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login

### Admin Endpoints (Authentication Required)
- `GET/POST /api/products/admin/products/` - Product CRUD
- `PUT/DELETE /api/products/admin/products/{id}/` - Update/delete product
- `POST /api/products/admin/products/bulk_delete/` - Bulk delete
- `PATCH /api/products/admin/products/{id}/update_stock/` - Stock management
- `GET/POST /api/products/admin/categories/` - Category CRUD

## 🧪 Testing & Validation


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

## 📦 Deployment & Production


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

## 🏗️ Architecture

**Current System:**
- **Backend**: Django REST Framework with PostgreSQL
- **Frontend**: React with Material-UI/TailwindCSS
- **Database**: PostgreSQL (unified for all environments)
- **Authentication**: JWT with role-based permissions
- **Deployment**: Render.com (backend) + Vercel (frontend)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security & Compliance

- Never commit `.env` files
- Use strong secret keys in production
- Enable HTTPS in production
- Regularly update dependencies

## 📞 Support & Contact

If you have any questions or issues, please open an issue on GitHub.

### 🔍 Troubleshooting

If you're experiencing issues with product/category loading or other errors:

1. Review error messages in browser console (F12)
2. Verify API endpoint configuration
3. Check backend service status if deployed
4. Ensure CORS settings are correct

**Common Issues:**
- **"Network error"** - Check API URL and backend availability
- **"CORS policy error"** - Verify frontend URL in backend CORS settings
- **"Server error"** - Check backend logs for details

#### No Products Displaying

**Solutions:**
1. **Seed the database:**
   ```bash
   cd backend
   python manage.py seed_products
   ```

2. **Verify API URL:**
   - Local: `REACT_APP_API_URL=http://localhost:8000/api`
   - Production: `REACT_APP_API_URL=https://your-backend.com/api`

3. **Test API:**
   ```bash
   curl http://localhost:8000/api/products/
   curl http://localhost:8000/api/health/
   ```

#### Images Not Loading

**Solutions:**
1. **Check image URLs:**
   ```bash
   curl http://localhost:8000/api/products/ | grep image
   ```

2. **Frontend fallback:**
   - Components show placeholders for missing images
   - Check browser console for 404 errors

#### API URL Misconfigurations

**Local Development:**
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- API URL: `http://localhost:8000/api`

**Production:**
- Set `REACT_APP_API_URL` to your deployed backend URL



---


**Note**: This is a demo application. For production use, ensure proper security configurations and testing.

## 🔒 Security Features

- JWT token authentication
- CORS protection
- Rate limiting (100 req/min)
- Input sanitization
- HTTPS enforcement
- Security headers (HSTS, XSS protection)
- Role-based permissions

---

**Live Application**: https://easycart-frontend-wj9x.onrender.com/