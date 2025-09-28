# EasyCart Deployment Instructions

## Current Deployment - Render Platform ✅

EasyCart is deployed on **Render** with the following live applications:

### 🌐 Live Applications:
- **Frontend**: [https://easycart-frontend-zge5.onrender.com](https://easycart-frontend-zge5.onrender.com)
- **Backend API**: [https://easycart-backend-0u8r.onrender.com](https://easycart-backend-0u8r.onrender.com)
- **Admin Dashboard**: [https://easycart-admin.onrender.com](https://easycart-admin.onrender.com)

## 🚀 Deploy Your Own Instance

For complete step-by-step deployment instructions, see [RENDER_DEPLOY.md](RENDER_DEPLOY.md)

### Quick Summary:
1. **Backend (Web Service)**: Deploy from `backend/` directory
2. **Frontend (Static Site)**: Deploy from `frontend/` directory  
3. **Admin Dashboard (Static Site)**: Deploy from `admin-dashboard/` directory

## 🧪 Test the Live Application

### Seed Database:
```bash
curl -X POST https://easycart-backend-0u8r.onrender.com/api/seed
```

### Test API Endpoints:
```bash
# Health check
curl https://easycart-backend-0u8r.onrender.com/api/health

# Get products
curl https://easycart-backend-0u8r.onrender.com/api/products
```

### Test Frontend:
Visit [https://easycart-frontend-zge5.onrender.com](https://easycart-frontend-zge5.onrender.com)

### Admin Access:
- **URL**: [https://easycart-admin.onrender.com/admin/login](https://easycart-admin.onrender.com/admin/login)
- **Login**: `admin@easycart.com` / `admin123`

## 🔄 Auto-Deploy

Render automatically deploys when you push changes to the `main` branch:
- GitHub integration handles automatic deployments
- Environment variables managed in Render dashboard
- No additional CI/CD setup required

## 🛠️ Environment Variables

### Backend:
```
NODE_ENV=production
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-connection-string
```

### Frontend & Admin:
```
REACT_APP_API_URL=https://easycart-backend-0u8r.onrender.com/api
```

## 📖 Additional Resources

- [RENDER_DEPLOY.md](RENDER_DEPLOY.md) - Complete deployment guide
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - General deployment information