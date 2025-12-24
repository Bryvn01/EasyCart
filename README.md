# EasyCart

[![CI/CD](https://github.com/Bryvn01/EasyCart/workflows/CI-CD-Pipeline/badge.svg)](https://github.com/Bryvn01/EasyCart/actions)
[![codecov](https://codecov.io/gh/Bryvn01/EasyCart/branch/main/graph/badge.svg)](https://codecov.io/gh/Bryvn01/EasyCart)
[![Test Coverage](https://img.shields.io/badge/coverage-53%25-yellow.svg)](https://codecov.io/gh/Bryvn01/EasyCart)
[![Python 3.12](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Django 6.0](https://img.shields.io/badge/django-6.0-green.svg)](https://www.djangoproject.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Production-ready e-commerce platform with Django REST Framework backend and React frontend. Features JWT authentication, role-based permissions, M-Pesa integration, and automated CI/CD.

## Live Demo

- Frontend: https://easycart-frontend-wj9x.onrender.com
- Admin: https://easycart-admin-08xf.onrender.com
- API: https://easycart-backend-2k8l.onrender.com/api

## Features

- Product catalog with search, filtering, and pagination
- Shopping cart and checkout workflow
- JWT authentication with OTP and 2FA support
- Role-based access control (superadmin, manager, editor, viewer)
- Admin dashboard with analytics
- M-Pesa payment integration
- Cloudinary image management
- PostgreSQL database with Redis caching

## Tech Stack

**Backend:** Django 5.2, DRF 3.16, PostgreSQL 14+, Redis 7+, Celery
**Frontend:** React 18, TailwindCSS, Axios, React Router
**Deployment:** Render.com, Cloudinary CDN

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure database, Redis, and secrets
python manage.py migrate
python manage.py seed_products
python manage.py createsuperuser
python manage.py runserver  # http://localhost:8000
```

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
# Backend tests (53% coverage, targeting 80%)
cd backend
python manage.py test --keepdb --verbosity=2
python -m coverage run --source='apps' manage.py test --keepdb
python -m coverage report
python -m coverage html  # View coverage report in htmlcov/

# Frontend tests
cd frontend
npm test

# Run all tests in CI/CD
# Tests automatically run on PR/push via GitHub Actions
```

**Test Coverage:** 53% (200+ tests) | **Target:** 80%
- Accounts: 96% coverage
- Products: 90% coverage
- Orders: 95% coverage
- Payments: 92% coverage
- Admin Dashboard: 90% coverage (newly added)
- Core Middleware: 55% coverage (newly added)
- POS System: 64% coverage (newly added)

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
