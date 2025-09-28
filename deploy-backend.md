# EasyCart Backend - Deployed on Render ✅

## Current Status: Backend Running Successfully

**Live Backend API**: [https://easycart-backend-0u8r.onrender.com](https://easycart-backend-0u8r.onrender.com)

## 🚀 Deploy Your Own Backend on Render

### 1. Setup Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Connect your repository

### 2. Deploy Backend (Web Service)
1. Click **"New +"** → **"Web Service"**
2. Select your **EasyCart** repository
3. Configure settings:
   - **Name**: `easycart-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Environment Variables
Add these environment variables in Render dashboard:
```
NODE_ENV=production
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb+srv://easycart:easycart2024@cluster0.mongodb.net/easycart
```

### 4. MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user: `easycart` / `easycart2024`
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string and add to MONGODB_URI

## 🧪 Test the Live Backend

### Seed Database:
```bash
curl -X POST https://easycart-backend-0u8r.onrender.com/api/seed
```

### Test API Health:
```bash
curl https://easycart-backend-0u8r.onrender.com/api/health
```

### Get Products:
```bash
curl https://easycart-backend-0u8r.onrender.com/api/products
```

## 👨‍💼 Admin Access

The backend provides admin authentication for:
- **Email**: admin@easycart.com
- **Password**: admin123

## 📖 Complete Deployment Guide

For full deployment instructions including frontend and admin dashboard, see [RENDER_DEPLOY.md](RENDER_DEPLOY.md)