# Quick Reference: seed_products Command

## 🚀 Quick Start

```bash
# 1. Set environment variable
export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/easycart"

# 2. Run the command
cd backend
python manage.py seed_products
```

## 📋 Command Syntax

```bash
python manage.py seed_products [--clear]
```

### Options
- `--clear`: Clear all existing products and categories before seeding

## 🔑 Environment Variables

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `MONGO_URI` | ✅ Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/easycart` |
| `CLOUDINARY_URL` | ❌ Optional | Image upload service | `cloudinary://key:secret@cloud` |

## 📊 What Gets Seeded?

### Categories (10)
- Groceries
- Electronics
- Fashion
- Essentials
- Home & Kitchen
- Beauty & Personal Care
- Health & Wellness
- Baby & Kids
- Sports & Outdoors
- Books & Stationery

### Products (31)
| Category | Count | Examples |
|----------|-------|----------|
| Groceries | 8 | Unga wa Dola, Brookside Milk, Royco Mix |
| Electronics | 6 | Safaricom Phone, Samsung A14, Vitron TV |
| Fashion | 5 | Maasai Shuka, Bata Shoes, Ankara Dress |
| Essentials | 6 | Nice & Lovely Lotion, Pampers, Colgate |
| Home & Kitchen | 3 | Ramtons Microwave, Sufuria Set |
| Sports | 3 | Hiking Backpack, Running Shoes, Football |

## ✅ Features

- ✓ **Idempotent** - Safe to run multiple times
- ✓ **Logging** - Tracks success/failure for each product
- ✓ **KES Prices** - All prices in Kenyan Shillings
- ✓ **Kenyan Brands** - Authentic local products
- ✓ **Cloudinary Ready** - With fallback to placeholders

## 📝 Example Outputs

### First Run (Creating Products)
```
✓ Connected to MongoDB: easycart
⚠ CLOUDINARY_URL not set - Will use placeholder images

Seeding Categories to MongoDB...
  ✓ Created category: Groceries
  ✓ Created category: Electronics
  ...

Seeding Products to MongoDB...
  ✓ Created: Unga wa Dola Maize Flour 2kg (KES 210, Stock: 150)
  ✓ Created: Pembe Maize Flour 2kg (KES 220, Stock: 200)
  ...

✓ Seeding complete!
  - Successfully created: 31 products
  - Skipped (already exist): 0 products
  - Failed: 0 products
  - Total in database: 31
```

### Second Run (Idempotent)
```
✓ Connected to MongoDB: easycart
...
  - Skipped (unchanged): Unga wa Dola Maize Flour 2kg
  - Skipped (unchanged): Pembe Maize Flour 2kg
  ...

✓ Seeding complete!
  - Successfully created: 0 products
  - Skipped (already exist): 31 products
  - Failed: 0 products
  - Total in database: 31
```

### With --clear Flag
```
⚠ Clearing existing data from MongoDB...
✓ Data cleared from MongoDB

Seeding Categories to MongoDB...
  ✓ Created category: Groceries
  ...

✓ Seeding complete!
  - Successfully created: 31 products
  - Skipped (already exist): 0 products
  - Failed: 0 products
  - Total in database: 31
```

## ❌ Common Errors

### Error: MONGO_URI not configured
```
✗ Error: MONGO_URI not configured. Please set MONGO_URI environment variable...
```
**Fix:** Set `MONGO_URI` in `.env` file or export it

### Error: Failed to connect to MongoDB
```
✗ Error: Failed to connect to MongoDB: ...
```
**Fix:** Check connection string, network, and MongoDB Atlas IP whitelist

## 🔍 Technical Details

### Technology
- **PyMongo** - Direct MongoDB access (not Django ORM)
- **MongoDB Atlas** - Cloud database
- **Cloudinary** - Optional image CDN

### Why Not Django ORM?
This project uses a dual-backend architecture:
- Django: Auth, admin, sessions (SQLite/PostgreSQL)
- Node.js: Products, cart (MongoDB)

Since Djongo is incompatible with Django 4.x, PyMongo is used for direct MongoDB access.

### Database Collections

**categories**
```json
{
  "name": "Groceries",
  "slug": "groceries",
  "description": "...",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**products**
```json
{
  "name": "Unga wa Dola Maize Flour 2kg",
  "slug": "unga-wa-dola-maize-flour-2kg",
  "price": 210,
  "category": "Groceries",
  "stock": 150,
  "brand": "Dola",
  "image": "https://...",
  "images": ["https://..."],
  "isActive": true,
  "rating": 0,
  "numReviews": 0,
  "createdAt": "...",
  "updatedAt": "..."
}
```

## 📚 Related Docs

- `SEED_PRODUCTS_COMMAND_GUIDE.md` - Full documentation
- `MONGODB_AUDIT_README.md` - Architecture details
- `CLOUDINARY_INTEGRATION_SUMMARY.md` - Image upload info

## 💡 Tips

1. **First time?** Start without `--clear` to preserve any existing data
2. **Testing?** Use `--clear` to reset to a known state
3. **Production?** Run once after deployment, then as needed for updates
4. **Debugging?** Check logs with `--verbosity 2` for detailed output

## ⚡ Advanced Usage

### Custom Verbosity
```bash
# Minimal output
python manage.py seed_products --verbosity 0

# Verbose output
python manage.py seed_products --verbosity 2
```

### With Environment File
```bash
# Load from .env file
cd backend
source .env
python manage.py seed_products
```

### Production Deployment
```bash
# On Render/Railway/Heroku
heroku run python backend/manage.py seed_products -a your-app

# Using Docker
docker exec -it easycart-backend python manage.py seed_products
```

## 🎯 Success Criteria

Command succeeds when:
- ✅ Connects to MongoDB Atlas
- ✅ Creates/updates all categories
- ✅ Creates/updates all products
- ✅ Shows summary with 0 failures
- ✅ Products visible in MongoDB Atlas dashboard
