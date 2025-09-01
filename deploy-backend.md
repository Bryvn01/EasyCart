# Backend Deployment Instructions

## 1. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository: `https://github.com/Bryvn01/EasyCart`
3. Select the `backend` folder as root directory
4. Add environment variables:
   - `MONGODB_URI`: `mongodb+srv://easycart:easycart2024@easycart.abc123.mongodb.net/easycart`
   - `JWT_SECRET`: `easycart-super-secret-key-2024`
   - `NODE_ENV`: `production`
5. Deploy

## 2. Setup MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user: `easycart` / `easycart2024`
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string

## 3. Seed Database

After deployment, run:
```bash
curl -X POST https://your-backend-url.vercel.app/api/seed
```

## 4. Test API

```bash
curl https://your-backend-url.vercel.app/api/health
```

## 5. Admin Login

- Email: admin@easycart.com
- Password: admin123