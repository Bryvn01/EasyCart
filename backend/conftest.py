"""
Pytest configuration for Django tests.
Ensures proper setup for all test runs.
"""

import os
import sys
import django
from django.conf import settings

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")

# Setup Django
if not settings.configured:
    django.setup()


def pytest_configure(config):
    """Configure pytest with Django settings."""
    # Set test database configuration
    if hasattr(settings, "DATABASES"):
        for db_name in settings.DATABASES:
            settings.DATABASES[db_name][
                "NAME"
            ] = f"test_{settings.DATABASES[db_name].get('NAME', 'easycart')}"
            settings.DATABASES[db_name]["OPTIONS"] = {
                "options": "-c default_transaction_read_only=off"
            }

    # Disable external services in tests
    settings.TWILIO_ACCOUNT_SID = ""
    settings.TWILIO_AUTH_TOKEN = ""
    settings.CLOUDINARY_ENABLED = False
    settings.CELERY_TASK_ALWAYS_EAGER = True
    settings.CELERY_TASK_EAGER_PROPAGATES = True

    # Set safe test values
    settings.SECRET_KEY = "test-secret-key-for-testing-only-do-not-use-in-production"
    settings.DEBUG = True
    settings.ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver"]
