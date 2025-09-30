# Database Seeding Guide

## Overview

EasyCart includes a Django management command to populate the database with authentic Kenyan products across multiple categories.

## Command Usage

### Basic Seeding

To seed the database with products:

```bash
cd backend
python manage.py seed_products
```

This will:
- Create 10 product categories (Groceries, Electronics, Fashion, etc.)
- Add 50+ authentic Kenyan products with realistic pricing in KES
- Set stock levels for each product (ranging from 12 to 200 units)
- Skip duplicates if products already exist

### Clear and Re-seed

To clear existing products and categories before seeding:

```bash
python manage.py seed_products --clear
```

**Warning**: This will delete all existing products and categories!

## Product Categories

The seeding command creates the following categories:

1. **Groceries** - Fresh produce, pantry staples (Unga, Brookside Milk, Royco, etc.)
2. **Electronics** - Phones, TVs, appliances (Safaricom, Samsung, Vitron, TCL, etc.)
3. **Fashion** - Clothing, shoes, accessories (Maasai Shuka, Bata, Ankara prints, etc.)
4. **Essentials** - Health, beauty, baby care (Pampers, Nice & Lovely, Geisha, etc.)
5. **Home & Kitchen** - Appliances, cookware (Ramtons, Prestige, Sufuria sets, etc.)
6. **Beauty & Personal Care** - Skincare, makeup, grooming products
7. **Health & Wellness** - Vitamins, supplements, health products
8. **Baby & Kids** - Baby food, diapers, toys
9. **Sports & Outdoors** - Fitness equipment, outdoor gear (Hiking backpacks, running shoes, etc.)
10. **Books & Stationery** - Books, office supplies

## Sample Products

### Groceries (8 products)
- Unga wa Dola Maize Flour 2kg - KES 210
- Brookside Fresh Milk 500ml - KES 65
- Royco Mchuzi Mix Beef 100g - KES 85
- Ketepa Pride Tea Bags 100s - KES 320
- And more...

### Electronics (6 products)
- Safaricom Neon Ray Pro Smartphone - KES 8,999
- Samsung Galaxy A14 128GB - KES 24,999
- Vitron 32" LED Digital TV - KES 12,999
- TCL 43" Smart Android TV - KES 28,500
- And more...

### Fashion (5 products)
- Men's Maasai Shuka Blanket - KES 1,200
- Bata School Shoes - Black - KES 1,899
- Ankara Print Dress - Women's - KES 2,500
- And more...

### Essentials (6 products)
- Nice & Lovely Cocoa Butter Lotion 400ml - KES 350
- Pampers Baby-Dry Diapers Size 3 (50pcs) - KES 1,200
- Menengai Bar Soap 800g - KES 180
- And more...

## Product Data Structure

Each product includes:

- **Name**: Descriptive product name
- **Category**: One of the 10 categories
- **Description**: Detailed product description highlighting Kenyan relevance
- **Price**: In Kenyan Shillings (KES)
- **Stock**: Number of units available (12-200)
- **Brand**: Product brand name
- **Image URL**: Placeholder image (currently using placeholder.com)
- **Slug**: Auto-generated URL-friendly slug
- **Status**: Active by default

## Customization

To add more products or modify existing ones:

1. Open: `backend/apps/products/management/commands/seed_products.py`
2. Find the product lists (groceries, electronics, fashion, etc.)
3. Add new product dictionaries following the existing format:
   ```python
   {
       "name": "Product Name",
       "category": "Category Name",
       "description": "Product description",
       "price": 999,
       "stock": 50,
       "brand": "Brand Name",
       "image_url": "https://example.com/image.jpg",
   }
   ```
4. Run the seeding command again

## Database Requirements

The seeding command works with:

- **MongoDB** via Djongo (primary database)
- **PostgreSQL** (if configured)
- **SQLite** (development only)

Make sure your database connection is configured in `backend/.env`:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/easycart?retryWrites=true&w=majority
```

## Verification

After seeding, verify products were created:

### Option 1: Django Shell
```bash
python manage.py shell
```

```python
from apps.products.models import Product, Category

# Count products
print(f"Total products: {Product.objects.count()}")

# Count categories
print(f"Total categories: {Category.objects.count()}")

# List all categories
for cat in Category.objects.all():
    print(f"{cat.name}: {cat.products.count()} products")
```

### Option 2: API Endpoint
Visit: `http://localhost:8000/api/products/` (or your deployed URL)

You should see a JSON response with paginated products.

### Option 3: Django Admin
1. Go to: `http://localhost:8000/admin/`
2. Log in with superuser credentials
3. Navigate to "Products" → "Products"
4. You should see all seeded products

## Production Deployment

### On Render

1. Access the backend service shell:
   - Go to Render dashboard
   - Select "easycart-backend" service
   - Click "Shell" tab
   - Wait for shell to connect

2. Run seeding command:
   ```bash
   python manage.py seed_products --clear
   ```

3. Monitor output for success messages

### On Other Platforms

For Heroku, Railway, or other platforms:

```bash
# Heroku
heroku run python manage.py seed_products --app easycart-backend

# Railway
railway run python manage.py seed_products

# Generic SSH
ssh user@server
cd /path/to/backend
source venv/bin/activate
python manage.py seed_products
```

## Troubleshooting

### "No module named 'apps.products'"

**Solution**: Make sure you're in the `backend` directory and Django can find your apps:

```bash
cd backend
export DJANGO_SETTINGS_MODULE=ecommerce.settings
python manage.py seed_products
```

### "Database connection failed"

**Solution**: Check your MONGODB_URI in `.env`:

```bash
# Test connection
python manage.py check

# Check database settings
python manage.py showmigrations
```

### "Product already exists" warnings

**Normal behavior**: The command uses `get_or_create()` to prevent duplicates. Existing products are skipped.

To force recreation, use `--clear` flag.

### Products not showing in API

**Solution**: Check that products are active:

```python
# Django shell
from apps.products.models import Product
Product.objects.filter(is_active=False).update(is_active=True)
```

## Tips

1. **First Time Setup**: Use `--clear` flag to ensure clean state
2. **Production**: Seed database immediately after deployment
3. **Development**: Re-seed whenever you need fresh test data
4. **Custom Images**: Replace placeholder URLs with real product images
5. **Stock Management**: Update stock levels through Django admin or API

## Next Steps

After seeding:

1. **Create Superuser**: `python manage.py createsuperuser`
2. **Test API**: Visit `/api/products/` endpoint
3. **Test Frontend**: Products should appear on homepage
4. **Admin Dashboard**: Manage products through `/admin/` panel

## Related Documentation

- [Render Deployment Guide](../RENDER_DEPLOYMENT_GUIDE.md)
- [Django Management Commands](https://docs.djangoproject.com/en/3.2/howto/custom-management-commands/)
- [Product Model Documentation](../backend/apps/products/models.py)
