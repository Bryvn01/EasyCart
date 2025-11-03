from apps.products.models import Category, Product
from django.core.files.base import ContentFile
import requests
import os
from io import BytesIO


def add_kenyan_products():
    # Define categories and products data with authentic Kenyan brands
    categories_data = {
        "Food & Groceries": {
            "description": "Staple food items and groceries",
            "image_url": "https://i.imgur.com/placeholder-food.jpg",
        },
        "Fresh Produce": {
            "description": "Fresh vegetables and fruits",
            "image_url": "https://i.imgur.com/placeholder-produce.jpg",
        },
        "Beverages": {
            "description": "Soft drinks, juices, and water",
            "image_url": "https://i.imgur.com/placeholder-beverages.jpg",
        },
        "Household Items": {
            "description": "Cleaning and household essentials",
            "image_url": "https://i.imgur.com/placeholder-household.jpg",
        },
        "Personal Care": {
            "description": "Health and personal care products",
            "image_url": "https://i.imgur.com/placeholder-personal.jpg",
        },
    }

    products_data = [
        # Food & Groceries - Authentic Kenyan brands
        {
            "name": "Tuzo Milk 1L",
            "description": "Fresh Tuzo UHT milk, 1 liter pack - Premium quality",
            "price": 120.00,
            "category": "Food & Groceries",
            "stock": 100,
            "image_filename": "tuzo-milk.jpg",
        },
        {
            "name": "Blue Band Margarine 500g",
            "description": "Blue Band margarine for cooking and spreading, 500g",
            "price": 280.00,
            "category": "Food & Groceries",
            "stock": 150,
            "image_filename": "blue-band.jpg",
        },
        {
            "name": "Pembe Maize Flour 2kg",
            "description": "Premium Pembe maize flour, 2 kilograms - Perfect for ugali",
            "price": 180.00,
            "category": "Food & Groceries",
            "stock": 80,
            "image_filename": "pembe-flour.jpg",
        },
        {
            "name": "Kabras Sugar 2kg",
            "description": "Kabras refined sugar, 2 kilograms",
            "price": 220.00,
            "category": "Food & Groceries",
            "stock": 120,
            "image_filename": "kabras-sugar.jpg",
        },
        {
            "name": "Unga Wa Dola 2kg",
            "description": "Unga Wa Dola wheat flour, 2 kilograms",
            "price": 160.00,
            "category": "Food & Groceries",
            "stock": 90,
            "image_filename": "unga-wa-dola.jpg",
        },
        {
            "name": "Royco Mchuzi Mix 400g",
            "description": "Royco mchuzi mix seasoning, 400g - Authentic Kenyan flavor",
            "price": 350.00,
            "category": "Food & Groceries",
            "stock": 110,
            "image_filename": "royco-mchuzi.jpg",
        },
        # Fresh Produce
        {
            "name": "Fresh Tomatoes 1kg",
            "description": "Locally grown fresh tomatoes from Kenyan farms, 1 kilogram",
            "price": 80.00,
            "category": "Fresh Produce",
            "stock": 200,
            "image_filename": "fresh-tomatoes.jpg",
        },
        {
            "name": "Sweet Bananas 1kg",
            "description": "Sweet ripe bananas from Coast region, 1 kilogram",
            "price": 70.00,
            "category": "Fresh Produce",
            "stock": 180,
            "image_filename": "kenyan-bananas.jpg",
        },
        {
            "name": "Fresh Carrots 1kg",
            "description": "Crunchy fresh carrots from Nakuru, 1 kilogram",
            "price": 90.00,
            "category": "Fresh Produce",
            "stock": 150,
            "image_filename": "kenyan-carrots.jpg",
        },
        # Beverages - Kenyan brands
        {
            "name": "Coca-Cola 500ml",
            "description": "Classic Coca-Cola soft drink, 500ml bottle",
            "price": 80.00,
            "category": "Beverages",
            "stock": 250,
            "image_filename": "coca-cola-kenya.jpg",
        },
        {
            "name": "Minute Maid Orange 1L",
            "description": "Minute Maid premium orange juice, 1 liter",
            "price": 150.00,
            "category": "Beverages",
            "stock": 180,
            "image_filename": "minute-maid-orange.jpg",
        },
        {
            "name": "Keringet Mineral Water 500ml",
            "description": "Keringet pure mineral water from Kenyan springs, 500ml",
            "price": 50.00,
            "category": "Beverages",
            "stock": 300,
            "image_filename": "keringet-water.jpg",
        },
        # Household Items - Kenyan brands
        {
            "name": "Omo Washing Powder 1kg",
            "description": "Omo multi-active washing powder, 1 kilogram",
            "price": 400.00,
            "category": "Household Items",
            "stock": 100,
            "image_filename": "omo-washing-powder.jpg",
        },
        {
            "name": "Softcare Tissue 4 Rolls",
            "description": "Softcare premium toilet tissue, pack of 4 rolls",
            "price": 250.00,
            "category": "Household Items",
            "stock": 150,
            "image_filename": "softcare-tissue.jpg",
        },
        {
            "name": "Dettol Original Soap 110g",
            "description": "Dettol antibacterial soap bar, 110g",
            "price": 120.00,
            "category": "Household Items",
            "stock": 180,
            "image_filename": "dettol-soap.jpg",
        },
        # Personal Care - Kenyan brands
        {
            "name": "Colgate Total 100ml",
            "description": "Colgate Total toothpaste for complete protection, 100ml",
            "price": 150.00,
            "category": "Personal Care",
            "stock": 200,
            "image_filename": "colgate-total.jpg",
        },
        {
            "name": "Nivea Soft Cream 200ml",
            "description": "Nivea Soft moisturizing cream, 200ml",
            "price": 350.00,
            "category": "Personal Care",
            "stock": 150,
            "image_filename": "nivea-soft.jpg",
        },
        {
            "name": "Always Ultra Pads 10s",
            "description": "Always Ultra Thin sanitary pads, pack of 10",
            "price": 250.00,
            "category": "Personal Care",
            "stock": 180,
            "image_filename": "always-ultra-pads.jpg",
        },
    ]

    # Create categories if not exist
    category_objs = {}
    for cat_name, cat_data in categories_data.items():
        category, created = Category.objects.get_or_create(
            name=cat_name, defaults={"description": cat_data["description"]}
        )
        category_objs[cat_name] = category

    # Create products
    for prod in products_data:
        category = category_objs.get(prod["category"])
        if not category:
            continue

        product, created = Product.objects.get_or_create(
            name=prod["name"],
            defaults={
                "description": prod["description"],
                "price": prod["price"],
                "category": category,
                "stock": prod["stock"],
            },
        )

        # Use local image if available
        image_filename = prod.get("image_filename")
        if image_filename:
            image_path = f"media/products/{image_filename}"
            if os.path.exists(image_path):
                try:
                    with open(image_path, "rb") as f:
                        image_content = ContentFile(f.read())
                        product.image.save(image_filename, image_content, save=True)
                        print(f"✅ Added image for {prod['name']}")
                except Exception as e:
                    print(f"Failed to save image for {prod['name']}: {e}")
            else:
                print(f"Image file not found: {image_path}")


add_kenyan_products()
