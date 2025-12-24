# Cloudinary Integration Testing Guide

## Overview
This guide helps you test the complete Cloudinary image integration flow for EasyCart.

## Prerequisites
- MongoDB running (local or Atlas)
- Node.js 18+ installed
- Cloudinary account (optional but recommended)

## Setup Instructions

### 1. Configure Environment Variables

**Backend `.env` file:**
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/easycart
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/easycart

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env` file:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Run the Seed Script

The seed script will populate your database with 27+ authentic Kenyan products.

**With Cloudinary (recommended):**
```bash
cd backend
node scripts/seedProducts.js
```

Expected output:
```
🌱 Starting product seeding process...
📦 Connecting to MongoDB...
✅ Connected to MongoDB

🧹 Clearing existing products and categories...
✅ Cleared existing data

📁 Inserting categories...
✅ Inserted 8 categories

☁️  Cloudinary is configured - will upload images

🛒 Processing 27 products...

[1/27] Processing: Ajab All Purpose Flour 2kg
   ⬆️  Uploading to Cloudinary...
   ✅ Uploaded successfully
   💾 Saved to database

...

📊 SEEDING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully seeded: 27 products
❌ Failed: 0 products
📁 Categories: 8
☁️  Cloudinary: Enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Product seeding completed successfully!
```

**Without Cloudinary:**
If Cloudinary is not configured, the script will still work but use the source image URLs directly:
```
⚠️  Cloudinary is not configured - using source URLs directly
   To enable Cloudinary, set these environment variables:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
```

## Testing the Integration

### 1. Start the Backend Server

```bash
cd backend
npm start
```

Expected output:
```
MongoDB connected
Mongoose is connected to MongoDB
Server running on port 5000
```

### 2. Test the Products API

Open a new terminal and test the API:

```bash
# Get all products
curl http://localhost:5000/api/products

# Expected response includes image field:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Ajab All Purpose Flour 2kg",
      "price": 320,
      "image": "https://res.cloudinary.com/your-cloud/image/upload/...",
      "images": [
        {
          "url": "https://res.cloudinary.com/your-cloud/image/upload/...",
          "alt": "Ajab All Purpose Flour 2kg",
          "isPrimary": true
        }
      ],
      "category": "Groceries",
      "brand": "Ajab",
      "description": "...",
      "stock": 100,
      "tags": ["flour", "baking", "kenyan"]
    }
  ],
  "pagination": { ... }
}
```

### 3. Start the Frontend

```bash
cd frontend
npm start
```

The app will open at http://localhost:3000

### 4. Visual Testing

#### ProductCard Component
- Navigate to the products page
- **Verify:**
  - ✅ Product images load with skeleton animation
  - ✅ Images are served from Cloudinary (check Network tab)
  - ✅ Fallback image shows if URL fails
  - ✅ Lazy loading works (images load as you scroll)
  - ✅ Multiple images show navigation dots

#### BannerCarousel Component
- Check the homepage banner
- **Verify:**
  - ✅ Banner images load smoothly
  - ✅ Skeleton shows during loading
  - ✅ Auto-rotation works
  - ✅ Manual navigation dots work

#### CategoryCard Component
- Check the categories section
- **Verify:**
  - ✅ Category images load with skeleton
  - ✅ Icons show for categories without images
  - ✅ Hover effects work properly

### 5. Network Performance Testing

Open Chrome DevTools → Network tab:

1. **Check image optimization:**
   - Images should be served in WebP format (if Cloudinary is enabled)
   - Images should have appropriate dimensions
   - Check for `q_auto` and `f_auto` in Cloudinary URLs

2. **Check lazy loading:**
   - Clear network log
   - Scroll down the page
   - Images should load only when they enter the viewport

3. **Check caching:**
   - Reload the page
   - Images should load from cache (Status 304 or from disk cache)

## Troubleshooting

### Problem: Seed script fails with "MongoDB connection error"
**Solution:**
- Ensure MongoDB is running: `mongod` or check Atlas connection
- Verify MONGO_URI in `.env` is correct
- Check network connectivity

### Problem: Images not loading in frontend
**Solution:**
- Check browser console for errors
- Verify API is returning `image` field in product JSON
- Check CORS settings if frontend and backend are on different ports
- Verify image URLs are accessible

### Problem: Cloudinary upload fails
**Solution:**
- Verify Cloudinary credentials in `.env`
- Check internet connectivity
- Ensure you haven't exceeded Cloudinary free tier limits
- Check Cloudinary dashboard for upload errors

### Problem: "react-scripts not found" error
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Verification Checklist

- [ ] Backend server starts without errors
- [ ] MongoDB connection successful
- [ ] Seed script completes successfully
- [ ] Products API returns data with `image` field
- [ ] Frontend loads without console errors
- [ ] ProductCard shows images with skeleton loading
- [ ] BannerCarousel images load and rotate
- [ ] CategoryCard images load properly
- [ ] Fallback images work when URLs fail
- [ ] Lazy loading works (check Network tab)
- [ ] Images are optimized (WebP, proper size)

## Expected Product Categories

The seed script creates these categories:
1. **Groceries** - Flour, sugar, cooking oil, etc.
2. **Beverages** - Coca-Cola, juices, tea, etc.
3. **Household** - Cleaning products, detergents
4. **Personal Care** - Soap, lotion, toothpaste
5. **Electronics** - TVs, microwaves, blenders
6. **Fashion** - Shoes, bags, traditional wear
7. **Health & Beauty** - (Category placeholder)
8. **Sports & Fitness** - (Category placeholder)

## Sample Products

Here are some products you should see after seeding:
- Ajab All Purpose Flour 2kg - KES 320
- Mumias Sugar 2kg - KES 440
- Fresh Fri Cooking Oil 3L - KES 950
- Brookside Fresh Milk 500ml - KES 65
- Coca-Cola 1.25L - KES 120
- Bruhm 32" Digital TV - KES 14,500

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [ImageWithFallback Component Source](../frontend/src/components/ImageWithFallback.jsx)
- [Seed Script Source](../backend/scripts/seedProducts.js)
- [Product Model Schema](../backend/models/Product.js)

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review browser console and server logs
3. Verify all environment variables are set
4. Ensure dependencies are installed correctly
5. Check MongoDB and Cloudinary service status

---

**Last Updated:** 2024
**Version:** 1.0.0
