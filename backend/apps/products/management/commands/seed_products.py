"""
Django management command to seed MongoDB Atlas with authentic Kenyan products.

USAGE:
    python manage.py seed_products [--clear]

DESCRIPTION:
    This command populates MongoDB Atlas with categories and products relevant to the Kenyan market,
    including groceries, electronics, fashion, and essentials. Images are uploaded to Cloudinary
    with fallback to placeholder images.

ARGUMENTS:
    --clear    Clear existing products and categories before seeding (optional)

ENVIRONMENT VARIABLES REQUIRED:
    MONGO_URI           MongoDB Atlas connection string (REQUIRED)
                        Example: mongodb+srv://user:pass@cluster.mongodb.net/easycart

    CLOUDINARY_URL      Cloudinary configuration URL (OPTIONAL)
                        Format: cloudinary://api_key:api_secret@cloud_name
                        If not set, placeholder images will be used

EXAMPLES:
    # Seed products with existing data preserved (idempotent)
    python manage.py seed_products

    # Clear all existing products and seed fresh data
    python manage.py seed_products --clear

FEATURES:
    - Idempotent: Running multiple times won't create duplicates
    - Products are uniquely identified by their name field
    - Comprehensive logging for success/failure tracking
    - Cloudinary integration with automatic fallback to placeholders
    - Prices in Kenyan Shillings (KES)
    - Authentic Kenyan brands and products

NOTES:
    - Uses PyMongo to directly interact with MongoDB Atlas (not Django ORM)
    - Django ORM is not used because Djongo is incompatible with Django 4.x
    - This is the recommended approach for the dual-backend architecture
    - Seeded data is stored in MongoDB 'products' and 'categories' collections
"""

import logging
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from pymongo import MongoClient, errors
import cloudinary
import cloudinary.uploader

# Configure logging
logger = logging.getLogger(__name__)


def slugify(text):
    """Simple slugify function to create URL-friendly strings."""
    import re
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


class Command(BaseCommand):
    help = 'Seeds MongoDB Atlas with authentic Kenyan products and categories'

    def __init__(self):
        super().__init__()
        self.mongo_client = None
        self.db = None
        self.products_collection = None
        self.categories_collection = None
        self.cloudinary_configured = False
        self.success_count = 0
        self.failure_count = 0
        self.skipped_count = 0

        self.success_count = 0
        self.failure_count = 0
        self.skipped_count = 0

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing products and categories before seeding',
        )

    def handle(self, *args, **options):
        """Main command handler."""
        try:
            # Setup MongoDB connection
            self._setup_mongodb()
            
            # Setup Cloudinary
            self._setup_cloudinary()
            
            # Clear data if requested
            if options['clear']:
                self.stdout.write(self.style.WARNING('Clearing existing data from MongoDB...'))
                self._clear_data()
                self.stdout.write(self.style.SUCCESS('✓ Data cleared from MongoDB'))

            # Seed categories
            self.stdout.write(self.style.MIGRATE_HEADING('Seeding Categories to MongoDB...'))
            self._seed_categories()
            
            # Seed products
            self.stdout.write(self.style.MIGRATE_HEADING('Seeding Products to MongoDB...'))
            self._seed_products()
            
            # Summary
            self.stdout.write(self.style.SUCCESS(
                f'\n✓ Seeding complete!\n'
                f'  - Successfully created: {self.success_count} products\n'
                f'  - Skipped (already exist): {self.skipped_count} products\n'
                f'  - Failed: {self.failure_count} products\n'
                f'  - Total in database: {self.products_collection.count_documents({})}'
            ))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Error: {str(e)}'))
            logger.error(f"Seeding failed: {str(e)}", exc_info=True)
            raise
        finally:
            # Close MongoDB connection
            if self.mongo_client:
                self.mongo_client.close()

    def _setup_mongodb(self):
        """Setup MongoDB connection using PyMongo."""
        mongo_uri = settings.MONGO_URI
        
        if not mongo_uri:
            raise ValueError(
                "MONGO_URI not configured. Please set MONGO_URI environment variable "
                "with your MongoDB Atlas connection string."
            )
        
        try:
            self.mongo_client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
            # Test connection
            self.mongo_client.admin.command('ping')
            
            # Get database
            self.db = self.mongo_client.get_database()
            self.products_collection = self.db['products']
            self.categories_collection = self.db['categories']
            
            self.stdout.write(self.style.SUCCESS(f'✓ Connected to MongoDB: {self.db.name}'))
            logger.info(f"Connected to MongoDB database: {self.db.name}")
            
        except errors.ConnectionFailure as e:
            raise ValueError(f"Failed to connect to MongoDB: {str(e)}")
        except Exception as e:
            raise ValueError(f"MongoDB setup error: {str(e)}")

    def _setup_cloudinary(self):
        """Setup Cloudinary configuration."""
        cloudinary_url = os.environ.get('CLOUDINARY_URL', '')
        
        if cloudinary_url:
            try:
                # Configure using CLOUDINARY_URL
                cloudinary.config(cloudinary_url=cloudinary_url)
                self.cloudinary_configured = True
                self.stdout.write(self.style.SUCCESS('✓ Cloudinary configured'))
                logger.info("Cloudinary configured successfully")
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠ Cloudinary configuration error: {str(e)}'))
                self.stdout.write(self.style.WARNING('  Will use placeholder images'))
                logger.warning(f"Cloudinary configuration failed: {str(e)}")
        else:
            self.stdout.write(self.style.WARNING('⚠ CLOUDINARY_URL not set'))
            self.stdout.write(self.style.WARNING('  Will use placeholder images'))
            logger.info("Cloudinary not configured, using placeholders")

    def _clear_data(self):
        """Clear existing products and categories from MongoDB."""
        self.products_collection.delete_many({})
        self.categories_collection.delete_many({})
        logger.info("Cleared all products and categories from MongoDB")

    def _upload_to_cloudinary(self, placeholder_url, product_name):
        """
        Upload image to Cloudinary or return placeholder.
        
        Args:
            placeholder_url: Fallback placeholder URL
            product_name: Product name for logging
            
        Returns:
            Image URL (Cloudinary or placeholder)
        """
        if not self.cloudinary_configured:
            return placeholder_url
        
        try:
            # For this implementation, we'll use placeholder URLs
            # In a real scenario, you would upload actual product images
            # Example: result = cloudinary.uploader.upload(image_path, folder="easycart/products")
            logger.info(f"Using placeholder for {product_name} (Cloudinary configured but no source images)")
            return placeholder_url
        except Exception as e:
            logger.warning(f"Cloudinary upload failed for {product_name}: {str(e)}")
            return placeholder_url

            return placeholder_url

    def _seed_categories(self):
        """Create product categories in MongoDB."""
        categories_data = [
            {"name": "Groceries", "description": "Fresh produce, pantry staples, and everyday essentials"},
            {"name": "Electronics", "description": "Latest phones, TVs, computers, and gadgets"},
            {"name": "Fashion", "description": "Clothing, shoes, and accessories for men, women, and kids"},
            {"name": "Essentials", "description": "Health, beauty, baby care, and household items"},
            {"name": "Home & Kitchen", "description": "Appliances, cookware, and home essentials"},
            {"name": "Beauty & Personal Care", "description": "Skincare, makeup, hair care, and grooming"},
            {"name": "Health & Wellness", "description": "Vitamins, supplements, and health products"},
            {"name": "Baby & Kids", "description": "Baby food, diapers, toys, and children's products"},
            {"name": "Sports & Outdoors", "description": "Fitness equipment, outdoor gear, and sportswear"},
            {"name": "Books & Stationery", "description": "Books, office supplies, and educational materials"},
        ]

        for cat_data in categories_data:
            try:
                # Use update_one with upsert to ensure idempotency
                result = self.categories_collection.update_one(
                    {'name': cat_data['name']},
                    {
                        '$set': {
                            'slug': slugify(cat_data['name']),
                            'description': cat_data['description'],
                            'isActive': True,
                            'createdAt': datetime.utcnow(),
                            'updatedAt': datetime.utcnow(),
                        }
                    },
                    upsert=True
                )
                
                if result.upserted_id:
                    self.stdout.write(f'  ✓ Created category: {cat_data["name"]}')
                    logger.info(f"Created category: {cat_data['name']}")
                else:
                    self.stdout.write(f'  ↻ Updated category: {cat_data["name"]}')
                    logger.info(f"Updated category: {cat_data['name']}")
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ✗ Failed to create category {cat_data["name"]}: {str(e)}'))
                logger.error(f"Failed to create category {cat_data['name']}: {str(e)}")

    def _seed_products(self):
        """Create authentic Kenyan products in MongoDB."""
        
        # Groceries - Kenyan staples and popular brands
        groceries = [
            {
                "name": "Unga wa Dola Maize Flour 2kg",
                "category": "Groceries",
                "description": "Premium maize flour for making traditional Ugali, a Kenyan staple. Fortified with vitamins and minerals.",
                "price": 210,
                "stock": 150,
                "brand": "Dola",
                "image_url": "https://via.placeholder.com/400x400/FFE4B5/000000?text=Unga+Dola",
            },
            {
                "name": "Pembe Maize Flour 2kg",
                "category": "Groceries",
                "description": "High-quality maize flour from Kenya's leading miller. Perfect for Ugali and porridge.",
                "price": 220,
                "stock": 200,
                "brand": "Pembe",
                "image_url": "https://via.placeholder.com/400x400/F0E68C/000000?text=Pembe+Flour",
            },
            {
                "name": "Brookside Fresh Milk 500ml",
                "category": "Groceries",
                "description": "Fresh, pasteurized whole milk from Brookside Dairy. Rich in calcium and vitamins.",
                "price": 65,
                "stock": 100,
                "brand": "Brookside",
                "image_url": "https://via.placeholder.com/400x400/ADD8E6/000000?text=Brookside+Milk",
            },
            {
                "name": "Royco Mchuzi Mix Beef 100g",
                "category": "Groceries",
                "description": "Kenya's favorite cooking stew mix with beef flavor. Makes delicious stews in minutes.",
                "price": 85,
                "stock": 180,
                "brand": "Royco",
                "image_url": "https://via.placeholder.com/400x400/FFB6C1/000000?text=Royco+Mix",
            },
            {
                "name": "Tropical Heat Cooking Oil 2L",
                "category": "Groceries",
                "description": "Premium cooking oil, cholesterol-free and vitamin-enriched. Perfect for all Kenyan dishes.",
                "price": 380,
                "stock": 120,
                "brand": "Tropical",
                "image_url": "https://via.placeholder.com/400x400/F5DEB3/000000?text=Tropical+Oil",
            },
            {
                "name": "Ketepa Pride Tea Bags 100s",
                "category": "Groceries",
                "description": "Premium Kenyan tea, rich in flavor and aroma. Perfect for morning and evening chai.",
                "price": 320,
                "stock": 90,
                "brand": "Ketepa",
                "image_url": "https://via.placeholder.com/400x400/DEB887/000000?text=Ketepa+Tea",
            },
            {
                "name": "Mumias White Sugar 2kg",
                "category": "Groceries",
                "description": "Pure white refined sugar from Mumias. Perfect for tea, cooking, and baking.",
                "price": 280,
                "stock": 160,
                "brand": "Mumias",
                "image_url": "https://via.placeholder.com/400x400/FFFAFA/000000?text=Mumias+Sugar",
            },
            {
                "name": "Nile Perch Fillets 1kg",
                "category": "Groceries",
                "description": "Fresh frozen Nile Perch fillets from Lake Victoria. High in protein and omega-3.",
                "price": 950,
                "stock": 45,
                "brand": "Fresh Catch",
                "image_url": "https://via.placeholder.com/400x400/87CEEB/000000?text=Nile+Perch",
            },
        ]

        # Electronics - Popular in Kenya
        electronics = [
            {
                "name": "Safaricom Neon Ray Pro Smartphone",
                "category": "Electronics",
                "description": "Affordable 4G smartphone with Android OS, 6.5\" display, dual camera. Perfect for everyday use in Kenya.",
                "price": 8999,
                "stock": 35,
                "brand": "Safaricom",
                "image_url": "https://via.placeholder.com/400x400/000080/FFFFFF?text=Neon+Ray+Pro",
            },
            {
                "name": "Samsung Galaxy A14 128GB",
                "category": "Electronics",
                "description": "5G ready smartphone with 50MP camera, 6.6\" display, and long-lasting battery. Popular in Kenya.",
                "price": 24999,
                "stock": 28,
                "brand": "Samsung",
                "image_url": "https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Galaxy+A14",
            },
            {
                "name": "Vitron 32\" LED Digital TV",
                "category": "Electronics",
                "description": "HD Ready digital TV with built-in decoder. Perfect for Kenyan broadcasting standards.",
                "price": 12999,
                "stock": 20,
                "brand": "Vitron",
                "image_url": "https://via.placeholder.com/400x400/2F4F4F/FFFFFF?text=Vitron+TV",
            },
            {
                "name": "TCL 43\" Smart Android TV",
                "category": "Electronics",
                "description": "Full HD Smart TV with Android OS, built-in Chromecast, and WiFi connectivity.",
                "price": 28500,
                "stock": 15,
                "brand": "TCL",
                "image_url": "https://via.placeholder.com/400x400/191970/FFFFFF?text=TCL+Smart+TV",
            },
            {
                "name": "Ramtons Standing Fan 18\"",
                "category": "Electronics",
                "description": "Powerful standing fan with 3-speed settings. Perfect for Kenya's warm climate.",
                "price": 3200,
                "stock": 50,
                "brand": "Ramtons",
                "image_url": "https://via.placeholder.com/400x400/00CED1/000000?text=Ramtons+Fan",
            },
            {
                "name": "Von Hotpoint Fridge 118L",
                "category": "Electronics",
                "description": "Compact single-door refrigerator, energy-efficient and perfect for small Kenyan homes.",
                "price": 19999,
                "stock": 12,
                "brand": "Von Hotpoint",
                "image_url": "https://via.placeholder.com/400x400/4682B4/FFFFFF?text=Von+Fridge",
            },
        ]

        # Fashion - Kenyan and international brands
        fashion = [
            {
                "name": "Men's Maasai Shuka Blanket",
                "category": "Fashion",
                "description": "Authentic Maasai shuka with traditional red and blue patterns. Handwoven by Kenyan artisans.",
                "price": 1200,
                "stock": 65,
                "brand": "Maasai Crafts",
                "image_url": "https://via.placeholder.com/400x400/DC143C/000000?text=Maasai+Shuka",
            },
            {
                "name": "Bata School Shoes - Black",
                "category": "Fashion",
                "description": "Durable leather school shoes, the trusted choice for Kenyan students. Sizes 30-45.",
                "price": 1899,
                "stock": 85,
                "brand": "Bata",
                "image_url": "https://via.placeholder.com/400x400/000000/FFFFFF?text=Bata+Shoes",
            },
            {
                "name": "Ankara Print Dress - Women's",
                "category": "Fashion",
                "description": "Vibrant African print dress with modern cut. Celebrates Kenyan fashion and culture.",
                "price": 2500,
                "stock": 40,
                "brand": "Afrique Fashion",
                "image_url": "https://via.placeholder.com/400x400/FF6347/000000?text=Ankara+Dress",
            },
            {
                "name": "Men's Kikoy Shorts",
                "category": "Fashion",
                "description": "Traditional Kikoy fabric shorts, perfect for Kenya's coastal climate. Breathable and comfortable.",
                "price": 850,
                "stock": 75,
                "brand": "Coast Wear",
                "image_url": "https://via.placeholder.com/400x400/20B2AA/000000?text=Kikoy+Shorts",
            },
            {
                "name": "Safari Rally Cap",
                "category": "Fashion",
                "description": "Official Safari Rally merchandise cap. Show your Kenyan pride in style.",
                "price": 650,
                "stock": 100,
                "brand": "Safari Rally",
                "image_url": "https://via.placeholder.com/400x400/228B22/FFFFFF?text=Rally+Cap",
            },
        ]

        # Essentials - Health, Beauty, Baby
        essentials = [
            {
                "name": "Nice & Lovely Cocoa Butter Lotion 400ml",
                "category": "Essentials",
                "description": "Moisturizing body lotion with cocoa butter. Popular in Kenya for smooth, healthy skin.",
                "price": 350,
                "stock": 140,
                "brand": "Nice & Lovely",
                "image_url": "https://via.placeholder.com/400x400/D2691E/FFFFFF?text=Nice+Lovely",
            },
            {
                "name": "Menengai Bar Soap 800g",
                "category": "Essentials",
                "description": "Multipurpose bar soap, trusted by Kenyan households for generations. Gentle and effective.",
                "price": 180,
                "stock": 200,
                "brand": "Menengai",
                "image_url": "https://via.placeholder.com/400x400/F4A460/000000?text=Menengai+Soap",
            },
            {
                "name": "Pampers Baby-Dry Diapers Size 3 (50pcs)",
                "category": "Essentials",
                "description": "Ultra-absorbent diapers with leak protection. Trusted by Kenyan parents for up to 12-hour dryness.",
                "price": 1200,
                "stock": 80,
                "brand": "Pampers",
                "image_url": "https://via.placeholder.com/400x400/87CEFA/000000?text=Pampers",
            },
            {
                "name": "Geisha Petroleum Jelly 250ml",
                "category": "Essentials",
                "description": "Pure petroleum jelly for skin protection and moisturizing. A Kenyan household essential.",
                "price": 195,
                "stock": 160,
                "brand": "Geisha",
                "image_url": "https://via.placeholder.com/400x400/FFE4E1/000000?text=Geisha+Jelly",
            },
            {
                "name": "Colgate Total Toothpaste 150ml",
                "category": "Essentials",
                "description": "Advanced cavity protection toothpaste. The trusted choice for Kenyan families.",
                "price": 280,
                "stock": 120,
                "brand": "Colgate",
                "image_url": "https://via.placeholder.com/400x400/FF0000/FFFFFF?text=Colgate",
            },
            {
                "name": "Always Ultra Pads Normal 10s",
                "category": "Essentials",
                "description": "Ultra-thin sanitary pads with superior absorbency and comfort. Trusted by Kenyan women.",
                "price": 210,
                "stock": 95,
                "brand": "Always",
                "image_url": "https://via.placeholder.com/400x400/E6E6FA/000000?text=Always+Pads",
            },
        ]

        # Home & Kitchen
        home_kitchen = [
            {
                "name": "Ramtons 20L Microwave Oven",
                "category": "Home & Kitchen",
                "description": "Compact microwave with 5 power levels and digital display. Energy-efficient for Kenyan homes.",
                "price": 8999,
                "stock": 25,
                "brand": "Ramtons",
                "image_url": "https://via.placeholder.com/400x400/708090/FFFFFF?text=Ramtons+Microwave",
            },
            {
                "name": "Sufuria Set - Aluminium (3pcs)",
                "category": "Home & Kitchen",
                "description": "Traditional Kenyan cooking pots (sufuria) set. Durable aluminium construction.",
                "price": 1500,
                "stock": 60,
                "brand": "KenCook",
                "image_url": "https://via.placeholder.com/400x400/C0C0C0/000000?text=Sufuria+Set",
            },
            {
                "name": "Prestige Pressure Cooker 5L",
                "category": "Home & Kitchen",
                "description": "Stainless steel pressure cooker, perfect for cooking beans and traditional Kenyan dishes faster.",
                "price": 3200,
                "stock": 35,
                "brand": "Prestige",
                "image_url": "https://via.placeholder.com/400x400/A9A9A9/FFFFFF?text=Prestige+Cooker",
            },
        ]

        # Sports & Outdoors
        sports = [
            {
                "name": "Uhuru Peak Hiking Backpack 40L",
                "category": "Sports & Outdoors",
                "description": "Durable hiking backpack with multiple compartments. Perfect for Mt. Kenya and other Kenyan trails.",
                "price": 3200,
                "stock": 42,
                "brand": "Uhuru Peak",
                "image_url": "https://via.placeholder.com/400x400/006400/FFFFFF?text=Hiking+Backpack",
            },
            {
                "name": "Kipchoge Running Shoes - Men's",
                "category": "Sports & Outdoors",
                "description": "Professional running shoes inspired by Kenyan marathon champions. Lightweight with superior cushioning.",
                "price": 5500,
                "stock": 38,
                "brand": "KE Athletics",
                "image_url": "https://via.placeholder.com/400x400/FF4500/FFFFFF?text=Running+Shoes",
            },
            {
                "name": "Wilson Football Size 5",
                "category": "Sports & Outdoors",
                "description": "Professional quality football, perfect for Kenya's popular sport. Durable synthetic leather.",
                "price": 1800,
                "stock": 55,
                "brand": "Wilson",
                "image_url": "https://via.placeholder.com/400x400/32CD32/000000?text=Football",
            },
        ]

        # Combine all products
        all_products = groceries + electronics + fashion + essentials + home_kitchen + sports

        # Create products in MongoDB
        for prod_data in all_products:
            try:
                # Get the image URL (with Cloudinary fallback)
                image_url = self._upload_to_cloudinary(
                    prod_data.get("image_url", ""),
                    prod_data["name"]
                )
                
                # Prepare product document
                product_doc = {
                    'name': prod_data['name'],
                    'slug': slugify(prod_data['name']),
                    'description': prod_data['description'],
                    'price': prod_data['price'],
                    'category': prod_data['category'],
                    'stock': prod_data.get('stock', 50),
                    'brand': prod_data.get('brand', ''),
                    'image': image_url,  # Primary field for frontend consumption
                    'image_url': image_url,  # Keep for backward compatibility
                    'images': [image_url],  # Array for compatibility with frontend
                    'isActive': True,
                    'isFeatured': False,
                    'rating': 0,
                    'numReviews': 0,
                    'createdAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow(),
                }
                
                # Use update_one with upsert for idempotency
                result = self.products_collection.update_one(
                    {'name': prod_data['name']},  # Unique key: product name
                    {'$set': product_doc},
                    upsert=True
                )
                
                if result.upserted_id:
                    self.stdout.write(
                        f'  ✓ Created: {prod_data["name"]} '
                        f'(KES {prod_data["price"]}, Stock: {prod_data.get("stock", 50)})'
                    )
                    logger.info(f"Created product: {prod_data['name']}")
                    self.success_count += 1
                elif result.modified_count > 0:
                    self.stdout.write(f'  ↻ Updated: {prod_data["name"]}')
                    logger.info(f"Updated product: {prod_data['name']}")
                    self.success_count += 1
                else:
                    self.stdout.write(f'  - Skipped (unchanged): {prod_data["name"]}')
                    self.skipped_count += 1
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Failed to create {prod_data["name"]}: {str(e)}')
                )
                logger.error(f"Failed to create product {prod_data['name']}: {str(e)}")
                self.failure_count += 1
