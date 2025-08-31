#!/usr/bin/env python3
"""
Comprehensive application test suite
"""
import os
import sys
import django
import requests
from pathlib import Path

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.products.models import Category, Product
from apps.orders.models import Order, Cart, CartItem

User = get_user_model()

def test_database_connectivity():
    """Test database connection and basic operations"""
    try:
        # Test user creation
        user_count = User.objects.count()
        print(f"[OK] Database connected - {user_count} users found")
        
        # Test product queries
        product_count = Product.objects.count()
        category_count = Category.objects.count()
        print(f"[OK] Products: {product_count}, Categories: {category_count}")
        
        return True
    except Exception as e:
        print(f"[ERROR] Database connectivity failed: {e}")
        return False

def test_model_integrity():
    """Test model relationships and constraints"""
    try:
        # Test category-product relationship
        categories = Category.objects.all()[:3]
        for category in categories:
            products = category.products.all()[:2]
            print(f"[OK] Category '{category.name}' has {products.count()} products")
        
        # Test product fields
        product = Product.objects.first()
        if product:
            print(f"[OK] Product model fields working: {product.name}, Price: {product.price}")
        
        return True
    except Exception as e:
        print(f"[ERROR] Model integrity test failed: {e}")
        return False

def test_api_endpoints():
    """Test critical API endpoints"""
    base_url = "http://localhost:8000/api"
    
    try:
        # Test products endpoint
        response = requests.get(f"{base_url}/products/", timeout=5)
        if response.status_code == 200:
            print(f"[OK] Products API working - {len(response.json().get('results', []))} products")
        else:
            print(f"[WARNING] Products API returned status {response.status_code}")
        
        # Test categories endpoint
        response = requests.get(f"{base_url}/products/categories/", timeout=5)
        if response.status_code == 200:
            print(f"[OK] Categories API working - {len(response.json())} categories")
        else:
            print(f"[WARNING] Categories API returned status {response.status_code}")
        
        return True
    except requests.exceptions.ConnectionError:
        print("[WARNING] API server not running - start with 'python manage.py runserver'")
        return False
    except Exception as e:
        print(f"[ERROR] API test failed: {e}")
        return False

def test_security_configurations():
    """Test security settings"""
    from django.conf import settings
    
    issues = []
    
    # Check DEBUG setting
    if settings.DEBUG:
        issues.append("DEBUG is True - should be False in production")
    
    # Check SECRET_KEY
    if settings.SECRET_KEY == 'django-insecure-change-me-in-production':
        issues.append("SECRET_KEY is using default value")
    
    # Check ALLOWED_HOSTS
    if not settings.ALLOWED_HOSTS or settings.ALLOWED_HOSTS == ['*']:
        issues.append("ALLOWED_HOSTS not properly configured")
    
    if issues:
        for issue in issues:
            print(f"[WARNING] Security: {issue}")
    else:
        print("[OK] Security configurations look good")
    
    return len(issues) == 0

def test_file_structure():
    """Test critical file structure"""
    critical_files = [
        'backend/manage.py',
        'backend/ecommerce/settings.py',
        'backend/apps/products/models.py',
        'backend/apps/orders/models.py',
        'backend/apps/accounts/models.py',
        'frontend/src/App.js',
        'frontend/src/services/api.js',
        'frontend/package.json',
        'README.md'
    ]
    
    missing_files = []
    for file_path in critical_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print(f"[WARNING] Missing files: {', '.join(missing_files)}")
        return False
    else:
        print("[OK] All critical files present")
        return True

def main():
    """Run all tests"""
    print("Running comprehensive application tests...\n")
    
    tests = [
        ("Database Connectivity", test_database_connectivity),
        ("Model Integrity", test_model_integrity),
        ("API Endpoints", test_api_endpoints),
        ("Security Configurations", test_security_configurations),
        ("File Structure", test_file_structure),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"[ERROR] {test_name} failed with exception: {e}")
    
    print(f"\n=== Test Results ===")
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("[SUCCESS] All tests passed! Application is ready.")
    else:
        print("[WARNING] Some tests failed. Review the issues above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)