"""
Django management command to seed the database with authentic Kenyan products.
Usage: python manage.py seed_products [--clear]

This command populates the database with categories and products relevant to the Kenyan market,
including groceries, electronics, fashion, and essentials.
"""

from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.products.models import Product, Category


class Command(BaseCommand):
    help = 'Seeds the database with authentic Kenyan products and categories'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing products and categories before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✓ Data cleared'))

        self.stdout.write(self.style.MIGRATE_HEADING('Seeding Categories...'))
        self._seed_categories()
        
        self.stdout.write(self.style.MIGRATE_HEADING('Seeding Products...'))
        self._seed_products()
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully seeded {Product.objects.count()} products in {Category.objects.count()} categories'))

    def _seed_categories(self):
        """Create product categories matching frontend sections"""
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
            category, created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={
                    "slug": slugify(cat_data["name"]),
                    "description": cat_data["description"],
                    "is_active": True
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created category: {category.name}')

    def _seed_products(self):
        """Create authentic Kenyan products across all categories"""
        
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

        # Create products in database
        for prod_data in all_products:
            category = Category.objects.get(name=prod_data["category"])
            product, created = Product.objects.get_or_create(
                name=prod_data["name"],
                defaults={
                    "category": category,
                    "description": prod_data["description"],
                    "price": prod_data["price"],
                    "stock": prod_data.get("stock", 50),
                    "brand": prod_data.get("brand", ""),
                    "image_url": prod_data.get("image_url", ""),
                    "slug": slugify(prod_data["name"]),
                    "is_active": True,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created: {product.name} (KES {product.price}, Stock: {product.stock})')
