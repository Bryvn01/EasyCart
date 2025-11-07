from django.test import TestCase
from apps.products.models import Product, Category


class ProductTests(TestCase):
    def setUp(self):
        """Set up test fixtures"""
        self.category = Category.objects.create(
            name="Test Category",
            description="Test category description"
        )

    def test_product_creation(self):
        product = Product.objects.create(
            name="Test Product",
            price=9.99,
            description="Test description",
            category=self.category
        )
        self.assertEqual(str(product), "Test Product")
