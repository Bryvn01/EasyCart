import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from apps.products.models import Product, Category
from apps.accounts.models import User
from apps.orders.models import Order, Cart

# Quick database queries
print("=== DATABASE OVERVIEW ===")
print(f"Users: {User.objects.count()}")
print(f"Categories: {Category.objects.count()}")
print(f"Products: {Product.objects.count()}")
print(f"Orders: {Order.objects.count()}")
print(f"Carts: {Cart.objects.count()}")

print("\n=== RECENT PRODUCTS ===")
for product in Product.objects.all()[:5]:
    print(f"- {product.name}: KES {product.price} (Stock: {product.stock})")

print("\n=== CATEGORIES ===")
for category in Category.objects.all():
    print(f"- {category.name}: {category.product_set.count()} products")

print("\n=== USERS ===")
for user in User.objects.all():
    print(f"- {user.username} ({user.email}) - Admin: {user.is_admin}")