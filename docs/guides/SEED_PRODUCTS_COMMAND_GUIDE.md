# Django Management Command: seed_products

## Overview

The `seed_products` management command seeds MongoDB Atlas with authentic Kenyan product data, including categories and products across groceries, electronics, fashion, essentials, home & kitchen, and sports categories.

## Location

`backend/apps/products/management/commands/seed_products.py`

## Usage

```bash
# Basic usage - seed products (idempotent)
python manage.py seed_products

# Clear existing data and seed fresh
python manage.py seed_products --clear
```

## Requirements

### Required Environment Variables

1. **MONGO_URI** (Required)
   - MongoDB Atlas connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/easycart?retryWrites=true&w=majority`
   - Must be set in `.env` file or environment

2. **CLOUDINARY_URL** (Optional)
   - Cloudinary configuration for image uploads
   - Format: `cloudinary://api_key:api_secret@cloud_name`
   - If not set, placeholder images will be used

### Setup

1. Copy `.env.example` to `.env` if not already done:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `.env` and set your MongoDB Atlas connection string:
   ```bash
   MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/easycart
   ```

3. (Optional) Add Cloudinary URL for image uploads:
   ```bash
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   ```

## Features

### Idempotency
- Running the command multiple times will not create duplicate products
- Products are uniquely identified by their `name` field
- Uses MongoDB's `update_one` with `upsert=True` for safe updates

### Product Data
- **37 authentic Kenyan products** across 6 categories
- Prices in Kenyan Shillings (KES)
- Real Kenyan brands: Brookside, Royco, Safaricom, Bata, etc.
- Stock levels and descriptions included

### Categories
- Groceries (8 products)
- Electronics (6 products)
- Fashion (5 products)
- Essentials (6 products)
- Home & Kitchen (3 products)
- Sports & Outdoors (3 products)

### Logging
- Comprehensive success/failure tracking
- Logs to Django logger: `apps.products.management.commands.seed_products`
- Console output with color-coded status:
  - ✓ Green: Successfully created
  - ↻ Yellow: Updated existing
  - ✗ Red: Failed to create
  - - Gray: Skipped (unchanged)

## Implementation Details

### Technology Stack
- **PyMongo**: Direct MongoDB interaction (not Django ORM)
- **Cloudinary**: Image upload integration with fallback
- **Django Management Commands**: Built-in Django framework

### Why PyMongo Instead of Django ORM?
This project uses a dual-backend architecture:
- **Django backend**: Handles authentication, admin, sessions (uses SQLite/PostgreSQL)
- **Node.js backend**: Handles products, cart, orders (uses MongoDB)

Since Djongo is incompatible with Django 4.x, we use PyMongo for direct MongoDB access. This is the recommended approach documented in `MONGODB_AUDIT_README.md`.

### Database Structure

#### Categories Collection
```json
{
  "name": "Groceries",
  "slug": "groceries",
  "description": "Fresh produce, pantry staples, and everyday essentials",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### Products Collection
```json
{
  "name": "Unga wa Dola Maize Flour 2kg",
  "slug": "unga-wa-dola-maize-flour-2kg",
  "description": "Premium maize flour for making traditional Ugali...",
  "price": 210,
  "category": "Groceries",
  "stock": 150,
  "brand": "Dola",
  "image": "https://via.placeholder.com/400x400/FFE4B5/000000?text=Unga+Dola",
  "images": ["https://via.placeholder.com/400x400/FFE4B5/000000?text=Unga+Dola"],
  "isActive": true,
  "isFeatured": false,
  "rating": 0,
  "numReviews": 0,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## Examples

### Example 1: First Time Setup
```bash
# Set environment variable
export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/easycart"

# Seed products
cd backend
python manage.py seed_products
```

**Output:**
```
✓ Connected to MongoDB: easycart
⚠ CLOUDINARY_URL not set
  Will use placeholder images
Seeding Categories to MongoDB...
  ✓ Created category: Groceries
  ✓ Created category: Electronics
  ...
Seeding Products to MongoDB...
  ✓ Created: Unga wa Dola Maize Flour 2kg (KES 210, Stock: 150)
  ✓ Created: Pembe Maize Flour 2kg (KES 220, Stock: 200)
  ...
✓ Seeding complete!
  - Successfully created: 37 products
  - Skipped (already exist): 0 products
  - Failed: 0 products
  - Total in database: 37
```

### Example 2: Re-seeding (Idempotent)
```bash
python manage.py seed_products
```

**Output:**
```
✓ Connected to MongoDB: easycart
...
  - Skipped (unchanged): Unga wa Dola Maize Flour 2kg
  - Skipped (unchanged): Pembe Maize Flour 2kg
  ...
✓ Seeding complete!
  - Successfully created: 0 products
  - Skipped (already exist): 37 products
  - Failed: 0 products
  - Total in database: 37
```

### Example 3: Clear and Re-seed
```bash
python manage.py seed_products --clear
```

**Output:**
```
⚠ Clearing existing data from MongoDB...
✓ Data cleared from MongoDB
...
✓ Seeding complete!
  - Successfully created: 37 products
  - Skipped (already exist): 0 products
  - Failed: 0 products
  - Total in database: 37
```

## Troubleshooting

### Error: "MONGO_URI not configured"
**Solution:** Set the `MONGO_URI` environment variable in your `.env` file or export it:
```bash
export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/easycart"
```

### Error: "Failed to connect to MongoDB"
**Possible causes:**
1. Invalid connection string
2. Network connectivity issues
3. MongoDB Atlas IP whitelist restrictions

**Solution:**
1. Verify connection string is correct
2. Check MongoDB Atlas dashboard for connection issues
3. Add your IP address to MongoDB Atlas IP whitelist

### Warning: "Cloudinary not configured"
This is not an error. The command will use placeholder images if `CLOUDINARY_URL` is not set. To enable Cloudinary:
```bash
export CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

## Testing

Run the test script to verify the command structure:
```bash
python /tmp/test_seed_command.py
```

## Related Documentation

- `MONGODB_AUDIT_README.md` - MongoDB configuration details
- `MONGODB_CONFIGURATION_SUMMARY.md` - Visual summary of setup
- `CLOUDINARY_INTEGRATION_SUMMARY.md` - Cloudinary integration details
- `DATABASE_SEEDING_GUIDE.md` - General seeding guide

## Support

For issues or questions:
1. Check `MONGODB_AUDIT_README.md` for architecture details
2. Verify environment variables are correctly set
3. Check Django logs for detailed error messages
4. Review MongoDB Atlas dashboard for connection issues
