import os
import sys
import unittest
import django
from apps.accounts.otp_service import send_otp_sms, send_otp_whatsapp

"""Quick test script for Twilio configuration"""

# Skip by default in CI to avoid live Twilio calls; enable with ALLOW_LIVE_EXTERNAL_TESTS=1
if os.getenv("ALLOW_LIVE_EXTERNAL_TESTS") != "1":
    raise unittest.SkipTest("Live Twilio test disabled by default")

# Add backend to path
sys.path.insert(0, "C:/EasyCart/backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

print("=" * 60)
print("🧪 TWILIO CONFIGURATION TEST")
print("=" * 60)

# Test SMS
print("\n📱 Testing SMS delivery...")
try:
    result_sms = send_otp_sms("+254723796116", "123456")
    if result_sms:
        print("✅ SMS: Configuration successful!")
    else:
        print("⚠️  SMS: Failed (check Twilio console for details)")
except Exception as e:
    print(f"❌ SMS: Error - {e}")

# Test WhatsApp
print("\n💬 Testing WhatsApp delivery...")
try:
    result_wa = send_otp_whatsapp("+254723796116", "123456")
    if result_wa:
        print("✅ WhatsApp: Configuration successful!")
    else:
        print("⚠️  WhatsApp: Failed (check if number is verified in sandbox)")
except Exception as e:
    print(f"❌ WhatsApp: Error - {e}")

print("\n" + "=" * 60)
print("Test complete! Check your phone for test messages.")
print("=" * 60)
