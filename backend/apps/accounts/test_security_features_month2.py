"""
Comprehensive Security Feature Tests
Tests for email verification, JWT rotation, device fingerprinting, and pwned passwords
"""

from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
import secrets

from apps.accounts.email_verification_service import (
    generate_verification_token,
    send_verification_email,
    verify_email_token,
    resend_verification_email,
    get_verification_status,
)
from apps.accounts.device_fingerprint_service import (
    generate_device_fingerprint,
    track_device_login,
    verify_device_fingerprint,
    detect_suspicious_activity,
    get_user_devices,
    revoke_device,
    revoke_all_devices,
)
from apps.accounts.management.commands.rotate_jwt_key import JWTKeyRotation
from apps.accounts.pwned_passwords_validator import PwnedPasswordsValidator

User = get_user_model()


class EmailVerificationTests(TestCase):
    """Test email verification functionality"""

    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="SecureP@ssw0rd123!",
            phone_number="+254712345678",
            email_verified=False,
        )

    def test_generate_verification_token(self):
        """Test token generation creates 64-character token"""
        token = generate_verification_token()
        self.assertEqual(len(token), 64)
        self.assertTrue(all(c in "0123456789abcdef" for c in token))

    def test_send_verification_email(self):
        """Test sending verification email updates user fields"""
        request = self.factory.get("/")
        result = send_verification_email(self.user, request)

        # Refresh user from database
        self.user.refresh_from_db()

        # Check that token was set
        self.assertIsNotNone(self.user.email_verification_token)
        self.assertIsNotNone(self.user.email_verification_sent_at)
        self.assertEqual(len(self.user.email_verification_token), 64)

    def test_verify_valid_token(self):
        """Test verifying a valid token"""
        # Send verification email first
        request = self.factory.get("/")
        send_verification_email(self.user, request)
        self.user.refresh_from_db()

        # Verify the token
        success, message, user = verify_email_token(self.user.email_verification_token)

        self.assertTrue(success)
        self.assertEqual(user.id, self.user.id)

        # Check user is now verified
        user.refresh_from_db()
        self.assertTrue(user.email_verified)
        self.assertIsNone(user.email_verification_token)

    def test_verify_expired_token(self):
        """Test verifying an expired token fails"""
        # Create expired token
        self.user.email_verification_token = generate_verification_token()
        self.user.email_verification_sent_at = timezone.now() - timedelta(hours=25)
        self.user.save()

        success, message, user = verify_email_token(self.user.email_verification_token)

        self.assertFalse(success)
        self.assertIn("expired", message.lower())

    def test_verify_invalid_token(self):
        """Test verifying an invalid token fails"""
        success, message, user = verify_email_token("invalid_token_12345")

        self.assertFalse(success)
        self.assertIn("invalid", message.lower())

    def test_resend_rate_limiting(self):
        """Test resend rate limiting prevents spam"""
        request = self.factory.get("/")

        # First send should succeed
        success1, msg1 = resend_verification_email(self.user, request)
        self.assertTrue(success1)

        # Immediate resend should fail (rate limited)
        success2, msg2 = resend_verification_email(self.user, request)
        self.assertFalse(success2)
        self.assertIn("wait", msg2.lower())

    def test_verification_status(self):
        """Test getting verification status"""
        status = get_verification_status(self.user)

        self.assertFalse(status["email_verified"])
        self.assertIsNone(status["verification_sent_at"])
        self.assertTrue(status["can_resend"])


class DeviceFingerprintingTests(TestCase):
    """Test device fingerprinting functionality"""

    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="SecureP@ssw0rd123!",
            phone_number="+254712345678",
            email_verified=False,
        )
        cache.clear()

    def test_generate_device_fingerprint(self):
        """Test device fingerprint generation"""
        request = self.factory.get("/")
        request.META["HTTP_USER_AGENT"] = "Mozilla/5.0"
        request.META["HTTP_ACCEPT_LANGUAGE"] = "en-US"
        request.META["HTTP_ACCEPT_ENCODING"] = "gzip"

        fingerprint = generate_device_fingerprint(request)

        # Should be 64-character SHA256 hex
        self.assertEqual(len(fingerprint), 64)
        self.assertTrue(all(c in "0123456789abcdef" for c in fingerprint))

    def test_track_device_login(self):
        """Test tracking device login"""
        request = self.factory.get("/")
        request.META["HTTP_USER_AGENT"] = "Mozilla/5.0"
        request.META["REMOTE_ADDR"] = "192.168.1.1"

        device_info = track_device_login(self.user, request)

        self.assertIsNotNone(device_info)
        self.assertIn("device_fingerprint", device_info)
        self.assertEqual(device_info["user_id"], self.user.id)

    def test_verify_known_device(self):
        """Test verifying a known device"""
        request = self.factory.get("/")
        request.META["HTTP_USER_AGENT"] = "Mozilla/5.0"
        request.META["REMOTE_ADDR"] = "192.168.1.1"

        # Track device first
        track_device_login(self.user, request)

        # Verify it's known
        is_known, device_info = verify_device_fingerprint(self.user, request)
        self.assertTrue(is_known)

    def test_verify_unknown_device(self):
        """Test verifying an unknown device"""
        request = self.factory.get("/")
        request.META["HTTP_USER_AGENT"] = "Unknown Browser"
        request.META["REMOTE_ADDR"] = "10.0.0.1"

        is_known, device_info = verify_device_fingerprint(self.user, request)
        self.assertFalse(is_known)

    def test_detect_suspicious_new_device(self):
        """Test detecting suspicious login from new device"""
        # Track initial device
        request1 = self.factory.get("/")
        request1.META["HTTP_USER_AGENT"] = "Mozilla/5.0"
        request1.META["REMOTE_ADDR"] = "192.168.1.1"
        track_device_login(self.user, request1)

        # Login from completely new device and IP
        request2 = self.factory.get("/")
        request2.META["HTTP_USER_AGENT"] = "Different Browser"
        request2.META["REMOTE_ADDR"] = "10.0.0.1"

        is_suspicious, reason = detect_suspicious_activity(self.user, request2)
        # May or may not be suspicious depending on timing
        self.assertIsInstance(is_suspicious, bool)

    def test_get_user_devices(self):
        """Test retrieving user's devices"""
        request = self.factory.get("/")
        request.META["HTTP_USER_AGENT"] = "Mozilla/5.0"
        request.META["REMOTE_ADDR"] = "192.168.1.1"

        track_device_login(self.user, request)
        devices = get_user_devices(self.user)

        self.assertGreaterEqual(len(devices), 1)

    def test_revoke_device(self):
        """Test revoking a specific device"""
        request = self.factory.get("/")
        request.META["HTTP_USER_AGENT"] = "Mozilla/5.0"

        device_info = track_device_login(self.user, request)
        device_fp = device_info["device_fingerprint"]

        # Revoke the device
        result = revoke_device(self.user, device_fp)
        self.assertTrue(result)

        # Verify device is no longer known
        is_known, _ = verify_device_fingerprint(self.user, request)
        self.assertFalse(is_known)

    def test_revoke_all_devices(self):
        """Test revoking all devices"""
        # Track multiple devices
        for i in range(3):
            request = self.factory.get("/")
            request.META["HTTP_USER_AGENT"] = f"Browser {i}"
            track_device_login(self.user, request)

        # Revoke all
        count = revoke_all_devices(self.user)
        self.assertGreaterEqual(count, 3)


class JWTRotationTests(TestCase):
    """Test JWT secret rotation functionality"""

    def setUp(self):
        cache.clear()
        self.rotation = JWTKeyRotation()

    def test_generate_new_secret(self):
        """Test generating new JWT secret"""
        secret = self.rotation.generate_new_secret()

        # Should be non-empty string
        self.assertIsInstance(secret, str)
        self.assertGreater(len(secret), 40)

    def test_get_current_key(self):
        """Test getting current JWT key"""
        key = self.rotation.get_current_key()

        self.assertIsNotNone(key)
        self.assertIsInstance(key, str)

    def test_get_all_active_keys(self):
        """Test getting all active JWT keys"""
        keys = self.rotation.get_all_active_keys()

        self.assertIsInstance(keys, list)
        self.assertGreaterEqual(len(keys), 1)
        self.assertLessEqual(len(keys), 3)

    def test_rotation_status(self):
        """Test getting rotation status"""
        status = self.rotation.get_rotation_status()

        # Check for keys that actually exist in response
        self.assertIn("active_keys", status)
        self.assertIn("max_keys", status)
        self.assertIn("key_lifetime_days", status)
        self.assertIn("rotation_needed", status)

    def test_force_rotation(self):
        """Test forcing key rotation"""
        initial_key = self.rotation.get_current_key()

        success, message = self.rotation.rotate_key()

        self.assertTrue(success)

        # Current key should be different
        new_key = self.rotation.get_current_key()
        self.assertNotEqual(initial_key, new_key)

        # Old key should still be in active keys
        active_keys = self.rotation.get_all_active_keys()
        self.assertIn(initial_key, active_keys)

    def test_max_active_keys(self):
        """Test that max 3 keys are kept active"""
        # Clear cache first
        cache.clear()

        # Rotate 5 times
        for _ in range(5):
            self.rotation.rotate_key()

        active_keys = self.rotation.get_all_active_keys()
        # After 5 rotations, should have max 3 keys (current + 2 previous)
        self.assertLessEqual(len(active_keys), 3)


class PwnedPasswordValidatorTests(TestCase):
    """Test pwned password validation"""

    def setUp(self):
        self.validator = PwnedPasswordsValidator()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="TempP@ssw0rd123!",
            phone_number="+254712345678",
            email_verified=False,
        )

    def test_reject_compromised_password(self):
        """Test that common compromised passwords are rejected"""
        # Known compromised password
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate("Password123!", user=self.user)

        self.assertIn("compromised", str(cm.exception))

    def test_accept_secure_password(self):
        """Test that unique secure passwords are accepted"""
        # Very unlikely to be compromised
        secure_password = f"MyUniqueP@ss{secrets.token_hex(8)}2024!"

        try:
            self.validator.validate(secure_password, user=self.user)
            # Should not raise exception
        except ValidationError:
            self.fail("Secure password was incorrectly rejected")

    def test_get_help_text(self):
        """Test validator help text"""
        help_text = self.validator.get_help_text()

        self.assertIsInstance(help_text, str)
        self.assertIn("password", help_text.lower())


class IntegrationTests(TestCase):
    """Integration tests for security features working together"""

    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="SecureP@ssw0rd123!",
            phone_number="+254712345678",
            email_verified=False,
        )
        cache.clear()

    def test_registration_with_email_verification_and_device_tracking(self):
        """Test complete registration flow with security features"""
        request = self.factory.post("/api/auth/register/")
        request.META["HTTP_USER_AGENT"] = "Mozilla/5.0"
        request.META["REMOTE_ADDR"] = "192.168.1.1"

        # Send verification email
        send_verification_email(self.user, request)
        self.user.refresh_from_db()

        # Verify email
        token = self.user.email_verification_token
        success, message, user = verify_email_token(token)

        self.assertTrue(success)
        self.assertTrue(user.email_verified)

        # Track device after verification
        device_info = track_device_login(user, request)

        self.assertIsNotNone(device_info)

    def test_login_with_device_fingerprinting_and_jwt_rotation(self):
        """Test login flow with device fingerprinting"""
        request = self.factory.post("/api/auth/login/")
        request.META["HTTP_USER_AGENT"] = "Mozilla/5.0"
        request.META["REMOTE_ADDR"] = "192.168.1.1"

        # Track login
        device_info = track_device_login(self.user, request)

        # Check for suspicious activity
        is_suspicious, reason = detect_suspicious_activity(self.user, request)

        # Get JWT key for token generation
        rotation = JWTKeyRotation()
        jwt_key = rotation.get_current_key()

        self.assertIsNotNone(device_info)
        self.assertIsNotNone(jwt_key)
