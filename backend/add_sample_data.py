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

products_data = [
    # Groceries
    {'name': 'Unga wa Dola 2kg', 'brand': 'Dola', 'description': 'Premium wheat flour for baking and cooking', 'price': 180, 'category': 'Groceries', 'stock': 50, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/unga-wa-dola.jpg'},
    {'name': 'Pembe Maize Flour 2kg', 'brand': 'Pembe', 'description': 'Fine maize flour for ugali', 'price': 120, 'category': 'Groceries', 'stock': 45, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/pembe-maize-flour.jpg'},
    {'name': 'Basmati Rice 1kg', 'brand': 'Sunrice', 'description': 'Premium long grain rice', 'price': 250, 'category': 'Groceries', 'stock': 30, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/basmati-rice.jpg'},
    {'name': 'Sugar 2kg', 'brand': 'Mumias', 'description': 'Pure white sugar', 'price': 220, 'category': 'Groceries', 'stock': 40, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/sugar.jpg'},
    {'name': 'Cooking Oil 1L', 'brand': 'Fresh Fri', 'description': 'Refined sunflower oil', 'price': 280, 'category': 'Groceries', 'stock': 35, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/cooking-oil.jpg'},

    # Beverages
    {'name': 'Coca Cola 500ml', 'brand': 'Coca Cola', 'description': 'Refreshing soft drink', 'price': 80, 'category': 'Beverages', 'stock': 100, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/coca-cola.jpg'},
    {'name': 'Tusker Beer 500ml', 'brand': 'Tusker', 'description': 'Premium Kenyan lager', 'price': 150, 'category': 'Beverages', 'stock': 60, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/tusker-beer.jpg'},
    {'name': 'Minute Maid Orange 1L', 'brand': 'Minute Maid', 'description': 'Fresh orange juice', 'price': 120, 'category': 'Beverages', 'stock': 25, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/minute-maid-orange.jpg'},
    {'name': 'Brookside Milk 500ml', 'brand': 'Brookside', 'description': 'Fresh whole milk', 'price': 65, 'category': 'Beverages', 'stock': 80, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/brookside-milk.jpg'},

    # Personal Care
    {'name': 'Colgate Toothpaste 100ml', 'brand': 'Colgate', 'description': 'Cavity protection toothpaste', 'price': 180, 'category': 'Personal Care', 'stock': 40, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/colgate-toothpaste.jpg'},
    {'name': 'Nivea Body Lotion 400ml', 'brand': 'Nivea', 'description': 'Moisturizing body lotion', 'price': 450, 'category': 'Personal Care', 'stock': 25, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/nivea-lotion.jpg'},
    {'name': 'Dettol Soap 100g', 'brand': 'Dettol', 'description': 'Antibacterial soap bar', 'price': 85, 'category': 'Personal Care', 'stock': 60, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/dettol-soap.jpg'},

    # Household
    {'name': 'Omo Washing Powder 1kg', 'brand': 'Omo', 'description': 'Multi-active washing powder', 'price': 320, 'category': 'Household', 'stock': 30, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/omo-washing-powder.jpg'},
    {'name': 'Vim Dishwashing Liquid 500ml', 'brand': 'Vim', 'description': 'Grease cutting dish soap', 'price': 150, 'category': 'Household', 'stock': 45, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/vim-dishwashing.jpg'},
    {'name': 'Toilet Paper 4 Rolls', 'brand': 'Velvex', 'description': 'Soft toilet tissue', 'price': 200, 'category': 'Household', 'stock': 50, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/toilet-paper.jpg'},

    # Dairy & Eggs
    {'name': 'Fresh Eggs 30pcs', 'brand': 'Kenchic', 'description': 'Farm fresh chicken eggs', 'price': 420, 'category': 'Dairy & Eggs', 'stock': 20, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/eggs.jpg'},
    {'name': 'President Cheese 200g', 'brand': 'President', 'description': 'Processed cheese slices', 'price': 280, 'category': 'Dairy & Eggs', 'stock': 15, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/cheese.jpg'},
    {'name': 'Yogurt 500ml', 'brand': 'Brookside', 'description': 'Natural plain yogurt', 'price': 120, 'category': 'Dairy & Eggs', 'stock': 25, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/yogurt.jpg'},

    # Meat & Poultry
    {'name': 'Chicken Breast 1kg', 'brand': 'Kenchic', 'description': 'Fresh boneless chicken breast', 'price': 650, 'category': 'Meat & Poultry', 'stock': 10, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/chicken-breast.jpg'},
    {'name': 'Beef Steak 1kg', 'brand': 'Farm Fresh', 'description': 'Premium beef cuts', 'price': 850, 'category': 'Meat & Poultry', 'stock': 8, 'image_url': 'https://res.cloudinary.com/demo/image/upload/v1690000000/beef-steak.jpg'},
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
            'brand': product_data['brand'],
            'image_url': product_data['image_url'],
            'is_active': True
        }
    )
    print(f"{'Created' if created else 'Found'} product: {product.name} - KES {product.price}")

print(f"\nSample data added successfully!")
print(f"Categories: {Category.objects.count()}")
print(f"Products: {Product.objects.count()}")