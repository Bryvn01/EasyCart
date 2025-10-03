#!/usr/bin/env python
"""
Test script to verify review system integration
"""
import os
import sys
import django

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from apps.products.review_models import Review
from django.contrib import admin

def test_product_serializer():
    """Test that product serializer includes rating and review_count"""
    print("\n[TEST] Testing Product Serializer")
    print("=" * 60)
    
    try:
        # Get a product (or create one for testing)
        products = Product.objects.all()[:1]
        
        if not products:
            print("[WARN] No products found in database")
            print("[INFO] Skipping serializer test")
            return False
        
        product = products[0]
        serializer = ProductSerializer(product)
        data = serializer.data
        
        # Check if rating and review_count are in the serialized data
        has_rating = 'rating' in data
        has_review_count = 'review_count' in data
        
        print(f"[CHECK] Product: {product.name}")
        print(f"[CHECK] Has 'rating' field: {has_rating}")
        print(f"[CHECK] Has 'review_count' field: {has_review_count}")
        
        if has_rating and has_review_count:
            print(f"[DATA] Rating: {data['rating']}")
            print(f"[DATA] Review Count: {data['review_count']}")
            print("[PASS] Product serializer includes rating and review_count")
            return True
        else:
            print("[FAIL] Product serializer missing rating or review_count")
            return False
            
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False

def test_admin_registration():
    """Test that Review models are registered in admin"""
    print("\n[TEST] Testing Admin Registration")
    print("=" * 60)
    
    try:
        from apps.products.review_models import Review, ReviewHelpful
        
        # Check if models are registered in admin
        review_registered = Review in admin.site._registry
        review_helpful_registered = ReviewHelpful in admin.site._registry
        
        print(f"[CHECK] Review model registered: {review_registered}")
        print(f"[CHECK] ReviewHelpful model registered: {review_helpful_registered}")
        
        if review_registered and review_helpful_registered:
            print("[PASS] Review models are registered in admin")
            
            # Get admin classes
            review_admin = admin.site._registry[Review]
            review_helpful_admin = admin.site._registry[ReviewHelpful]
            
            print(f"[INFO] Review admin list_display: {review_admin.list_display}")
            print(f"[INFO] Review admin list_filter: {review_admin.list_filter}")
            print(f"[INFO] Review admin search_fields: {review_admin.search_fields}")
            
            return True
        else:
            print("[FAIL] Review models not properly registered in admin")
            return False
            
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_review_model_properties():
    """Test Review model and Product review properties"""
    print("\n[TEST] Testing Review Model Properties")
    print("=" * 60)
    
    try:
        # Test Product model properties
        products = Product.objects.all()[:1]
        
        if not products:
            print("[WARN] No products found in database")
            return False
        
        product = products[0]
        
        # Test that properties exist and work
        avg_rating = product.average_rating
        review_count = product.review_count
        
        print(f"[CHECK] Product: {product.name}")
        print(f"[CHECK] Average rating: {avg_rating}")
        print(f"[CHECK] Review count: {review_count}")
        
        # Check if there are any reviews
        reviews = Review.objects.filter(product=product)
        print(f"[INFO] Reviews in database for this product: {reviews.count()}")
        
        print("[PASS] Product review properties working")
        return True
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 60)
    print("Review System Integration Tests")
    print("=" * 60)
    
    results = []
    
    # Run tests
    results.append(("Admin Registration", test_admin_registration()))
    results.append(("Product Serializer", test_product_serializer()))
    results.append(("Review Model Properties", test_review_model_properties()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nPassed: {passed}/{total}")
    
    if passed == total:
        print("\n✓ All tests passed!")
        return 0
    else:
        print(f"\n✗ {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
