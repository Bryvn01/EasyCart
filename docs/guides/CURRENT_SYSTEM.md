# EasyCart - Current System Architecture

## 🏗️ System Overview

**EasyCart** is a production-ready e-commerce platform with a modern tech stack:

- **Backend**: Django REST Framework + PostgreSQL
- **Frontend**: React + Material-UI/TailwindCSS
- **Database**: PostgreSQL (unified for all environments)
- **Authentication**: JWT with role-based permissions
- **Deployment**: Render.com (backend) + Vercel (frontend)

## 🗄️ Database Architecture

### PostgreSQL Database
- **Engine**: `django.db.backends.postgresql`
- **Host**: Render.com managed PostgreSQL
- **Features**: ACID compliance, concurrent users, advanced indexing
- **Models**: Products, Categories, Users, Orders, Payments

### Data Structure
```
Categories (12 total)
├── Staples (8 products)
├── Beverages (5 products)
├── Dairy (3 products)
├── Fresh Produce (5 products)
├── Meat & Poultry (3 products)
├── Household (4 products)
├── Personal Care (4 products)
├── Bakery (1 product)
├── Spreads (1 product)
├── Snacks (3 products)
└── Total: 37 products
```

## 🔐 Authentication & Permissions

### Role-Based Access Control
- **superadmin**: Full system access
- **manager**: Product/order management
- **editor**: Product CRUD operations
- **viewer**: Read-only access

### JWT Implementation
- Access tokens (60 min lifetime)
- Refresh tokens (7 days)
- Automatic token rotation
- Secure HTTP-only cookies

## 🚀 API Endpoints

### Core Endpoints
```
GET  /api/products/           # List products with filters
GET  /api/products/{id}/      # Get single product
POST /api/products/           # Create product (editor+)
PUT  /api/products/{id}/      # Update product (editor+)
DELETE /api/products/{id}/    # Delete product (editor+)

GET  /api/products/categories/ # List categories
GET  /api/health/             # Health check
POST /api/auth/login/         # User login
POST /api/auth/register/      # User registration
```

### Features
- Pagination (20 items per page)
- Filtering (category, price range, search)
- Sorting (price, name, date)
- Role-based permissions
- CORS configuration

## 🛠️ Development Setup

### Quick Start
```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_products
python manage.py runserver

# Frontend
cd frontend
npm install
npm start
```

### Environment Variables
```env
# Backend (.env)
SECRET_KEY=your-secret-key
DEBUG=True
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:8000/api
```

## 📊 Production Deployment

### Backend (Render.com)
- **Service**: Web Service
- **Build**: `pip install -r requirements.txt`
- **Start**: `gunicorn ecommerce.wsgi:application`
- **Database**: Managed PostgreSQL
- **Environment**: Production variables set in dashboard

### Frontend (Vercel)
- **Framework**: React
- **Build**: `npm run build`
- **Deploy**: Automatic from Git
- **Environment**: `REACT_APP_API_URL` set to backend URL

## 🔧 Key Features

### Admin Capabilities
- Full CRUD operations on products
- Category management
- User role assignment
- Order tracking
- Inventory management

### Customer Features
- Product browsing with filters
- Shopping cart (localStorage)
- User registration/login
- Order placement
- Mobile-responsive design

### Technical Features
- PostgreSQL ACID transactions
- JWT authentication
- Role-based permissions
- API rate limiting
- CORS security
- Health monitoring
- Audit logging

## 📈 Performance & Scalability

### Database Optimizations
- Indexed fields (name, category, price)
- Connection pooling
- Query optimization
- Pagination for large datasets

### Caching Strategy
- Django cache framework
- Static file caching (WhiteNoise)
- Browser caching headers
- CDN for images (Cloudinary)

### Security Measures
- HTTPS enforcement
- CORS restrictions
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### API Testing
```bash
curl http://localhost:8000/api/health/
curl http://localhost:8000/api/products/
```

## 📚 Documentation

- **README.md**: Main project documentation
- **API Documentation**: Available at `/api/docs/` (if enabled)
- **Environment Setup**: See `.env.example` files
- **Deployment Guides**: In respective deployment sections

## 🔄 Data Flow

1. **User Request** → Frontend (React)
2. **API Call** → Backend (Django REST Framework)
3. **Database Query** → PostgreSQL
4. **Response** → JSON API response
5. **UI Update** → React component re-render

## 🚨 Monitoring & Maintenance

### Health Checks
- `/api/health/` endpoint
- Database connectivity
- System resource monitoring

### Logging
- Django logging framework
- Rotating log files
- Error tracking
- Audit trails

### Backup Strategy
- Automated PostgreSQL backups (Render)
- Code versioning (Git)
- Environment configuration backup

---

**Last Updated**: October 2025
**System Status**: Production Ready ✅
