from django.contrib.auth.models import AbstractUser
from django.db import models
from simple_history.models import HistoricalRecords


class User(AbstractUser):
    ROLE_CHOICES = [
        ("superadmin", "Superadmin"),
        ("manager", "Manager"),
        ("editor", "Editor"),
        ("viewer", "Viewer"),
    ]

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    preferred_username = models.CharField(
        max_length=30,
        blank=True,
        null=True,
        unique=True,
        help_text="User-chosen display username (optional, must be unique)",
        verbose_name="Preferred Username"
    )
    is_admin = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="viewer")

    # Fix reverse accessor clashes with default User model
    groups = models.ManyToManyField(
        "auth.Group",
        verbose_name="groups",
        blank=True,
        help_text="The groups this user belongs to.",
        related_name="custom_user_set",
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        verbose_name="user permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        related_name="custom_user_set",
        related_query_name="custom_user",
    )

    # Superuser permissions for Django admin access
    is_staff = models.BooleanField(
        "staff status",
        default=False,
        help_text="Designates whether the user can log into this admin site.",
    )
    is_superuser = models.BooleanField(
        "superuser status",
        default=False,
        help_text="Designates that this user has all permissions without explicitly assigning them.",
    )

    # 2FA fields
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)
    two_factor_enabled = models.BooleanField(default=False)

    # OTP fields for customer login/registration
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    otp_verified = models.BooleanField(default=False)
    otp_attempts = models.IntegerField(default=0)
    otp_last_attempt = models.DateTimeField(blank=True, null=True)
    otp_blocked_until = models.DateTimeField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)

    # Email verification fields
    email_verified = models.BooleanField(
        default=False,
        help_text="Whether the user has verified their email address"
    )
    email_verification_token = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        help_text="Token for email verification"
    )
    email_verification_sent_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When the verification email was last sent"
    )

    history = HistoricalRecords()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


class OTPDeliveryLog(models.Model):
    """Track OTP delivery attempts and methods for analytics"""

    DELIVERY_METHOD_CHOICES = [
        ("whatsapp", "WhatsApp"),
        ("sms", "SMS"),
        ("email", "Email"),
        ("console", "Console"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="otp_deliveries",
        null=True,
        blank=True,
    )
    identifier = models.CharField(max_length=255, help_text="Phone number or email")
    delivery_method = models.CharField(
        max_length=20,
        choices=DELIVERY_METHOD_CHOICES,
        help_text="Method used to deliver OTP",
    )
    success = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    error_message = models.TextField(
        blank=True, help_text="Error details if delivery failed"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["delivery_method"]),
            models.Index(fields=["success"]),
        ]

    def __str__(self):
        status = "✓" if self.success else "✗"
        return (
            f"{status} {self.delivery_method} to {self.identifier} at {self.created_at}"
        )
