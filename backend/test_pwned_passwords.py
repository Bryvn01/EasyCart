"""
Test script for pwned password validation
"""

import os
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()


def test_pwned_passwords():
    """Test pwned password validation with known compromised and safe passwords"""

    print("\n" + "=" * 60)
    print("TESTING PWNED PASSWORD VALIDATION")
    print("=" * 60 + "\n")

    # Test cases
    test_cases = [
        ("password123", "Should FAIL - Common compromised password"),
        ("P@ssw0rd!", "Should FAIL - Very common compromised password"),
        ("qwerty123456", "Should FAIL - Common keyboard pattern"),
        ("MySecureP@ssw0rd2024$%^", "Should PASS - Strong unique password"),
        ("xK9#mL2$pQ4&vN8@wR7!", "Should PASS - Random complex password"),
    ]

    for password, description in test_cases:
        print(f"Testing: {password}")
        print(f"Description: {description}")
        try:
            # Create a dummy user for validation context
            user = User(username="testuser", email="test@example.com")
            validate_password(password, user=user)
            print("✅ PASSED - Password is secure\n")
        except ValidationError as e:
            print(f"❌ FAILED - {e.messages[0]}\n")

    print("=" * 60)
    print("Test completed!")
    print("=" * 60)


if __name__ == "__main__":
    test_pwned_passwords()
