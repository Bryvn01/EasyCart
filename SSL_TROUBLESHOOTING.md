# 🔒 SSL/TLS Troubleshooting Guide

## Common Error: `[SSL] record layer failure (_ssl.c:2580)`

### What This Error Means

This error occurs when your Python server is configured to expect SSL/TLS (HTTPS) traffic, but is receiving plain HTTP requests. This commonly happens when deploying to platforms like Render, Heroku, or Railway that handle SSL/TLS termination at the edge.

### Why It Happens on Render

**Render's Architecture:**
```
User's Browser (HTTPS) → Render Edge/Load Balancer (handles SSL) → Your App (HTTP)
```

- **Render automatically handles HTTPS** at the edge (load balancer level)
- Your application receives **plain HTTP requests** on the internal port
- If your app is configured for SSL, it expects HTTPS but gets HTTP → error!

### Solution: Remove SSL Configuration from Your App

#### 1. Fix Docker Configuration

**❌ WRONG - Causes SSL errors:**
```dockerfile
# Copy SSL certificates
COPY cert.pem /app/cert.pem
COPY key.pem /app/key.pem

# Run with SSL flags
CMD ["gunicorn", "app:application", "--certfile", "cert.pem", "--keyfile", "key.pem"]
```

**✅ CORRECT - Works on Render:**
```dockerfile
# No SSL certificate files needed

# Run without SSL flags (Render handles SSL at the edge)
CMD ["gunicorn", "app:application", "--bind", "0.0.0.0:8000"]
```

#### 2. Fix Uvicorn Configuration (FastAPI)

**❌ WRONG:**
```bash
uvicorn main:app --host 0.0.0.0 --port 10000 --ssl-keyfile=key.pem --ssl-certfile=cert.pem
```

**✅ CORRECT:**
```bash
uvicorn main:app --host 0.0.0.0 --port 10000
```

#### 3. Fix Gunicorn Configuration (Django/Flask)

**❌ WRONG:**
```bash
gunicorn app:application --bind 0.0.0.0:8000 --certfile cert.pem --keyfile key.pem
```

**✅ CORRECT:**
```bash
gunicorn app:application --bind 0.0.0.0:8000
```

#### 4. Remove SSL Certificate Files

**Add to `.gitignore`:**
```gitignore
# SSL Certificates (Render handles SSL at the edge)
*.pem
*.key
*.crt
*.cert
```

**Remove from repository:**
```bash
git rm --cached cert.pem key.pem
git commit -m "Remove SSL certificates - Render handles SSL at edge"
git push
```

#### 5. Check Render Start Command

In your Render dashboard:
1. Go to your web service
2. Check the **Start Command**
3. Ensure it does NOT include `--ssl-keyfile`, `--ssl-certfile`, `--certfile`, or `--keyfile`

**Example correct start commands:**
- Django: `gunicorn ecommerce.wsgi:application --bind 0.0.0.0:$PORT`
- FastAPI: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Flask: `gunicorn app:app --bind 0.0.0.0:$PORT`

### Local Development with HTTPS (Optional)

If you need HTTPS for local development (e.g., testing OAuth, payment gateways):

#### Option 1: Use `django-sslserver` (Django)
```bash
pip install django-sslserver
python manage.py runsslserver
```

#### Option 2: Use `mkcert` for Local Certificates
```bash
# Install mkcert
brew install mkcert  # macOS
choco install mkcert # Windows

# Create local CA
mkcert -install

# Generate certificates
mkcert localhost 127.0.0.1

# Use with uvicorn
uvicorn main:app --ssl-keyfile=localhost+1-key.pem --ssl-certfile=localhost+1.pem
```

**Important:** Keep local development certificates separate and NEVER commit them to your repository.

### Verification Checklist

After fixing SSL configuration:

- [ ] Dockerfile has no `COPY *.pem` commands
- [ ] Dockerfile CMD has no SSL flags
- [ ] `.gitignore` includes `*.pem`, `*.key`, `*.crt`
- [ ] SSL certificate files removed from git: `git rm --cached *.pem`
- [ ] Render Start Command has no SSL flags
- [ ] Application serves plain HTTP on the specified port
- [ ] Push changes to trigger Render redeploy

### Testing After Fix

1. **Push changes to GitHub:**
   ```bash
   git add .
   git commit -m "Fix SSL configuration for Render deployment"
   git push
   ```

2. **Wait for Render to redeploy** (check dashboard for build logs)

3. **Test your endpoints:**
   ```bash
   # Should return 200 OK without SSL errors
   curl https://your-app.onrender.com/health
   ```

4. **Check logs in Render dashboard** - SSL errors should be gone

### Still Having Issues?

#### Check Health Check Path
Render pings your health check endpoint. If it doesn't exist:
```python
# Django
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok"})
```

#### Check Port Binding
Render provides the port via `$PORT` environment variable:
```python
# Make sure you bind to the PORT environment variable
port = os.environ.get('PORT', 8000)
```

#### Enable Debug Logging (Temporarily)
```python
# Add to see what requests are coming in
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Platform-Specific Notes

#### Render
- ✅ Free SSL certificates with auto-renewal
- ✅ HTTP/2 support
- ✅ Automatic SSL termination at edge

#### Heroku
- ✅ Free SSL on `*.herokuapp.com` domains
- ✅ Custom domains need paid dyno
- ✅ Automatic SSL termination

#### Railway
- ✅ Free SSL certificates
- ✅ Automatic HTTPS
- ✅ No SSL configuration needed

#### AWS/DigitalOcean (Self-Hosted)
- ❌ You MUST configure SSL yourself
- Use nginx/Apache with Let's Encrypt
- Or use AWS Certificate Manager + ALB

### Summary

**For Render, Heroku, Railway:**
- Your app = HTTP only
- Platform = handles HTTPS

**For self-hosted (AWS, DigitalOcean, VPS):**
- You must configure SSL with nginx/Apache
- Use Let's Encrypt for free certificates

---

**Need help?** Check your specific platform's documentation or open an issue in the repository.
