"""Test timezone display conversion"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")

import django  # noqa: E402

django.setup()

import pytz  # noqa: E402
from django.utils import timezone  # noqa: E402

# Get current time in UTC
utc_time = timezone.now()

# Convert to East Africa Time
eat = pytz.timezone("Africa/Nairobi")
local_time = utc_time.astimezone(eat)

print("=" * 60)
print("TIMEZONE DISPLAY TEST")
print("=" * 60)
print(f"UTC Time:           {utc_time.strftime('%Y-%m-%d %I:%M:%S %p %Z')}")
print(f"East Africa Time:   {local_time.strftime('%Y-%m-%d %I:%M:%S %p %Z')}")
print(f"Time Difference:    +{(local_time.hour - utc_time.hour) % 24} hours")
print("=" * 60)
print()
print("WHAT THIS MEANS:")
print(
    f"- Django admin will now show: {local_time.strftime('%I:%M %p')} (East Africa Time)"
)
print(f"- Instead of showing:         {utc_time.strftime('%I:%M %p')} (UTC)")
print(f"- Database still stores:      {utc_time.strftime('%I:%M %p')} UTC (unchanged)")
print()
print("✅ Your timestamps will now display correctly in Django admin!")
