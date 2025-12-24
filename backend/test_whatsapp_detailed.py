"""
Detailed WhatsApp Delivery Test
Tests Twilio WhatsApp configuration with full error details
"""

import os
import sys
from pathlib import Path

# Setup Django
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")

import django

django.setup()

from decouple import config
from twilio.rest import Client

print("=" * 70)
print("WHATSAPP DELIVERY TEST")
print("=" * 70)

# Load credentials
TWILIO_ACCOUNT_SID = config("TWILIO_ACCOUNT_SID", default="")
TWILIO_AUTH_TOKEN = config("TWILIO_AUTH_TOKEN", default="")
TWILIO_PHONE_NUMBER = config("TWILIO_PHONE_NUMBER", default="")
TWILIO_WHATSAPP_NUMBER = config("TWILIO_WHATSAPP_NUMBER", default="")
TWILIO_WHATSAPP_FROM = config("TWILIO_WHATSAPP_FROM", default="")

print("\n1. Checking Credentials:")
print(
    f"   Account SID: {TWILIO_ACCOUNT_SID[:10]}... (length: {len(TWILIO_ACCOUNT_SID)})"
)
print(f"   Auth Token: {TWILIO_AUTH_TOKEN[:10]}... (length: {len(TWILIO_AUTH_TOKEN)})")
print(f"   Phone Number: {TWILIO_PHONE_NUMBER}")
print(f"   WhatsApp Number: {TWILIO_WHATSAPP_NUMBER}")
print(
    f"   WhatsApp From: {TWILIO_WHATSAPP_FROM if TWILIO_WHATSAPP_FROM else f'whatsapp:{TWILIO_PHONE_NUMBER}'}"
)

# Create Twilio client
print("\n2. Creating Twilio Client...")
try:
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    print("   ✅ Client created successfully")
except Exception as e:
    print(f"   ❌ Failed to create client: {e}")
    sys.exit(1)

# Test WhatsApp send
print("\n3. Testing WhatsApp Message...")
test_phone = "+254723796116"
test_otp = "123456"
whatsapp_from = (
    TWILIO_WHATSAPP_FROM if TWILIO_WHATSAPP_FROM else f"whatsapp:{TWILIO_PHONE_NUMBER}"
)

print(f"   From: {whatsapp_from}")
print(f"   To: whatsapp:{test_phone}")
print(f"   Message: Your EasyCart verification code is: {test_otp}")

try:
    message = client.messages.create(
        body=f"Your EasyCart verification code is: {test_otp}\nValid for 10 minutes.",
        from_=whatsapp_from,
        to=f"whatsapp:{test_phone}",
    )
    print(f"\n   ✅ WhatsApp message sent!")
    print(f"   Message SID: {message.sid}")
    print(f"   Status: {message.status}")
    print(f"   Direction: {message.direction}")
    print(f"   Price: {message.price} {message.price_unit}")
except Exception as e:
    print(f"\n   ❌ WhatsApp send failed!")
    print(f"   Error Type: {type(e).__name__}")
    print(f"   Error Message: {str(e)}")

    # Check if it's a Twilio error with more details
    if hasattr(e, "code"):
        print(f"   Error Code: {e.code}")
    if hasattr(e, "msg"):
        print(f"   Detailed Message: {e.msg}")

    # Common error codes
    print("\n   Common Issues:")
    if "21608" in str(e):
        print("   - Error 21608: The 'To' number is not a valid mobile number")
        print("   - Solution: Verify phone number format (+254...)")
    elif "21606" in str(e):
        print("   - Error 21606: The 'From' number is not a valid WhatsApp sender")
        print("   - Solution: Verify WhatsApp is enabled on this number")
    elif "63007" in str(e):
        print(
            "   - Error 63007: Permission to send an SMS/WhatsApp has not been enabled"
        )
        print("   - Solution: Upgrade from trial OR verify recipient number")
        print(
            "   - Verify at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
        )
    elif "21211" in str(e):
        print("   - Error 21211: Invalid 'To' phone number")
        print("   - Solution: Check phone number format")

print("\n" + "=" * 70)
