# EasyCart Vercel Deployment Guide

## Quick Start

This guide will help you deploy your EasyCart backend to Vercel as serverless functions.

## Prerequisites

- [Vercel Account](https://vercel.com/signup) (free tier works)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- [Cloudinary Account](https://cloudinary.com/users/register/free) (optional, for image uploads)
- Git repository connected to Vercel

## Step-by-Step Deployment

### 1. Prepare Your Repository

Your repository should have this structure:
```
/api
├── _utils/
├── auth/
├── products/
├── categories/
├── upload/
├── health.js
├── seed.js
└── package.json
vercel.json
.vercelignore
```

✅ All files are already in place!

### 2. Create a Vercel Project

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`Bryvn01/EasyCart`)
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
5. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project directory
cd /path/to/EasyCart

# Login to Vercel
vercel login

# Deploy
vercel

# Or deploy to production directly
vercel --prod
```

### 3. Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Required Variables:

```bash
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/easycart?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URLs (comma-separated, no spaces)
FRONTEND_URL=https://your-frontend.vercel.app,https://your-admin.vercel.app,http://localhost:3000
```

#### Optional Variables (for image uploads):

```bash
# Cloudinary (Option 1: Single URL)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# OR (Option 2: Individual credentials)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### How to Add Environment Variables:

**Via Dashboard:**
1. Go to Project Settings
2. Navigate to "Environment Variables"
3. Add each variable:
   - Name: `MONGO_URI`
   - Value: `mongodb+srv://...`
   - Environment: Production, Preview, Development (select all)
4. Click "Save"
5. Repeat for all variables

**Via CLI:**
```bash
vercel env add MONGO_URI
# Enter value when prompted
# Select environments: Production, Preview, Development

vercel env add JWT_SECRET
vercel env add FRONTEND_URL
vercel env add CLOUDINARY_URL
```

### 4. MongoDB Atlas Setup

Ensure your MongoDB Atlas cluster allows connections from Vercel:

1. Go to MongoDB Atlas Dashboard
2. Navigate to "Network Access"
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ This is safe as your connection is still password-protected
   - Vercel uses dynamic IPs, so specific IP whitelisting isn't practical
5. Save changes

### 5. Redeploy with Environment Variables

After adding environment variables:

**Via Dashboard:**
- Click "Redeploy" on your latest deployment

**Via CLI:**
```bash
vercel --prod
```

### 6. Verify Deployment

Test your endpoints:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Expected response:
{
  "status": "UP",
  "service": "easycart-nodejs-backend",
  "version": "1.0.0",
  "timestamp": "...",
  "components": {
    "database": {
      "status": "UP",
      "details": { ... }
    }
  }
}

# Seed database (first time only)
curl -X POST https://your-project.vercel.app/api/seed

# Get products
curl https://your-project.vercel.app/api/products

# Get categories
curl https://your-project.vercel.app/api/categories
```

## Custom Domain (Optional)

### Add a Custom Domain

1. Go to Project Settings → "Domains"
2. Add your domain (e.g., `api.easycart.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning (~1-2 minutes)

### Update Frontend Configuration

Update your frontend to use the new API URL:

```javascript
// frontend/.env.production
REACT_APP_API_URL=https://api.easycart.com

// or if using your-project.vercel.app:
REACT_APP_API_URL=https://your-project.vercel.app
```

## Testing

### Test Authentication Flow

```bash
# Register a user
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "username": "testuser"
  }'

# Login
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Save the access token from the response

# Get profile
curl https://your-project.vercel.app/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Product Endpoints

```bash
# Get all products with filtering
curl "https://your-project.vercel.app/api/products?category=Electronics&limit=10"

# Get product by ID
curl https://your-project.vercel.app/api/products/PRODUCT_ID

# Create product (admin only)
curl -X POST https://your-project.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 1000,
    "category": "Electronics",
    "brand": "TestBrand",
    "stock": 50
  }'
```

## Monitoring and Logs

### View Function Logs

**Via Dashboard:**
1. Go to your project
2. Click on a deployment
3. Navigate to "Functions" tab
4. Click on a function to view logs

**Via CLI:**
```bash
vercel logs
```

### Performance Monitoring

Monitor your functions in the Vercel dashboard:
- Execution time
- Invocations count
- Error rate
- Cold start frequency

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Timeout

**Problem:** `MongoServerSelectionError: connection timed out`

**Solutions:**
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Ensure cluster is running (not paused)
- Verify MongoDB version is compatible

#### 2. CORS Errors

**Problem:** Frontend getting CORS errors

**Solutions:**
- Add frontend URL to `FRONTEND_URL` environment variable
- Ensure URLs in `FRONTEND_URL` match exactly (including protocol)
- Check for trailing slashes
- Format: `https://app1.com,https://app2.com` (comma-separated, no spaces)

#### 3. Authentication Errors

**Problem:** "Invalid token" errors

**Solutions:**
- Verify `JWT_SECRET` is set correctly
- Ensure token is sent as: `Authorization: Bearer <token>`
- Check token hasn't expired
- Verify same `JWT_SECRET` used for signing and verification

#### 4. Image Upload Errors

**Problem:** Image uploads failing

**Solutions:**
- Verify Cloudinary credentials are set
- Check images are base64 encoded
- Ensure file size < 5MB per image
- Test with smaller images first

#### 5. Cold Start Performance

**Problem:** First request is slow (1-3 seconds)

**Solutions:**
- This is normal for serverless functions
- Subsequent requests will be faster
- Consider using Vercel's "Edge Functions" for critical endpoints
- Implement frontend loading states

### Debug Mode

Enable detailed logging:

1. Add environment variable:
   ```
   DEBUG=*
   ```

2. Check function logs in Vercel dashboard

## Production Checklist

Before going live, ensure:

- [ ] MongoDB Atlas is configured correctly
- [ ] Environment variables are set for Production
- [ ] `JWT_SECRET` is a strong random string
- [ ] `FRONTEND_URL` includes all production URLs
- [ ] Database is seeded with initial data
- [ ] Custom domain is configured (if using)
- [ ] SSL certificate is active
- [ ] Health check endpoint returns "UP"
- [ ] Test all critical endpoints
- [ ] Set up monitoring alerts in Vercel
- [ ] Document API endpoints for frontend team
- [ ] Update frontend API URLs
- [ ] Test authentication flow end-to-end
- [ ] Test image upload functionality
- [ ] Verify CORS is working from frontend
- [ ] Test error handling and fallback data

## Cost Optimization

### Vercel Free Tier Limits

- 100 GB bandwidth per month
- 100 hours of serverless function execution
- Unlimited functions and deployments

### Tips to Stay Within Limits

1. **Enable caching** for static responses
2. **Optimize queries** to MongoDB
3. **Use CDN** for images (Cloudinary)
4. **Implement pagination** (already done)
5. **Monitor usage** in Vercel dashboard

If you exceed limits, consider:
- Vercel Pro plan ($20/month)
- Self-hosting on VPS
- Using Vercel for API, separate static hosting for frontend

## Next Steps

1. **Deploy Frontend:**
   - Deploy your React frontend to Vercel (separate project)
   - Update `REACT_APP_API_URL` to point to this API
   - Update `FRONTEND_URL` in API to include frontend URL

2. **Set Up Monitoring:**
   - Configure alerts for errors
   - Monitor performance metrics
   - Set up uptime monitoring (e.g., UptimeRobot)

3. **Documentation:**
   - Share API documentation with frontend team
   - Document any custom endpoints
   - Create Postman collection for testing

4. **CI/CD:**
   - Vercel automatically deploys on push to main
   - Set up preview deployments for pull requests
   - Configure branch-based deployments

## Support

For additional help:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord Community](https://discord.gg/vercel)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [EasyCart Repository Issues](https://github.com/Bryvn01/EasyCart/issues)

## Success! 🎉

Your EasyCart backend is now running as serverless functions on Vercel!

API URL: `https://your-project.vercel.app`

Test it: `https://your-project.vercel.app/api/health`
