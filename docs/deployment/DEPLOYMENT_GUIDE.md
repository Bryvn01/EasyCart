# EasyCart Admin Dashboard - Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Backend Deployment (Render.com)

#### A. Push Latest Code
```bash
cd c:\EasyCart
git add .
git commit -m "Admin dashboard fixes - production ready"
git push origin main
```

#### B. Render Configuration
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete (~5-10 minutes)

#### C. Verify Backend Endpoints
```bash
# Test endpoints
curl https://easycart-backend-2k8l.onrender.com/api/health/
curl https://easycart-backend-2k8l.onrender.com/api/products/admin/products/
curl https://easycart-backend-2k8l.onrender.com/api/orders/admin/orders/
```

---

### 2. Admin Dashboard Deployment

#### A. Update Environment Variables
Edit `admin-dashboard/.env`:
```env
# Switch to production
REACT_APP_API_URL=https://easycart-backend-2k8l.onrender.com/api
REACT_APP_UPLOAD_URL=https://easycart-backend-2k8l.onrender.com/uploads
GENERATE_SOURCEMAP=false
```

#### B. Build for Production
```bash
cd c:\EasyCart\admin-dashboard
npm run build
```

#### C. Deploy to Render
1. Push to GitHub:
```bash
git add .
git commit -m "Admin dashboard production build"
git push origin main
```

2. Render will auto-deploy from `admin-dashboard/build`

---

### 3. Post-Deployment Verification

#### Test All Pages
1. **Login**: https://easycart-admin-08xf.onrender.com/admin/login
   - Email: `admin@easycart.com`
   - Password: `admin123`

2. **Dashboard**: https://easycart-admin-08xf.onrender.com/admin/dashboard
   - ✅ Stats loading
   - ✅ Recent orders displaying

3. **Products**: https://easycart-admin-08xf.onrender.com/admin/products
   - ✅ List products
   - ✅ Create product
   - ✅ Upload image
   - ✅ Edit/delete product

4. **Categories**: https://easycart-admin-08xf.onrender.com/admin/categories
   - ✅ List categories
   - ✅ Create/edit/delete

5. **Orders**: https://easycart-admin-08xf.onrender.com/admin/orders
   - ✅ List orders
   - ✅ Update status

6. **Users**: https://easycart-admin-08xf.onrender.com/admin/users
   - ✅ List customers
   - ✅ Edit customer details

---

## 🔧 Environment Configuration

### Backend (.env)
```env
# Django
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=easycart-backend-2k8l.onrender.com

# Database (PostgreSQL on Render)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart_db
DB_USER=easycart_user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host.render.com
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://easycart-frontend-wj9x.onrender.com,https://easycart-admin-08xf.onrender.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# M-Pesa
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://easycart-backend-2k8l.onrender.com/api/orders/payment/mpesa/callback/

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_ADMIN_PHONE=254723796116
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://easycart-backend-2k8l.onrender.com/api
```

### Admin Dashboard (.env)
```env
REACT_APP_API_URL=https://easycart-backend-2k8l.onrender.com/api
REACT_APP_UPLOAD_URL=https://easycart-backend-2k8l.onrender.com/uploads
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
GENERATE_SOURCEMAP=false
```

---

## 📋 Pre-Deployment Checklist

### Backend
- [ ] All migrations applied
- [ ] Static files collected
- [ ] Environment variables set
- [ ] Database seeded with products
- [ ] Superuser created
- [ ] CORS origins configured
- [ ] Cloudinary credentials set
- [ ] M-Pesa credentials configured (if using)

### Admin Dashboard
- [ ] API URL points to production
- [ ] Build completes without errors
- [ ] No console errors in production build
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Image upload works
- [ ] All CRUD operations work

---

## 🐛 Troubleshooting

### Issue: "Network Error" on Login
**Solution**:
1. Check backend is running: `curl https://easycart-backend-2k8l.onrender.com/api/health/`
2. Verify CORS settings include admin dashboard URL
3. Check browser console for specific error

### Issue: Images Not Uploading
**Solution**:
1. Verify Cloudinary credentials in backend `.env`
2. Check file size < 5MB
3. Check file type is image (JPEG, PNG, WebP)
4. Check backend logs for upload errors

### Issue: "Failed to fetch products/orders"
**Solution**:
1. Verify backend endpoints exist:
   - `/api/products/admin/products/`
   - `/api/orders/admin/orders/`
2. Check authentication token is valid
3. Verify user has admin privileges

### Issue: "Unknown" Customer Names in Orders
**Solution**: This is expected for orders without user association. Not an error.

---

## 🔒 Security Checklist

### Production Security
- [ ] DEBUG=False in production
- [ ] Strong SECRET_KEY (50+ random characters)
- [ ] HTTPS enabled (Render provides this)
- [ ] CORS restricted to specific origins
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Secure password hashing (Django default)
- [ ] JWT tokens with expiration
- [ ] Admin-only endpoints protected

### Monitoring
- [ ] Set up error tracking (Sentry recommended)
- [ ] Monitor API response times
- [ ] Check database performance
- [ ] Monitor disk usage
- [ ] Set up uptime monitoring

---

## 📊 Performance Optimization

### Backend
- [ ] Enable database connection pooling
- [ ] Add Redis caching (optional)
- [ ] Optimize database queries (select_related, prefetch_related)
- [ ] Enable gzip compression
- [ ] Set up CDN for static files

### Frontend
- [ ] Code splitting enabled (React.lazy)
- [ ] Images optimized via Cloudinary
- [ ] Lazy loading for images
- [ ] Minified production build
- [ ] Source maps disabled in production

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## 📞 Support

### Common Commands

**Check Backend Status**:
```bash
curl https://easycart-backend-2k8l.onrender.com/api/health/
```

**View Backend Logs** (Render Dashboard):
1. Go to Render Dashboard
2. Select backend service
3. Click "Logs" tab

**Restart Services** (Render Dashboard):
1. Go to service
2. Click "Manual Deploy" → "Clear build cache & deploy"

---

## ✅ Final Verification

After deployment, verify:

1. **Authentication**:
   - [ ] Can login with admin credentials
   - [ ] Token stored correctly
   - [ ] Protected routes work

2. **Products**:
   - [ ] List loads
   - [ ] Can create product
   - [ ] Can upload image
   - [ ] Can edit/delete

3. **Orders**:
   - [ ] List loads
   - [ ] Can update status

4. **Performance**:
   - [ ] Pages load < 3 seconds
   - [ ] No console errors
   - [ ] Images load properly

---

## 🎉 Success Criteria

Your admin dashboard is production-ready when:
- ✅ All pages load without errors
- ✅ Authentication works
- ✅ All CRUD operations work
- ✅ Image upload works
- ✅ No security vulnerabilities
- ✅ Performance is acceptable
- ✅ Mobile responsive

---

**Last Updated**: 2025-01-04
**Version**: 1.0.0
