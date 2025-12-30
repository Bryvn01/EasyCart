import os
import sys
import unittest
from pathlib import Path
from decouple import Config, RepositoryEnv

"""Quick test to verify TWILIO_WHATSAPP_FROM loads correctly"""

# Skip live .env Twilio inspection unless explicitly allowed to avoid leaking secrets in CI
if os.getenv("ALLOW_LIVE_EXTERNAL_TESTS") != "1":
    raise unittest.SkipTest("Twilio env inspection disabled by default")

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Force fresh config load
env_file = backend_dir / ".env"
config = Config(RepositoryEnv(str(env_file)))

print(f".env file location: {env_file}")
print(f"File exists: {env_file.exists()}")
print()

# Test all Twilio variables
print("Twilio Configuration:")
print(f"  ACCOUNT_SID: {config('TWILIO_ACCOUNT_SID', default='NOT FOUND')[:15]}...")
print(f"  AUTH_TOKEN: {config('TWILIO_AUTH_TOKEN', default='NOT FOUND')[:15]}...")
print(f"  PHONE_NUMBER: {config('TWILIO_PHONE_NUMBER', default='NOT FOUND')}")
print(f"  WHATSAPP_NUMBER: {config('TWILIO_WHATSAPP_NUMBER', default='NOT FOUND')}")
print(f"  WHATSAPP_FROM: {config('TWILIO_WHATSAPP_FROM', default='NOT FOUND')}")
print()

# Check if WHATSAPP_FROM is configured
whatsapp_from = config("TWILIO_WHATSAPP_FROM", default="")
if whatsapp_from:
    print(f"✅ TWILIO_WHATSAPP_FROM is configured: {whatsapp_from}")
    print("   WhatsApp sandbox should work!")
else:
    print("❌ TWILIO_WHATSAPP_FROM not found in .env")
    print("   Add this line to backend/.env:")
    print("   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886")
