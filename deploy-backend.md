# Backend Deployment Instructions

## 1. Deploy to Render

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `https://github.com/Bryvn01/EasyCart`
4. Select the `backend` folder as root directory
5. Add environment variables:
   - `MONGODB_URI`: `mongodb+srv://easycart:easycart2024@easycart.abc123.mongodb.net/easycart`
   - `JWT_SECRET`: `easycart-super-secret-key-2024`
   - `NODE_ENV`: `production`
6. Deploy

## 2. Setup MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user: `easycart` / `easycart2024`
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string

## 3. Seed Database

After deployment, run:
```bash
curl -X POST https://easycart-backend.onrender.com/api/seed
```

## 4. Test API

```bash
curl https://easycart-backend.onrender.com/api/health
```

## 5. Admin Login

- Email: admin@easycart.com
- Password: admin123

**Backend URL:** https://easycart-backend.onrender.com
