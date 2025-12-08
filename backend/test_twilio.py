#!/usr/bin/env python
"""Test Twilio configuration"""

from decouple import config
from twilio.rest import Client

# Load credentials
TWILIO_ACCOUNT_SID = config("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = config("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = config("TWILIO_PHONE_NUMBER")

print("Testing Twilio Configuration...")
print(f"Account SID: {TWILIO_ACCOUNT_SID[:10]}...")
print(f"Phone Number: {TWILIO_PHONE_NUMBER}")

try:
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    # Test account info
    account = client.api.accounts(TWILIO_ACCOUNT_SID).fetch()
    print(f"\n✅ Account Status: {account.status}")
    print(f"✅ Account Type: {account.type}")

    # Test phone number
    phone = client.incoming_phone_numbers.list(phone_number=TWILIO_PHONE_NUMBER)
    if phone:
        print(f"✅ Phone Number Valid: {phone[0].phone_number}")
    else:
        print("⚠️  Phone number not found in account")

    print("\n✅ Twilio is configured correctly!")

except Exception as e:
    print(f"\n❌ Error: {e}")
