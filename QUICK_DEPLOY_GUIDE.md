# EasyCart - Quick Start Deployment Guide

## 🚀 Deploy in 15 Minutes

This guide helps you deploy EasyCart quickly to popular platforms.

---

## Option 1: Deploy to Vercel (Frontend) + Railway (Backend)

### Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free tier available)
- MongoDB Atlas account (free)

### Step 1: Prepare Repository

```bash
# Push to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your EasyCart repository
4. Select `backend` folder as root directory
5. Add environment variables:
   ```
   DEBUG=False
   SECRET_KEY=<generate-secure-key>
   ALLOWED_HOSTS=*.railway.app
   MONGODB_URI=<your-mongodb-atlas-uri>
   CORS_ALLOWED_ORIGINS=<your-vercel-url>
   ```
6. Deploy! Railway will auto-detect Django and deploy
7. Note your Railway URL: `https://easycart-backend.railway.app`

### Step 3: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project" → Import from GitHub
3. Select your EasyCart repository
4. Set root directory to `frontend`
5. Add environment variables:
   ```
   REACT_APP_API_URL=https://easycart-backend.railway.app/api
   REACT_APP_BACKEND_URL=https://easycart-backend.railway.app
   ```
6. Click "Deploy"
7. Your site will be live at: `https://easycart.vercel.app`

### Step 4: Update CORS Settings

Go back to Railway, update environment variable:
```
CORS_ALLOWED_ORIGINS=https://easycart.vercel.app
```

**✅ Done! Your app is live!**

---

## Option 2: Deploy to Render (Full Stack)

### Step 1: Deploy Backend

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   ```
   Name: easycart-backend
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn easycart.wsgi:application
   ```
5. Add environment variables (same as Railway)
6. Create Web Service

### Step 2: Deploy Frontend

1. Click "New +" → "Static Site"
2. Select same repository
3. Configure:
   ```
   Name: easycart-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```
4. Add environment variables
5. Create Static Site

**✅ Done! Both services deployed!**

---

## Option 3: Deploy to DigitalOcean App Platform

### Single Config File

Create `app.yaml` in project root:

```yaml
name: easycart
services:
  - name: backend
    github:
      repo: <your-username>/EasyCart
      branch: main
    source_dir: backend
    environment_slug: python
    run_command: gunicorn easycart.wsgi:application
    envs:
      - key: DEBUG
        value: "False"
      - key: SECRET_KEY
        value: <your-secret-key>
        type: SECRET
      - key: MONGODB_URI
        value: <your-mongodb-uri>
        type: SECRET
    
  - name: frontend
    github:
      repo: <your-username>/EasyCart
      branch: main
    source_dir: frontend
    environment_slug: node-js
    build_command: npm run build
    envs:
      - key: REACT_APP_API_URL
        value: ${backend.PUBLIC_URL}/api
```

Deploy:
```bash
doctl apps create --spec app.yaml
```

---

## MongoDB Atlas Setup (Required for All Options)

### Step 1: Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Build a Database → Shared (Free)
4. Choose cloud provider and region
5. Cluster name: `easycart-cluster`

### Step 2: Create Database User

1. Security → Database Access
2. Add New Database User:
   ```
   Username: easycart_user
   Password: <generate-strong-password>
   Role: Atlas Admin (or readWrite on specific database)
   ```

### Step 3: Configure Network Access

1. Security → Network Access
2. Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
3. (In production, restrict to your hosting platform IPs)

### Step 4: Get Connection String

1. Databases → Connect
2. Choose "Connect your application"
3. Copy connection string:
   ```
   mongodb+srv://easycart_user:<password>@easycart-cluster.xxxxx.mongodb.net/easycart?retryWrites=true&w=majority
   ```
4. Replace `<password>` with actual password
5. Add to your platform's environment variables as `MONGODB_URI`

---

## Cloudinary Setup (Already Configured)

Your app is already configured to use Cloudinary. Just verify:

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy credentials:
   ```
   CLOUDINARY_CLOUD_NAME=dvpr5bcrp
   CLOUDINARY_API_KEY=<your-key>
   CLOUDINARY_API_SECRET=<your-secret>
   ```
3. Add to backend environment variables

---

## Custom Domain Setup

### For Vercel (Frontend)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `www.easycart.com`
3. Update DNS records at your domain provider:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### For Railway (Backend)

1. Railway Dashboard → Your Service → Settings → Domains
2. Add custom domain: `api.easycart.com`
3. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: <your-project>.railway.app
   ```

---

## Environment Variables Reference

### Backend (.env)

```bash
# Required
DEBUG=False
SECRET_KEY=<50-char-random-string>
ALLOWED_HOSTS=<your-domain>,*.railway.app
MONGODB_URI=<atlas-connection-string>
CORS_ALLOWED_ORIGINS=https://easycart.com,https://www.easycart.com

# Optional but Recommended
CLOUDINARY_CLOUD_NAME=dvpr5bcrp
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
EMAIL_HOST_USER=<smtp-username>
EMAIL_HOST_PASSWORD=<smtp-password>
SENTRY_DSN=<sentry-dsn>
```

### Frontend (.env.production)

```bash
# Required
REACT_APP_API_URL=https://api.easycart.com/api
REACT_APP_BACKEND_URL=https://api.easycart.com

# Optional
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=<sentry-dsn>
```

---

## Generate Secure SECRET_KEY

```python
# Run in Python shell
import secrets
print(secrets.token_urlsafe(50))
```

Or online: https://djecrety.ir/

---

## Post-Deployment Checklist

- [ ] Backend is accessible at your domain
- [ ] Frontend loads without errors
- [ ] Can browse products
- [ ] Can create account
- [ ] Can login
- [ ] Can add items to cart
- [ ] Images load from Cloudinary
- [ ] No console errors in browser DevTools
- [ ] HTTPS is working (green padlock)

---

## Monitoring Setup (Optional but Recommended)

### Free Monitoring Tools

1. **UptimeRobot** - Monitor uptime
   - Add backend: `https://api.easycart.com/health/`
   - Add frontend: `https://easycart.com`

2. **Sentry** - Error tracking
   - Free tier: 5,000 errors/month
   - Setup: See PRODUCTION_DEPLOYMENT_CHECKLIST.md

3. **Google Analytics** - User analytics
   - Free forever
   - Add tracking ID to frontend

---

## Cost Estimate (Free Tier)

| Service | Free Tier | Cost After Free Tier |
|---------|-----------|---------------------|
| Vercel (Frontend) | Unlimited | $20/month for team features |
| Railway (Backend) | $5 credit/month | $0.000463/GB-hour + $0.20/GB egress |
| MongoDB Atlas | 512MB storage | $9/month (M10) |
| Cloudinary | 25GB storage | $99/month (Plus) |
| **Total Free** | ✅ Fully functional | ~$30-50/month at scale |

---

## Troubleshooting

### Backend won't start
```bash
# Check logs on Railway/Render
# Common issues:
# - Missing MONGODB_URI
# - Invalid SECRET_KEY
# - ALLOWED_HOSTS not set
```

### Frontend shows API errors
```bash
# Check CORS settings in backend
# Verify REACT_APP_API_URL is correct
# Check browser console for exact error
```

### Database connection fails
```bash
# Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
# Check connection string format
# Ensure password doesn't contain special characters (URL encode if needed)
```

---

## Support Resources

- **Railway Docs**: https://docs.railway.app/
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Django Deployment**: https://docs.djangoproject.com/en/4.2/howto/deployment/

---

**🎉 Congratulations! Your EasyCart app is live!**

**Next Steps:**
1. Add products through admin panel
2. Set up payment processing
3. Configure email notifications
4. Add your custom domain
5. Set up monitoring and alerts

**Need help?** Check the comprehensive guide: `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
