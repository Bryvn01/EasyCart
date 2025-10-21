# 🚀 Render Deployment Guide (Django + PostgreSQL)

## Current Status
- ✅ Frontend: https://easycart-frontend-wj9x.onrender.com/ (Active)
- ✅ Backend: https://easycart-backend-2k8l.onrender.com/ (Active)
- ✅ Admin: https://easycart-admin-08xf.onrender.com/ (Active)

## Deploy to Render

### Step 1: Go to Render Dashboard
1. Visit: https://render.com/dashboard
2. Click "New +"

### Step 2: Deploy Backend (Web Service)
1. Select "Web Service"
2. Connect GitHub repository: `https://github.com/Bryvn01/EasyCart`
3. Configure:
   - **Service Name:** `easycart-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3.10+
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn ecommerce.wsgi:application`

### Step 3: Add Backend Environment Variables
```
# PostgreSQL
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=your-postgres-host
DB_PORT=5432

# Django
SECRET_KEY=your-django-secret-key
DEBUG=False
ALLOWED_HOSTS=easycart-backend-2k8l.onrender.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://easycart-frontend-wj9x.onrender.com,https://easycart-admin-08xf.onrender.com
FRONTEND_URL=https://easycart-frontend-wj9x.onrender.com

# Cloudinary (optional, for images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 4: Deploy Frontend (Static Site)
1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Site Name:** `easycart-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `build`

### Step 5: Add Frontend Environment Variables
```
REACT_APP_API_URL=https://easycart-backend-2k8l.onrender.com/api
```

### Step 6: Deploy Admin (Static Site)
1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Site Name:** `easycart-admin`
   - **Root Directory:** `admin-dashboard`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `build`

### Step 7: Add Admin Environment Variables
```
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
```

## Test After Deployment

### Seed Database
```bash
# SSH into your backend service or use the Render shell
python manage.py migrate
python manage.py seed_products
```

### Test Admin Login
- URL: https://easycart-admin.onrender.com/admin/manage
- Use your created superuser credentials

### Test API Health
```bash
curl https://easycart-backend.onrender.com/api/health/
```

### Test Frontend
- Visit: https://easycart-1-752r.onrender.com

## Benefits of Render

✅ **Automatic HTTPS** - All deployments get SSL certificates
✅ **Auto-deploy on push** - Automatically builds and deploys from Git
✅ **Environment variables** - Managed securely in dashboard
✅ **Free tier** - 750 hours/month included
✅ **Built-in monitoring** - Logs and metrics included
✅ **No cold starts** - For static sites

## Live URLs

- **Frontend:** https://easycart-frontend-wj9x.onrender.com
- **Backend:** https://easycart-backend-2k8l.onrender.com
- **Admin:** https://easycart-admin-08xf.onrender.com