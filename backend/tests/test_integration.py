"""
End-to-end integration tests for complete user journeys.
"""

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.products.models import Product, Category
from apps.orders.models import Cart, CartItem, Order
from decimal import Decimal

User = get_user_model()


@override_settings(
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
)
class CompleteUserJourneyTests(APITestCase):
    """
    Test complete user journeys from registration to order completion.
    """

    def setUp(self):
        self.client = APIClient()
        
        # Create test products
        self.category = Category.objects.create(
            name="Electronics",
            description="Electronic items"
        )
        self.product1 = Product.objects.create(
            name="Smartphone",
            description="Latest smartphone",
            price=Decimal("25000.00"),
            stock=10,
            category=self.category,
            is_active=True
        )
        self.product2 = Product.objects.create(
            name="Laptop",
            description="High-performance laptop",
            price=Decimal("75000.00"),
            stock=5,
            category=self.category,
            is_active=True
        )

    def test_complete_shopping_journey_success(self):
        """
        Test a complete successful shopping journey:
        1. Register account
        2. Login
        3. Browse products
        4. Add items to cart
        5. Update cart
        6. Checkout
        7. View order
        """
        # Step 1: Register
        register_data = {
            "username": "shopper123",
            "email": "shopper@example.com",
            "password": "ShopPass123!",
            "password_confirm": "ShopPass123!",
            "phone": "+254712345678",
            "address": "123 Main Street, Nairobi, Kenya"
        }
        response = self.client.post(reverse("register"), register_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        access_token = response.data["access"]

        # Step 2: Login (verify credentials work)
        login_data = {
            "email": "shopper@example.com",
            "password": "ShopPass123!"
        }
        response = self.client.post(reverse("login"), login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Authenticate for subsequent requests
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # Step 3: View products (browse)
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data["results"]), 0)

        # Step 4: Add items to cart
        cart_data = {
            "product_id": self.product1.id,
            "quantity": 2
        }
        response = self.client.post(reverse("add-to-cart"), cart_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        cart_data = {
            "product_id": self.product2.id,
            "quantity": 1
        }
        response = self.client.post(reverse("add-to-cart"), cart_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Step 5: View cart
        response = self.client.get(reverse("get-cart"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["items"]), 2)

        # Step 6: Checkout
        checkout_data = {
            "shipping_address": "456 Shopping Lane, Nairobi, Kenya",
            "phone_number": "+254712345678",
            "payment_method": "mpesa"
        }
        response = self.client.post(reverse("checkout"), checkout_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order_id = response.data["id"]
        
        # Verify order total
        expected_total = (self.product1.price * 2) + self.product2.price
        self.assertEqual(Decimal(response.data["total_amount"]), expected_total)

        # Step 7: View order details
        response = self.client.get(reverse("order-detail", args=[order_id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "pending")

        # Step 8: Verify cart is empty after checkout
        response = self.client.get(reverse("get-cart"))
        self.assertEqual(len(response.data["items"]), 0)

    def test_password_change_journey(self):
        """
        Test password change flow:
        1. Register
        2. Login
        3. Change password
        4. Verify old password doesn't work
        5. Verify new password works
        """
        # Step 1: Register
        register_data = {
            "username": "pwdchanger",
            "email": "pwdchange@example.com",
            "password": "OldPass123!",
            "password_confirm": "OldPass123!",
        }
        response = self.client.post(reverse("register"), register_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        access_token = response.data["access"]
        
        # Authenticate
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # Step 2: Change password
        change_data = {
            "current_password": "OldPass123!",
            "new_password": "NewPass456!",
            "confirm_password": "NewPass456!"
        }
        response = self.client.post(reverse("change_password"), change_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Step 3: Verify old password doesn't work
        self.client.credentials()  # Clear auth
        login_data = {
            "email": "pwdchange@example.com",
            "password": "OldPass123!"
        }
        response = self.client.post(reverse("login"), login_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Step 4: Verify new password works
        login_data["password"] = "NewPass456!"
        response = self.client.post(reverse("login"), login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_profile_update_journey(self):
        """
        Test profile update flow:
        1. Register
        2. Update profile
        3. Verify changes
        """
        # Register
        register_data = {
            "username": "profileuser",
            "email": "profile@example.com",
            "password": "ValidPass123!",
            "password_confirm": "ValidPass123!",
        }
        response = self.client.post(reverse("register"), register_data)
        access_token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # Update profile
        update_data = {
            "phone": "+254798765432",
            "address": "789 Profile Road, Mombasa, Kenya"
        }
        response = self.client.patch(reverse("profile"), update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify changes
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["phone"], "+254798765432")
        self.assertIn("Profile Road", response.data["address"])

    def test_stock_depletion_prevents_checkout(self):
        """
        Test that checkout fails when stock is depleted:
        1. User A adds items to cart
        2. User B buys all stock
        3. User A checkout should fail
        """
        # Create User A
        self.client.post(reverse("register"), {
            "username": "userA",
            "email": "userA@example.com",
            "password": "ValidPass123!",
            "password_confirm": "ValidPass123!",
        })
        response = self.client.post(reverse("login"), {
            "email": "userA@example.com",
            "password": "ValidPass123!"
        })
        token_a = response.data["access"]
        
        # User A adds all stock to cart
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_a}')
        self.client.post(reverse("add-to-cart"), {
            "product_id": self.product1.id,
            "quantity": 10
        })

        # Create User B
        self.client.credentials()  # Clear auth
        self.client.post(reverse("register"), {
            "username": "userB",
            "email": "userB@example.com",
            "password": "ValidPass123!",
            "password_confirm": "ValidPass123!",
        })
        response = self.client.post(reverse("login"), {
            "email": "userB@example.com",
            "password": "ValidPass123!"
        })
        token_b = response.data["access"]

        # User B adds same product to cart and checks out first
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_b}')
        self.client.post(reverse("add-to-cart"), {
            "product_id": self.product1.id,
            "quantity": 10
        })
        response = self.client.post(reverse("checkout"), {
            "shipping_address": "123 Main Street, Nairobi, Kenya",
            "phone_number": "+254712345678",
            "payment_method": "mpesa"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # User A tries to checkout (should fail due to no stock)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_a}')
        response = self.client.post(reverse("checkout"), {
            "shipping_address": "456 Test Road, Nairobi, Kenya",
            "phone_number": "+254798765432",
            "payment_method": "mpesa"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Insufficient stock", response.data["error"])

    def test_security_validation_journey(self):
        """
        Test that security validations work:
        1. Weak password rejected
        2. Invalid phone rejected
        3. Invalid address rejected
        """
        # Test weak password
        register_data = {
            "username": "weakuser",
            "email": "weak@example.com",
            "password": "weak",
            "password_confirm": "weak",
        }
        response = self.client.post(reverse("register"), register_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test valid registration
        register_data["password"] = "StrongPass123!"
        register_data["password_confirm"] = "StrongPass123!"
        response = self.client.post(reverse("register"), register_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        access_token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # Test invalid phone
        response = self.client.patch(reverse("profile"), {
            "phone": "invalid-phone"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Add to cart and test invalid checkout data
        self.client.post(reverse("add-to-cart"), {
            "product_id": self.product1.id,
            "quantity": 1
        })

        # Test short address
        response = self.client.post(reverse("checkout"), {
            "shipping_address": "short",
            "phone_number": "+254712345678",
            "payment_method": "mpesa"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test invalid phone in checkout
        response = self.client.post(reverse("checkout"), {
            "shipping_address": "123 Main Street, Nairobi, Kenya",
            "phone_number": "bad-phone",
            "payment_method": "mpesa"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
