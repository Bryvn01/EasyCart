# EasyCart Enhanced Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GITHUB ACTIONS CI/CD PIPELINE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │   TEST   │ → │ SECURITY │ → │  BUILD   │ → │  DEPLOY  │ → │  HEALTH  │ │
│  │          │   │   SCAN   │   │          │   │          │   │  CHECK   │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│                                                                               │
│  • Unit Tests       • npm audit     • Backend      • Render      • Verify   │
│  • Integration      • OWASP Check   • Frontend     • Auto Deploy • Smoke    │
│  • Coverage         • CodeQL        • Admin        • Env Vars    • Endpoints│
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                    INCOMING HTTP REQUEST                         │        │
│  └────────────────────────────┬──────────────────────────────────┘        │
│                                 │                                             │
│                                 ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │              SECURITY & MIDDLEWARE PIPELINE                      │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │  1. Helmet.js           → Security headers (CSP, XSS, etc)      │        │
│  │  2. Request Size Limit  → Max 10MB per request                  │        │
│  │  3. Body Parser         → Parse JSON/URL-encoded                │        │
│  │  4. MongoDB Sanitize    → Remove $ operators                    │        │
│  │  5. Input Sanitization  → XSS protection, prototype pollution   │        │
│  │  6. CORS                → Origin validation                     │        │
│  │  7. Request Logger      → Log request with unique ID            │        │
│  │  8. Performance Monitor → Track request timing                  │        │
│  │  9. Global Rate Limiter → 100 req/15min per IP                  │        │
│  └────────────────────────────┬──────────────────────────────────┘        │
│                                 │                                             │
│                                 ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                      ROUTE HANDLERS                              │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │  /api/auth      → Auth Rate Limiter (5/15min)                   │        │
│  │                 → Input Validation (email, password)             │        │
│  │                 → Async Error Handler                            │        │
│  │                                                                   │        │
│  │  /api/products  → Search Rate Limiter (30/min)                   │        │
│  │                 → Input Validation (price, quantity)             │        │
│  │                 → Async Error Handler                            │        │
│  │                                                                   │        │
│  │  /api/upload    → Upload Rate Limiter (10/hour)                  │        │
│  │                 → File Size Validation                           │        │
│  │                 → Async Error Handler                            │        │
│  └────────────────────────────┬──────────────────────────────────┘        │
│                                 │                                             │
│                                 ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                   ERROR HANDLING CHAIN                           │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │  • Custom Error Classes (ValidationError, AuthError, etc)        │        │
│  │  • Automatic Error Type Detection                                │        │
│  │  • Structured Error Logging                                      │        │
│  │  • Development vs Production Error Details                       │        │
│  │  • 404 Handler for Unknown Routes                                │        │
│  └────────────────────────────┬──────────────────────────────────┘        │
│                                 │                                             │
│                                 ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                     RESPONSE + LOGGING                           │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │  • Log Response Time                                             │        │
│  │  • Log Status Code                                               │        │
│  │  • Log Slow Requests (>1s)                                       │        │
│  │  • Send Structured Response                                      │        │
│  └────────────────────────────┬──────────────────────────────────┘        │
│                                 │                                             │
│                                 ▼                                             │
│                          HTTP RESPONSE                                        │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOGGING ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────┐              │
│  │                    LOGGER SERVICE                         │              │
│  ├──────────────────────────────────────────────────────────┤              │
│  │  Log Levels:                                              │              │
│  │  • ERROR   → Critical issues, sent to monitoring         │              │
│  │  • WARN    → Warning conditions                          │              │
│  │  • INFO    → Normal operations                           │              │
│  │  • DEBUG   → Detailed info (dev only)                    │              │
│  │                                                           │              │
│  │  Output Format:                                          │              │
│  │  • Development: Human-readable with colors               │              │
│  │  • Production:  Structured JSON for aggregation          │              │
│  └────────────────────────┬──────────────────────────────┘              │
│                            │                                                 │
│                            ▼                                                 │
│  ┌────────────────────────────────────────────────────────┐                │
│  │            LOG DESTINATIONS                             │                │
│  ├────────────────────────────────────────────────────────┤                │
│  │  Development:                                           │                │
│  │  • Console output                                       │                │
│  │  • File logs (optional)                                 │                │
│  │                                                          │                │
│  │  Production:                                            │                │
│  │  • Stdout (JSON)                                        │                │
│  │  • Error Tracking Service (Sentry-ready)                │                │
│  │  • Log Aggregation (DataDog, LogRocket, etc)            │                │
│  └──────────────────────────────────────────────────────┘                │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND ERROR HANDLING                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────┐                │
│  │            ERROR BOUNDARY (React Component)             │                │
│  ├────────────────────────────────────────────────────────┤                │
│  │  • Catches component rendering errors                   │                │
│  │  • Displays user-friendly fallback UI                   │                │
│  │  • Provides recovery options (retry, reload, go back)   │                │
│  │  • Tracks error count to detect recurring issues        │                │
│  └────────────────────────┬──────────────────────────────┘                │
│                            │                                                 │
│                            ▼                                                 │
│  ┌────────────────────────────────────────────────────────┐                │
│  │           ERROR LOGGER SERVICE                          │                │
│  ├────────────────────────────────────────────────────────┤                │
│  │  Handles:                                               │                │
│  │  • Global unhandled errors                              │                │
│  │  • Unhandled promise rejections                         │                │
│  │  • API errors                                           │                │
│  │  • Navigation errors                                    │                │
│  │  • Component errors                                     │                │
│  └────────────────────────┬──────────────────────────────┘                │
│                            │                                                 │
│                            ▼                                                 │
│  ┌────────────────────────────────────────────────────────┐                │
│  │            BACKEND ERROR ENDPOINT                       │                │
│  │            POST /api/errors                             │                │
│  ├────────────────────────────────────────────────────────┤                │
│  │  Receives frontend errors and logs them centrally       │                │
│  │  Includes: timestamp, URL, user agent, stack trace      │                │
│  └──────────────────────────────────────────────────────┘                │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYER DETAILS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  INPUT SANITIZATION                           RATE LIMITING                  │
│  ┌────────────────────────┐                  ┌──────────────────────┐      │
│  │ • Remove <script> tags  │                  │ • Global: 100/15min  │      │
│  │ • Strip event handlers  │                  │ • Auth: 5/15min      │      │
│  │ • Remove javascript:    │                  │ • Register: 3/hour   │      │
│  │ • Prototype pollution   │                  │ • Upload: 10/hour    │      │
│  │   prevention            │                  │ • Search: 30/min     │      │
│  └────────────────────────┘                  └──────────────────────┘      │
│                                                                               │
│  MONGODB INJECTION                            VALIDATION SCHEMAS             │
│  ┌────────────────────────┐                  ┌──────────────────────┐      │
│  │ • Remove $ operators    │                  │ • Email validator    │      │
│  │ • Block $where, $gt etc │                  │ • Phone validator    │      │
│  │ • Circular ref handling │                  │ • MongoDB ID         │      │
│  │ • Security event log    │                  │ • Price validator    │      │
│  └────────────────────────┘                  │ • Quantity validator │      │
│                                               │ • URL validator      │      │
│  SECURITY HEADERS (Helmet)                   └──────────────────────┘      │
│  ┌────────────────────────┐                                                 │
│  │ • Content-Security-Policy (CSP)                                           │
│  │ • X-Content-Type-Options: nosniff                                         │
│  │ • X-Frame-Options: DENY                                                   │
│  │ • X-XSS-Protection                                                        │
│  │ • Strict-Transport-Security (HSTS)                                        │
│  └────────────────────────┘                                                 │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW EXAMPLE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  User Login Request Flow:                                                    │
│                                                                               │
│  1. POST /api/auth/login                                                     │
│     ↓                                                                         │
│  2. Helmet adds security headers                                             │
│     ↓                                                                         │
│  3. Request size checked (< 10MB)                                            │
│     ↓                                                                         │
│  4. Body parsed to JSON                                                      │
│     ↓                                                                         │
│  5. MongoDB operators removed ($ne, $where, etc)                             │
│     ↓                                                                         │
│  6. XSS protection applied (sanitize strings)                                │
│     ↓                                                                         │
│  7. CORS origin validated                                                    │
│     ↓                                                                         │
│  8. Request logged with unique ID                                            │
│     ↓                                                                         │
│  9. Performance timer started                                                │
│     ↓                                                                         │
│  10. Rate limit checked (5 attempts per 15min)                               │
│     ↓                                                                         │
│  11. Input validated (email format, password present)                        │
│     ↓                                                                         │
│  12. Controller logic executed (check credentials)                           │
│     ↓                                                                         │
│  13. On error: Custom error class thrown                                     │
│     ↓                                                                         │
│  14. Error handler catches and formats response                              │
│     ↓                                                                         │
│  15. Error logged with context                                               │
│     ↓                                                                         │
│  16. Response time calculated and logged                                     │
│     ↓                                                                         │
│  17. JSON response sent to client                                            │
│     ↓                                                                         │
│  18. Frontend receives response                                              │
│                                                                               │
│  If failed: Frontend logs error, displays message                            │
│  If success: User authenticated, JWT stored                                  │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  GitHub Repository                                                            │
│       │                                                                       │
│       │ git push origin main                                                 │
│       ▼                                                                       │
│  ┌─────────────────────────────────────────┐                                │
│  │      GitHub Actions Workflow            │                                │
│  │  1. Checkout code                       │                                │
│  │  2. Run tests (parallel)                │                                │
│  │  3. Security scan                       │                                │
│  │  4. Build services (parallel)           │                                │
│  │  5. Deployment notification             │                                │
│  └──────────────┬──────────────────────────┘                                │
│                 │                                                             │
│                 │ Auto-deploy via webhook                                    │
│                 ▼                                                             │
│  ┌─────────────────────────────────────────┐                                │
│  │         Render.com Platform             │                                │
│  ├─────────────────────────────────────────┤                                │
│  │  • easycart-backend (Node.js)           │                                │
│  │  • easycart-frontend (Static)           │                                │
│  │  • easycart-admin (Static)              │                                │
│  └──────────────┬──────────────────────────┘                                │
│                 │                                                             │
│                 │ Health checks after deploy                                 │
│                 ▼                                                             │
│  ┌─────────────────────────────────────────┐                                │
│  │     Post-Deployment Verification         │                                │
│  │  • Backend health: /api/health          │                                │
│  │  • Frontend check: /                    │                                │
│  │  • Smoke test: /api/products            │                                │
│  └─────────────────────────────────────────┘                                │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Components Summary

### 1. CI/CD Pipeline
- 5-stage automated workflow
- Runs on every push to main/develop
- Automated deployment to Render
- Post-deployment health checks

### 2. Security Middleware Stack
- 9 layers of protection
- Input sanitization & validation
- Rate limiting (6 types)
- Security headers via Helmet

### 3. Error Handling System
- Structured logging (4 levels)
- Custom error classes (7 types)
- Request tracking & timing
- Frontend error boundary

### 4. Logging Architecture
- Environment-aware formatting
- Multiple log destinations
- Performance monitoring
- Security event tracking

### 5. Frontend Error Management
- React error boundary
- Global error handlers
- Centralized error logging
- User-friendly recovery UI

## Technology Stack

**Backend:**
- Express.js with comprehensive middleware
- Mongoose for MongoDB
- Helmet.js for security headers
- express-rate-limit for rate limiting
- express-mongo-sanitize for injection protection

**Frontend:**
- React with enhanced ErrorBoundary
- Error logger service
- Integration with backend error endpoint

**CI/CD:**
- GitHub Actions
- OWASP Dependency Check
- npm audit
- CodeQL security scanning

**Deployment:**
- Render.com platform
- Automated deployments
- Health monitoring
- Rollback capabilities
