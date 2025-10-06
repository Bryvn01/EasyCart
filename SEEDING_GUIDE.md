# Database Seeding Guide

This guide explains how to seed the EasyCart database with sample products.

## Prerequisites

1. **MongoDB Connection**: Ensure you have a MongoDB instance running:
   - **Local**: MongoDB running on `localhost:27017`
   - **Atlas**: MongoDB Atlas cluster with connection string

2. **Environment Variables**: Create a `.env` file in the `backend` directory:
   ```bash
   # Required: MongoDB connection (must use 'easycart' database)
   MONGO_URI=mongodb://localhost:27017/easycart
   # Or for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority
   
   # Optional: Cloudinary for image uploads
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
   CLOUDINARY_API_KEY=<your_cloudinary_api_key>
   CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   ```

   **Important**: The database name **must** be `easycart` (not `test`, `admin`, or any other name).

## Seeding Options

### Option 1: Full Reset (Default)
Clears all existing products and categories, then seeds fresh data.

```bash
cd backend
npm run seed
```

### Option 2: Idempotent Mode (Safe for Production)
Only adds missing products, skips existing ones. Safe to run multiple times.

```bash
cd backend
npm run seed:idempotent
```

or

```bash
cd backend
node scripts/seedProducts.js --idempotent
```

### Option 3: Custom Options
```bash
# Don't clear existing data, but allow duplicates
node scripts/seedProducts.js --no-clear

# Skip products that already exist (by name + brand)
node scripts/seedProducts.js --skip-existing

# Show help
node scripts/seedProducts.js --help
```

## What Gets Seeded

- **Categories**: 15 product categories (Staples, Beverages, Dairy, etc.)
- **Products**: 79 authentic Kenyan products with:
  - Name, brand, price (in KES)
  - Description and category
  - Stock levels
  - Product images (Cloudinary or fallback URLs)
  - Tags for search/filtering
  - Featured status for first 8 products

## Verification

After seeding, verify the data was inserted correctly:

### Using MongoDB Shell
```bash
mongosh "mongodb://localhost:27017/easycart"
db.products.countDocuments()  # Should return 79
db.categories.countDocuments()  # Should return 15
db.products.findOne()  # View a sample product
```

### Using the API
```bash
# Check product count
curl http://localhost:5000/api/products | jq '.pagination.total'

# View products
curl http://localhost:5000/api/products | jq '.data[] | {name, price, category}'
```

### Using MongoDB Compass
1. Connect to `mongodb://localhost:27017`
2. Select `easycart` database
3. Browse `products` and `categories` collections

## Troubleshooting

### Error: Connected to wrong database
```
❌ ERROR: Connected to wrong database!
   Expected: easycart
   Got: test
```

**Solution**: Update `MONGO_URI` to explicitly include database name:
```bash
MONGO_URI=mongodb://localhost:27017/easycart
# or for Atlas:
MONGO_URI=mongodb+srv://<username>:<password>@cluster.net/easycart?retryWrites=true&w=majority
```

### Error: Products not showing in frontend
1. **Check database**: Verify products exist in `easycart` database
2. **Check API**: Test `/api/products` endpoint returns data
3. **Check logs**: Look for errors in backend console
4. **Check environment**: Verify `REACT_APP_API_URL` in frontend `.env`

### Error: Image upload failed
If Cloudinary upload fails, the script automatically falls back to source URLs.

To enable Cloudinary:
```bash
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

## Seeding in Production

For production deployments:

1. **Use idempotent mode** to avoid data loss:
   ```bash
   npm run seed:idempotent
   ```

2. **Set environment variables** in your hosting platform:
   - Render: Dashboard → Environment → Add `MONGO_URI`
   - Heroku: `heroku config:set MONGO_URI=...`
   - Railway: Settings → Variables → Add `MONGO_URI`

3. **Run seed script** after deployment:
   ```bash
   # SSH into your server or use hosting platform's console
   cd backend
   npm run seed:idempotent
   ```

## CI/CD Integration

To seed database during deployment, add to your deployment script:

```bash
# In your deploy script or CI/CD pipeline
cd backend
npm install
npm run seed:idempotent  # Safe for repeated runs
npm start
```

## Sample Product Data

The seed script includes authentic Kenyan products:
- **Staples**: Jogoo Maize Flour, Kabras Sugar, Ndengu
- **Beverages**: Brookside Milk, Ketepa Tea, Stoney Tangawizi
- **Dairy**: Tuzo Cheese, Daima Yoghurt, Prestige Margarine
- **Personal Care**: Always Pads, Colgate Toothpaste, Dettol Soap
- And many more...

All prices are in Kenya Shillings (KES) and reflect realistic market prices.

## Related Documentation

- [MongoDB Configuration Guide](../MONGODB_QUICK_REFERENCE.md)
- [API Documentation](../README.md#api-endpoints)
- [Backend Setup](../README.md#backend-setup)
