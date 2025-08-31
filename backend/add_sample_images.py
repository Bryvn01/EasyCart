import os
import django
import requests
import re
from io import BytesIO
from django.core.files import File
from django.utils.text import get_valid_filename

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from apps.products.models import Product

# Sample image URLs (placeholder images)
sample_images = {
    'Unga wa Dola 2kg': 'https://via.placeholder.com/300x300/FFE4B5/8B4513?text=Unga+wa+Dola',
    'Coca Cola 500ml': 'https://via.placeholder.com/300x300/FF0000/FFFFFF?text=Coca+Cola',
    'Tusker Beer 500ml': 'https://via.placeholder.com/300x300/FFD700/000000?text=Tusker+Beer',
    'Fresh Eggs 30pcs': 'https://via.placeholder.com/300x300/FFFACD/8B4513?text=Fresh+Eggs',
    'Chicken Breast 1kg': 'https://via.placeholder.com/300x300/FFB6C1/8B0000?text=Chicken+Breast',
}

def download_and_save_image(product_name, image_url):
    try:
        product = Product.objects.get(name=product_name)
        if product.image:
            print(f"Image already exists for {product_name}")
            return
            
        response = requests.get(image_url)
        if response.status_code == 200:
            image_file = BytesIO(response.content)
            # Sanitize product name to prevent path traversal
            safe_name = re.sub(r'[^\w\s-]', '', product_name).strip()
            file_name = get_valid_filename(f"{safe_name.replace(' ', '_').lower()}.png")
            product.image.save(file_name, File(image_file), save=True)
            print(f"Added image for {product_name}")
        else:
            print(f"Failed to download image for {product_name}")
    except Product.DoesNotExist:
        print(f"Product {product_name} not found")
    except Exception as e:
        print(f"Error adding image for {product_name}: {e}")

print("Adding sample images...")
for product_name, image_url in sample_images.items():
    download_and_save_image(product_name, image_url)

print("Sample images added! You can now upload real images through admin panel.")