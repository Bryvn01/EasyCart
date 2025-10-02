# 🚀 Render Deployment Guide

## Current Status
- ✅ Frontend: https://easycart-1-752r.onrender.com/ (Working)
- ✅ Backend: https://easycart-backend.onrender.com/ (Working)  
- ✅ Admin: https://easycart-admin.onrender.com/ (Working)

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
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Step 3: Add Backend Environment Variables
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/easycart?retryWrites=true&w=majority
JWT_SECRET=<your_jwt_secret>
NODE_ENV=production
FRONTEND_URL=https://easycart-1-752r.onrender.com
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
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
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
```

## Test After Deployment

### Seed Database
```bash
curl -X POST https://easycart-backend.onrender.com/api/seed
```

### Test Admin Login
- URL: https://easycart-admin.onrender.com/admin/manage
- Email: admin@easycart.com
- Password: admin123

### Test API Health
```bash
curl https://easycart-backend.onrender.com/api/health
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

- **Frontend:** https://easycart-1-752r.onrender.com  
- **Backend:** https://easycart-backend.onrender.com  
- **Admin:** https://easycart-admin.onrender.com