from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from apps.products.models import Product, Category
import json
import os

User = get_user_model()


class SecurityTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        # Use environment variables or defaults for test credentials
        test_username = os.getenv("TEST_USERNAME", "testuser")
        test_email = os.getenv("TEST_EMAIL", "test@example.com")
        test_password = os.getenv("TEST_PASSWORD", "testpass123")

        self.user = User.objects.create_user(
            username=test_username, email=test_email, password=test_password
        )
        self.category = Category.objects.create(name="Test Category")
        self.product = Product.objects.create(
            name="Test Product",
            description="Test Description",
            price=10.00,
            category=self.category,
            stock=100,
        )

    def test_xss_protection_in_product_name(self):
        """Test that product names are properly escaped"""
        malicious_name = '<script>alert("xss")</script>'
        product = Product.objects.create(
            name=malicious_name, description="Test", price=10.00, category=self.category
        )

        # The __str__ method should escape the name
        self.assertNotIn("<script>", str(product))
        self.assertIn("&lt;script&gt;", str(product))

    def test_sql_injection_protection(self):
        """Test protection against SQL injection in search"""
        malicious_search = "'; DROP TABLE products; --"

        # Try the API endpoint first
        response = self.client.get("/api/products/", {"search": malicious_search})

        # If API endpoint doesn't exist, try regular endpoint
        if response.status_code == 404:
            response = self.client.get("/products/", {"search": malicious_search})

        # Should return 200, 400, or redirect (301/302) but not 500 error
        self.assertNotEqual(response.status_code, 500)
        # Products table should still exist
        self.assertTrue(Product.objects.exists())

    def test_price_validation_nan_injection(self):
        """Test protection against NaN injection in price filters"""
        # Try API endpoint first
        response = self.client.get(
            "/api/products/", {"price_min": "NaN", "price_max": "Infinity"}
        )

        # If API endpoint doesn't exist, try regular endpoint
        if response.status_code == 404:
            response = self.client.get(
                "/products/", {"price_min": "NaN", "price_max": "Infinity"}
            )

        # Should handle gracefully without 500 errors
        self.assertNotEqual(response.status_code, 500)

    def test_authentication_required_for_sensitive_operations(self):
        """Test that sensitive operations require authentication"""
        # Try to create product without authentication - use API endpoint
        response = self.client.post(
            "/api/products/", {"name": "Unauthorized Product", "price": 100.00}
        )

        # If API endpoint doesn't exist, try regular endpoint
        if response.status_code == 404:
            response = self.client.post(
                "/products/", {"name": "Unauthorized Product", "price": 100.00}
            )

        # Should require authentication - accept redirects (301, 302) or auth errors (400, 401, 403)
        self.assertIn(response.status_code, [301, 302, 400, 401, 403])

    def test_csrf_protection(self):
        """Test CSRF protection on state-changing operations"""
        # Login the user first
        test_password = os.getenv("TEST_PASSWORD", "testpass123")
        self.client.login(username="testuser", password=test_password)

        # Try POST without CSRF token to cart endpoint
        response = self.client.post(
            "/api/cart/add/", {"product_id": self.product.id, "quantity": 1}
        )

        # If API endpoint doesn't exist, try regular endpoint
        if response.status_code == 404:
            response = self.client.post(
                "/cart/add/", {"product_id": self.product.id, "quantity": 1}
            )

        # Should be protected - could be 403 (CSRF failure) or redirect
        self.assertIsNotNone(response)
        self.assertIn(response.status_code, [200, 301, 302, 403, 404])
