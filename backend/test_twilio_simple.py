"""
Simple Twilio connection test (without Django)
"""

import os
from pathlib import Path
from decouple import config

# Load .env file
env_path = Path(__file__).parent / ".env"
print(f"Loading .env from: {env_path}")
print(f"File exists: {env_path.exists()}\n")

# Read credentials
TWILIO_ACCOUNT_SID = config("TWILIO_ACCOUNT_SID", default="")
TWILIO_AUTH_TOKEN = config("TWILIO_AUTH_TOKEN", default="")
TWILIO_PHONE_NUMBER = config("TWILIO_PHONE_NUMBER", default="")
TWILIO_WHATSAPP_NUMBER = config("TWILIO_WHATSAPP_NUMBER", default="")

print("=" * 70)
print("TWILIO CREDENTIALS CHECK")
print("=" * 70)

print(f"\n1. TWILIO_ACCOUNT_SID:")
if TWILIO_ACCOUNT_SID:
    print(
        f"   ✅ Found: {TWILIO_ACCOUNT_SID[:15]}... (length: {len(TWILIO_ACCOUNT_SID)})"
    )
    print(
        f"   Format: {'✅ Valid' if TWILIO_ACCOUNT_SID.startswith('AC') and len(TWILIO_ACCOUNT_SID) == 34 else '⚠️ Invalid format'}"
    )
else:
    print("   ❌ NOT FOUND or EMPTY")

print(f"\n2. TWILIO_AUTH_TOKEN:")
if TWILIO_AUTH_TOKEN:
    print(
        f"   ✅ Found: {TWILIO_AUTH_TOKEN[:10]}... (length: {len(TWILIO_AUTH_TOKEN)})"
    )
else:
    print("   ❌ NOT FOUND or EMPTY")

print(f"\n3. TWILIO_PHONE_NUMBER:")
if TWILIO_PHONE_NUMBER:
    print(f"   ✅ Found: {TWILIO_PHONE_NUMBER}")
    print(
        f"   Format: {'✅ Valid E.164' if TWILIO_PHONE_NUMBER.startswith('+') else '⚠️ Should start with +'}"
    )
else:
    print("   ❌ NOT FOUND or EMPTY")

print(f"\n4. TWILIO_WHATSAPP_NUMBER:")
if TWILIO_WHATSAPP_NUMBER:
    print(f"   ✅ Found: {TWILIO_WHATSAPP_NUMBER}")
else:
    print("   ⚠️  Not configured (optional)")

# Test Twilio connection
print(f"\n{'='*70}")
print("TESTING TWILIO CONNECTION")
print("=" * 70 + "\n")

if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    try:
        from twilio.rest import Client

        print("Creating Twilio client...")
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        print("Fetching account details...\n")
        account = client.api.accounts(TWILIO_ACCOUNT_SID).fetch()

        print("✅ CONNECTION SUCCESSFUL!\n")
        print(f"Account Details:")
        print(f"  - Status: {account.status}")
        print(f"  - Type: {account.type}")
        print(f"  - Name: {account.friendly_name}")

        # List phone numbers
        print(f"\nChecking phone numbers...")
        try:
            numbers = client.incoming_phone_numbers.list(limit=5)
            if numbers:
                print(f"✅ Found {len(numbers)} phone number(s) in your account:")
                for num in numbers:
                    print(f"   - {num.phone_number} ({num.friendly_name})")
            else:
                print("⚠️  No phone numbers found")
                print("\n💡 Action Required:")
                print("   You need to either:")
                print("   1. Purchase a phone number in Twilio Console")
                print("   2. Or verify recipient numbers for trial account")
                print(
                    "   🔗 https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
                )
        except Exception as e:
            print(f"⚠️  Could not list numbers: {e}")

        print(f"\n{'='*70}")
        print("✅ TWILIO IS CONFIGURED AND WORKING!")
        print("=" * 70)

    except Exception as e:
        print(f"❌ CONNECTION FAILED!")
        print(f"\nError: {str(e)}")
        print(f"\n💡 Troubleshooting:")
        print(f"   1. Verify credentials at: https://console.twilio.com/")
        print(f"   2. Check Account SID starts with 'AC'")
        print(f"   3. Ensure Auth Token has no extra spaces")
        print(f"   4. Check your Twilio account is active")

else:
    print("❌ MISSING CREDENTIALS")
    print("\nPlease add these to your .env file:")
    if not TWILIO_ACCOUNT_SID:
        print("   - TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
    if not TWILIO_AUTH_TOKEN:
        print("   - TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
    if not TWILIO_PHONE_NUMBER:
        print("   - TWILIO_PHONE_NUMBER=+1234567890")

print()
