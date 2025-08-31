#!/usr/bin/env python3
"""
Security and stability fixes for the e-commerce application
"""
import os
import re
import json
from pathlib import Path

def fix_frontend_security_headers():
    """Add security headers to frontend build"""
    public_dir = Path("frontend/public")
    if public_dir.exists():
        # Create .htaccess for Apache or nginx.conf for Nginx
        htaccess_content = """
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"

# HTTPS Redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
"""
        with open(public_dir / ".htaccess", "w") as f:
            f.write(htaccess_content)
        print("[OK] Added security headers configuration")

def validate_environment_variables():
    """Check for required environment variables"""
    backend_env = Path("backend/.env")
    required_vars = [
        'SECRET_KEY',
        'DEBUG',
        'ALLOWED_HOSTS',
        'DB_ENGINE',
        'EMAIL_HOST',
        'CORS_ALLOWED_ORIGINS'
    ]
    
    if backend_env.exists():
        with open(backend_env) as f:
            env_content = f.read()
        
        missing_vars = []
        for var in required_vars:
            if f"{var}=" not in env_content:
                missing_vars.append(var)
        
        if missing_vars:
            print(f"[WARNING] Missing environment variables: {', '.join(missing_vars)}")
        else:
            print("[OK] All required environment variables present")
    else:
        print("[WARNING] .env file not found in backend directory")

def check_file_permissions():
    """Check and fix file permissions for security"""
    sensitive_files = [
        "backend/.env",
        "backend/db.sqlite3",
        "backend/logs/django.log"
    ]
    
    for file_path in sensitive_files:
        if os.path.exists(file_path):
            try:
                # Set restrictive permissions (owner read/write only)
                os.chmod(file_path, 0o600)
                print(f"[OK] Fixed permissions for {file_path}")
            except Exception as e:
                print(f"[WARNING] Could not fix permissions for {file_path}: {e}")

def validate_cors_settings():
    """Validate CORS settings for security"""
    settings_file = Path("backend/ecommerce/settings.py")
    if settings_file.exists():
        with open(settings_file) as f:
            content = f.read()
        
        # Check for overly permissive CORS settings
        if "CORS_ALLOW_ALL_ORIGINS = True" in content:
            print("[WARNING] CORS_ALLOW_ALL_ORIGINS is set to True - this is insecure for production")
        
        if "CORS_ALLOWED_ORIGINS" in content:
            print("[OK] CORS origins are properly configured")
        else:
            print("[WARNING] CORS_ALLOWED_ORIGINS not found in settings")

def create_production_checklist():
    """Create a production deployment checklist"""
    checklist = """
# Production Deployment Checklist

## Security
- [ ] Change SECRET_KEY to a strong, unique value
- [ ] Set DEBUG = False
- [ ] Configure ALLOWED_HOSTS properly
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure secure session cookies
- [ ] Set up proper CORS origins
- [ ] Enable security middleware
- [ ] Set up rate limiting
- [ ] Configure CSP headers

## Database
- [ ] Use PostgreSQL or MySQL in production (not SQLite)
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Set up database monitoring

## Infrastructure
- [ ] Set up reverse proxy (Nginx/Apache)
- [ ] Configure static file serving
- [ ] Set up media file storage (AWS S3/CloudFront)
- [ ] Configure logging and monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure caching (Redis/Memcached)

## Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure database indexing
- [ ] Set up application monitoring
- [ ] Load test the application

## Backup & Recovery
- [ ] Set up automated database backups
- [ ] Test backup restoration process
- [ ] Set up file storage backups
- [ ] Document recovery procedures

## Monitoring
- [ ] Set up application monitoring
- [ ] Configure log aggregation
- [ ] Set up alerting for critical issues
- [ ] Monitor resource usage
"""
    
    with open("PRODUCTION_CHECKLIST.md", "w") as f:
        f.write(checklist)
    print("[OK] Created production deployment checklist")

def main():
    """Run all security and stability checks"""
    print("Running security and stability checks...\n")
    
    fix_frontend_security_headers()
    validate_environment_variables()
    check_file_permissions()
    validate_cors_settings()
    create_production_checklist()
    
    print("\nSecurity and stability checks completed!")
    print("Review PRODUCTION_CHECKLIST.md before deploying to production")

if __name__ == "__main__":
    main()