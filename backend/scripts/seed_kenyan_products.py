"""
Seeder script to populate the database with sample products and categories relevant to the Kenyan market.
Run with: python manage.py runscript seed_kenyan_products
"""

from apps.products.models import Product, Category
from django.utils.text import slugify

CATEGORIES = [
    "Electronics",
    "Groceries",
    "Fashion",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Books",
    "Health & Wellness",
    "Baby & Kids",
    "Automotive",
    "Sports & Outdoors",
]

PRODUCTS = [
    {
        "name": "Safaricom Neon Ray Pro Smartphone",
        "category": "Electronics",
        "description": "Affordable 4G smartphone with Android OS, perfect for everyday use in Kenya.",
        "price": 5999,
        "brand": "Safaricom",
        "image_url": "https://easycart-kenya.s3.amazonaws.com/products/neon-ray-pro.jpg",
    },
    {
        "name": "Unga wa Dola Maize Flour 2kg",
        "category": "Groceries",
        "description": "Popular maize flour for making Ugali, a Kenyan staple food.",
        "price": 210,
        "brand": "Dola",
        "image_url": "https://easycart-kenya.s3.amazonaws.com/products/unga-dola.jpg",
    },
    {
        "name": "Men's Maasai Shuka",
        "category": "Fashion",
        "description": "Traditional Maasai shuka, vibrant and warm, ideal for Kenyan weather.",
        "price": 1200,
        "brand": "Local Artisan",
        "image_url": "https://easycart-kenya.s3.amazonaws.com/products/maasai-shuka.jpg",
    },
    {
        "name": "Ramtons 20L Microwave Oven",
        "category": "Home & Kitchen",
        "description": "Compact microwave oven, energy efficient and perfect for Kenyan homes.",
        "price": 8999,
        "brand": "Ramtons",
        "image_url": "https://easycart-kenya.s3.amazonaws.com/products/ramtons-microwave.jpg",
    },
    {
        "name": "Nice & Lovely Cocoa Butter Lotion 400ml",
        "category": "Beauty & Personal Care",
        "description": "Moisturizing lotion popular in Kenya for smooth, healthy skin.",
        "price": 350,
        "brand": "Nice & Lovely",
        "image_url": "https://easycart-kenya.s3.amazonaws.com/products/nice-lovely-lotion.jpg",
    },
    {
        "name": "Storymoja Swahili Short Stories",
        "category": "Books",
        "description": "A collection of engaging Swahili short stories for all ages.",
        "price": 650,
        "brand": "Storymoja",
        "image_url": "https://easycart-kenya.s3.amazonaws.com/products/storymoja-swahili.jpg",
    },
    {
        "name": "Menengai Bar Soap 800g",
        "category": "Health & Wellness",
        "description": "Multipurpose bar soap, trusted by Kenyan households for generations.",
        "price": 180,
        "brand": "Menengai",
        "image_url": "https://easycart-kenya.s3.amazonaws.com/products/menengai-soap.jpg",
    },
    {
        "name": "Pampers Baby-Dry Diapers Size 3 (50pcs)",
        "category": "Baby & Kids",
        "description": "Comfortable and absorbent diapers for Kenyan babies.",
        "price": 1200,
        "brand": "Pampers",
        "image_url": "https://easycart-kenya.s3.amazonaws.com/products/pampers-baby-dry.jpg",
    },
    {
        "name": "Toyota Genuine Engine Oil 5L",
        "category": "Automotive",
        "description": "High-quality engine oil suitable for most cars in Kenya.",
        "price": 3500,
        "brand": "Toyota",
        "image_url": "https://easycart-kenya.s3.amazonaws.com/products/toyota-oil.jpg",
    },
    {
        "name": "Uhuru Peak Hiking Backpack 40L",
        "category": "Sports & Outdoors",
        "description": "Durable hiking backpack, ideal for Kenyan outdoor adventures.",
        "price": 3200,
        "brand": "Uhuru Peak",
        "image_url": "https://easycart-kenya.s3.amazonaws.com/products/uhuru-backpack.jpg",
    },
]

def run():
    print("Seeding Kenyan categories...")
    for cat_name in CATEGORIES:
        Category.objects.get_or_create(name=cat_name, slug=slugify(cat_name))
    print("Categories seeded.")

    print("Seeding Kenyan products...")
    for prod in PRODUCTS:
        category = Category.objects.get(name=prod["category"])
        Product.objects.get_or_create(
            name=prod["name"],
            defaults={
                "category": category,
                "description": prod["description"],
                "price": prod["price"],
                "brand": prod["brand"],
                "image_url": prod["image_url"],
                "slug": slugify(prod["name"]),
            },
        )
    print("Products seeded.")
