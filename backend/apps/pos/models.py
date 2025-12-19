from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
from simple_history.models import HistoricalRecords
from apps.products.models import Product

User = get_user_model()


class POSSession(models.Model):
    """
    Represents a POS session (shift) for a staff member.
    Tracks opening/closing times and cash amounts.
    """

    STATUS_CHOICES = [
        ("open", "Open"),
        ("closed", "Closed"),
        ("reconciled", "Reconciled"),
    ]

    staff = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="pos_sessions",
        limit_choices_to={"is_staff": True},
    )
    session_number = models.CharField(max_length=50, unique=True, db_index=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="open", db_index=True
    )

    # Cash tracking
    opening_cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    closing_cash = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    expected_cash = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    cash_difference = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    # Session times
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    # Notes
    opening_notes = models.TextField(blank=True)
    closing_notes = models.TextField(blank=True)

    # Summary (computed on close)
    total_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_transactions = models.IntegerField(default=0)

    history = HistoricalRecords()

    class Meta:
        ordering = ["-opened_at"]
        indexes = [
            models.Index(fields=["staff", "status"]),
            models.Index(fields=["-opened_at"]),
        ]

    def __str__(self):
        return f"Session {self.session_number} - {self.staff.username}"

    def save(self, *args, **kwargs):
        if not self.session_number:
            # Generate unique session number with microseconds: SESS-YYYYMMDD-HHMMSS-MICROSECONDS
            now = timezone.now()
            timestamp = now.strftime("%Y%m%d-%H%M%S")
            microseconds = now.strftime("%f")[
                :3
            ]  # First 3 digits of microseconds (milliseconds)
            self.session_number = f"SESS-{timestamp}-{microseconds}"
        super().save(*args, **kwargs)

    def close_session(self, closing_cash, closing_notes=""):
        """Close the POS session and calculate discrepancies."""
        self.status = "closed"
        self.closed_at = timezone.now()
        self.closing_cash = closing_cash
        self.closing_notes = closing_notes

        # Calculate expected cash from transactions
        cash_sales = self.transactions.filter(
            payment_method="cash", status="completed"
        ).aggregate(total=models.Sum("total_amount"))["total"] or Decimal("0")

        self.expected_cash = self.opening_cash + cash_sales
        self.cash_difference = closing_cash - self.expected_cash

        # Calculate totals
        completed_transactions = self.transactions.filter(status="completed")
        self.total_sales = completed_transactions.aggregate(
            total=models.Sum("total_amount")
        )["total"] or Decimal("0")
        self.total_transactions = completed_transactions.count()

        self.save()


class POSTransaction(models.Model):
    """
    Represents a single POS transaction (sale).
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("mpesa", "M-Pesa"),
        ("airtel", "Airtel Money"),
        ("mixed", "Mixed Payment"),
    ]

    session = models.ForeignKey(
        POSSession, on_delete=models.PROTECT, related_name="transactions"
    )
    transaction_number = models.CharField(max_length=50, unique=True, db_index=True)

    # Customer info (optional for walk-in)
    customer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_purchases",
    )
    customer_name = models.CharField(max_length=200, blank=True)
    customer_phone = models.CharField(max_length=15, blank=True)
    customer_email = models.EmailField(blank=True)

    # Transaction details
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True
    )
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHOD_CHOICES, db_index=True
    )

    # Amounts
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Payment details
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    change_given = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_reference = models.CharField(max_length=100, blank=True)

    # Notes
    notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Receipt
    receipt_printed = models.BooleanField(default=False)
    receipt_emailed = models.BooleanField(default=False)

    history = HistoricalRecords()

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["session", "status"]),
            models.Index(fields=["payment_method", "status"]),
            models.Index(fields=["-created_at"]),
            models.Index(fields=["customer"]),
        ]

    def __str__(self):
        return f"Transaction {self.transaction_number}"

    def save(self, *args, **kwargs):
        if not self.transaction_number:
            # Generate unique transaction number with microseconds: POS-YYYYMMDD-HHMMSS-MICROSECONDS
            now = timezone.now()
            timestamp = now.strftime("%Y%m%d-%H%M%S")
            microseconds = now.strftime("%f")[
                :3
            ]  # First 3 digits of microseconds (milliseconds)
            self.transaction_number = f"POS-{timestamp}-{microseconds}"

        # Calculate totals
        if self.discount_percentage > 0:
            self.discount_amount = (self.subtotal * self.discount_percentage) / Decimal(
                "100"
            )

        self.total_amount = self.subtotal - self.discount_amount + self.tax_amount

        super().save(*args, **kwargs)

    def complete_transaction(self, amount_paid):
        """Complete the transaction and update inventory."""
        self.status = "completed"
        self.completed_at = timezone.now()
        self.amount_paid = amount_paid

        if self.payment_method == "cash":
            self.change_given = max(Decimal("0"), amount_paid - self.total_amount)

        self.save()

        # Update inventory (handled by signals)
        return True

    def cancel_transaction(self, reason=""):
        """Cancel the transaction and restore inventory."""
        self.status = "cancelled"
        self.notes = f"{self.notes}\nCancellation reason: {reason}".strip()
        self.save()

        # Restore inventory (handled by signals)
        return True


class POSTransactionItem(models.Model):
    """
    Individual items in a POS transaction.
    """

    transaction = models.ForeignKey(
        POSTransaction, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(Product, on_delete=models.PROTECT)

    # Product details at time of sale (for historical accuracy)
    product_name = models.CharField(max_length=200)
    product_sku = models.CharField(max_length=100)

    # Pricing
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    def save(self, *args, **kwargs):
        # Store product details
        if not self.product_name:
            self.product_name = self.product.name
            self.product_sku = self.product.sku

        # Calculate line total
        if self.discount_percentage > 0:
            self.discount_amount = (
                self.unit_price * self.quantity * self.discount_percentage
            ) / Decimal("100")

        self.line_total = (self.unit_price * self.quantity) - self.discount_amount

        super().save(*args, **kwargs)


class POSPaymentSplit(models.Model):
    """
    For transactions with mixed payment methods.
    """

    transaction = models.ForeignKey(
        POSTransaction, on_delete=models.CASCADE, related_name="payment_splits"
    )
    payment_method = models.CharField(
        max_length=20, choices=POSTransaction.PAYMENT_METHOD_CHOICES
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.payment_method}: {self.amount}"


class POSStaffPermission(models.Model):
    """
    Specific POS permissions for staff members.
    """

    PERMISSION_CHOICES = [
        ("can_open_session", "Can Open Session"),
        ("can_close_session", "Can Close Session"),
        ("can_apply_discount", "Can Apply Discount"),
        ("can_void_transaction", "Can Void Transaction"),
        ("can_refund", "Can Process Refund"),
        ("can_view_reports", "Can View Reports"),
        ("can_manage_cash", "Can Manage Cash"),
        ("can_override_price", "Can Override Price"),
    ]

    staff = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="pos_permissions",
        limit_choices_to={"is_staff": True},
    )
    permission = models.CharField(max_length=50, choices=PERMISSION_CHOICES)
    granted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="granted_pos_permissions",
    )
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("staff", "permission")
        ordering = ["staff", "permission"]

    def __str__(self):
        return f"{self.staff.username} - {self.get_permission_display()}"


class POSDiscount(models.Model):
    """
    Predefined discount templates for quick application.
    """

    DISCOUNT_TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed Amount"),
    ]

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2)

    # Constraints
    min_purchase_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    max_discount_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    # Validity
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)

    # Usage tracking
    usage_count = models.IntegerField(default=0)
    max_usage = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def is_valid(self):
        """Check if discount is currently valid."""
        if not self.is_active:
            return False

        now = timezone.now()
        if self.valid_from and now < self.valid_from:
            return False
        if self.valid_until and now > self.valid_until:
            return False

        if self.max_usage and self.usage_count >= self.max_usage:
            return False

        return True

    def calculate_discount(self, subtotal):
        """Calculate discount amount for given subtotal."""
        if not self.is_valid():
            return Decimal("0")

        if self.min_purchase_amount and subtotal < self.min_purchase_amount:
            return Decimal("0")

        if self.discount_type == "percentage":
            discount = (subtotal * self.value) / Decimal("100")
        else:
            discount = self.value

        if self.max_discount_amount:
            discount = min(discount, self.max_discount_amount)

        return discount


class POSReceipt(models.Model):
    """
    Stores generated receipts for reprinting.
    """

    transaction = models.OneToOneField(
        POSTransaction, on_delete=models.CASCADE, related_name="receipt"
    )
    receipt_number = models.CharField(max_length=50, unique=True)
    receipt_data = models.JSONField()  # Stores full receipt details
    generated_at = models.DateTimeField(auto_now_add=True)
    printed_count = models.IntegerField(default=0)
    last_printed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self):
        return f"Receipt {self.receipt_number}"
