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
    is_admin = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="viewer")

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
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)

    history = HistoricalRecords()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
