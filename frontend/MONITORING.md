# Sentry Error Monitoring for EasyCart Frontend

EasyCart's frontend integrates Sentry for real-time error and performance monitoring.

## Setup
1. Create a Sentry account at https://sentry.io/ and create a new project (Next.js/React).
2. Add your Sentry DSN to your environment variables:
   - In `.env` or deployment environment: `NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here`
3. Sentry is initialized in `src/pages/_app.js` and will automatically capture errors and performance data.

## Features
- Captures unhandled exceptions and promise rejections.
- Tracks performance and slow transactions.
- Environment-aware (development, production, etc.).

## Documentation
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

For privacy, ensure no sensitive user data is sent to Sentry. Adjust `tracesSampleRate` as needed for production.
