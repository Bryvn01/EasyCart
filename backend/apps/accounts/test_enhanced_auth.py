"""
Tests for enhanced authentication and security features.
"""

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import User


# Disable rate limiting for tests
@override_settings(
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
)
class PasswordValidationTests(APITestCase):
    """Test password validation requirements"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")

    def test_password_minimum_length(self):
        """Test that password must be at least 8 characters"""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "Short1!",
            "password_confirm": "Short1!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_password_requires_uppercase(self):
        """Test that password must contain uppercase letter"""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "lowercase123!",
            "password_confirm": "lowercase123!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_requires_lowercase(self):
        """Test that password must contain lowercase letter"""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "UPPERCASE123!",
            "password_confirm": "UPPERCASE123!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_requires_digit(self):
        """Test that password must contain a digit"""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "NoDigits!",
            "password_confirm": "NoDigits!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_requires_special_char(self):
        """Test that password must contain a special character"""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "NoSpecial123",
            "password_confirm": "NoSpecial123",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valid_password_accepted(self):
        """Test that a valid password is accepted"""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "ValidPass123!",
            "password_confirm": "ValidPass123!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_password_mismatch(self):
        """Test that mismatched passwords are rejected"""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "ValidPass123!",
            "password_confirm": "DifferentPass123!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
)
class UsernameValidationTests(APITestCase):
    """Test username validation"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")

    def test_username_minimum_length(self):
        """Test that username must be at least 3 characters"""
        data = {
            "username": "ab",
            "email": "test@example.com",
            "password": "ValidPass123!",
            "password_confirm": "ValidPass123!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_username_valid_characters(self):
        """Test that username only accepts valid characters"""
        data = {
            "username": "user@#$%",
            "email": "test@example.com",
            "password": "ValidPass123!",
            "password_confirm": "ValidPass123!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valid_username_accepted(self):
        """Test that valid username is accepted"""
        data = {
            "username": "valid_user.name-123",
            "email": "test@example.com",
            "password": "ValidPass123!",
            "password_confirm": "ValidPass123!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


@override_settings(
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
)
class PasswordChangeTests(APITestCase):
    """Test password change functionality"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="OldPass123!",
        )
        self.client.force_authenticate(user=self.user)
        self.change_password_url = reverse("change_password")

    def test_change_password_success(self):
        """Test successful password change"""
        data = {
            "current_password": "OldPass123!",
            "new_password": "NewPass123!",
            "confirm_password": "NewPass123!",
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPass123!"))

    def test_change_password_wrong_current(self):
        """Test that wrong current password is rejected"""
        data = {
            "current_password": "WrongPass123!",
            "new_password": "NewPass123!",
            "confirm_password": "NewPass123!",
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_mismatch(self):
        """Test that mismatched new passwords are rejected"""
        data = {
            "current_password": "OldPass123!",
            "new_password": "NewPass123!",
            "confirm_password": "DifferentPass123!",
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_requires_auth(self):
        """Test that password change requires authentication"""
        self.client.force_authenticate(user=None)
        data = {
            "current_password": "OldPass123!",
            "new_password": "NewPass123!",
            "confirm_password": "NewPass123!",
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
)
class ProfileUpdateTests(APITestCase):
    """Test profile update functionality"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="ValidPass123!",
        )
        self.client.force_authenticate(user=self.user)
        self.profile_url = reverse("profile")

    def test_update_phone_valid(self):
        """Test updating phone with valid number"""
        data = {"phone": "+254712345678"}
        response = self.client.patch(self.profile_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.phone, "+254712345678")

    def test_update_phone_invalid(self):
        """Test that invalid phone number is rejected"""
        data = {"phone": "invalid-phone"}
        response = self.client.patch(self.profile_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_address(self):
        """Test updating address"""
        data = {"address": "123 Main Street, Nairobi"}
        response = self.client.patch(self.profile_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertIn("123 Main Street", self.user.address)

    def test_cannot_update_email(self):
        """Test that email cannot be updated via profile endpoint"""
        original_email = self.user.email
        data = {"email": "newemail@example.com"}
        response = self.client.patch(self.profile_url, data)
        # Should succeed but not change email
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, original_email)

    def test_cannot_update_role(self):
        """Test that role cannot be updated via profile endpoint"""
        original_role = self.user.role
        data = {"role": "superadmin"}
        response = self.client.patch(self.profile_url, data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, original_role)
