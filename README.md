# EasyCart

[![CI-CD-Pipeline](https://github.com/Bryvn01/EasyCart/workflows/CI-CD-Pipeline/badge.svg)](https://github.com/Bryvn01/EasyCart/actions/workflows/ci.yml)
[![Codecov](https://codecov.io/gh/Bryvn01/EasyCart/branch/main/graph/badge.svg)](https://codecov.io/gh/Bryvn01/EasyCart)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Last verified:** 2026-07-06

## Project Overview

EasyCart is a production‑ready, security‑hardened e‑commerce platform designed for African markets. It’s built as a monorepo containing:

- **Django REST API** (`backend/`) – Core business logic, authentication, payment processing, and admin APIs.
- **Customer web app** (`frontend/`) – React + Next.js hybrid with TailwindCSS, M‑Pesa STK Push, and a modern shopping experience.
- **Admin dashboard** (`admin-dashboard/`) – React dashboard for managing products, orders, and customers.
- **React Native mobile app** (`mobile/`) – iOS/Android mobile client (in active development).

## Project Status (July 2026)

- ✅ **287 tests passing, 13 skipped, 0 failures** – comprehensive backend coverage with 80%+ across critical modules (orders, payments, authentication).
- ✅ **0 known Python vulnerabilities** – all dependencies audited and patched.
- ✅ **0 npm vulnerabilities in the customer frontend** – all packages audited and overridden where necessary.
- ✅ **Admin dashboard npm vulnerabilities minimized** – remaining alerts are non‑exploitable transitive dev dependencies.
- ✅ **CI/CD pipeline fully green** – GitHub Actions runs tests, linting, security scans, and deploys to Render and Vercel.
- ✅ **CodeQL and Codecov integrated** – static analysis and coverage tracking on every push.

## Monorepo Structure

```text
backend/            Django REST API + business logic
frontend/           Customer web app (React + Next.js)
admin-dashboard/    Admin web app (React)
mobile/             React Native mobile app
docs/               Setup, deployment, API, security, testing guides
.github/workflows/  CI/CD, security, deployment automation workflows
```

Verified Feature Matrix
Area	Status	Evidence
Product catalog, categories, search/filter APIs	Implemented	backend/apps/products/, backend/ecommerce/urls.py
Cart, checkout, orders	Implemented	backend/apps/orders/
JWT auth + refresh	Implemented	backend/ecommerce/settings.py, backend/apps/accounts/urls.py
OTP request/verify/resend flows	Implemented	backend/apps/accounts/otp_views.py
Admin 2FA endpoints	Implemented	backend/apps/accounts/two_factor_views.py
Role‑based permissions (superadmin/manager/editor/viewer)	Implemented	backend/apps/accounts/permissions.py, backend/apps/accounts/models.py
M‑Pesa STK Push + callback processing	Implemented	backend/apps/payments/gateways/mpesa_gateway.py
Webhook signature verification (production mode)	Implemented	backend/utils/security_helpers.py
Idempotency protection for order/payment paths	Implemented	backend/apps/orders/idempotency.py (94% coverage)
Admin dashboard APIs and UI	Implemented	admin-dashboard/src/services/api.js, backend/apps/admin_dashboard/
Mobile parity with web features	Partial	mobile/src/ and mobile docs indicate ongoing implementation
Quick Start
1) Backend (Django API on http://localhost:8000)
bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_products
python manage.py runserver
2) Frontend (React dev server on http://localhost:3000)
bash
cd frontend
npm ci
cp .env.example .env
npm start
3) Admin Dashboard (default React port is also 3000)
Run on another port when frontend is already running:

bash
cd admin-dashboard
npm ci
cp .env.example .env
PORT=3001 npm start
4) Mobile (React Native)
bash
cd mobile
npm ci
cp .env.example .env
npm start
Environment Variables
Environment variables are documented in .env.example files within each service. The critical variables are:

Backend: SECRET_KEY, DEBUG, ALLOWED_HOSTS, database settings, CORS_ALLOWED_ORIGINS, and optional service keys (MPESA_*, TWILIO_*, CLOUDINARY_*).

Frontend & Admin Dashboard: REACT_APP_API_URL (must point to the Django API).

Mobile: API base URL is currently hardcoded in mobile/src/api/client.ts; update it for local testing.

Testing & Coverage
Backend
bash
cd backend
pytest --cov=apps --cov-report=html        # Full suite + HTML report
pytest --cov=apps.orders --cov-report=term # Target specific modules
287 tests, 13 skipped, 0 failures across all apps.

80%+ coverage on critical paths (orders, payments, authentication).

New tests added in apps/orders/tests/ and apps/payments/tests/.

Frontend & Admin Dashboard
bash
cd frontend
npm test -- --watchAll=false --passWithNoTests
npm run lint
npm run build
Component tests for UI elements, cart, and product workflows.

Admin dashboard includes tests for the notification system and dashboard pages.

Security Scanning
bash
# Python
pip-audit
bandit -r apps/ ecommerce/ -ll

# Node.js
npm audit
All Python and customer‑frontend npm vulnerabilities are resolved. Admin dashboard retains only non‑exploitable transitive alerts from dev tooling.

CI/CD
Key workflows in .github/workflows/:

ci.yml (CI‑CD‑Pipeline): Runs on every push/PR. Executes reusable test workflow + security audit.

reusable‑test.yml: Backend lint/tests/coverage, frontend lint/tests/build.

required‑checks.yml: Additional gate for push/PR.

render‑ci.yml: Render deployment triggers.

codeql.yml, security‑audit.yml: Static analysis and dependency scanning.

Deployment configuration:

render.yaml defines backend service on Render.

docker-compose.yml provides local multi‑service deployment (Postgres, Redis, backend, Celery, frontend).

Frontend is also deployable to Vercel.

Security
JWT authentication is the default DRF auth class, with token rotation and refresh.

OTP request/verify endpoints include throttling and cooldowns.

2FA endpoints for admin users (TOTP).

Role‑based access control (superadmin, manager, editor, viewer).

M‑Pesa callback signature verification enforced in production.

Idempotency protection prevents duplicate payment callbacks.

Content Security Policy headers applied to all responses.

Dependencies audited – Python stack at zero known vulnerabilities, frontend npm packages fully patched.

API & Docs
API routing: backend/ecommerce/urls.py

API docs: docs/api/

Setup guide: docs/setup/QUICK_START.md

Deployment guide: docs/deployment/DEPLOYMENT_GUIDE.md

Security policy: SECURITY.md

Troubleshooting
ModuleNotFoundError: No module named 'django' → Activate backend venv and install backend/requirements.txt.

react‑scripts: not found / jest: not found → Run npm ci in the relevant frontend/admin/mobile directory.

CORS or auth errors → Verify REACT_APP_API_URL / NEXT_PUBLIC_API_URL and backend CORS_ALLOWED_ORIGINS.

Payment callback issues → Verify MPESA_* env values and production webhook signature settings.

License
MIT — see LICENSE.
