# 🚀 Manual Deployment Guide

## Current Status
- ✅ Frontend: https://easy-cart-obsc.vercel.app/ (Working)
- ❌ Backend: Needs manual deployment

## Deploy Backend to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click "New Project"

### Step 2: Import Repository
1. Select "Import Git Repository"
2. Enter: `https://github.com/Bryvn01/EasyCart`
3. Click "Import"

### Step 3: Configure Backend Project
1. **Project Name:** `easycart-backend`
2. **Root Directory:** `backend`
3. **Framework Preset:** Other
4. **Build Command:** `npm install`
5. **Output Directory:** (leave empty)

### Step 4: Add Environment Variables
```
MONGODB_URI=mongodb+srv://easycart:EasyCart2024@cluster0.mongodb.net/easycart?retryWrites=true&w=majority
JWT_SECRET=easycart-super-secret-jwt-key-production-2024
NODE_ENV=production
FRONTEND_URL=https://easy-cart-obsc.vercel.app
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy the deployment URL

### Step 6: Update Frontend
Update frontend environment to use new backend URL:
```bash
# In frontend/.env
REACT_APP_API_URL=https://your-new-backend-url.vercel.app/api
```

## Test After Deployment

### Seed Database
```bash
curl -X POST https://your-backend-url.vercel.app/api/seed
```

### Test Admin Login
- URL: https://easy-cart-obsc.vercel.app/admin/manage
- Email: admin@easycart.com
- Password: admin123

### Test API Health
```bash
curl https://your-backend-url.vercel.app/api/health
```

## All Features Ready
✅ Security fixes (CSRF, XSS protection)
✅ Performance improvements (lazy loading, debouncing)
✅ UI/UX enhancements (toast notifications, reusable components)
✅ Error handling improvements
✅ Admin panel with proper authentication