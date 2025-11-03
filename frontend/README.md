# EasyCart Frontend (Next.js)

## Latest Enhancements (2025-10-21)
- Mobile sidebar auto-hides after search or navigation (try on your phone!)
- Product edit modal supports direct image URLs (no upload needed for FYP/demo)

This is the production-ready frontend for EasyCart, built with Next.js and React. It is designed for robust, secure, and accessible e-commerce experiences, following best practices for FYP/local deployment.

---

## Table of Contents
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

## Testing
- **Unit/Integration:**
  ```sh
  npm test
  ```
- **E2E (Cypress, optional):**
  ```sh
  npx cypress open
  ```
- Coverage and test setup are documented in `NEXTJS_README.md`.

## Security
- **Security headers** are enforced in both `nginx.conf` and `next.config.js` (CSP, HSTS, X-Frame-Options, etc.).
- **Automated security checks:** `npm audit` runs in CI/CD and locally.
- See `SECURITY.md` for details.

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

## Troubleshooting
- If Lighthouse shows `CHROME_INTERSTITIAL_ERROR`, ensure the server is running at http://localhost:3000.
- For API errors, check backend connectivity and CORS.

---

For more details, see `NEXTJS_README.md`, `MONITORING.md`, and `LIGHTHOUSE_A11Y_CHECKS.md`.

_Last updated: 2025-10-21_
