#!/usr/bin/env python3
"""
Update product images with high-quality, relevant images for Kenyan e-commerce
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

from apps.products.models import Product

def optimize_image(image_url, max_width=600, quality=90):
    """Download and optimize image for e-commerce display"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(image_url, headers=headers, timeout=15)
        if response.status_code == 200:
            img = Image.open(BytesIO(response.content))
            
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Resize for optimal display
            if img.width > max_width or img.height > max_width:
                img.thumbnail((max_width, max_width), Image.Resampling.LANCZOS)
            
            # Save optimized image
            output = BytesIO()
            img.save(output, format='JPEG', quality=quality, optimize=True)
            output.seek(0)
            return output
        return None
    except Exception as e:
        print(f"Error optimizing image {image_url}: {e}")
        return None

# High-quality product images matching Kenyan e-commerce standards
KENYAN_PRODUCT_IMAGES = {
    # Groceries - Staple foods
    'Unga wa Dola 2kg': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',  # Wheat flour bag
    'Pembe Maize Flour 2kg': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',  # Maize flour
    'Basmati Rice 1kg': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',  # Rice grains
    'Sugar 2kg': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=600&q=80',  # White sugar
    'Cooking Oil 1L': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',  # Cooking oil bottle
    
    # Beverages - Popular Kenyan drinks
    'Coca Cola 500ml': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80',  # Coca Cola bottle
    'Tusker Beer 500ml': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80',  # Beer bottle
    'Minute Maid Orange 1L': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80',  # Orange juice
    'Brookside Milk 500ml': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80',  # Milk carton
    
    # Personal Care - Essential hygiene products
    'Colgate Toothpaste 100ml': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&q=80',  # Toothpaste tube
    'Nivea Body Lotion 400ml': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',  # Body lotion
    'Dettol Soap 100g': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80',  # Soap bar
    
    # Household - Cleaning essentials
    'Omo Washing Powder 1kg': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',  # Detergent box
    'Vim Dishwashing Liquid 500ml': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80',  # Dish soap
    'Toilet Paper 4 Rolls': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80',  # Toilet paper
    
    # Dairy & Eggs - Fresh products
    'Fresh Eggs 30pcs': 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=600&q=80',  # Egg carton
    'President Cheese 200g': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80',  # Cheese package
    'Yogurt 500ml': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80',  # Yogurt container
    
    # Meat & Poultry - Fresh proteins
    'Chicken Breast 1kg': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80',  # Chicken meat
    'Beef Steak 1kg': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&q=80',  # Beef cuts
}

# Alternative high-quality images for better variety
ALTERNATIVE_IMAGES = {
    'Sugar 2kg': 'https://images.unsplash.com/photo-1582049165295-519d5d5c4a8c?w=600&q=80',  # Sugar crystals
    'Cooking Oil 1L': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',  # Oil bottle
    'Toilet Paper 4 Rolls': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80',  # TP rolls
    'Fresh Eggs 30pcs': 'https://images.unsplash.com/photo-1569288052389-dac9b01ac3b9?w=600&q=80',  # Eggs in carton
}

def update_product_images():
    """Update products with high-quality, relevant images"""
    print("Updating product images with Kenyan e-commerce quality standards...\n")
    
    updated_count = 0
    failed_count = 0
    
    # First try main images
    for product_name, image_url in KENYAN_PRODUCT_IMAGES.items():
        try:
            product = Product.objects.get(name=product_name)
            
            # Skip if image already exists and we don't want to overwrite
            if product.image:
                print(f"Updating existing image for {product_name}")
            
            optimized_image = optimize_image(image_url)
            if optimized_image:
                safe_name = ''.join(c for c in product_name if c.isalnum() or c in ' -_').strip()
                file_name = get_valid_filename(f"{safe_name.replace(' ', '_').lower()}.jpg")
                
                # Delete old image if exists
                if product.image:
                    product.image.delete(save=False)
                
                product.image.save(file_name, File(optimized_image), save=True)
                print(f"[OK] Updated high-quality image for {product_name}")
                updated_count += 1
            else:
                # Try alternative image
                alt_url = ALTERNATIVE_IMAGES.get(product_name)
                if alt_url:
                    alt_image = optimize_image(alt_url)
                    if alt_image:
                        safe_name = ''.join(c for c in product_name if c.isalnum() or c in ' -_').strip()
                        file_name = get_valid_filename(f"{safe_name.replace(' ', '_').lower()}.jpg")
                        product.image.save(file_name, File(alt_image), save=True)
                        print(f"[OK] Updated with alternative image for {product_name}")
                        updated_count += 1
                    else:
                        print(f"[FAIL] Failed to download images for {product_name}")
                        failed_count += 1
                else:
                    print(f"[FAIL] Failed to download image for {product_name}")
                    failed_count += 1
                    
        except Product.DoesNotExist:
            print(f"[FAIL] Product {product_name} not found in database")
            failed_count += 1
        except Exception as e:
            print(f"[FAIL] Error updating {product_name}: {e}")
            failed_count += 1
    
    print(f"\n=== Update Summary ===")
    print(f"Successfully updated: {updated_count} products")
    print(f"Failed updates: {failed_count} products")
    print(f"Total products processed: {updated_count + failed_count}")
    
    # Verify images are accessible
    print(f"\n=== Verification ===")
    products_with_images = Product.objects.exclude(image='').count()
    total_products = Product.objects.count()
    print(f"Products with images: {products_with_images}/{total_products}")
    
    if products_with_images > 0:
        sample_product = Product.objects.exclude(image='').first()
        print(f"Sample image URL: http://localhost:8000{sample_product.image.url}")
        print(f"Sample file path: {sample_product.image.path}")

def main():
    """Main execution function"""
    print("Easycart Product Image Update")
    print("=" * 50)
    update_product_images()
    print("\n[SUCCESS] Product image update completed!")
    print("\nNext steps:")
    print("1. Verify images display correctly in frontend")
    print("2. Consider adding product image galleries")
    print("3. Implement image lazy loading for performance")
    print("4. Add image alt tags for SEO and accessibility")

if __name__ == "__main__":
    main()