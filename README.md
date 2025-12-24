# EasyCart

[![CI/CD](https://github.com/Bryvn01/EasyCart/workflows/CI-CD-Pipeline/badge.svg)](https://github.com/Bryvn01/EasyCart/actions)
[![codecov](https://codecov.io/gh/Bryvn01/EasyCart/branch/main/graph/badge.svg)](https://codecov.io/gh/Bryvn01/EasyCart)
[![Test Coverage](https://img.shields.io/badge/coverage-70%25-brightgreen.svg)](https://codecov.io/gh/Bryvn01/EasyCart)
[![Python 3.12](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Django 6.0](https://img.shields.io/badge/django-6.0-green.svg)](https://www.djangoproject.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Production-ready e-commerce platform with Django REST Framework backend and React frontend. Features JWT authentication, role-based permissions, M-Pesa integration, and automated CI/CD.

## Live Demo

- Frontend: https://easycart-frontend-wj9x.onrender.com
- Admin: https://easycart-admin-08xf.onrender.com
- API: https://easycart-backend-2k8l.onrender.com/api

## Features

### Core E-commerce
- **Product Catalog** - Search, filtering, pagination, and category management
- **Shopping Cart** - Real-time cart management with offline support
- **Checkout Flow** - Multi-step checkout with address validation
- **Order Management** - Order tracking, history, and status updates

### Authentication & Security
- **JWT Authentication** - Secure token-based authentication
- **2FA Support** - Two-factor authentication with OTP
- **Role-Based Access Control** - Superadmin, manager, editor, and viewer roles
- **Rate Limiting** - API rate limiting to prevent abuse

### Payment Integration
- **Stripe** - Credit/debit card payments
- **M-Pesa** - Mobile money integration for African markets

### Admin Features
- **Analytics Dashboard** - Sales metrics, revenue tracking, user insights
- **User Management** - Role assignment, permissions, user activity
- **Content Management** - Product management, order processing

### Infrastructure
- **PostgreSQL** - Robust relational database
- **Redis** - Session management and caching
- **Cloudinary** - Image CDN and optimization
- **Celery** - Background task processing

## Tech Stack

**Backend:** Django 6.0, DRF 3.16, PostgreSQL 14+, Redis 7+, Celery
**Frontend:** React 18, TailwindCSS, Axios, React Router
**Mobile:** React Native, Expo, TypeScript
**Deployment:** Render.com, Cloudinary CDN, GitHub Actions CI/CD

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure database, Redis, and secrets
python manage.py migrate
python manage.py seed_products
python manage.py createsuperuser
python manage.py runserver  # http://localhost:8000
```

> **Note:** Ensure PostgreSQL and Redis services are running before starting the backend.

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Set REACT_APP_API_URL=http://localhost:8000/api
npm start  # http://localhost:3000
```

### Admin Dashboard
```bash
cd admin-dashboard
npm install
cp .env.example .env
npm start
```

## Testing

```bash
# Backend tests (70%+ coverage)
cd backend
python manage.py test --keepdb --verbosity=2 --parallel=2
python -m coverage run --source='apps' manage.py test --keepdb
python -m coverage report
python -m coverage html  # View coverage report in htmlcov/

# Frontend tests
cd frontend
npm test

# Run all tests in CI/CD
# Tests automatically run on PR/push via GitHub Actions
```

**Test Coverage:** 70%+ (515+ tests) | **Target:** 80%
- Accounts: 96% coverage (authentication, registration, profiles)
- Products: 90% coverage (catalog, search, filtering)
- Orders: 95% coverage (cart, checkout, order management)
- Payments: 92% coverage (Stripe, M-Pesa integration)
- Admin Dashboard: 90% coverage (analytics, role management)
- Core Middleware: 85% coverage (auth, rate limiting)
- POS System: 82% coverage (point of sale operations)

## API Documentation

See [API Docs](docs/api/) for complete endpoint documentation.

Key endpoints:
- `GET /api/products/` - List products with filters
- `POST /api/auth/login/` - User authentication
- `POST /api/cart/add/` - Add item to cart
- `POST /api/orders/create/` - Create order
- `POST /api/payments/mpesa/` - M-Pesa payment

## Deployment

See [Deployment Guide](docs/deployment/) for production setup on Render, Azure, or Railway.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Documentation

- [Setup Guide](docs/setup/)
- [Architecture](docs/architecture/)
- [API Reference](docs/api/)
- [Deployment](docs/deployment/)
- [Security](docs/security/)
