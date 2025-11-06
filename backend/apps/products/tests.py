from django.test import TestCase
from apps.products.models import Product


class ProductTests(TestCase):
    def test_product_creation(self):
        product = Product.objects.create(
            name="Test Product", price=9.99, description="Test description"
        )
        self.assertEqual(str(product), "Test Product")
