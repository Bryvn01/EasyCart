#!/usr/bin/env python3
"""
Add optimized media assets for Easycart application
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

def create_media_directories():
    """Create media directory structure"""
    directories = [
        'backend/media/products',
        'backend/media/categories', 
        'backend/media/banners',
        'backend/media/icons',
        'frontend/public/images/banners',
        'frontend/public/images/categories',
        'frontend/public/images/icons'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")

def optimize_image(image_url, max_width=800, quality=85):
    """Download and optimize image for web"""
    try:
        response = requests.get(image_url, timeout=10)
        if response.status_code == 200:
            img = Image.open(BytesIO(response.content))
            
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Resize if too large
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Save optimized image
            output = BytesIO()
            img.save(output, format='JPEG', quality=quality, optimize=True)
            output.seek(0)
            return output
        return None
    except Exception as e:
        print(f"Error optimizing image {image_url}: {e}")
        return None

# High-quality product images from Unsplash (free to use)
PRODUCT_IMAGES = {
    # Groceries
    'Unga wa Dola 2kg': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',  # Flour
    'Pembe Maize Flour 2kg': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',  # Corn flour
    'Basmati Rice 1kg': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',  # Rice
    'Sugar 2kg': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&q=80',  # Sugar
    'Cooking Oil 1L': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',  # Oil
    
    # Beverages
    'Coca Cola 500ml': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80',  # Soda
    'Tusker Beer 500ml': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',  # Beer
    'Minute Maid Orange 1L': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80',  # Orange juice
    'Brookside Milk 500ml': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80',  # Milk
    
    # Personal Care
    'Colgate Toothpaste 100ml': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80',  # Toothpaste
    'Nivea Body Lotion 400ml': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80',  # Lotion
    'Dettol Soap 100g': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80',  # Soap
    
    # Household
    'Omo Washing Powder 1kg': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',  # Detergent
    'Vim Dishwashing Liquid 500ml': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80',  # Dish soap
    'Toilet Paper 4 Rolls': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80',  # Toilet paper
    
    # Dairy & Eggs
    'Fresh Eggs 30pcs': 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=800&q=80',  # Eggs
    'President Cheese 200g': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&q=80',  # Cheese
    'Yogurt 500ml': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',  # Yogurt
    
    # Meat & Poultry
    'Chicken Breast 1kg': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',  # Chicken
    'Beef Steak 1kg': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80',  # Beef
}

# Category images
CATEGORY_IMAGES = {
    'Groceries': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',  # Grocery store
    'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',  # Drinks
    'Personal Care': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80',  # Beauty products
    'Household': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',  # Cleaning supplies
    'Dairy & Eggs': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80',  # Dairy
    'Meat & Poultry': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80',  # Meat
}

def add_product_images():
    """Add optimized images to products"""
    print("Adding product images...")
    
    for product_name, image_url in PRODUCT_IMAGES.items():
        try:
            product = Product.objects.get(name=product_name)
            if product.image:
                print(f"Image already exists for {product_name}")
                continue
                
            optimized_image = optimize_image(image_url)
            if optimized_image:
                safe_name = re.sub(r'[^\w\s-]', '', product_name).strip()
                file_name = get_valid_filename(f"{safe_name.replace(' ', '_').lower()}.jpg")
                product.image.save(file_name, File(optimized_image), save=True)
                print(f"Added optimized image for {product_name}")
            else:
                print(f"Failed to download image for {product_name}")
                
        except Product.DoesNotExist:
            print(f"Product {product_name} not found")
        except Exception as e:
            print(f"Error adding image for {product_name}: {e}")

def add_category_images():
    """Add optimized images to categories"""
    print("Adding category images...")
    
    for category_name, image_url in CATEGORY_IMAGES.items():
        try:
            category = Category.objects.get(name=category_name)
            if category.image:
                print(f"Image already exists for {category_name}")
                continue
                
            optimized_image = optimize_image(image_url, max_width=600)
            if optimized_image:
                safe_name = re.sub(r'[^\w\s-]', '', category_name).strip()
                file_name = get_valid_filename(f"{safe_name.replace(' ', '_').lower()}.jpg")
                category.image.save(file_name, File(optimized_image), save=True)
                print(f"Added optimized image for {category_name}")
            else:
                print(f"Failed to download image for {category_name}")
                
        except Category.DoesNotExist:
            print(f"Category {category_name} not found")
        except Exception as e:
            print(f"Error adding image for {category_name}: {e}")

def create_banner_images():
    """Create banner images for the frontend"""
    print("Creating banner images...")
    
    banner_urls = [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80',  # Main banner
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',  # Promo banner
        'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200&q=80',  # Sale banner
    ]
    
    banner_names = ['hero-banner.jpg', 'promo-banner.jpg', 'sale-banner.jpg']
    
    for i, (url, name) in enumerate(zip(banner_urls, banner_names)):
        try:
            optimized_image = optimize_image(url, max_width=1200, quality=90)
            if optimized_image:
                file_path = f'frontend/public/images/banners/{name}'
                with open(file_path, 'wb') as f:
                    f.write(optimized_image.getvalue())
                print(f"Created banner: {name}")
        except Exception as e:
            print(f"Error creating banner {name}: {e}")

def create_icon_assets():
    """Create icon assets"""
    print("Creating icon assets...")
    
    # Create simple colored placeholders for icons
    icon_colors = {
        'cart-icon.svg': '#3B82F6',
        'search-icon.svg': '#6B7280', 
        'user-icon.svg': '#374151',
        'heart-icon.svg': '#EF4444',
        'star-icon.svg': '#F59E0B'
    }
    
    for icon_name, color in icon_colors.items():
        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="{color}">
    <circle cx="12" cy="12" r="10"/>
</svg>'''
        
        file_path = f'frontend/public/images/icons/{icon_name}'
        with open(file_path, 'w') as f:
            f.write(svg_content)
        print(f"Created icon: {icon_name}")

def main():
    """Run all media asset creation"""
    print("Creating optimized media assets for Easycart...\n")
    
    create_media_directories()
    add_product_images()
    add_category_images()
    create_banner_images()
    create_icon_assets()
    
    print("\n✅ Media assets created successfully!")
    print("\n📝 Next steps for production:")
    print("1. Replace Unsplash images with actual product photos")
    print("2. Add brand-specific banners and promotional images")
    print("3. Create custom icons matching Easycart brand")
    print("4. Optimize images further with WebP format")
    print("5. Set up CDN for faster image delivery")

if __name__ == "__main__":
    main()