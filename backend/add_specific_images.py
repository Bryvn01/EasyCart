#!/usr/bin/env python3
"""
Add specific product images provided by user
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

def optimize_image(image_url):
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

# User-provided specific images
SPECIFIC_IMAGES = {
    'Dettol Soap 100g': 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.xHPd6BfLgH-WfQ_aLJke1wHaGG%3Fpid%3DApi&f=1&ipt=b288d566dc4fd1c4c5e1a73d0e7c184a63c3c455d9390053a68a6b3b14d2ec0f&ipo=images',
    'Nivea Body Lotion 400ml': 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.HU1bF0XKm2XmLIsMl1k1JwHaHa%3Fr%3D0%26pid%3DApi&f=1&ipt=6feadd2cbec7eeb290a298c77b1ae3c44c86f324bacd7161505d25761be11bdf&ipo=images',
    'Colgate Toothpaste 100ml': 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.KcGeKLZePSkr4HKwUgtL-wHaJG%3Fpid%3DApi&f=1&ipt=5e47211753d5de3e3b5d93b4aae5647abed9a2d9fffdb8ef02d8532fb5fbe160&ipo=images'
}

def update_specific_images():
    print("Adding user-provided specific images...")
    
    for product_name, image_url in SPECIFIC_IMAGES.items():
        try:
            product = Product.objects.get(name=product_name)
            optimized_image = optimize_image(image_url)
            
            if optimized_image:
                if product.image:
                    product.image.delete(save=False)
                
                safe_name = ''.join(c for c in product_name if c.isalnum() or c in ' -_').strip()
                file_name = get_valid_filename(f"{safe_name.replace(' ', '_').lower()}.jpg")
                product.image.save(file_name, File(optimized_image), save=True)
                print(f"[OK] Updated: {product_name}")
            else:
                print(f"[FAIL] Failed to download: {product_name}")
            
        except Product.DoesNotExist:
            print(f"[FAIL] Product not found: {product_name}")
        except Exception as e:
            print(f"[FAIL] Error with {product_name}: {e}")

if __name__ == "__main__":
    update_specific_images()
    print("Specific images update completed!")