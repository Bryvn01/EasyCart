# Security Best Practices for EasyCart

This document outlines the key security measures implemented in the EasyCart backend to ensure a robust, production-ready deployment suitable for local and free-tier environments.

## 1. Rate Limiting
- **Global API Rate Limit:**
  - All API endpoints are protected by a default rate limit of **100 requests per minute per IP** using `django-ratelimit` middleware.
  - This helps prevent abuse and DoS attacks.
- **Brute-force Protection:**
  - The login endpoint is protected with a stricter limit: **5 login attempts per minute per IP**.
  - Excessive attempts are automatically blocked.

## 2. Security Headers & SSL
- **HSTS, X-Frame-Options, XSS Filter, Content-Type Nosniff** are enforced in `settings.py`.
- **SSL/HTTPS** is enforced in production (when `DEBUG` is False).

## 3. Authentication & Permissions
- **JWT Authentication** is used for all API endpoints.
- **Role-based permissions** restrict access to sensitive endpoints (admin/superadmin only).

## 4. Audit Logging
- **All model changes** are tracked using `django-simple-history` for auditability.
- **Application logs** are written to rotating log files in the `logs/` directory.

## 5. Input Validation & Sanitization
- User input is sanitized to prevent path traversal and injection attacks.
- Password reset and registration endpoints do not leak user existence.

## 6. Dependency & Code Security
- **Automated security scanning** is performed in CI using [Bandit](https://bandit.readthedocs.io/).
- **Dependencies** are kept up to date and reviewed for vulnerabilities.

## 7. Additional Protections
- **CSRF protection** is enabled for all session-based endpoints.
- **CORS** is restricted to trusted origins.
- **File upload limits** are enforced.

---

For more details, see `backend/ecommerce/settings.py` and the [Monitoring & Logging Guide](monitoring.md).
