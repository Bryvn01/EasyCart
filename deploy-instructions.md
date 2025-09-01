# Deployment Instructions

## 1. Manual Vercel Deployment

### Backend:
1. Go to https://vercel.com/new
2. Import GitHub repo: `https://github.com/Bryvn01/EasyCart`
3. Set Root Directory: `backend`
4. Add Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://easycart:EasyCart2024@cluster0.mongodb.net/easycart`
   - `JWT_SECRET`: `easycart-super-secret-jwt-key-production-2024`
   - `FRONTEND_URL`: `https://easycart-frontend.vercel.app`
5. Deploy

### Frontend:
1. Go to https://vercel.com/new
2. Import same GitHub repo
3. Set Root Directory: `frontend`
4. Add Environment Variables:
   - `REACT_APP_API_URL`: `https://easycart-backend.vercel.app/api`
   - `REACT_APP_FIREBASE_API_KEY`: `AIzaSyBqK8J9X2mF4nP7vL3wR8sT1uY6eH9cA2b`
   - `REACT_APP_POSTHOG_KEY`: `phc_easycart_demo_key_2024`
5. Deploy

## 2. GitHub Actions Auto-Deploy

### Setup Secrets:
1. Go to GitHub repo Settings > Secrets
2. Add Repository Secrets:
   - `VERCEL_TOKEN`: Get from https://vercel.com/account/tokens
   - `VERCEL_ORG_ID`: Get from Vercel team settings
   - `VERCEL_BACKEND_PROJECT_ID`: Get from backend project settings
   - `VERCEL_FRONTEND_PROJECT_ID`: Get from frontend project settings

### Auto-Deploy:
- Push to `main` branch triggers deployment
- Both frontend and backend deploy automatically
- Environment variables managed in Vercel dashboard

## 3. Post-Deployment

### Seed Database:
```bash
curl -X POST https://easycart-backend.vercel.app/api/seed
```

### Test Endpoints:
```bash
# Health check
curl https://easycart-backend.vercel.app/api/health

# Get products
curl https://easycart-backend.vercel.app/api/products

# Frontend
https://easycart-frontend.vercel.app
```

## 4. Admin Access
- URL: `https://easycart-frontend.vercel.app/admin/manage`
- Login: `admin@easycart.com` / `admin123`