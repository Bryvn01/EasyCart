"""
Tests for cart, checkout, and promo code functionality
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from rest_framework.test import APIClient
from rest_framework import status

from apps.products.models import Product
from .models import Cart, CartItem, Order, OrderItem, PromoCode

User = get_user_model()


class PromoCodeModelTests(TestCase):
    """Test PromoCode model functionality"""
    
    def setUp(self):
        self.promo = PromoCode.objects.create(
            code="TEST10",
            discount_type="percentage",
            discount_value=Decimal("10.00"),
            min_purchase=Decimal("100.00"),
            max_discount=Decimal("50.00"),
            usage_limit=10,
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30),
            active=True
        )
    
    def test_promo_code_is_valid(self):
        """Test that valid promo code passes validation"""
        is_valid, message = self.promo.is_valid()
        self.assertTrue(is_valid)
        self.assertEqual(message, "Valid")
    
    def test_inactive_promo_code(self):
        """Test that inactive promo code fails validation"""
        self.promo.active = False
        self.promo.save()
        is_valid, message = self.promo.is_valid()
        self.assertFalse(is_valid)
        self.assertIn("not active", message)
    
    def test_expired_promo_code(self):
        """Test that expired promo code fails validation"""
        self.promo.valid_until = timezone.now() - timedelta(days=1)
        self.promo.save()
        is_valid, message = self.promo.is_valid()
        self.assertFalse(is_valid)
        self.assertIn("expired", message)
    
    def test_usage_limit_reached(self):
        """Test that promo code with usage limit reached fails"""
        self.promo.usage_count = 10
        self.promo.save()
        is_valid, message = self.promo.is_valid()
        self.assertFalse(is_valid)
        self.assertIn("usage limit", message)
    
    def test_percentage_discount_calculation(self):
        """Test percentage discount calculation"""
        discount = self.promo.calculate_discount(Decimal("200.00"))
        self.assertEqual(discount, Decimal("20.00"))  # 10% of 200
    
    def test_percentage_discount_with_max_cap(self):
        """Test percentage discount with max cap"""
        discount = self.promo.calculate_discount(Decimal("1000.00"))
        self.assertEqual(discount, Decimal("50.00"))  # Capped at max_discount
    
    def test_fixed_discount_calculation(self):
        """Test fixed amount discount"""
        self.promo.discount_type = "fixed"
        self.promo.discount_value = Decimal("25.00")
        self.promo.save()
        discount = self.promo.calculate_discount(Decimal("200.00"))
        self.assertEqual(discount, Decimal("25.00"))
    
    def test_discount_with_min_purchase(self):
        """Test that discount is 0 when below min purchase"""
        discount = self.promo.calculate_discount(Decimal("50.00"))
        self.assertEqual(discount, Decimal("0"))


class CartPromoCodeAPITests(TestCase):
    """Test cart promo code API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123"
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test product
        self.product = Product.objects.create(
            name="Test Product",
            description="Test description",
            price=Decimal("150.00"),
            stock=10
        )
        
        # Create cart and add item
        self.cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )
        
        # Create promo code
        self.promo = PromoCode.objects.create(
            code="SAVE20",
            discount_type="percentage",
            discount_value=Decimal("20.00"),
            min_purchase=Decimal("100.00"),
            active=True
        )
    
    def test_apply_valid_promo_code(self):
        """Test applying a valid promo code"""
        response = self.client.post('/api/orders/cart/promo/apply/', {
            'code': 'SAVE20'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('discount', response.data)
        self.assertEqual(response.data['discount'], 60.00)  # 20% of 300
        
        # Verify cart has promo code
        self.cart.refresh_from_db()
        self.assertEqual(self.cart.promo_code, self.promo)
    
    def test_apply_invalid_promo_code(self):
        """Test applying an invalid promo code"""
        response = self.client.post('/api/orders/cart/promo/apply/', {
            'code': 'INVALID'
        })
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_apply_promo_below_min_purchase(self):
        """Test applying promo when cart is below min purchase"""
        # Update promo to require high minimum
        self.promo.min_purchase = Decimal("500.00")
        self.promo.save()
        
        response = self.client.post('/api/orders/cart/promo/apply/', {
            'code': 'SAVE20'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Minimum purchase', response.data['error'])
    
    def test_remove_promo_code(self):
        """Test removing a promo code"""
        self.cart.promo_code = self.promo
        self.cart.save()
        
        response = self.client.post('/api/orders/cart/promo/remove/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.cart.refresh_from_db()
        self.assertIsNone(self.cart.promo_code)


class CheckoutAtomicityTests(TestCase):
    """Test checkout atomic transaction behavior"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123"
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test products
        self.product1 = Product.objects.create(
            name="Product 1",
            price=Decimal("100.00"),
            stock=5
        )
        self.product2 = Product.objects.create(
            name="Product 2",
            price=Decimal("200.00"),
            stock=3
        )
        
        # Create cart with items
        self.cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(
            cart=self.cart,
            product=self.product1,
            quantity=2
        )
        CartItem.objects.create(
            cart=self.cart,
            product=self.product2,
            quantity=1
        )
    
    def test_successful_checkout_updates_stock(self):
        """Test that successful checkout updates product stock"""
        initial_stock1 = self.product1.stock
        initial_stock2 = self.product2.stock
        
        response = self.client.post('/api/orders/checkout/', {
            'shipping_address': '123 Test Street, Test City, 12345',
            'phone_number': '+254712345678',
            'payment_method': 'mpesa'
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify stock was updated
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.stock, initial_stock1 - 2)
        self.assertEqual(self.product2.stock, initial_stock2 - 1)
        
        # Verify order was created
        order = Order.objects.get(id=response.data['id'])
        self.assertEqual(order.items.count(), 2)
        
        # Verify cart was cleared
        self.assertEqual(self.cart.items.count(), 0)
    
    def test_checkout_fails_with_insufficient_stock(self):
        """Test that checkout fails when stock is insufficient"""
        # Reduce stock to less than needed
        self.product1.stock = 1
        self.product1.save()
        
        response = self.client.post('/api/orders/checkout/', {
            'shipping_address': '123 Test Street, Test City, 12345',
            'phone_number': '+254712345678',
            'payment_method': 'mpesa'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Stock validation failed', response.data['error'])
        
        # Verify no order was created
        self.assertEqual(Order.objects.count(), 0)
        
        # Verify cart was not cleared
        self.assertEqual(self.cart.items.count(), 2)
