"""
Tests for cart and wishlist integration features
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.products.models import Product
from apps.products.wishlist_models import Wishlist, WishlistItem
from apps.orders.models import Cart, CartItem

User = get_user_model()


class CartWishlistIntegrationTest(TestCase):
    """Test cart and wishlist interaction"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            price=100.00,
            stock=10,
            category='Test',
            is_active=True
        )
        
    def test_cart_creation(self):
        """Test that cart is created for user"""
        cart, created = Cart.objects.get_or_create(user=self.user)
        self.assertTrue(created or cart.user == self.user)
        
    def test_wishlist_creation(self):
        """Test that wishlist is created for user"""
        wishlist, created = Wishlist.objects.get_or_create(user=self.user)
        self.assertTrue(created or wishlist.user == self.user)
        
    def test_add_to_cart(self):
        """Test adding item to cart"""
        cart, _ = Cart.objects.get_or_create(user=self.user)
        cart_item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=2
        )
        self.assertEqual(cart_item.quantity, 2)
        self.assertEqual(cart_item.product, self.product)
        
    def test_add_to_wishlist(self):
        """Test adding item to wishlist"""
        wishlist, _ = Wishlist.objects.get_or_create(user=self.user)
        wishlist_item = WishlistItem.objects.create(
            wishlist=wishlist,
            product=self.product
        )
        self.assertEqual(wishlist_item.product, self.product)
        
    def test_update_cart_quantity(self):
        """Test updating cart item quantity"""
        cart, _ = Cart.objects.get_or_create(user=self.user)
        cart_item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=1
        )
        # Update quantity
        cart_item.quantity = 5
        cart_item.save()
        
        # Verify update
        updated_item = CartItem.objects.get(id=cart_item.id)
        self.assertEqual(updated_item.quantity, 5)
        
    def test_move_from_wishlist_to_cart(self):
        """Test moving item from wishlist to cart"""
        # Create wishlist with item
        wishlist, _ = Wishlist.objects.get_or_create(user=self.user)
        wishlist_item = WishlistItem.objects.create(
            wishlist=wishlist,
            product=self.product
        )
        
        # Move to cart
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(
            cart=cart,
            product=wishlist_item.product,
            quantity=1
        )
        wishlist_item.delete()
        
        # Verify
        self.assertEqual(CartItem.objects.filter(cart=cart, product=self.product).count(), 1)
        self.assertEqual(WishlistItem.objects.filter(wishlist=wishlist, product=self.product).count(), 0)
        
    def test_move_from_cart_to_wishlist(self):
        """Test moving item from cart to wishlist"""
        # Create cart with item
        cart, _ = Cart.objects.get_or_create(user=self.user)
        cart_item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=2
        )
        
        # Move to wishlist
        wishlist, _ = Wishlist.objects.get_or_create(user=self.user)
        WishlistItem.objects.create(
            wishlist=wishlist,
            product=cart_item.product
        )
        cart_item.delete()
        
        # Verify
        self.assertEqual(WishlistItem.objects.filter(wishlist=wishlist, product=self.product).count(), 1)
        self.assertEqual(CartItem.objects.filter(cart=cart, product=self.product).count(), 0)
