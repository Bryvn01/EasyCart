"""Quick test to verify TWILIO_WHATSAPP_FROM loads correctly"""

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Force fresh config load
from decouple import Config, RepositoryEnv

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
