# Deployment Instructions

## 1. Render Deployment (Recommended)

### Backend:
1. Go to https://render.com/new
2. Select "Web Service"
3. Import GitHub repo: `https://github.com/Bryvn01/EasyCart`
4. Set Root Directory: `backend`
5. Add Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://easycart:EasyCart2024@cluster0.mongodb.net/easycart`
   - `JWT_SECRET`: `easycart-super-secret-jwt-key-production-2024`
   - `FRONTEND_URL`: `https://easycart-frontend.onrender.com`
6. Deploy

### Frontend:
1. Go to https://render.com/new
2. Select "Static Site"
3. Import same GitHub repo
4. Set Root Directory: `frontend`
5. Add Environment Variables:
   - `REACT_APP_API_URL`: `https://easycart-backend.onrender.com/api`
   - `REACT_APP_FIREBASE_API_KEY`: `AIzaSyBqK8J9X2mF4nP7vL3wR8sT1uY6eH9cA2b`
   - `REACT_APP_POSTHOG_KEY`: `phc_easycart_demo_key_2024`
6. Deploy

### Admin Dashboard:
1. Go to https://render.com/new
2. Select "Static Site"
3. Import same GitHub repo
4. Set Root Directory: `admin-dashboard`
5. Add Environment Variables:
   - `REACT_APP_API_URL`: `https://easycart-backend.onrender.com/api`
6. Deploy

## 2. Post-Deployment

### Seed Database:
```bash
curl -X POST https://easycart-backend.onrender.com/api/seed
```

### Test Endpoints:
```bash
# Health check
curl https://easycart-backend.onrender.com/api/health

# Get products
curl https://easycart-backend.onrender.com/api/products

# Frontend
https://easycart-frontend.onrender.com
```

## 3. Admin Access
- URL: `https://easycart-admin.onrender.com/admin/login`
- Login: `admin@easycart.com` / `admin123`