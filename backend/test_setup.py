#!/usr/bin/env python3
"""
Test setup script to ensure test data exists
"""
import os
import sys
import django
from django.core.management import call_command

# Setup Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

# Run migrations first
print("Running migrations...")
try:
    call_command('migrate', verbosity=0)
    print("[OK] Migrations completed")
except Exception as e:
    print(f"[WARNING] Migration error (may be expected): {e}")

from django.contrib.auth import get_user_model
from apps.products.models import Category, Product

User = get_user_model()

def setup_test_data():
    """Create test data for API tests"""
    print("Setting up test data...")

    # Create test user
    test_email = os.getenv('TEST_EMAIL', 'test@example.com')
    test_password = os.getenv('TEST_PASSWORD', 'testpassword')
    test_username = os.getenv('TEST_USERNAME', 'testuser')

    user, created = User.objects.get_or_create(
        email=test_email,
        defaults={
            'username': test_username,
            'password': test_password
        }
    )

    if created:
        user.set_password(test_password)
        user.save()
        print(f"[OK] Created test user: {test_email}")
    else:
        print(f"[OK] Test user already exists: {test_email}")

    # Create test category
    category, created = Category.objects.get_or_create(
        name='Test Category',
        defaults={'description': 'Test category for API tests'}
    )

    if created:
        print("[OK] Created test category")
    else:
        print("[OK] Test category already exists")

    # Create test product
    product, created = Product.objects.get_or_create(
        name='Test Product',
        defaults={
            'description': 'Test product for API tests',
            'price': 10.00,
            'category': category,
            'stock': 100,
            'is_active': True
        }
    )

    if created:
        print("[OK] Created test product")
    else:
        print("[OK] Test product already exists")

    print("Test data setup complete!")

if __name__ == "__main__":
    setup_test_data()
