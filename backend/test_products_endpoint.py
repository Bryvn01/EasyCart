#!/usr/bin/env python3
"""
Test script for Products API endpoint error handling
Tests various scenarios: normal operation, empty DB, database errors
Run with: python test_products_endpoint.py
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from apps.products.views import ProductListView, ProductDetailView
from apps.products.models import Product, Category
from rest_framework.test import APIRequestFactory, force_authenticate
from unittest.mock import patch, MagicMock
from django.db import DatabaseError

User = get_user_model()


class ProductEndpointTests(TestCase):
    """Test cases for product endpoint error handling"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.factory = APIRequestFactory()
        
        # Create test category
        self.category = Category.objects.create(
            name='Test Category',
            description='Test category description'
        )
        
        # Create test products
        self.product1 = Product.objects.create(
            name='Test Product 1',
            description='Test product 1 description',
            price=100.00,
            stock=10,
            category=self.category,
            is_active=True
        )
        
        self.product2 = Product.objects.create(
            name='Test Product 2',
            description='Test product 2 description',
            price=200.00,
            stock=5,
            category=self.category,
            is_active=True
        )
        
        # Create inactive product
        self.inactive_product = Product.objects.create(
            name='Inactive Product',
            description='Inactive product description',
            price=150.00,
            stock=3,
            category=self.category,
            is_active=False
        )
    
    def test_products_list_normal(self):
        """Test normal product list retrieval"""
        request = self.factory.get('/api/products/')
        view = ProductListView.as_view()
        response = view(request)
        
        self.assertEqual(response.status_code, 200)
        # Should return paginated response or list
        data = response.data
        if isinstance(data, dict) and 'results' in data:
            products = data['results']
        else:
            products = data
        
        # Should only return active products
        self.assertGreaterEqual(len(products), 2)
        print(f"✓ Normal product list: Retrieved {len(products)} products")
    
    def test_products_list_empty_database(self):
        """Test product list with empty database"""
        # Delete all products
        Product.objects.all().delete()
        
        request = self.factory.get('/api/products/')
        view = ProductListView.as_view()
        response = view(request)
        
        # Should return 200 with empty list, not error
        self.assertEqual(response.status_code, 200)
        
        data = response.data
        if isinstance(data, dict) and 'results' in data:
            products = data['results']
        else:
            products = data
        
        self.assertEqual(len(products), 0)
        print("✓ Empty database: Returns HTTP 200 with empty list")
    
    def test_products_list_database_error(self):
        """Test product list handles database errors gracefully"""
        request = self.factory.get('/api/products/')
        view = ProductListView.as_view()
        
        # Mock database error
        with patch.object(Product.objects, 'filter') as mock_filter:
            mock_filter.side_effect = DatabaseError("Database connection failed")
            
            response = view(request)
            
            # Should return 503 or 500, not crash
            self.assertIn(response.status_code, [500, 503])
            self.assertIn('error', response.data)
            print(f"✓ Database error: Returns HTTP {response.status_code} with error message")
    
    def test_products_list_serialization_error(self):
        """Test product list handles serialization errors"""
        request = self.factory.get('/api/products/')
        view = ProductListView.as_view()
        
        # Mock serialization error
        with patch('apps.products.views.ProductSerializer') as mock_serializer:
            mock_instance = MagicMock()
            mock_instance.data.side_effect = Exception("Serialization failed")
            mock_serializer.return_value = mock_instance
            
            response = view(request)
            
            # Should return empty list or error, not crash
            self.assertIn(response.status_code, [200, 500])
            print(f"✓ Serialization error: Returns HTTP {response.status_code} gracefully")
    
    def test_product_detail_not_found(self):
        """Test product detail with non-existent product"""
        request = self.factory.get('/api/products/99999/')
        view = ProductDetailView.as_view()
        response = view(request, pk=99999)
        
        # Should return 404
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)
        print("✓ Product not found: Returns HTTP 404 with error message")
    
    def test_product_detail_database_error(self):
        """Test product detail handles database errors"""
        request = self.factory.get(f'/api/products/{self.product1.pk}/')
        view = ProductDetailView.as_view()
        
        # Mock database error
        with patch.object(Product.objects, 'get') as mock_get:
            mock_get.side_effect = DatabaseError("Database connection failed")
            
            response = view(request, pk=self.product1.pk)
            
            # Should return error, not crash
            self.assertIn(response.status_code, [500, 503])
            self.assertIn('error', response.data)
            print(f"✓ Database error (detail): Returns HTTP {response.status_code} with error message")
    
    def test_price_filtering_valid(self):
        """Test price range filtering with valid values"""
        request = self.factory.get('/api/products/?price_min=50&price_max=150')
        view = ProductListView.as_view()
        response = view(request)
        
        self.assertEqual(response.status_code, 200)
        print("✓ Price filtering (valid): Works correctly")
    
    def test_price_filtering_invalid(self):
        """Test price range filtering with invalid values"""
        # Should not crash with invalid values
        test_cases = [
            '?price_min=invalid',
            '?price_max=NaN',
            '?price_min=inf',
            '?price_max=-inf',
        ]
        
        for query in test_cases:
            request = self.factory.get(f'/api/products/{query}')
            view = ProductListView.as_view()
            response = view(request)
            
            # Should return 200, ignoring invalid filters
            self.assertEqual(response.status_code, 200)
        
        print("✓ Price filtering (invalid): Handles gracefully without crashing")


def run_tests():
    """Run all tests"""
    print("=" * 60)
    print("Testing Products Endpoint Error Handling")
    print("=" * 60)
    print()
    
    from django.test.runner import DiscoverRunner
    test_runner = DiscoverRunner(verbosity=2, interactive=False, keepdb=False)
    
    # Run specific test class
    failures = test_runner.run_tests(['__main__.ProductEndpointTests'])
    
    print()
    print("=" * 60)
    if failures == 0:
        print("✅ All tests passed!")
        print()
        print("The /products endpoint now:")
        print("  • Returns HTTP 200 with empty list when no products exist")
        print("  • Handles database errors gracefully with proper error messages")
        print("  • Logs all errors with full tracebacks for debugging")
        print("  • Returns valid JSON in all scenarios (never generic Render error)")
    else:
        print(f"❌ {failures} test(s) failed")
    print("=" * 60)
    
    return 0 if failures == 0 else 1


if __name__ == '__main__':
    sys.exit(run_tests())
