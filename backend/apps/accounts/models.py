from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    is_admin = models.BooleanField(default=False)

    # Superuser permissions for Django admin access
    is_staff = models.BooleanField(
        'staff status',
        default=False,
        help_text='Designates whether the user can log into this admin site.',
    )
    is_superuser = models.BooleanField(
        'superuser status',
        default=False,
        help_text='Designates that this user has all permissions without explicitly assigning them.',
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
