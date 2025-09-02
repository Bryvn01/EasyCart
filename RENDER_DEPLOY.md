# 🚀 Render Deployment Guide for EasyCart

## Quick Deploy Steps

### 1. **Setup Render Account**
- Go to https://render.com
- Sign up with GitHub account
- Connect your GitHub repository

### 2. **Deploy Backend (Web Service)**
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub and select **"EasyCart"** repo
3. **Settings**:
   - **Name**: `easycart-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   ```
   NODE_ENV=production
   JWT_SECRET=easycart-super-secret-jwt-key-2024
   MONGODB_URI=mongodb+srv://easycart:EasyCart2024@cluster0.mongodb.net/easycart
   ```
5. Click **"Create Web Service"**

### 3. **Deploy Frontend (Static Site)**
1. Click **"New +"** → **"Static Site"**
2. Select **"EasyCart"** repo
3. **Settings**:
   - **Name**: `easycart-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://easycart-backend.onrender.com/api
   ```
5. Click **"Create Static Site"**

### 4. **Deploy Admin Dashboard (Static Site)**
1. Click **"New +"** → **"Static Site"**
2. Select **"EasyCart"** repo
3. **Settings**:
   - **Name**: `easycart-admin`
   - **Root Directory**: `admin-dashboard`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://easycart-backend.onrender.com/api
   ```
5. Click **"Create Static Site"**

## 🔧 **Important Notes**

### **Free Tier Limits:**
- Web services sleep after 15 minutes of inactivity
- First request after sleep takes 30+ seconds (cold start)
- 750 hours/month free (enough for testing)

### **Get Your URLs:**
After deployment:
- **Backend**: `https://easycart-backend.onrender.com`
- **Frontend**: `https://easycart-frontend.onrender.com`
- **Admin**: `https://easycart-admin.onrender.com`

### **Update API URLs:**
1. Go to frontend service → Environment
2. Update `REACT_APP_API_URL` with your actual backend URL
3. Do the same for admin dashboard

## 🧪 **Test Deployment**

### **1. Seed Database:**
```bash
curl -X POST https://easycart-backend.onrender.com/api/seed
```

### **2. Test Admin:**
- URL: `https://easycart-admin.onrender.com/admin/login`
- Email: admin@easycart.com
- Password: admin123

### **3. Test Frontend:**
- Visit: `https://easycart-frontend.onrender.com`
- Register account, browse products

## 🔄 **Auto-Deploy**
- Render automatically deploys on git push to main branch
- Check deployment logs in Render dashboard

## 💡 **Tips**
- **Cold starts**: First request after 15min takes time
- **Logs**: Check deployment logs if something fails
- **Custom domains**: Available on paid plans
- **SSL**: Automatic HTTPS for all deployments

---
**Ready to deploy on Render! Much simpler than Railway.** 🎉