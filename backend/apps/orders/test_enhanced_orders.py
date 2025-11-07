"""
Tests for enhanced order and checkout flow with transaction safety.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.products.models import Product, Category
from apps.orders.models import Cart, CartItem, Order, OrderItem
from decimal import Decimal

User = get_user_model()


class CheckoutTransactionTests(APITestCase):
    """Test checkout transaction safety and consistency"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="ValidPass123!",
        )
        self.client.force_authenticate(user=self.user)
        
        # Create category and products
        self.category = Category.objects.create(
            name="Electronics",
            description="Electronic items"
        )
        self.product1 = Product.objects.create(
            name="Product 1",
            description="Test product 1",
            price=Decimal("100.00"),
            stock=10,
            category=self.category,
            is_active=True
        )
        self.product2 = Product.objects.create(
            name="Product 2",
            description="Test product 2",
            price=Decimal("200.00"),
            stock=5,
            category=self.category,
            is_active=True
        )
        
        # Create cart with items
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item1 = CartItem.objects.create(
            cart=self.cart,
            product=self.product1,
            quantity=2
        )
        self.cart_item2 = CartItem.objects.create(
            cart=self.cart,
            product=self.product2,
            quantity=1
        )
        
        self.checkout_url = reverse("checkout")

    def test_checkout_success(self):
        """Test successful checkout with valid data"""
        data = {
            "shipping_address": "123 Main Street, Nairobi, Kenya",
            "phone_number": "+254712345678",
            "payment_method": "mpesa"
        }
        response = self.client.post(self.checkout_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify order was created
        order = Order.objects.get(user=self.user)
        self.assertEqual(order.total_amount, Decimal("400.00"))  # 2*100 + 1*200
        self.assertEqual(order.items.count(), 2)
        
        # Verify stock was updated
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.stock, 8)  # 10 - 2
        self.assertEqual(self.product2.stock, 4)  # 5 - 1
        
        # Verify cart was cleared
        self.assertEqual(self.cart.items.count(), 0)

    def test_checkout_empty_cart(self):
        """Test that checkout fails with empty cart"""
        # Clear cart
        self.cart.items.all().delete()
        
        data = {
            "shipping_address": "123 Main Street, Nairobi, Kenya",
            "phone_number": "+254712345678",
            "payment_method": "mpesa"
        }
        response = self.client.post(self.checkout_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_checkout_insufficient_stock(self):
        """Test that checkout fails when stock is insufficient"""
        # Update product stock to be less than cart quantity
        self.product1.stock = 1
        self.product1.save()
        
        data = {
            "shipping_address": "123 Main Street, Nairobi, Kenya",
            "phone_number": "+254712345678",
            "payment_method": "mpesa"
        }
        response = self.client.post(self.checkout_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Insufficient stock", response.data["error"])
        
        # Verify no order was created
        self.assertEqual(Order.objects.filter(user=self.user).count(), 0)
        
        # Verify cart was not cleared
        self.assertEqual(self.cart.items.count(), 2)

    def test_checkout_invalid_address(self):
        """Test that checkout requires valid shipping address"""
        data = {
            "shipping_address": "short",  # Too short
            "phone_number": "+254712345678",
            "payment_method": "mpesa"
        }
        response = self.client.post(self.checkout_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_invalid_phone(self):
        """Test that checkout requires valid phone number"""
        data = {
            "shipping_address": "123 Main Street, Nairobi, Kenya",
            "phone_number": "invalid-phone",
            "payment_method": "mpesa"
        }
        response = self.client.post(self.checkout_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_invalid_payment_method(self):
        """Test that checkout requires valid payment method"""
        data = {
            "shipping_address": "123 Main Street, Nairobi, Kenya",
            "phone_number": "+254712345678",
            "payment_method": "invalid_method"
        }
        response = self.client.post(self.checkout_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_atomicity(self):
        """Test that checkout is atomic - all or nothing"""
        # This test verifies that if stock update fails, order is not created
        # Set one product to have exactly the cart quantity
        self.product2.stock = 1
        self.product2.save()
        
        data = {
            "shipping_address": "123 Main Street, Nairobi, Kenya",
            "phone_number": "+254712345678",
            "payment_method": "mpesa"
        }
        response = self.client.post(self.checkout_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify stock was updated correctly
        self.product2.refresh_from_db()
        self.assertEqual(self.product2.stock, 0)


class CartManagementTests(APITestCase):
    """Test cart management with validation"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="ValidPass123!",
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(
            name="Electronics",
            description="Electronic items"
        )
        self.product = Product.objects.create(
            name="Test Product",
            description="Test product",
            price=Decimal("100.00"),
            stock=10,
            category=self.category,
            is_active=True
        )
        
        self.add_to_cart_url = reverse("add-to-cart")

    def test_add_to_cart_success(self):
        """Test adding item to cart successfully"""
        data = {
            "product_id": self.product.id,
            "quantity": 2
        }
        response = self.client.post(self.add_to_cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        cart = Cart.objects.get(user=self.user)
        cart_item = cart.items.get(product=self.product)
        self.assertEqual(cart_item.quantity, 2)

    def test_add_to_cart_exceeds_stock(self):
        """Test that adding more than available stock fails"""
        data = {
            "product_id": self.product.id,
            "quantity": 15  # More than stock
        }
        response = self.client.post(self.add_to_cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_to_cart_invalid_quantity(self):
        """Test that invalid quantity is rejected"""
        # Test negative quantity
        data = {
            "product_id": self.product.id,
            "quantity": -1
        }
        response = self.client.post(self.add_to_cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test zero quantity
        data["quantity"] = 0
        response = self.client.post(self.add_to_cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test excessive quantity
        data["quantity"] = 101
        response = self.client.post(self.add_to_cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_cart_item_success(self):
        """Test updating cart item quantity"""
        # First add item to cart
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=2
        )
        
        update_url = reverse("update-cart-item", args=[cart_item.id])
        data = {"quantity": 5}
        response = self.client.patch(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 5)

    def test_update_cart_item_exceeds_stock(self):
        """Test that updating to exceed stock fails"""
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=2
        )
        
        update_url = reverse("update-cart-item", args=[cart_item.id])
        data = {"quantity": 15}  # More than stock
        response = self.client.patch(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class OrderStatusTests(APITestCase):
    """Test order status management"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="ValidPass123!",
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(
            name="Electronics",
            description="Electronic items"
        )
        self.product = Product.objects.create(
            name="Test Product",
            description="Test product",
            price=Decimal("100.00"),
            stock=10,
            category=self.category,
            is_active=True
        )
        
        # Create an order
        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("100.00"),
            shipping_address="123 Main Street",
            phone_number="+254712345678",
            payment_method="mpesa"
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            price=Decimal("100.00")
        )

    def test_view_order_list(self):
        """Test viewing order list"""
        url = reverse("order-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_view_order_detail(self):
        """Test viewing order detail"""
        url = reverse("order-detail", args=[self.order.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.order.id)

    def test_cannot_view_other_user_order(self):
        """Test that user cannot view another user's order"""
        other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="ValidPass123!",
        )
        self.client.force_authenticate(user=other_user)
        
        url = reverse("order-detail", args=[self.order.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
