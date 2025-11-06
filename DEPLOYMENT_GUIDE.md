# EasyCart Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- GitHub repository
- Render.com account
- Vercel account (optional, for frontend)

## 🗄️ Database Setup (Render PostgreSQL)

### 1. Create PostgreSQL Database
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "PostgreSQL"
3. Configure:
   - **Name**: `easycart-db`
   - **Database**: `easycart`
   - **User**: `easycart_user`
   - **Region**: Choose closest to your users
4. Click "Create Database"
5. Note the connection details from the dashboard

## 🔧 Backend Deployment (Render)

### 1. Create Web Service
1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `easycart-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn ecommerce.wsgi:application`

### 2. Environment Variables
Add these in Render Dashboard → Environment:

```env
# Django Settings
SECRET_KEY=<your_django_secret_key>
DEBUG=False
ALLOWED_HOSTS=easycart-backend.onrender.com,yourdomain.com

# Database (from your PostgreSQL service)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=easycart_user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host.oregon-postgres.render.com
DB_PORT=5432

# CORS (add your frontend domains)
CORS_ALLOWED_ORIGINS=https://easycart-frontend.vercel.app,https://yourdomain.com

# Payment Gateway
MPESA_CONSUMER_KEY=<your_mpesa_consumer_key>
MPESA_CONSUMER_SECRET=<your_mpesa_consumer_secret>
MPESA_PASSKEY=<your_mpesa_passkey>
MPESA_CALLBACK_URL=https://easycart-backend.onrender.com/api/payments/mpesa/callback/
```

### 3. Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Your backend will be available at: `https://easycart-backend.onrender.com`

### 4. Initialize Database
```bash
# Connect to your Render service shell or run locally with production DB
python manage.py migrate
python manage.py seed_products
python manage.py createsuperuser
```

## 🌐 Frontend Deployment (Vercel)

### 1. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2. Environment Variables
Add in Vercel Dashboard → Settings → Environment Variables:

```env
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
```

### 3. Deploy
1. Click "Deploy"
2. Your frontend will be available at: `https://easycart-frontend.vercel.app`

## 🔒 Security Configuration

### 1. Update CORS Settings
In your backend environment variables, update:
```env
CORS_ALLOWED_ORIGINS=https://easycart-frontend.vercel.app,https://yourdomain.com
ALLOWED_HOSTS=easycart-backend.onrender.com,yourdomain.com
```

### 2. SSL/HTTPS
- Render automatically provides SSL certificates
- Vercel automatically provides SSL certificates
- Ensure all API calls use HTTPS in production

### 3. Environment Security
- Use strong, unique SECRET_KEY
- Set DEBUG=False in production
- Restrict CORS to your domains only
- Use environment variables for all secrets

## 🔍 Verification

### 1. Test Backend API
```bash
curl https://easycart-backend.onrender.com/api/health/
curl https://easycart-backend.onrender.com/api/products/
```

### 2. Test Frontend
1. Visit your Vercel URL
2. Verify products load correctly
3. Test user registration/login
4. Test product filtering and search

### 3. Test Database
```bash
# Check product count
curl https://easycart-backend.onrender.com/api/products/ | jq '.count'

# Check categories
curl https://easycart-backend.onrender.com/api/products/categories/
```

## 📊 Monitoring

### 1. Render Monitoring
- View logs in Render Dashboard
- Monitor resource usage
- Set up alerts for downtime

### 2. Database Monitoring
- Monitor PostgreSQL performance in Render
- Set up automated backups
- Monitor connection limits

### 3. Application Monitoring
- Monitor API response times
- Track error rates
- Monitor user activity

## 🔄 CI/CD Pipeline

### 1. Automatic Deployments
- Render automatically deploys on Git push to main branch
- Vercel automatically deploys on Git push to main branch

### 2. Environment Branches
- **main**: Production deployment
- **staging**: Staging environment (optional)
- **development**: Local development

## 🛠️ Maintenance

### 1. Database Backups
- Render provides automatic PostgreSQL backups
- Download backups regularly for additional safety
- Test backup restoration process

### 2. Updates
```bash
# Update dependencies
pip install -r requirements.txt --upgrade
npm update

# Run migrations
python manage.py migrate

# Update static files
python manage.py collectstatic
```

### 3. Scaling
- **Render**: Upgrade service plan for more resources
- **Database**: Upgrade PostgreSQL plan for more connections/storage
- **CDN**: Use Cloudinary or similar for image optimization

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
- Check build logs in Render Dashboard
- Verify requirements.txt is up to date
- Ensure Python version compatibility

#### 2. Database Connection Issues
- Verify database credentials
- Check database service status
- Ensure database allows connections from Render

#### 3. CORS Errors
- Update CORS_ALLOWED_ORIGINS with correct frontend URL
- Ensure no trailing slashes in URLs
- Check browser network tab for exact error

#### 4. Environment Variables
- Verify all required variables are set
- Check for typos in variable names
- Ensure sensitive values are properly escaped

### Debug Commands
```bash
# Check service status
curl https://easycart-backend.onrender.com/api/health/

# View detailed error
curl -v https://easycart-backend.onrender.com/api/products/

# Check environment
python manage.py check --deploy
```

## 📈 Performance Optimization

### 1. Database Optimization
- Add database indexes for frequently queried fields
- Use database connection pooling
- Optimize query patterns

### 2. Caching
- Enable Django caching
- Use CDN for static assets
- Implement browser caching headers

### 3. Monitoring
- Set up application performance monitoring
- Monitor database query performance
- Track user experience metrics

---

**Deployment Checklist:**
- [ ] PostgreSQL database created and configured
- [ ] Backend deployed to Render with all environment variables
- [ ] Frontend deployed to Vercel with API URL configured
- [ ] Database migrated and seeded
- [ ] CORS configured correctly
- [ ] SSL certificates active
- [ ] Health checks passing
- [ ] Admin user created
- [ ] Monitoring set up
