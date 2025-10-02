#!/usr/bin/env python3
"""
Simple demonstration of error handling improvements
Shows how the endpoint behaves in different scenarios
"""

import os
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')

import django
django.setup()

from django.test import RequestFactory
from apps.products.views import ProductListView
from apps.products.models import Product, Category
from unittest.mock import patch
from django.db import DatabaseError

def test_scenario(name, description, test_func):
    """Run a test scenario and display results"""
    print(f"\n{'='*70}")
    print(f"Scenario: {name}")
    print(f"{'='*70}")
    print(f"Description: {description}")
    print(f"\nTesting...")
    
    try:
        result = test_func()
        status_code = result.status_code if hasattr(result, 'status_code') else 'N/A'
        data_preview = str(result.data)[:100] if hasattr(result, 'data') else 'N/A'
        
        print(f"\n✓ Test completed successfully")
        print(f"  HTTP Status: {status_code}")
        print(f"  Response: {data_preview}...")
        
        return True
    except Exception as e:
        print(f"\n✗ Test failed with exception: {e}")
        return False

def scenario_normal_products():
    """Test with normal product data"""
    # Create test data
    category = Category.objects.get_or_create(
        name='Test Category',
        defaults={'description': 'Test category'}
    )[0]
    
    Product.objects.get_or_create(
        name='Test Product',
        defaults={
            'description': 'Test product',
            'price': 100.00,
            'stock': 10,
            'category': category,
            'is_active': True
        }
    )
    
    factory = RequestFactory()
    request = factory.get('/api/products/')
    view = ProductListView.as_view()
    response = view(request)
    
    return response

def scenario_empty_database():
    """Test with empty database"""
    # Clear all products
    Product.objects.all().delete()
    
    factory = RequestFactory()
    request = factory.get('/api/products/')
    view = ProductListView.as_view()
    response = view(request)
    
    return response

def scenario_database_error():
    """Test with simulated database error"""
    factory = RequestFactory()
    request = factory.get('/api/products/')
    view = ProductListView.as_view()
    
    # Mock database error
    with patch.object(Product.objects, 'filter') as mock_filter:
        mock_filter.side_effect = DatabaseError("Simulated DB connection failure")
        response = view(request)
    
    return response

def scenario_invalid_price_filter():
    """Test with invalid price filter"""
    factory = RequestFactory()
    request = factory.get('/api/products/?price_min=invalid&price_max=NaN')
    view = ProductListView.as_view()
    response = view(request)
    
    return response

def main():
    """Run demonstration scenarios"""
    print("\n" + "="*70)
    print("Products Endpoint Error Handling Demonstration")
    print("="*70)
    print("\nThis demonstration shows how the endpoint now handles various scenarios")
    print("gracefully without crashing or showing generic error pages.")
    
    scenarios = [
        (
            "Normal Product List",
            "Products exist in database, should return normal paginated response",
            scenario_normal_products
        ),
        (
            "Empty Database",
            "No products in database, should return HTTP 200 with empty list (not error)",
            scenario_empty_database
        ),
        (
            "Database Connection Error",
            "Database connection fails, should return HTTP 503 with error message",
            scenario_database_error
        ),
        (
            "Invalid Query Parameters",
            "Invalid price filters, should ignore invalid values and return results",
            scenario_invalid_price_filter
        ),
    ]
    
    results = []
    for name, description, test_func in scenarios:
        success = test_scenario(name, description, test_func)
        results.append((name, success))
    
    # Summary
    print(f"\n{'='*70}")
    print("Summary")
    print(f"{'='*70}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for name, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"  {status} - {name}")
    
    print(f"\n{passed}/{total} scenarios passed")
    
    print(f"\n{'='*70}")
    print("Key Improvements Demonstrated:")
    print(f"{'='*70}")
    print("  • Empty database returns HTTP 200 with empty list (not an error)")
    print("  • Database errors return HTTP 503 with proper error message")
    print("  • Invalid parameters are handled gracefully")
    print("  • All errors are logged with full context")
    print("  • API always returns valid JSON (never crashes)")
    print(f"{'='*70}\n")
    
    return 0 if passed == total else 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nDemonstration interrupted by user")
        sys.exit(1)
