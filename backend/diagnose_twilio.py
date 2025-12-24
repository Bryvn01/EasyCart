"""
Quick diagnostic script to check Twilio configuration
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from django.conf import settings
from twilio.rest import Client

print("\n" + "=" * 70)
print("TWILIO CONFIGURATION DIAGNOSTIC")
print("=" * 70 + "\n")

# Check environment variables
print("1. Checking .env variables:")
print(f"   TWILIO_ACCOUNT_SID: {settings.TWILIO_ACCOUNT_SID[:10]}... (masked)")
print(f"   TWILIO_AUTH_TOKEN: {settings.TWILIO_AUTH_TOKEN[:10]}... (masked)")
print(f"   TWILIO_PHONE_NUMBER: {settings.TWILIO_PHONE_NUMBER}")
print(f"   TWILIO_WHATSAPP_NUMBER: {settings.TWILIO_WHATSAPP_NUMBER}")

# Check if Twilio is configured
twilio_configured = bool(
    settings.TWILIO_ACCOUNT_SID
    and settings.TWILIO_AUTH_TOKEN
    and settings.TWILIO_PHONE_NUMBER
)

print(f"\n2. Twilio Configured: {'✅ YES' if twilio_configured else '❌ NO'}")

if twilio_configured:
    try:
        # Test Twilio client creation
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        # Try to fetch account info
        account = client.api.accounts(settings.TWILIO_ACCOUNT_SID).fetch()

        print(f"\n3. ✅ Twilio Connection Successful!")
        print(f"   Account Status: {account.status}")
        print(f"   Account Type: {account.type}")
        print(f"   Account Name: {account.friendly_name}")

        # Check phone numbers
        print(f"\n4. Checking Phone Numbers:")
        try:
            numbers = client.incoming_phone_numbers.list(limit=10)
            if numbers:
                print(f"   Found {len(numbers)} phone number(s):")
                for number in numbers:
                    print(f"   - {number.phone_number} ({number.friendly_name})")
            else:
                print("   ⚠️  No phone numbers found in your account")
                print(
                    "   💡 You need to purchase a phone number or verify trial numbers"
                )
        except Exception as e:
            print(f"   ⚠️  Could not list phone numbers: {e}")

        print(f"\n5. Testing SMS Send (Trial Mode):")
        print(f"   ⚠️  Note: Trial accounts can only send to verified numbers")
        print(
            f"   📱 To test: Add {settings.TWILIO_WHATSAPP_NUMBER} to Verified Caller IDs"
        )
        print(
            f"   🔗 https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
        )

    except Exception as e:
        print(f"\n3. ❌ Twilio Connection Failed!")
        print(f"   Error: {str(e)}")
        print(f"\n   Troubleshooting:")
        print(f"   1. Verify your Account SID and Auth Token at:")
        print(f"      https://console.twilio.com/")
        print(f"   2. Check if your Twilio account is active")
        print(f"   3. Ensure credentials are correct (no extra spaces)")
else:
    print(f"\n   Missing configuration:")
    if not settings.TWILIO_ACCOUNT_SID:
        print("   - TWILIO_ACCOUNT_SID is empty")
    if not settings.TWILIO_AUTH_TOKEN:
        print("   - TWILIO_AUTH_TOKEN is empty")
    if not settings.TWILIO_PHONE_NUMBER:
        print("   - TWILIO_PHONE_NUMBER is empty")

print("\n" + "=" * 70)
print("DIAGNOSTIC COMPLETE")
print("=" * 70 + "\n")
