# Backend Deployment Instructions

## 1. Deploy to Render

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `https://github.com/Bryvn01/EasyCart`
4. Select the `backend` folder as root directory
5. Add environment variables:
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>`
   - `JWT_SECRET`: `<generate-a-long-random-jwt-secret>`
   - `NODE_ENV`: `production`
6. Deploy

## 2. Setup MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user: `<username>` / `<strong-password>`
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
- Password: <your-admin-password>

**Backend URL:** https://easycart-backend.onrender.com
