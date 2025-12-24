"""
JWT Secret Key Rotation System
Implements automatic JWT secret key rotation for enhanced security
"""

import secrets
import hashlib
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class JWTKeyRotation:
    """Manages JWT secret key rotation"""

    CACHE_KEY_PREFIX = "jwt_secret_"
    MAX_ACTIVE_KEYS = 3  # Keep last 3 keys for graceful rotation
    KEY_LIFETIME_DAYS = 90  # Rotate every 90 days

    @staticmethod
    def generate_new_secret():
        """Generate a new secure secret key"""
        return secrets.token_urlsafe(64)

    @staticmethod
    def get_current_key():
        """Get the current active JWT secret key"""
        current_key = cache.get(f"{JWTKeyRotation.CACHE_KEY_PREFIX}current")
        if not current_key:
            # Fallback to settings.SECRET_KEY if no rotation key exists
            return settings.SECRET_KEY
        return current_key

    @staticmethod
    def get_all_active_keys():
        """Get all currently active keys for signature verification"""
        keys = []
        for i in range(JWTKeyRotation.MAX_ACTIVE_KEYS):
            key = cache.get(f"{JWTKeyRotation.CACHE_KEY_PREFIX}{i}")
            if key:
                keys.append(key)

        # Only include SECRET_KEY as fallback if no rotated keys exist
        if not keys and settings.SECRET_KEY:
            keys.append(settings.SECRET_KEY)

        return keys

    @staticmethod
    def rotate_key():
        """
        Rotate JWT secret key
        Creates new key and demotes old keys
        """
        try:
            # Generate new key
            new_key = JWTKeyRotation.generate_new_secret()

            # Get current key before rotation
            current_key = JWTKeyRotation.get_current_key()

            # Rotate keys (new becomes 0, 0 becomes 1, 1 becomes 2, 2 is dropped)
            for i in range(JWTKeyRotation.MAX_ACTIVE_KEYS - 1, 0, -1):
                old_key = cache.get(f"{JWTKeyRotation.CACHE_KEY_PREFIX}{i-1}")
                if old_key:
                    cache.set(
                        f"{JWTKeyRotation.CACHE_KEY_PREFIX}{i}",
                        old_key,
                        timeout=JWTKeyRotation.KEY_LIFETIME_DAYS * 24 * 3600,
                    )

            # If no key at position 0 but there was a current_key (could be SECRET_KEY),
            # preserve it at position 1
            if not cache.get(f"{JWTKeyRotation.CACHE_KEY_PREFIX}0") and current_key:
                cache.set(
                    f"{JWTKeyRotation.CACHE_KEY_PREFIX}1",
                    current_key,
                    timeout=JWTKeyRotation.KEY_LIFETIME_DAYS * 24 * 3600,
                )

            # Set new key as current
            cache.set(
                f"{JWTKeyRotation.CACHE_KEY_PREFIX}0",
                new_key,
                timeout=JWTKeyRotation.KEY_LIFETIME_DAYS * 24 * 3600,
            )
            cache.set(
                f"{JWTKeyRotation.CACHE_KEY_PREFIX}current",
                new_key,
                timeout=JWTKeyRotation.KEY_LIFETIME_DAYS * 24 * 3600,
            )

            # Store rotation timestamp
            cache.set(
                f"{JWTKeyRotation.CACHE_KEY_PREFIX}last_rotation",
                datetime.now().isoformat(),
                timeout=JWTKeyRotation.KEY_LIFETIME_DAYS * 24 * 3600,
            )

            logger.info("JWT secret key rotated successfully")
            return True, "Key rotated successfully"

        except Exception as e:
            logger.error(f"JWT key rotation failed: {e}")
            return False, f"Rotation failed: {e}"

    @staticmethod
    def get_rotation_status():
        """Get current rotation status"""
        last_rotation = cache.get(f"{JWTKeyRotation.CACHE_KEY_PREFIX}last_rotation")
        active_keys_count = len(JWTKeyRotation.get_all_active_keys())

        status = {
            "last_rotation": last_rotation,
            "active_keys": active_keys_count,
            "max_keys": JWTKeyRotation.MAX_ACTIVE_KEYS,
            "key_lifetime_days": JWTKeyRotation.KEY_LIFETIME_DAYS,
        }

        if last_rotation:
            last_rotation_date = datetime.fromisoformat(last_rotation)
            days_since = (datetime.now() - last_rotation_date).days
            status["days_since_rotation"] = days_since
            status["next_rotation_due"] = JWTKeyRotation.KEY_LIFETIME_DAYS - days_since
            status["rotation_needed"] = days_since >= JWTKeyRotation.KEY_LIFETIME_DAYS
        else:
            status["rotation_needed"] = True
            status["message"] = "Initial rotation needed"

        return status

    @staticmethod
    def should_rotate():
        """Check if rotation is due"""
        status = JWTKeyRotation.get_rotation_status()
        return status.get("rotation_needed", True)


class Command(BaseCommand):
    help = "Rotate JWT secret keys"

    def add_arguments(self, parser):
        parser.add_argument(
            "--status",
            action="store_true",
            help="Show rotation status without rotating",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force rotation even if not due",
        )

    def handle(self, *args, **options):
        if options["status"]:
            status = JWTKeyRotation.get_rotation_status()
            self.stdout.write("\n=== JWT Key Rotation Status ===")
            for key, value in status.items():
                self.stdout.write(f"{key}: {value}")
            self.stdout.write("=" * 40 + "\n")
            return

        if options["force"] or JWTKeyRotation.should_rotate():
            self.stdout.write("Rotating JWT secret key...")
            success, message = JWTKeyRotation.rotate_key()

            if success:
                self.stdout.write(self.style.SUCCESS(f"✅ {message}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ {message}"))
        else:
            status = JWTKeyRotation.get_rotation_status()
            days_until = status.get("next_rotation_due", "N/A")
            self.stdout.write(
                self.style.WARNING(
                    f"Rotation not needed. Next rotation due in {days_until} days."
                )
            )
            self.stdout.write("Use --force to rotate anyway.")
