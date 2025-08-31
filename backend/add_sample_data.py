import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from apps.products.models import Category, Product

# Create categories
categories_data = [
    {'name': 'Groceries', 'description': 'Essential food items'},
    {'name': 'Beverages', 'description': 'Drinks and refreshments'},
    {'name': 'Personal Care', 'description': 'Health and beauty products'},
    {'name': 'Household', 'description': 'Cleaning and home supplies'},
    {'name': 'Dairy & Eggs', 'description': 'Fresh dairy products'},
    {'name': 'Meat & Poultry', 'description': 'Fresh meat products'},
]

categories = {}
for cat_data in categories_data:
    category, created = Category.objects.get_or_create(
        name=cat_data['name'],
        defaults={'description': cat_data['description']}
    )
    categories[cat_data['name']] = category
    print(f"{'Created' if created else 'Found'} category: {category.name}")

# Sample products with Kenyan pricing
products_data = [
    # Groceries
    {'name': 'Unga wa Dola 2kg', 'description': 'Premium wheat flour for baking and cooking', 'price': 180, 'category': 'Groceries', 'stock': 50},
    {'name': 'Pembe Maize Flour 2kg', 'description': 'Fine maize flour for ugali', 'price': 120, 'category': 'Groceries', 'stock': 45},
    {'name': 'Basmati Rice 1kg', 'description': 'Premium long grain rice', 'price': 250, 'category': 'Groceries', 'stock': 30},
    {'name': 'Sugar 2kg', 'description': 'Pure white sugar', 'price': 220, 'category': 'Groceries', 'stock': 40},
    {'name': 'Cooking Oil 1L', 'description': 'Refined sunflower oil', 'price': 280, 'category': 'Groceries', 'stock': 35},
    
    # Beverages
    {'name': 'Coca Cola 500ml', 'description': 'Refreshing soft drink', 'price': 80, 'category': 'Beverages', 'stock': 100},
    {'name': 'Tusker Beer 500ml', 'description': 'Premium Kenyan lager', 'price': 150, 'category': 'Beverages', 'stock': 60},
    {'name': 'Minute Maid Orange 1L', 'description': 'Fresh orange juice', 'price': 120, 'category': 'Beverages', 'stock': 25},
    {'name': 'Brookside Milk 500ml', 'description': 'Fresh whole milk', 'price': 65, 'category': 'Beverages', 'stock': 80},
    
    # Personal Care
    {'name': 'Colgate Toothpaste 100ml', 'description': 'Cavity protection toothpaste', 'price': 180, 'category': 'Personal Care', 'stock': 40},
    {'name': 'Nivea Body Lotion 400ml', 'description': 'Moisturizing body lotion', 'price': 450, 'category': 'Personal Care', 'stock': 25},
    {'name': 'Dettol Soap 100g', 'description': 'Antibacterial soap bar', 'price': 85, 'category': 'Personal Care', 'stock': 60},
    
    # Household
    {'name': 'Omo Washing Powder 1kg', 'description': 'Multi-active washing powder', 'price': 320, 'category': 'Household', 'stock': 30},
    {'name': 'Vim Dishwashing Liquid 500ml', 'description': 'Grease cutting dish soap', 'price': 150, 'category': 'Household', 'stock': 45},
    {'name': 'Toilet Paper 4 Rolls', 'description': 'Soft toilet tissue', 'price': 200, 'category': 'Household', 'stock': 50},
    
    # Dairy & Eggs
    {'name': 'Fresh Eggs 30pcs', 'description': 'Farm fresh chicken eggs', 'price': 420, 'category': 'Dairy & Eggs', 'stock': 20},
    {'name': 'President Cheese 200g', 'description': 'Processed cheese slices', 'price': 280, 'category': 'Dairy & Eggs', 'stock': 15},
    {'name': 'Yogurt 500ml', 'description': 'Natural plain yogurt', 'price': 120, 'category': 'Dairy & Eggs', 'stock': 25},
    
    # Meat & Poultry
    {'name': 'Chicken Breast 1kg', 'description': 'Fresh boneless chicken breast', 'price': 650, 'category': 'Meat & Poultry', 'stock': 10},
    {'name': 'Beef Steak 1kg', 'description': 'Premium beef cuts', 'price': 850, 'category': 'Meat & Poultry', 'stock': 8},
]

for product_data in products_data:
    category = categories[product_data['category']]
    product, created = Product.objects.get_or_create(
        name=product_data['name'],
        defaults={
            'description': product_data['description'],
            'price': product_data['price'],
            'category': category,
            'stock': product_data['stock'],
            'is_active': True
        }
    )
    print(f"{'Created' if created else 'Found'} product: {product.name} - KES {product.price}")

print(f"\nSample data added successfully!")
print(f"Categories: {Category.objects.count()}")
print(f"Products: {Product.objects.count()}")