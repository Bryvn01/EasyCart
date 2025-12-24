"""
JWT Multi-Key Verification Middleware
Supports verification with multiple active keys during rotation periods
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
import jwt
import logging

logger = logging.getLogger(__name__)


class MultiKeyJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that supports multiple secret keys
    Allows graceful key rotation without invalidating existing tokens
    """

    def get_validated_token(self, raw_token):
        """
        Override to try multiple keys during verification
        """
        from apps.accounts.management.commands.rotate_jwt_key import JWTKeyRotation

        # Get all active keys
        active_keys = JWTKeyRotation.get_all_active_keys()

        # Try to validate with each key
        last_exception = None
        for key_index, secret_key in enumerate(active_keys):
            try:
                # Temporarily override the signing key
                original_key = settings.SECRET_KEY
                settings.SECRET_KEY = secret_key

                # Attempt validation
                validated_token = super().get_validated_token(raw_token)

                # Restore original key
                settings.SECRET_KEY = original_key

                if key_index > 0:
                    logger.info(f"Token validated with rotated key (index {key_index})")

                return validated_token

            except (InvalidToken, TokenError) as e:
                last_exception = e
                # Restore original key before trying next
                settings.SECRET_KEY = original_key
                continue

        # If all keys failed, raise the last exception
        if last_exception:
            raise last_exception

        raise InvalidToken("Token validation failed with all active keys")


def get_jwt_signing_key():
    """
    Get the current JWT signing key for new token creation
    """
    try:
        from apps.accounts.management.commands.rotate_jwt_key import JWTKeyRotation

        return JWTKeyRotation.get_current_key()
    except:
        return settings.SECRET_KEY
