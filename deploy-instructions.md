# Deployment Instructions

## 1. Manual Render Deployment

### Backend:
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repo: `https://github.com/Bryvn01/EasyCart`
4. Set Root Directory: `backend`
5. Add Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://easycart:EasyCart2024@cluster0.mongodb.net/easycart`
   - `JWT_SECRET`: `easycart-super-secret-jwt-key-production-2024`
   - `FRONTEND_URL`: `https://easycart-1-752r.onrender.com`
6. Deploy

### Frontend:
1. Go to https://render.com/dashboard
2. Click "New +" → "Static Site"  
3. Connect same GitHub repo
4. Set Root Directory: `frontend`
5. Add Environment Variables:
   - `REACT_APP_API_URL`: `https://easycart-backend.onrender.com/api`
   - `REACT_APP_FIREBASE_API_KEY`: `AIzaSyBqK8J9X2mF4nP7vL3wR8sT1uY6eH9cA2b`
   - `REACT_APP_POSTHOG_KEY`: `phc_easycart_demo_key_2024`
6. Deploy

### Admin Dashboard:
1. Go to https://render.com/dashboard
2. Click "New +" → "Static Site"
3. Connect same GitHub repo
4. Set Root Directory: `admin-dashboard`
5. Add Environment Variables:
   - `REACT_APP_API_URL`: `https://easycart-backend.onrender.com/api`
6. Deploy

## 2. Automatic Deployment

**Note:** Render automatically deploys on push to main branch. No additional setup required.

**Live URLs:**
- Frontend: https://easycart-1-752r.onrender.com
- Backend: https://easycart-backend.onrender.com
- Admin: https://easycart-admin.onrender.com

## 3. Test Deployment

### Seed Database:
```bash
curl -X POST https://easycart-backend.onrender.com/api/seed
```

### Test API:
```bash
curl https://easycart-backend.onrender.com/api/health
curl https://easycart-backend.onrender.com/api/products
```

### Test Frontend:
https://easycart-1-752r.onrender.com

### Test Admin Dashboard:
- URL: `https://easycart-admin.onrender.com/admin/manage`
- Email: admin@easycart.com
- Password: admin123

## 4. Benefits of Render:

- Automatic HTTPS for all deployments
- Auto-deploy on git push to main branch
- Environment variables managed in dashboard
- Free tier includes 750 hours/month
- No cold starts for static sites
- Built-in monitoring and logs
