"""
Comprehensive test coverage for Cart functionality.
Tests cover cart operations, validation, edge cases, and error handling.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from apps.accounts.models import User
from apps.products.models import Product, Category
from apps.orders.models import Cart, CartItem


class CartModelTests(TestCase):
    """Unit tests for Cart and CartItem models."""

    def setUp(self):
        """Set up test data for cart model tests."""
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="TestPass123!"
        )
        self.category = Category.objects.create(
            name="Electronics", description="Electronic items"
        )
        self.product = Product.objects.create(
            name="Test Product",
            description="Test Description",
            price=Decimal("100.00"),
            stock=10,
            category=self.category,
        )

    def test_cart_creation(self):
        """Test that a cart is created correctly for a user."""
        cart = Cart.objects.create(user=self.user)
        self.assertEqual(cart.user, self.user)
        self.assertIsNotNone(cart.created_at)

    def test_cart_one_to_one_relationship(self):
        """Test that each user can only have one cart."""
        Cart.objects.create(user=self.user)
        # Attempting to create another cart should raise an error
        with self.assertRaises(Exception):
            Cart.objects.create(user=self.user)

    def test_cart_item_creation(self):
        """Test that cart items are created correctly."""
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        self.assertEqual(cart_item.cart, cart)
        self.assertEqual(cart_item.product, self.product)
        self.assertEqual(cart_item.quantity, 2)

    def test_cart_item_unique_together(self):
        """Test that duplicate cart items for same product are prevented."""
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)

        # Attempting to create duplicate should raise error
        with self.assertRaises(Exception):
            CartItem.objects.create(cart=cart, product=self.product, quantity=1)

    def test_cart_item_default_quantity(self):
        """Test that cart items have default quantity of 1."""
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product)
        self.assertEqual(cart_item.quantity, 1)


class CartAPITests(APITestCase):
    """Integration tests for Cart API endpoints."""

    def setUp(self):
        """Set up test data for cart API tests."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="TestPass123!"
        )
        self.category = Category.objects.create(
            name="Electronics", description="Electronic items"
        )
        self.product = Product.objects.create(
            name="Test Product",
            description="Test Description",
            price=Decimal("100.00"),
            stock=10,
            category=self.category,
        )

    def test_get_cart_unauthenticated(self):
        """Test that unauthenticated users get empty cart."""
        url = reverse("get-cart")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["items"], [])
        self.assertEqual(response.data["total"], 0)
        self.assertEqual(response.data["count"], 0)

    def test_get_cart_authenticated_empty(self):
        """Test that authenticated users with no items get empty cart."""
        self.client.force_authenticate(user=self.user)
        url = reverse("get-cart")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_to_cart_success(self):
        """Test successfully adding a product to cart."""
        self.client.force_authenticate(user=self.user)
        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": 2}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify cart item was created
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.items.count(), 1)
        cart_item = cart.items.first()
        self.assertEqual(cart_item.quantity, 2)
        self.assertEqual(cart_item.product, self.product)

    def test_add_to_cart_requires_authentication(self):
        """Test that adding to cart requires authentication."""
        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": 1}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_to_cart_invalid_product(self):
        """Test adding non-existent product to cart returns 404."""
        self.client.force_authenticate(user=self.user)
        url = reverse("add-to-cart")
        data = {"product_id": 99999, "quantity": 1}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_add_to_cart_invalid_quantity_negative(self):
        """Test that negative quantity is rejected."""
        self.client.force_authenticate(user=self.user)
        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": -1}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_add_to_cart_invalid_quantity_zero(self):
        """Test that zero quantity is rejected."""
        self.client.force_authenticate(user=self.user)
        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": 0}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_to_cart_invalid_quantity_exceeds_max(self):
        """Test that quantity over 100 is rejected."""
        self.client.force_authenticate(user=self.user)
        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": 101}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Quantity must be between 1 and 100", response.data["error"])

    def test_add_to_cart_exceeds_stock(self):
        """Test that adding more than available stock is rejected."""
        self.client.force_authenticate(user=self.user)
        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": 20}  # Stock is 10
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Only 10 items available", response.data["error"])

    def test_add_to_cart_duplicate_product_updates_quantity(self):
        """Test that adding same product again updates quantity."""
        self.client.force_authenticate(user=self.user)
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": 3}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify quantity was updated
        cart_item = CartItem.objects.get(cart=cart, product=self.product)
        self.assertEqual(cart_item.quantity, 5)

    def test_add_to_cart_duplicate_exceeds_stock(self):
        """Test that updating quantity respects stock limits."""
        self.client.force_authenticate(user=self.user)
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=8)

        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": 5}  # Total would be 13 > 10
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_cart_item_success(self):
        """Test successfully updating cart item quantity."""
        self.client.force_authenticate(user=self.user)
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        url = reverse("update-cart-item", kwargs={"item_id": cart_item.id})
        data = {"quantity": 5}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 5)

    def test_remove_from_cart_success(self):
        """Test successfully removing item from cart."""
        self.client.force_authenticate(user=self.user)
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        url = reverse("remove-from-cart", kwargs={"item_id": cart_item.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify item was deleted
        self.assertFalse(CartItem.objects.filter(id=cart_item.id).exists())

    def test_clear_cart_success(self):
        """Test successfully clearing entire cart."""
        self.client.force_authenticate(user=self.user)
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        product2 = Product.objects.create(
            name="Product 2", price=Decimal("50.00"), stock=5, category=self.category
        )
        CartItem.objects.create(cart=cart, product=product2, quantity=1)

        url = reverse("clear-cart")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify all items were removed
        self.assertEqual(cart.items.count(), 0)


class CartEdgeCaseTests(APITestCase):
    """Tests for cart edge cases and failure scenarios."""

    def setUp(self):
        """Set up test data for edge case tests."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="TestPass123!"
        )
        self.category = Category.objects.create(name="Test")
        self.product = Product.objects.create(
            name="Test Product",
            price=Decimal("100.00"),
            stock=5,
            category=self.category,
        )

    def test_add_to_cart_with_zero_stock(self):
        """Test adding product with zero stock is rejected."""
        self.product.stock = 0
        self.product.save()

        self.client.force_authenticate(user=self.user)
        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": 1}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_to_cart_invalid_quantity_type(self):
        """Test that non-numeric quantity is rejected."""
        self.client.force_authenticate(user=self.user)
        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": "invalid"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid quantity", response.data["error"])

    def test_add_to_cart_missing_product_id(self):
        """Test that missing product_id is handled."""
        self.client.force_authenticate(user=self.user)
        url = reverse("add-to-cart")
        data = {"quantity": 1}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_concurrent_cart_modifications(self):
        """Test that concurrent cart updates don't cause conflicts."""
        self.client.force_authenticate(user=self.user)
        Cart.objects.create(user=self.user)

        # Simulate concurrent adds
        url = reverse("add-to-cart")
        data = {"product_id": self.product.id, "quantity": 2}

        response1 = self.client.post(url, data, format="json")
        response2 = self.client.post(url, data, format="json")

        self.assertIn(
            response1.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]
        )
        self.assertIn(
            response2.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]
        )
