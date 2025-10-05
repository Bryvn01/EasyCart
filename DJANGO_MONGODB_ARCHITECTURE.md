# EasyCart Django + MongoDB Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────┐        │
│  │   React Frontend     │         │   Admin Dashboard    │        │
│  │   (Port 3000)        │         │   (Port 3001)        │        │
│  │                      │         │                      │        │
│  │  • Product listing   │         │  • Product CRUD      │        │
│  │  • Shopping cart     │         │  • Inventory mgmt    │        │
│  │  • Checkout flow     │         │  • Analytics         │        │
│  │  • User auth         │         │  • User management   │        │
│  └──────────────────────┘         └──────────────────────┘        │
│           │                                 │                      │
│           │ REACT_APP_API_URL               │ REACT_APP_API_URL   │
│           │ (http://localhost:8000/api)     │                      │
└───────────┼─────────────────────────────────┼──────────────────────┘
            │                                 │
            └─────────────┬───────────────────┘
                          │
                          │ HTTP/HTTPS
                          │ JSON API
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │        Django REST Framework Backend (Port 8000)          │    │
│  │                                                            │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │              URL Router (urls.py)                  │   │    │
│  │  │                                                     │   │    │
│  │  │  /api/products/        → ProductListView          │   │    │
│  │  │  /api/products/<id>/   → ProductDetailView        │   │    │
│  │  │  /api/products/categories/ → CategoryListView     │   │    │
│  │  │  /api/auth/login/      → JWT Login                │   │    │
│  │  │  /api/auth/register/   → User Registration        │   │    │
│  │  │  /api/auth/token/refresh/ → Token Refresh         │   │    │
│  │  │  /api/health/          → Health Check             │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  │                                                            │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │         DRF Views (apps/products/views.py)         │   │    │
│  │  │                                                     │   │    │
│  │  │  • ProductListView      (APIView)                  │   │    │
│  │  │    - GET: List products with filters              │   │    │
│  │  │    - Pagination: 20 per page                      │   │    │
│  │  │    - Filters: category, search, price range       │   │    │
│  │  │    - Ordering: by any field                       │   │    │
│  │  │                                                     │   │    │
│  │  │  • ProductDetailView    (APIView)                  │   │    │
│  │  │    - GET: Single product by ID                    │   │    │
│  │  │                                                     │   │    │
│  │  │  • CategoryListView     (APIView)                  │   │    │
│  │  │    - GET: List all categories                     │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  │                                                            │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │     MongoDB Utilities (mongodb_utils.py)           │   │    │
│  │  │                                                     │   │    │
│  │  │  • MongoDBConnection    (Singleton)                │   │    │
│  │  │    - Connection pooling                           │   │    │
│  │  │    - Error handling                               │   │    │
│  │  │    - Auto-reconnect                               │   │    │
│  │  │                                                     │   │    │
│  │  │  • get_products_from_mongodb()                     │   │    │
│  │  │    - Query builder                                │   │    │
│  │  │    - Pagination logic                             │   │    │
│  │  │    - JSON serialization                           │   │    │
│  │  │                                                     │   │    │
│  │  │  • serialize_mongodb_doc()                         │   │    │
│  │  │    - ObjectId → string conversion                 │   │    │
│  │  │    - Nested object handling                       │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  │                                                            │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │       Middleware & Security                        │   │    │
│  │  │                                                     │   │    │
│  │  │  • CORS Headers   (django-cors-headers)            │   │    │
│  │  │  • JWT Auth       (simplejwt)                      │   │    │
│  │  │  • Throttling     (DRF rate limiting)              │   │    │
│  │  │  • HTTPS Redirect (production)                     │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          │ PyMongo
                          │ (MONGO_URI)
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │         MongoDB Atlas (easycart database)                 │    │
│  │                                                            │    │
│  │  📦 Collections:                                          │    │
│  │                                                            │    │
│  │  • products                                               │    │
│  │    {                                                       │    │
│  │      _id: ObjectId("..."),                                │    │
│  │      name: "Unga wa Dola Maize Flour 2kg",               │    │
│  │      price: 210,                                          │    │
│  │      category: "Groceries",                               │    │
│  │      description: "Premium maize flour...",               │    │
│  │      image: "https://res.cloudinary.com/.../jogoo.jpg",   │    │
│  │      brand: "Dola",                                        │    │
│  │      stock: 150,                                          │    │
│  │      sku: "PRD-1234567890-abc123-unga-wa-do",            │    │
│  │      slug: "unga-wa-dola-maize-flour-2kg",               │    │
│  │      createdAt: ISODate("2024-01-01T00:00:00Z")          │    │
│  │    }                                                       │    │
│  │                                                            │    │
│  │  • categories                                             │    │
│  │    {                                                       │    │
│  │      _id: ObjectId("..."),                                │    │
│  │      name: "Groceries",                                   │    │
│  │      slug: "groceries",                                   │    │
│  │      description: "Fresh produce, pantry staples..."      │    │
│  │    }                                                       │    │
│  │                                                            │    │
│  │  📊 Indexes:                                              │    │
│  │    • category (ascending)                                 │    │
│  │    • price (ascending)                                    │    │
│  │    • name (text index)                                    │    │
│  │    • createdAt (descending)                               │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │    Django Database (SQLite/PostgreSQL)                    │    │
│  │                                                            │    │
│  │  📦 Tables:                                                │    │
│  │                                                            │    │
│  │  • auth_user            (Django authentication)           │    │
│  │  • django_session       (Session management)              │    │
│  │  • auth_permission      (User permissions)                │    │
│  │                                                            │    │
│  │  ⚠️  Note: Product data NOT stored here                   │    │
│  │           Products fetched from MongoDB only              │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow Example: GET /api/products/?category=Electronics

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. HTTP GET /api/products/?category=Electronics
       ▼
┌─────────────────────────────────────────────┐
│         Django URL Router                   │
│  urls.py → path('', ProductListView)       │
└──────┬──────────────────────────────────────┘
       │ 2. Route to ProductListView.get()
       ▼
┌─────────────────────────────────────────────┐
│         ProductListView (APIView)           │
│  - Parse query params                       │
│  - Extract: category="Electronics"          │
│  - Call: get_products_from_mongodb()       │
└──────┬──────────────────────────────────────┘
       │ 3. Query MongoDB
       ▼
┌─────────────────────────────────────────────┐
│      mongodb_utils.py                       │
│  - Build query: {category: "Electronics"}  │
│  - Execute: products.find({...})           │
│  - Apply pagination (skip/limit)           │
│  - Serialize ObjectIds to strings          │
└──────┬──────────────────────────────────────┘
       │ 4. MongoDB query
       ▼
┌─────────────────────────────────────────────┐
│         MongoDB Atlas                       │
│  - Execute query on products collection    │
│  - Return: 6 electronics products          │
└──────┬──────────────────────────────────────┘
       │ 5. Return documents
       ▼
┌─────────────────────────────────────────────┐
│      mongodb_utils.py                       │
│  - Serialize: _id → id                     │
│  - Format response                          │
└──────┬──────────────────────────────────────┘
       │ 6. Return serialized data
       ▼
┌─────────────────────────────────────────────┐
│      ProductListView                        │
│  - Build pagination metadata               │
│  - Return Response()                        │
└──────┬──────────────────────────────────────┘
       │ 7. JSON response
       ▼
┌─────────────────────────────────────────────┐
│         Browser                             │
│  Receives:                                  │
│  {                                          │
│    "count": 6,                             │
│    "next": false,                          │
│    "previous": false,                      │
│    "results": [                            │
│      {                                      │
│        "id": "507f...",                    │
│        "name": "Samsung Galaxy A14",       │
│        "price": 24999,                     │
│        "category": "Electronics",          │
│        ...                                  │
│      }                                      │
│    ]                                        │
│  }                                          │
└─────────────────────────────────────────────┘
```

## Authentication Flow: JWT Login

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /api/auth/login/
       │    { email, password }
       ▼
┌─────────────────────────────────────────────┐
│         Django URL Router                   │
│  urls.py → path('login/', login)           │
└──────┬──────────────────────────────────────┘
       │ 2. Route to login view
       ▼
┌─────────────────────────────────────────────┐
│    accounts/views.py: login()               │
│  - Validate credentials                     │
│  - Authenticate user                        │
│  - Generate JWT tokens                      │
└──────┬──────────────────────────────────────┘
       │ 3. Query Django database
       ▼
┌─────────────────────────────────────────────┐
│    Django Database (SQLite/PostgreSQL)      │
│  - SELECT * FROM auth_user                  │
│    WHERE email='...'                        │
│  - Verify password hash                     │
└──────┬──────────────────────────────────────┘
       │ 4. User authenticated
       ▼
┌─────────────────────────────────────────────┐
│    djangorestframework-simplejwt            │
│  - Generate access token (60 min)          │
│  - Generate refresh token (7 days)         │
└──────┬──────────────────────────────────────┘
       │ 5. Return tokens
       ▼
┌─────────────────────────────────────────────┐
│         Browser                             │
│  Receives:                                  │
│  {                                          │
│    "user": {...},                          │
│    "access": "eyJ0eXAi...",                │
│    "refresh": "eyJ0eXAi..."                │
│  }                                          │
│                                             │
│  Stores tokens in localStorage              │
└─────────────────────────────────────────────┘
```

## Environment Configuration

```
┌──────────────────────────────────────────────────────────────┐
│                    Environment Variables                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Backend (.env):                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  MONGO_URI=mongodb+srv://...@cluster.mongodb.net/  │    │
│  │  SECRET_KEY=django-secret-key                      │    │
│  │  DEBUG=False                                        │    │
│  │  FRONTEND_URL=https://easycart.com                 │    │
│  │  CORS_ALLOWED_ORIGINS=https://easycart.com,...     │    │
│  │  ALLOWED_HOSTS=easycart-backend.onrender.com       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Frontend (.env):                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  REACT_APP_API_URL=https://api.easycart.com/api   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                                   │
│  • HTTPS/TLS encryption                                      │
│  • HSTS headers                                              │
│  • Secure cookie flags                                       │
└──────────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 2: CORS Protection                                    │
│  • Origin validation (CORS_ALLOWED_ORIGINS)                  │
│  • Credentials control                                       │
│  • Method restrictions                                       │
└──────────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 3: Authentication & Authorization                     │
│  • JWT token validation                                      │
│  • Token expiration (60 min access, 7 days refresh)         │
│  • User permission checks                                    │
└──────────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 4: Input Validation                                   │
│  • Price range validation (NaN, infinity checks)             │
│  • Query parameter sanitization                              │
│  • DRF serializer validation                                 │
└──────────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 5: Database Security                                  │
│  • MongoDB Atlas network access control                      │
│  • Database user with specific permissions                   │
│  • Encrypted connections (SSL/TLS)                           │
│  • IP whitelist                                              │
└──────────────────────────────────────────────────────────────┘
```

## Deployment Architecture (Render)

```
┌──────────────────────────────────────────────────────────────┐
│                    Render Platform                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Web Service: easycart-backend                     │    │
│  │                                                     │    │
│  │  Build:  pip install -r requirements.txt           │    │
│  │  Start:  gunicorn ecommerce.wsgi:application       │    │
│  │  Port:   Auto-assigned by Render                   │    │
│  │  Health: /api/health/ (monitored)                  │    │
│  │                                                     │    │
│  │  Environment Variables:                            │    │
│  │    - MONGO_URI                                      │    │
│  │    - SECRET_KEY                                     │    │
│  │    - DEBUG=False                                    │    │
│  │    - ALLOWED_HOSTS=*.onrender.com                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Static Site: easycart-frontend                    │    │
│  │                                                     │    │
│  │  Build:  npm install && npm run build              │    │
│  │  Serve:  Static files from /build                  │    │
│  │                                                     │    │
│  │  Environment Variables:                            │    │
│  │    - REACT_APP_API_URL=https://backend.onrender.com│    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ External Services
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  External Services                                           │
│                                                              │
│  • MongoDB Atlas     (database cluster)                      │
│  • Cloudinary        (image CDN - optional)                  │
│  • SendGrid          (email - optional)                      │
└──────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Why PyMongo Instead of Djongo?
- **Problem**: Djongo incompatible with Django 4.x
- **Solution**: Use PyMongo for direct MongoDB access
- **Benefit**: Full MongoDB feature set, no version conflicts

### 2. Why Separate Databases?
- **Django ORM**: User authentication, sessions, admin
- **MongoDB**: Product catalog, flexible schema
- **Benefit**: Best tool for each job

### 3. Why Custom Serialization?
- **Problem**: MongoDB ObjectId not JSON-serializable
- **Solution**: Custom `serialize_mongodb_doc()` function
- **Benefit**: Clean `id` field in API responses

### 4. Why Graceful Startup?
- **Problem**: MongoDB unavailable blocks development
- **Solution**: Skip MongoDB check for management commands
- **Benefit**: Can run migrations, tests without live DB

---

**Architecture Version**: 3.0  
**Last Updated**: 2024-10-05  
**Status**: ✅ Production Ready
