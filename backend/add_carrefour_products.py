#!/usr/bin/env python3
"""
Add actual Carrefour Kenya products with authentic images
"""
import os
import django
import requests
from io import BytesIO
from PIL import Image
from django.core.files import File
from django.utils.text import get_valid_filename
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from apps.products.models import Product, Category

def optimize_image(image_url):
    """Download and optimize product image"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(image_url, headers=headers, timeout=15)
        if response.status_code == 200:
            img = Image.open(BytesIO(response.content))
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            img.thumbnail((600, 600), Image.Resampling.LANCZOS)
            output = BytesIO()
            img.save(output, format='JPEG', quality=90, optimize=True)
            output.seek(0)
            return output
    except Exception as e:
        print(f"Image error: {e}")
    return None

# Actual Carrefour Kenya products with realistic pricing
CARREFOUR_PRODUCTS = [
    # Groceries & Staples
    {'name': 'Pembe Maize Flour 2kg', 'price': 120, 'category': 'Groceries', 'description': 'Premium maize flour for ugali', 'stock': 50, 'image': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80'},
    {'name': 'Exe Wheat Flour 2kg', 'price': 180, 'category': 'Groceries', 'description': 'Quality wheat flour for baking', 'stock': 45, 'image': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80'},
    {'name': 'Pishori Rice 2kg', 'price': 280, 'category': 'Groceries', 'description': 'Premium Kenyan pishori rice', 'stock': 30, 'image': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80'},
    {'name': 'Kabras Sugar 2kg', 'price': 220, 'category': 'Groceries', 'description': 'Pure white sugar', 'stock': 40, 'image': 'https://images.unsplash.com/photo-1582049165295-519d5d5c4a8c?w=600&q=80'},
    {'name': 'Elianto Cooking Oil 2L', 'price': 520, 'category': 'Groceries', 'description': 'Pure sunflower cooking oil', 'stock': 25, 'image': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80'},
    {'name': 'Royco Mchuzi Mix 400g', 'price': 180, 'category': 'Groceries', 'description': 'Beef flavored stew mix', 'stock': 35, 'image': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80'},
    
    # Beverages
    {'name': 'Coca Cola 500ml', 'price': 80, 'category': 'Beverages', 'description': 'Classic Coca Cola', 'stock': 100, 'image': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80'},
    {'name': 'Fanta Orange 500ml', 'price': 80, 'category': 'Beverages', 'description': 'Orange flavored soda', 'stock': 80, 'image': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80'},
    {'name': 'Tusker Lager 500ml', 'price': 150, 'category': 'Beverages', 'description': 'Premium Kenyan lager beer', 'stock': 60, 'image': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80'},
    {'name': 'Brookside Milk 1L', 'price': 120, 'category': 'Beverages', 'description': 'Fresh whole milk', 'stock': 50, 'image': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80'},
    {'name': 'Minute Maid Apple 1L', 'price': 150, 'category': 'Beverages', 'description': 'Apple juice drink', 'stock': 30, 'image': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80'},
    {'name': 'Keringet Water 500ml', 'price': 50, 'category': 'Beverages', 'description': 'Natural mineral water', 'stock': 120, 'image': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80'},
    
    # Personal Care
    {'name': 'Colgate Total 100ml', 'price': 180, 'category': 'Personal Care', 'description': 'Complete oral care toothpaste', 'stock': 40, 'image': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&q=80'},
    {'name': 'Nivea Soft 200ml', 'price': 320, 'category': 'Personal Care', 'description': 'Moisturizing cream', 'stock': 25, 'image': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80'},
    {'name': 'Dettol Original Soap 110g', 'price': 85, 'category': 'Personal Care', 'description': 'Antibacterial soap bar', 'stock': 60, 'image': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80'},
    {'name': 'Always Ultra Pads 10s', 'price': 280, 'category': 'Personal Care', 'description': 'Ultra thin sanitary pads', 'stock': 30, 'image': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80'},
    
    # Household
    {'name': 'Omo Multiactive 1kg', 'price': 320, 'category': 'Household', 'description': 'Multi-active washing powder', 'stock': 30, 'image': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'},
    {'name': 'Vim Lemon 750ml', 'price': 180, 'category': 'Household', 'description': 'Lemon dishwashing liquid', 'stock': 45, 'image': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80'},
    {'name': 'Harpic Toilet Cleaner 500ml', 'price': 220, 'category': 'Household', 'description': 'Powerful toilet bowl cleaner', 'stock': 35, 'image': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80'},
    {'name': 'Softcare Tissue 4 Rolls', 'price': 200, 'category': 'Household', 'description': 'Soft toilet tissue', 'stock': 50, 'image': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80'},
    
    # Dairy & Eggs
    {'name': 'Brookside Yoghurt 500ml', 'price': 120, 'category': 'Dairy & Eggs', 'description': 'Natural plain yoghurt', 'stock': 25, 'image': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80'},
    {'name': 'KCC Butter 500g', 'price': 450, 'category': 'Dairy & Eggs', 'description': 'Pure dairy butter', 'stock': 20, 'image': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80'},
    {'name': 'Fresh Eggs Tray 30pcs', 'price': 420, 'category': 'Dairy & Eggs', 'description': 'Farm fresh chicken eggs', 'stock': 15, 'image': 'https://images.unsplash.com/photo-1569288052389-dac9b01ac3b9?w=600&q=80'},
    {'name': 'President Cheese 200g', 'price': 280, 'category': 'Dairy & Eggs', 'description': 'Processed cheese slices', 'stock': 18, 'image': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80'},
    
    # Meat & Poultry
    {'name': 'Chicken Breast 1kg', 'price': 650, 'category': 'Meat & Poultry', 'description': 'Fresh boneless chicken breast', 'stock': 10, 'image': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80'},
    {'name': 'Beef Stewing 1kg', 'price': 750, 'category': 'Meat & Poultry', 'description': 'Fresh beef for stewing', 'stock': 8, 'image': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&q=80'},
    {'name': 'Pork Chops 1kg', 'price': 680, 'category': 'Meat & Poultry', 'description': 'Fresh pork chops', 'stock': 6, 'image': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&q=80'},
    {'name': 'Tilapia Fish 1kg', 'price': 550, 'category': 'Meat & Poultry', 'description': 'Fresh tilapia fish', 'stock': 12, 'image': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=600&q=80'},
]

def add_carrefour_products():
    """Add Carrefour Kenya products to database"""
    print("Adding Carrefour Kenya products...")
    
    added = 0
    failed = 0
    
    for product_data in CARREFOUR_PRODUCTS:
        try:
            # Get or create category
            category, _ = Category.objects.get_or_create(
                name=product_data['category'],
                defaults={'description': f'{product_data["category"]} products'}
            )
            
            # Check if product already exists
            if Product.objects.filter(name=product_data['name']).exists():
                print(f"Exists: {product_data['name']}")
                continue
            
            # Create product
            product = Product.objects.create(
                name=product_data['name'],
                description=product_data['description'],
                price=product_data['price'],
                category=category,
                stock=product_data['stock'],
                is_active=True
            )
            
            # Add image
            if product_data.get('image'):
                optimized_image = optimize_image(product_data['image'])
                if optimized_image:
                    # Sanitize filename to prevent path traversal
                    safe_name = ''.join(c for c in product_data['name'] if c.isalnum() or c in ' -_').strip()[:50]
                    if not safe_name:
                        safe_name = f"product_{product.id}"
                    file_name = get_valid_filename(f"{safe_name.replace(' ', '_').lower()}.jpg")
                    product.image.save(file_name, File(optimized_image), save=True)
            
            print(f"Added: {product_data['name']} - KES {product_data['price']}")
            added += 1
            
        except Exception as e:
            print(f"Failed: {product_data['name']} - {e}")
            failed += 1
    
    print(f"\nSummary: {added} added, {failed} failed")
    print(f"Total products in database: {Product.objects.count()}")

if __name__ == "__main__":
    add_carrefour_products()