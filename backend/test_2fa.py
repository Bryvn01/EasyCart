#!/usr/bin/env python
"""
Quick 2FA Testing Script
Run: python test_2fa.py
"""
import os
import django
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from apps.accounts.models import User
from apps.accounts.two_factor import generate_totp_secret, get_totp_uri, verify_totp
import pyotp


def test_2fa():
    print("🔐 2FA Testing Script\n")

    # Get admin user
    try:
        user = User.objects.get(email="admin@easycart.com")
        print(f"✅ Found user: {user.email}")
    except User.DoesNotExist:
        print("❌ Admin user not found. Create one first.")
        return

    # Generate secret if not exists
    if not user.two_factor_secret:
        secret = generate_totp_secret()
        user.two_factor_secret = secret
        user.save()
        print(f"✅ Generated new secret: {secret}")
    else:
        secret = user.two_factor_secret
        print(f"✅ Existing secret: {secret}")

    # Generate QR code URI
    uri = get_totp_uri(user.email, secret)
    print(f"\n📱 QR Code URI:\n{uri}\n")

    # Generate current code
    totp = pyotp.TOTP(secret)
    current_code = totp.now()
    print(f"🔢 Current 6-digit code: {current_code}")
    print(f"⏰ Valid for next 30 seconds\n")

    # Verify the code
    is_valid = verify_totp(secret, current_code)
    print(f"✅ Code verification: {'PASSED' if is_valid else 'FAILED'}")

    # Show 2FA status
    print(f"\n📊 2FA Status:")
    print(f"   - Enabled: {user.two_factor_enabled}")
    print(f"   - Secret exists: {bool(user.two_factor_secret)}")

    print("\n💡 Next Steps:")
    print("1. Scan this URI in your authenticator app:")
    print(f"   {uri}")
    print("2. Or manually enter secret: " + secret)
    print("3. Use the 6-digit code from your app to enable 2FA")


if __name__ == "__main__":
    test_2fa()
