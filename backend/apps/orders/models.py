from django.db import models
from django.contrib.auth import get_user_model
from django.utils.html import escape
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.products.models import Product

User = get_user_model()


class PromoCode(models.Model):
    """Promotional discount codes for cart"""
    DISCOUNT_TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed Amount"),
    ]
    
    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default="percentage")
    discount_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    min_purchase = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0)]
    )
    max_discount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    usage_limit = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1)])
    usage_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else ' KSh'}"
    
    def is_valid(self):
        """Check if promo code is currently valid"""
        now = timezone.now()
        if not self.active:
            return False, "Promo code is not active"
        if self.valid_from > now:
            return False, "Promo code is not yet valid"
        if self.valid_until and self.valid_until < now:
            return False, "Promo code has expired"
        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False, "Promo code usage limit reached"
        return True, "Valid"
    
    def calculate_discount(self, subtotal):
        """Calculate discount amount for given subtotal"""
        if subtotal < self.min_purchase:
            return 0
        
        if self.discount_type == "percentage":
            discount = subtotal * (self.discount_value / 100)
        else:
            discount = self.discount_value
        
        # Apply max discount cap if set
        if self.max_discount and discount > self.max_discount:
            discount = self.max_discount
        
        # Ensure discount doesn't exceed subtotal
        return min(discount, subtotal)


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    PAYMENT_CHOICES = [
        ("mpesa", "M-Pesa"),
        ("airtel", "Airtel Money"),
        ("tkash", "T-Kash"),
        ("card", "Credit/Debit Card"),
        ("stripe", "Stripe"),
        ("paypal", "PayPal"),
        ("bank", "Bank Transfer"),
        ("cash", "Cash on Delivery"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    promo_code = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True
    )
    shipping_address = models.TextField()
    phone_number = models.CharField(max_length=15, default="0700000000")
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_CHOICES, default="mpesa"
    )
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending", db_index=True
    )
    payment_reference = models.CharField(max_length=100, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {escape(str(self.user.email))}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{escape(str(self.product.name))} x {self.quantity}"


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    promo_code = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    class Meta:
        unique_together = ("cart", "product")
