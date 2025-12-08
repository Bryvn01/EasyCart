#!/usr/bin/env python
"""Twilio Configuration Checker
Usage: python check_twilio.py
Note: Not part of automated test suite
"""


def main():
    """Check Twilio configuration"""
    from decouple import config

    try:
        from twilio.rest import Client
    except ImportError:
        print("❌ Twilio package not installed. Run: pip install twilio")
        return False

    TWILIO_ACCOUNT_SID = config("TWILIO_ACCOUNT_SID", default="")
    TWILIO_AUTH_TOKEN = config("TWILIO_AUTH_TOKEN", default="")
    TWILIO_PHONE_NUMBER = config("TWILIO_PHONE_NUMBER", default="")

    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
        print("❌ Twilio credentials not configured in .env")
        return False

    print("Testing Twilio Configuration...")
    print(f"Account SID: {TWILIO_ACCOUNT_SID[:10]}...")
    print(f"Phone Number: {TWILIO_PHONE_NUMBER}")

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        account = client.api.accounts(TWILIO_ACCOUNT_SID).fetch()
        print(f"\n✅ Account Status: {account.status}")
        print(f"✅ Account Type: {account.type}")

        phone = client.incoming_phone_numbers.list(phone_number=TWILIO_PHONE_NUMBER)
        if phone:
            print(f"✅ Phone Number Valid: {phone[0].phone_number}")
        else:
            print("⚠️  Phone number not found in account")

        print("\n✅ Twilio is configured correctly!")
        return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


if __name__ == "__main__":
    import sys

    sys.exit(0 if main() else 1)
