from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils.html import escape
from apps.products.models import Product

User = get_user_model()


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

    class Meta:
        ordering = ["-created_at"]  # Most recent orders first

    def __str__(self):
        return f"Order #{self.id} - {escape(str(self.user.email))}"


class OrderNotification(models.Model):
    order = models.ForeignKey(
        Order, related_name="notifications", on_delete=models.CASCADE
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="order_notifications",
        on_delete=models.CASCADE,
    )
    order_status = models.CharField(max_length=20)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["order", "recipient", "order_status"],
                name="unique_order_notification_per_status_recipient",
            )
        ]
        indexes = [
            models.Index(fields=["recipient", "-created_at"]),
            models.Index(fields=["is_read"]),
            models.Index(fields=["order", "order_status"]),
        ]

    def __str__(self):
        return f"Order #{self.order_id} -> {escape(str(self.recipient.email))}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{escape(str(self.product.name))} x {self.quantity}"


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    class Meta:
        unique_together = ("cart", "product")
