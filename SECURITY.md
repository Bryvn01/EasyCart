# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Security Updates (Latest)

### ✅ Fixed - January 2025

**Frontend:**
- ✅ Fixed `glob` command injection (CVE-2024-XXXX) - Updated to v10.5.0+
- ✅ Fixed `js-yaml` prototype pollution - Updated to v4.1.1+
- ✅ Fixed `node-forge` ASN.1 vulnerabilities - Updated to v1.3.2+
- ⚠️ `webpack-dev-server` - Moderate risk (dev-only, not in production)

**Backend:**
- ✅ Added `cryptography>=43.0.0` for secure encryption
- ✅ All dependencies up-to-date with security patches

### 🔴 Known Issues

**webpack-dev-server (Moderate - Dev Only)**
- **Impact**: Development environment only, not deployed to production
- **Risk**: Source code exposure when accessing malicious sites during development
- **Mitigation**: Only run dev server on localhost, never expose publicly
- **Status**: Waiting for react-scripts v6 release

## Reporting a Vulnerability

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email: security@easycart.com (or your email)
2. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

**Response Time:**
- Initial response: 48 hours
- Fix timeline: 7-14 days for critical issues

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Rotate secrets if accidentally exposed
- ✅ Use different credentials for dev/staging/production

### Dependencies
```bash
# Check for vulnerabilities regularly
npm audit                    # Frontend
pip-audit                    # Backend (install: pip install pip-audit)
```

### Production Checklist
- [ ] `DEBUG=False` in Django settings
- [ ] Strong `SECRET_KEY` (64+ random characters)
- [ ] HTTPS enabled (`SECURE_SSL_REDIRECT=True`)
- [ ] CORS restricted to known domains
- [ ] Database credentials rotated
- [ ] M-Pesa credentials secured
- [ ] Cloudinary API keys secured
- [ ] Rate limiting enabled
- [ ] Security headers configured (HSTS, XSS protection)

## Automated Security

### GitHub Dependabot
- Automatically creates PRs for dependency updates
- Review and merge weekly

### CI/CD Security Checks
- Runs on every PR
- Blocks merge if critical vulnerabilities found

## Security Contacts

- **Maintainer**: @Bryvn01
- **Security Email**: (Add your email)
- **GitHub Security Advisories**: https://github.com/Bryvn01/EasyCart/security/advisories
