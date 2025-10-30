# EasyCart Frontend (Next.js)



## 🚀 Latest Enhancements (2025)
- **Admin CRUD & Sync**: Full admin CRUD for products, categories, and orders via new admin endpoints (`/api/products/admin/products/`, `/api/products/admin/categories/`, `/api/orders/admin/orders/`).
- **Admin/Frontend Sync**: All admin actions (create, update, delete, bulk) are instantly reflected in the frontend UI.
- **ProductEditModal**: Supports both file upload and direct image URLs for product images, with instant preview, validation, and full accessibility
- **Mobile Sidebar**: Auto-hides after search or navigation for a seamless mobile experience
- **Fade-out/Auto-hide**: Action buttons and success messages fade out and auto-hide for better UX
- **Automated Testing**: Jest and React Testing Library for all components, including ProductEditModal and ProductCard
- **React Query v5**: All hooks use object form, QueryClientProvider in tests (see TESTING_GUIDE.md)
- **Security**: CSP, CORS, Sentry, and known dependency vulnerabilities documented (see SECURITY.md)
- **Docs**: All guides updated—see IMAGE_UPLOAD_GUIDE.md, ENHANCED_PRODUCT_API_GUIDE.md, TESTING_GUIDE.md, ADMIN_DASHBOARD_API_FIX_SUMMARY.md



This is the production-ready frontend for EasyCart, built with Next.js and React. It is designed for robust, secure, and accessible e-commerce experiences, following best practices for FYP/local deployment.

**Admin Integration:**
- Uses new admin endpoints for all product/category/order management
- Role-based permissions enforced for all admin actions
- See [ADMIN_DASHBOARD_API_FIX_SUMMARY.md](../ADMIN_DASHBOARD_API_FIX_SUMMARY.md) and [ENHANCED_PRODUCT_API_GUIDE.md](../ENHANCED_PRODUCT_API_GUIDE.md) for API details

---
## 🖼️ Product Image Handling (File Upload & URL)

ProductEditModal allows admins to upload an image file or paste an image URL, with instant preview and validation. The UI is fully accessible and keyboard-navigable. All product displays use robust image preview and fallback logic.

See [IMAGE_UPLOAD_GUIDE.md](../IMAGE_UPLOAD_GUIDE.md) and [ENHANCED_PRODUCT_API_GUIDE.md](../ENHANCED_PRODUCT_API_GUIDE.md) for details.

---

---

- [Admin CRUD & Sync](#admin-crud--sync)
- [Setup](#setup)
- [Running the App](#running-the-app)
- [Testing](#testing)
- [Security](#security)
- [Monitoring](#monitoring)
- [Accessibility & Lighthouse](#accessibility--lighthouse)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Setup
1. Clone the repository and navigate to the `frontend` directory.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env.local` file with the following (see `.env.example`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
   ```

## Running the App
- **Development:**
  ```sh
  npm run next:dev
  ```
  App runs at http://localhost:3000
- **Production:**
  ```sh
  npm run next:build
  npm run next:start
  ```


## 🧪 Testing
- **Unit/Integration:**
  ```sh
  npm test
  ```
- **E2E (Cypress, optional):**
  ```sh
  npx cypress open
  ```
- All tests pass; coverage and setup in [TESTING_GUIDE.md](../TESTING_GUIDE.md) and [NEXTJS_README.md](NEXTJS_README.md).

---


- Security headers are enforced in both `nginx.conf` and `next.config.js` (CSP, HSTS, X-Frame-Options, etc.)
- Automated security checks: `npm audit` runs in CI/CD and locally
- Sentry integrated for error monitoring
- All admin endpoints are protected by JWT authentication and role-based permissions
- CORS and secure HTTP headers enforced for all admin/CRUD operations
- Known, unresolvable frontend dependency vulnerabilities are documented and monitored (see [SECURITY.md](../SECURITY.md))

---

## Monitoring
- **Sentry** is integrated for error and performance monitoring.
- Setup and usage: see `MONITORING.md`.

## Accessibility & Lighthouse
- **Lighthouse and a11y checks:**
  - Step-by-step guide in `LIGHTHOUSE_A11Y_CHECKS.md`.
  - Most recent report: `lighthouse-report.html`.
- **How to run:**
  - Start the app, open Chrome DevTools → Lighthouse tab, run audit.
  - Use a11y tools/extensions for deeper checks.

## Deployment & Mobile Testing

After pushing to GitHub, the app will auto-deploy (Render.com). Open the deployed site on your phone to test the sidebar and all enhancements live.
- **Vercel (recommended):**
  - Set root to `frontend`, add `NEXT_PUBLIC_API_URL` env var.
- **Docker/Nginx:**
  - See `nginx.conf` for production security and caching.

- If admin CRUD actions do not reflect in the UI, verify API URL and backend status
- For permission errors, check your user role and JWT token validity
- If Lighthouse shows `CHROME_INTERSTITIAL_ERROR`, ensure the server is running at http://localhost:3000.
- For API errors, check backend connectivity and CORS.

---


## 📚 Additional Guides & References
- [IMAGE_UPLOAD_GUIDE.md](../IMAGE_UPLOAD_GUIDE.md): Dual image handling (file upload + URL)
- [ENHANCED_PRODUCT_API_GUIDE.md](../ENHANCED_PRODUCT_API_GUIDE.md): Product API reference
- [TESTING_GUIDE.md](../TESTING_GUIDE.md): Automated tests and coverage
- [SECURITY.md](../SECURITY.md): Security policy and known vulnerabilities
- [MONITORING.md](MONITORING.md): Sentry and error monitoring
- [LIGHTHOUSE_A11Y_CHECKS.md](LIGHTHOUSE_A11Y_CHECKS.md): Accessibility and Lighthouse
- [NEXTJS_README.md](NEXTJS_README.md): Next.js usage and test setup

---

_Last updated: 2025-10-21_
