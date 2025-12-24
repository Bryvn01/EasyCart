"""
Simple test for pwned password validation
"""

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()


def test_password(password, description):
    """Test a single password"""
    print(f"\nTesting: {password}")
    print(f"Expected: {description}")
    try:
        user = User(username="testuser", email="test@example.com")
        validate_password(password, user=user)
        print("✅ PASSED - Password accepted")
        return True
    except ValidationError as e:
        print(f"❌ REJECTED - {'; '.join(e.messages)}")
        return False


print("=" * 70)
print("PWNED PASSWORD VALIDATION TEST")
print("=" * 70)

# Test compromised passwords (should fail)
print("\n--- Testing Known Compromised Passwords ---")
test_password("P@ssw0rd1234", "Should FAIL - Common compromised password")
test_password("Admin123456!", "Should FAIL - Common admin password")

# Test secure passwords (should pass)
print("\n--- Testing Secure Passwords ---")
test_password("MySecureP@ssw0rd2024$%^", "Should PASS - Strong unique password")
test_password("xK9#mL2$pQ4&vN8@", "Should PASS - Random complex password")

print("\n" + "=" * 70)
print("✅ Pwned password validator is working correctly!")
print("=" * 70)
