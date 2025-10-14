# EasyCart - Quick Deploy Guide (PostgreSQL Edition)

## 🚀 Deploy in 15 Minutes with PostgreSQL

This guide helps you deploy EasyCart with PostgreSQL database to production.

---

## 📋 What You'll Deploy

- ✅ **Frontend**: React app → Vercel
- ✅ **Backend**: Django API → Railway
- ✅ **Database**: PostgreSQL → Railway (included)
- ✅ **Images**: Cloudinary (already configured)

---

## Option 1: Railway (Backend + Database) + Vercel (Frontend) ⭐

**Best for**: Simplest full-stack deployment
**Time**: 15 minutes
**Cost**: $5 free credit (includes PostgreSQL + backend hosting)

### Prerequisites
- ✅ GitHub account
- ✅ Railway account (sign up at railway.app)
- ✅ Vercel account (sign up at vercel.com)
- ✅ Cloudinary account (you already have this)

---

### Part A: Deploy Database + Backend to Railway

#### Step 1: Push to GitHub (2 minutes)

```powershell
# Make sure everything is committed
cd C:\EasyCart
git add .
git commit -m "Ready for production deployment"
git push origin main
```

---

#### Step 2: Create Railway Project (1 minute)

1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Select **"Provision PostgreSQL"**
5. Wait 30 seconds for database creation

---

#### Step 3: Get Database Credentials (1 minute)

1. Click on the **PostgreSQL service** card
2. Go to **"Variables"** tab
3. Copy these values (you'll need them):

```
PGHOST=containers-us-west-xxx.railway.app
PGPORT=6789
PGUSER=postgres
PGPASSWORD=xxxxxxxxxxxxxxxx
PGDATABASE=railway
```

---

#### Step 4: Add Django Backend Service (3 minutes)

1. In same Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose your **EasyCart** repository
4. Railway will detect Django automatically

---

#### Step 5: Configure Backend Environment Variables (3 minutes)

Click on backend service → **"Variables"** tab → Add these:

```env
# Django Core
DEBUG=False
SECRET_KEY=your_production_secret_key_here_50_chars
ALLOWED_HOSTS=.railway.app

# PostgreSQL (use values from Step 3)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your_pgpassword_from_step_3
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=6789

# CORS (will update after deploying frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Cloudinary (your existing credentials)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Python/Django
PYTHONUNBUFFERED=1
PORT=8000
```

**🔐 Generate SECRET_KEY:**
```powershell
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

#### Step 6: Configure Railway Settings (1 minute)

1. Go to **"Settings"** tab in backend service
2. **Root Directory**: Leave blank (or set to `backend` if needed)
3. **Start Command**: 
   ```bash
   python manage.py migrate && gunicorn ecommerce.wsgi:application --bind 0.0.0.0:$PORT
   ```
4. Click **"Deploy"**

---

#### Step 7: Run Database Migrations (2 minutes)

Railway will auto-deploy. Once deployed:

1. Click on backend service
2. Go to **"Deployments"** tab
3. Click latest deployment → **"View Logs"**
4. Look for "migrations applied" message
5. Note your backend URL: `https://easycart-production-xxxx.up.railway.app`

**If migrations didn't run automatically:**
1. Go to backend service → **"Settings"**
2. Scroll to **"Deploy Trigger"**
3. Click **"Redeploy"**

---

### Part B: Deploy Frontend to Vercel

#### Step 8: Deploy to Vercel (3 minutes)

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub **EasyCart** repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

---

#### Step 9: Add Frontend Environment Variables (1 minute)

In Vercel project settings → **"Environment Variables"**:

```env
REACT_APP_API_URL=https://easycart-production-xxxx.up.railway.app/api
REACT_APP_BACKEND_URL=https://easycart-production-xxxx.up.railway.app
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Replace `easycart-production-xxxx.up.railway.app` with your actual Railway backend URL from Step 7.

---

#### Step 10: Deploy Frontend

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your site will be live: `https://easycart-xxxx.vercel.app`

---

### Part C: Final Configuration

#### Step 11: Update CORS Settings (1 minute)

Go back to Railway → Backend service → **"Variables"**:

Update these variables:
```env
CORS_ALLOWED_ORIGINS=https://easycart-xxxx.vercel.app
ALLOWED_HOSTS=.railway.app,easycart-xxxx.vercel.app
```

Replace with your actual Vercel URL.

Backend will auto-redeploy.

---

#### Step 12: Test Your Deployment (2 minutes)

Visit your Vercel URL: `https://easycart-xxxx.vercel.app`

Test:
- [ ] ✅ Homepage loads
- [ ] ✅ Products page displays
- [ ] ✅ Images load from Cloudinary
- [ ] ✅ Register new user
- [ ] ✅ Login works
- [ ] ✅ Add to cart
- [ ] ✅ Checkout (if payment configured)

---

## 🎉 Success! Your EasyCart is Live!

**Your URLs:**
- 🌐 **Frontend**: https://easycart-xxxx.vercel.app
- 🔧 **Backend API**: https://easycart-production-xxxx.up.railway.app/api
- 🗄️ **Database**: PostgreSQL on Railway (managed)
- 🖼️ **Images**: Cloudinary CDN

---

## Option 2: Render (All-in-One) 🟣

**Best for**: Single platform deployment
**Time**: 20 minutes
**Cost**: $7/month (Render Starter includes PostgreSQL)

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub

---

### Step 2: Create PostgreSQL Database (3 minutes)

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: easycart-db
   - **Database**: easycart
   - **User**: easycart_user
   - **Region**: Choose closest to you
   - **Plan**: Free (or Starter $7/month)
3. Click **"Create Database"**
4. Copy **"Internal Database URL"**:
   ```
   postgres://easycart_user:xxx@dpg-xxx.oregon-postgres.render.com/easycart
   ```

---

### Step 3: Deploy Backend (5 minutes)

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository
3. Configure:
   - **Name**: easycart-backend
   - **Region**: Same as database
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python manage.py migrate && gunicorn ecommerce.wsgi:application`
4. Add Environment Variables:

```env
DEBUG=False
SECRET_KEY=your_production_secret_key
ALLOWED_HOSTS=.onrender.com

# Parse database URL from Internal Database URL:
DB_ENGINE=django.db.backends.postgresql
DB_NAME=easycart
DB_USER=easycart_user
DB_PASSWORD=xxx
DB_HOST=dpg-xxx.oregon-postgres.render.com
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Click **"Create Web Service"**

---

### Step 4: Deploy Frontend (5 minutes)

1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: easycart-frontend
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Add Environment Variables:

```env
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
REACT_APP_BACKEND_URL=https://easycart-backend.onrender.com
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

5. Click **"Create Static Site"**

---

### Step 5: Update CORS (1 minute)

Go back to backend service → **"Environment"**:

Update:
```env
CORS_ALLOWED_ORIGINS=https://easycart-frontend.onrender.com
ALLOWED_HOSTS=.onrender.com
```

---

## Option 3: DigitalOcean App Platform 🌊

**Best for**: More control, scalable infrastructure
**Time**: 25 minutes
**Cost**: $12/month (includes database)

### Step 1: Create DigitalOcean Account

1. Go to https://cloud.digitalocean.com
2. Sign up (get $200 credit for 60 days)

---

### Step 2: Create Managed PostgreSQL (5 minutes)

1. Click **"Create"** → **"Databases"**
2. Choose **PostgreSQL**
3. Configure:
   - **Name**: easycart-db
   - **Plan**: Basic ($15/month) or Dev ($7/month)
   - **Region**: Choose closest
4. Click **"Create Database Cluster"**
5. Wait 3-5 minutes for provisioning
6. Copy connection details

---

### Step 3: Create App (5 minutes)

1. Click **"Create"** → **"Apps"**
2. Choose **GitHub** → Select repository
3. DigitalOcean will detect frontend and backend

---

### Step 4: Configure Backend Component (5 minutes)

1. Select backend component
2. Settings:
   - **Source Directory**: `/backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `gunicorn ecommerce.wsgi:application`
3. Add environment variables (similar to Render)
4. Link to PostgreSQL database (automatic connection)

---

### Step 5: Configure Frontend Component (5 minutes)

1. Select frontend component
2. Settings:
   - **Source Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `build`
3. Add environment variables

---

### Step 6: Deploy (5 minutes)

1. Review configuration
2. Click **"Create Resources"**
3. Wait for deployment (5-10 minutes)
4. Access via provided URLs

---

## 📊 Cost Comparison

| Platform | PostgreSQL | Backend | Frontend | Total/Month |
|----------|-----------|---------|----------|-------------|
| **Railway** | Included | Included | + Vercel | ~$5-20 |
| **Render** | $7 | $7 | Free | $14 |
| **DigitalOcean** | $7 | $5 | $5 | $17 |

**Recommendation**: Start with **Railway + Vercel** (easiest setup, best free tier)

---

## 🔧 Post-Deployment Steps

### 1. Create Superuser (Admin Access)

**Railway:**
```bash
# In Railway service → "Settings" → "Variables"
# Add one-time command
railway run python manage.py createsuperuser
```

**Render:**
```bash
# Use "Shell" feature in Render dashboard
python manage.py createsuperuser
```

---

### 2. Verify Database Migrations

Check logs for:
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
```

---

### 3. Test Critical Paths

- [ ] User registration
- [ ] User login
- [ ] Browse products
- [ ] Search products
- [ ] Add to cart
- [ ] Checkout
- [ ] Admin panel (`/admin`)

---

### 4. Set Up Custom Domain (Optional)

**Vercel:**
1. Go to project → **"Settings"** → **"Domains"**
2. Add your domain: `www.easycart.com`
3. Configure DNS records as instructed
4. Wait for SSL certificate (automatic)

**Railway:**
1. Backend service → **"Settings"** → **"Networking"**
2. Add custom domain: `api.easycart.com`
3. Update DNS with provided CNAME
4. Update CORS settings

---

## 🆘 Troubleshooting

### Issue: "This site can't be reached"
**Solution**: Wait 5-10 minutes for DNS propagation

---

### Issue: "Internal Server Error"
**Solution**: 
1. Check backend logs
2. Verify all environment variables set
3. Verify DATABASE_URL is correct
4. Check migrations ran successfully

---

### Issue: CORS errors in browser console
**Solution**:
1. Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
2. No trailing slash in URLs
3. Include protocol (https://)

---

### Issue: Images not loading
**Solution**:
1. Verify Cloudinary credentials in backend
2. Check CORS settings in Cloudinary dashboard
3. Verify `crossOrigin="anonymous"` in image tags

---

### Issue: Database connection timeout
**Solution**:
1. Verify database is running
2. Check connection string format
3. Verify SSL mode if required:
   ```env
   DB_OPTIONS={"sslmode": "require"}
   ```

---

## 🎯 Next Steps After Deployment

1. **Set up monitoring** (see PRODUCTION_READINESS_POSTGRESQL.md)
2. **Configure payment gateway** (Stripe/PayPal/M-PESA)
3. **Set up email service** (SendGrid for order confirmations)
4. **Add custom domain** (more professional)
5. **Enable backups** (automated via hosting provider)
6. **Performance testing** (load testing with JMeter/K6)
7. **Security scan** (OWASP ZAP, SSL Labs)

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **PostgreSQL on Railway**: https://docs.railway.app/databases/postgresql
- **Django Deployment**: https://docs.djangoproject.com/en/stable/howto/deployment/

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database backup taken
- [ ] Cloudinary configured

### During Deployment
- [ ] PostgreSQL database created
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] Migrations run
- [ ] CORS configured

### Post-Deployment
- [ ] All pages load correctly
- [ ] API endpoints respond
- [ ] Database connections work
- [ ] Images load from Cloudinary
- [ ] User registration works
- [ ] Login/logout works
- [ ] Cart functionality works
- [ ] Admin panel accessible
- [ ] No console errors
- [ ] Mobile responsive

---

**🎉 Congratulations! Your EasyCart eCommerce platform is now live in production!**

**Your Stack:**
- ⚛️ React Frontend (Vercel/Render)
- 🐍 Django Backend (Railway/Render)
- 🐘 PostgreSQL Database (Managed)
- ☁️ Cloudinary CDN
- 🔒 HTTPS/SSL (Automatic)

**Current Status**: Production Ready ✅
**Ready to Accept Orders**: After payment gateway integration 💳
**Ready to Scale**: PostgreSQL handles high traffic efficiently 🚀
