"""Custom Pwned Passwords Validator using Have I Been Pwned API.

Compatible with Django 5.1+
"""

import hashlib
import logging

import requests
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

logger = logging.getLogger(__name__)


class PwnedPasswordsValidator:
    """
    Validate that the password has not been pwned in a data breach.

    Uses the Have I Been Pwned API (k-Anonymity model) which never sends
    the actual password over the network, only the first 5 characters of
    the SHA-1 hash.

    API Documentation: https://haveibeenpwned.com/API/v3#PwnedPasswords
    """

    def __init__(self, threshold=1, api_timeout=2):
        """
        Initialize the validator.

        Args:
            threshold: Minimum number of times password must appear to be rejected (default: 1)
            api_timeout: Request timeout in seconds (default: 2)
        """
        self.threshold = threshold
        self.api_timeout = api_timeout
        self.api_url = "https://api.pwnedpasswords.com/range/"

    def validate(self, password, user=None):
        """
        Validate that the password has not been pwned.

        Raises:
            ValidationError: If password has been found in breaches above threshold
        """
        # Hash the password
        sha1_hash = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
        prefix = sha1_hash[:5]
        suffix = sha1_hash[5:]

        try:
            # Query the API with the first 5 characters
            response = requests.get(
                f"{self.api_url}{prefix}",
                timeout=self.api_timeout,
                headers={"User-Agent": "Django-EasyCart-Security"},
            )
            response.raise_for_status()

            # Parse the response
            # Format: suffix:count (one per line)
            hashes = (line.split(":") for line in response.text.splitlines())

            # Check if our password hash appears in the results
            for hash_suffix, count in hashes:
                if hash_suffix == suffix:
                    breach_count = int(count)
                    if breach_count >= self.threshold:
                        logger.warning(
                            f"Password validation failed: found in {breach_count} breaches"
                        )
                        raise ValidationError(
                            _(
                                "This password has been compromised in a data breach "
                                "and appears %(count)d times in known breaches. "
                                "Please choose a different password."
                            ),
                            code="password_pwned",
                            params={"count": breach_count},
                        )
                    break

            # Password not found in breaches
            logger.debug("Password validation passed: not found in known breaches")

        except ValidationError:
            # Re-raise ValidationError to properly reject password
            raise
        except requests.RequestException as e:
            # API unavailable - log but don't block registration
            logger.warning(f"Pwned Passwords API unavailable: {e}")
            # In production, you might want to fail open (allow password)
            # to prevent API issues from blocking user registration
            pass
        except Exception as e:
            logger.error(f"Unexpected error in pwned password validation: {e}")
            # Fail open - don't block users due to validator errors
            pass

    def get_help_text(self):
        """Return help text for this validator."""
        return _(
            "Your password will be checked against a database of passwords "
            "compromised in data breaches to ensure it hasn't been leaked."
        )
