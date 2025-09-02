# 🚂 Railway Deployment Guide for EasyCart

## 🚀 Quick Deploy Steps

### 1. **Setup Railway Account**
- Go to https://railway.app
- Sign up with GitHub account
- Connect your GitHub repository

### 2. **Deploy Backend API**
1. Click "New Project" → "Deploy from GitHub repo"
2. Select `EasyCart` repository
3. Choose "Deploy from monorepo" 
4. Set **Root Directory**: `backend`
5. **Environment Variables**:
   ```
   NODE_ENV=production
   JWT_SECRET=easycart-super-secret-jwt-key-production-2024
   MONGODB_URI=mongodb+srv://easycart:EasyCart2024@cluster0.mongodb.net/easycart
   PORT=5000
   ```
6. Click "Deploy"

### 3. **Deploy Frontend**
1. Add new service to same project
2. Choose "Deploy from GitHub repo" 
3. Set **Root Directory**: `frontend`
4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```
5. Click "Deploy"

### 4. **Deploy Admin Dashboard**
1. Add new service to same project
2. Set **Root Directory**: `admin-dashboard`
3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```
4. Click "Deploy"

## 🔧 **Important Notes**

### **Get Backend URL:**
1. Go to backend service in Railway dashboard
2. Click "Settings" → "Domains"
3. Copy the generated URL (e.g., `https://backend-production-xxxx.railway.app`)
4. Use this URL in frontend environment variables

### **Custom Domains (Optional):**
1. Go to service → Settings → Domains
2. Click "Custom Domain"
3. Add your domain (e.g., `api.easycart.com`)

### **Database Setup:**
- Using MongoDB Atlas (already configured)
- Connection string in MONGODB_URI environment variable
- No additional Railway database needed

## 📋 **Final URLs**
After deployment, you'll have:
- **Backend API**: `https://backend-production-xxxx.railway.app`
- **Frontend**: `https://frontend-production-xxxx.railway.app`
- **Admin Dashboard**: `https://admin-production-xxxx.railway.app`

## 🧪 **Test Deployment**
1. **Seed Database**:
   ```bash
   curl -X POST https://your-backend-url.railway.app/api/seed
   ```

2. **Test Admin Login**:
   - URL: `https://your-admin-url.railway.app/admin/login`
   - Email: admin@easycart.com
   - Password: admin123

3. **Test Frontend**:
   - Visit frontend URL
   - Register new account
   - Browse products
   - Add to cart

## 🔄 **Auto-Deploy**
- Railway automatically deploys on every git push to main branch
- No manual deployment needed after initial setup
- Check deployment logs in Railway dashboard

## 💰 **Pricing**
- **Free Tier**: $5 credit monthly
- **Usage**: ~$0.10-0.50 per day for small traffic
- **Scaling**: Automatic based on usage

## 🛠️ **Troubleshooting**
- **Build Fails**: Check logs in Railway dashboard
- **Environment Variables**: Ensure all required vars are set
- **CORS Issues**: Backend allows all origins in production
- **Database Connection**: Verify MongoDB URI is correct

---
**Ready to deploy! Follow the steps above to get EasyCart live on Railway.** 🚀