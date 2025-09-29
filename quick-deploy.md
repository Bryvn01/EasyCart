# Quick Deployment Guide

## Render Deployment

The application is deployed on Render with automatic builds and HTTPS:

### Live URLs:
- ✅ Frontend: https://easycart-frontend.onrender.com/
- ✅ Backend: https://easycart-backend.onrender.com/
- ✅ Admin: https://easycart-admin.onrender.com/

### Manual Render Deploy (if needed):
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service" (for backend) or "Static Site" (for frontend/admin)
3. Connect GitHub repo: https://github.com/Bryvn01/EasyCart
4. Set appropriate root directory:
   - Backend: `backend`
   - Frontend: `frontend`
   - Admin: `admin-dashboard`

### Current Status:
- ✅ Frontend: https://easycart-frontend.onrender.com/ (Working)
- ✅ Backend: https://easycart-backend.onrender.com/ (Working)
- ✅ Admin: https://easycart-admin.onrender.com/ (Working)

### Test URLs:
- Frontend: https://easycart-frontend.onrender.com/
- Admin Panel: https://easycart-admin.onrender.com/admin/manage
- Login: admin@easycart.com / admin123

### Environment Variables for Backend:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/easycart
JWT_SECRET=<your_jwt_secret>
NODE_ENV=production
```

### Environment Variables for Frontend/Admin:
```
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
```