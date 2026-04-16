# EasyCart

[![CI-CD-Pipeline](https://github.com/Bryvn01/EasyCart/workflows/CI-CD-Pipeline/badge.svg)](https://github.com/Bryvn01/EasyCart/actions/workflows/ci.yml)
[![Codecov](https://codecov.io/gh/Bryvn01/EasyCart/branch/main/graph/badge.svg)](https://codecov.io/gh/Bryvn01/EasyCart)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Last verified on **2026-04-16** against commit **`9108d61375a90640003f2218ec99391f55d04ac9`**.

## Project Overview

EasyCart is a multi-app e-commerce monorepo with:
- A Django REST backend (`backend/`)
- A web customer frontend (`frontend/`)
- A React admin dashboard (`admin-dashboard/`)
- A React Native mobile app (`mobile/`)

## Current System Architecture

- **Primary API backend:** Django + DRF in `backend/` (`backend/manage.py`, `backend/ecommerce/settings.py`)
- **Auth:** JWT (`rest_framework_simplejwt`), OTP login flows, and admin 2FA endpoints (`backend/apps/accounts/`)
- **Payments:** M-Pesa gateway + webhook handling, plus Stripe/PayPal/Flutterwave code paths (`backend/apps/payments/`, `backend/apps/orders/`)
- **Caching/async:** Redis + Celery configuration in Django settings (`backend/ecommerce/settings.py`)
- **Web clients:** React app plus Next.js files in `frontend/` (hybrid structure; both `react-scripts` and `next` scripts exist)

## Monorepo Structure

```text
backend/            Django REST API + business logic
frontend/           Customer web app (React + Next.js assets/scripts)
admin-dashboard/    Admin web app (React)
mobile/             React Native mobile app
docs/               Setup, deployment, API, security, testing guides
.github/workflows/  CI/CD, security, deployment automation workflows
```

## Verified Feature Matrix

| Area | Status | Evidence |
|---|---|---|
| Product catalog, categories, search/filter APIs | Implemented | `backend/apps/products/`, `backend/ecommerce/urls.py` |
| Cart, checkout, orders | Implemented | `backend/apps/orders/` |
| JWT auth + refresh | Implemented | `backend/ecommerce/settings.py`, `backend/apps/accounts/urls.py` |
| OTP request/verify/resend flows | Implemented | `backend/apps/accounts/otp_views.py` |
| Admin 2FA endpoints | Implemented | `backend/apps/accounts/two_factor_views.py` |
| Role-based permissions (superadmin/manager/editor/viewer) | Implemented | `backend/apps/accounts/permissions.py`, `backend/apps/accounts/models.py` |
| M-Pesa payments + callback processing | Implemented | `backend/apps/payments/gateways/mpesa_gateway.py` |
| Webhook signature verification (production mode) | Implemented | `backend/utils/security_helpers.py` |
| Idempotency protection for order/payment paths | Partial | `backend/apps/orders/idempotency.py` |
| Admin dashboard APIs and UI | Implemented | `admin-dashboard/src/services/api.js`, `backend/apps/admin_dashboard/` |
| Mobile parity with web features | Partial | `mobile/src/` and mobile docs indicate ongoing implementation |

## Quick Start

### 1) Backend (Django API on `http://localhost:8000`)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_products
python manage.py runserver
```

### 2) Frontend (React dev server on `http://localhost:3000`)

```bash
cd frontend
npm ci
cp .env.example .env
npm start
```

### 3) Admin Dashboard (default React port is also 3000)

Run on another port when frontend is already running:

```bash
cd admin-dashboard
npm ci
cp .env.example .env
PORT=3001 npm start
```

### 4) Mobile (React Native)

```bash
cd mobile
npm ci
cp .env.example .env
npm start
```

## Environment Variables by Service

### Backend (`backend/.env`)

Minimum boot configuration from `backend/.env.example` + `backend/ecommerce/settings.py`:
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- Database: either `DATABASE_URL` **or** `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `CORS_ALLOWED_ORIGINS`
- Optional but used by implemented features: `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`, `SENTRY_DSN`, `TWILIO_*`, `MPESA_*`, `CLOUDINARY_*`, email settings

### Frontend (`frontend/.env`)

Used in code:
- `REACT_APP_API_URL` (required for API client)
- `NEXT_PUBLIC_API_URL` (Next.js routes/tests)
- Optional: `NEXT_PUBLIC_SENTRY_DSN`, `REACT_APP_FIREBASE_*`, `REACT_APP_API_BASE_URL`, `REACT_APP_SITE_URL`, `REACT_APP_VERSION`

### Admin Dashboard (`admin-dashboard/.env`)

Used in code:
- `REACT_APP_API_URL` (required)

### Mobile (`mobile/.env`)

`mobile/.env.example` is present, but runtime API base URL in `mobile/src/api/client.ts` is currently hardcoded by platform/dev mode logic.
For local mobile testing, update `API_BASE_URL` in `mobile/src/api/client.ts` to your machine/LAN reachable backend URL.

## Testing & Coverage

### Local commands

- **Backend:** `python manage.py test --verbosity=2 --keepdb`
- **Frontend:** `npm test -- --watchAll=false --passWithNoTests`, `npm run lint`, `npm run build`
- **Admin dashboard:** `CI=true npm test -- --watchAll=false --passWithNoTests`, `npm run build`
- **Mobile:** `npm test`, `npm run lint`, `npm run type-check`

## Coverage source of truth

- CI uploads backend/frontend coverage to Codecov (`.github/workflows/reusable-test.yml`)
- Coverage thresholds are configured in both `.codecov.yml` and `codecov.yml` (maintainers should consolidate to one file)
- This README intentionally avoids hard-coded global coverage percentages

## CI/CD

Key workflows in `.github/workflows/`:
- `ci.yml` (**CI-CD-Pipeline**): push/PR/manual, runs reusable test workflow + security audit job
- `reusable-test.yml` (**Reusable Test Workflow**): backend lint/tests/coverage, frontend lint/tests/build
- `required-checks.yml` (**Required Checks**): additional test/build gate for push/PR
- `render-ci.yml` (**EasyCart CI (Render)**): main/PR CI wrapper around reusable tests
- `staging-deploy.yml` (**Deploy to Render Staging**): dependabot PR staging deploy trigger
- `post-deployment-verification.yml`: scheduled/manual health/API checks against deployed endpoints
- `codeql.yml`, `security-audit.yml`: static/security scanning

Deployment configuration in-repo:
- `render.yaml` defines `easycart-backend` service on Render
- `docker-compose.yml` defines local multi-service deployment (Postgres, Redis, backend, celery, frontend)

## Security Notes

- JWT authentication is the default DRF auth class (`backend/ecommerce/settings.py`)
- OTP request/verify endpoints include throttling/cooldowns (`backend/apps/accounts/otp_views.py`)
- 2FA endpoints exist for authenticated admin users (`backend/apps/accounts/two_factor_views.py`)
- Role-based permission classes enforce scoped admin/editor/manager/superadmin behavior (`backend/apps/accounts/permissions.py`)
- M-Pesa callback signature verification is enforced in production when enabled (`backend/utils/security_helpers.py`, `backend/apps/payments/gateways/mpesa_gateway.py`)

## API & Docs Links

- API URL routing: [`backend/ecommerce/urls.py`](backend/ecommerce/urls.py)
- API docs folder: [`docs/api/`](docs/api/)
- Setup docs: [`docs/setup/QUICK_START.md`](docs/setup/QUICK_START.md)
- Deployment docs: [`docs/deployment/DEPLOYMENT_GUIDE.md`](docs/deployment/DEPLOYMENT_GUIDE.md)
- Security policy: [`SECURITY.md`](SECURITY.md)

## Troubleshooting

- `ModuleNotFoundError: No module named 'django'` → activate backend venv and install `backend/requirements.txt`
- `react-scripts: not found` / `jest: not found` → run `npm ci` in the relevant frontend/admin/mobile directory
- CORS or auth errors in web apps → verify `REACT_APP_API_URL`/`NEXT_PUBLIC_API_URL` and backend `CORS_ALLOWED_ORIGINS`
- Payment callback issues → verify `MPESA_*` env values and production webhook signature settings

## License

MIT — see [`LICENSE`](LICENSE).
