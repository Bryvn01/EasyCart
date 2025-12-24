"""
Automated JWT Key Rotation Task
Run this as a cron job or scheduled task
"""

import os
import sys
import django

# Setup Django
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from apps.accounts.management.commands.rotate_jwt_key import JWTKeyRotation
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_and_rotate():
    """Check if rotation is needed and rotate if necessary"""
    try:
        status = JWTKeyRotation.get_rotation_status()
        logger.info(f"JWT Key Rotation Status: {status}")

        if JWTKeyRotation.should_rotate():
            logger.info("JWT key rotation needed, rotating now...")
            success, message = JWTKeyRotation.rotate_key()

            if success:
                logger.info(f"✅ JWT key rotation successful: {message}")
                return True
            else:
                logger.error(f"❌ JWT key rotation failed: {message}")
                return False
        else:
            days_until = status.get("next_rotation_due", "N/A")
            logger.info(
                f"ℹ️  JWT key rotation not needed. Next rotation in {days_until} days."
            )
            return True

    except Exception as e:
        logger.error(f"Error in JWT key rotation check: {e}")
        return False


if __name__ == "__main__":
    check_and_rotate()
