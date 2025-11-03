#!/usr/bin/env python3
"""
MongoDB Configuration Validator
Validates MongoDB Atlas connectivity and configuration
"""
import os
import sys
from decouple import config
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError, OperationFailure


def validate_mongodb_connection():
    """
    Validate MongoDB connection using MONGO_URI from .env
    Returns: (success: bool, message: str)
    """
    # Load MONGO_URI from environment
    mongo_uri = config("MONGO_URI", default="")

    if not mongo_uri:
        return False, "❌ MONGO_URI not found in .env file or environment variables"

    # Mask password in URI for logging
    masked_uri = mongo_uri
    if "@" in mongo_uri and ":" in mongo_uri:
        parts = mongo_uri.split("@")
        if len(parts) >= 2:
            creds = parts[0].split("//")[-1]
            if ":" in creds:
                user = creds.split(":")[0]
                masked_uri = mongo_uri.replace(creds, f"{user}:****")

    print(f"🔍 Validating MongoDB connection...")
    print(f"   URI: {masked_uri}")

    try:
        # Create MongoDB client with timeout
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)  # 5 second timeout

        # Attempt to connect and get server info
        print("   Attempting to connect...")
        server_info = client.server_info()

        # Test database access
        db = client.get_database()
        db_name = db.name

        # Try to list collections (requires read permissions)
        collections = db.list_collection_names()

        # Success!
        print(f"✅ MongoDB connection successful!")
        print(f"   Server version: {server_info.get('version', 'unknown')}")
        print(f"   Database: {db_name}")
        print(f"   Collections: {len(collections)}")
        if collections:
            print(f"   Sample collections: {', '.join(collections[:5])}")

        # Close connection
        client.close()

        return True, "MongoDB connection validated successfully"

    except ConnectionFailure as e:
        return False, f"❌ Connection failed: {str(e)}\n   Check network, whitelist IPs, and credentials"

    except ConfigurationError as e:
        return False, f"❌ Configuration error: {str(e)}\n   Check MONGO_URI format"

    except OperationFailure as e:
        return False, f"❌ Operation failed: {str(e)}\n   Check database permissions"

    except Exception as e:
        return False, f"❌ Unexpected error: {type(e).__name__}: {str(e)}"


def validate_django_settings():
    """
    Validate Django settings can load properly
    Returns: (success: bool, message: str)
    """
    print("\n🔍 Validating Django settings...")

    try:
        # Setup Django environment
        sys.path.insert(0, os.path.dirname(__file__))
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")

        import django

        django.setup()

        from django.conf import settings

        # Check MongoDB configuration in settings
        has_mongo_uri = hasattr(settings, "MONGO_URI") and settings.MONGO_URI
        has_mongodb_config = hasattr(settings, "MONGODB_DATABASES")

        print(f"   MONGO_URI configured: {has_mongo_uri}")
        print(f"   MONGODB_DATABASES configured: {has_mongodb_config}")
        print(f"   Default database engine: {settings.DATABASES['default']['ENGINE']}")

        # Check Django version
        print(f"   Django version: {django.get_version()}")

        return True, "✅ Django settings validated successfully"

    except Exception as e:
        return False, f"❌ Django settings error: {type(e).__name__}: {str(e)}"


def main():
    """Main validation function"""
    print("=" * 60)
    print("MongoDB Configuration Validator")
    print("=" * 60)

    # Check for .env file
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        print(f"✅ .env file found at: {env_path}")
    else:
        print(f"⚠️  .env file not found at: {env_path}")
        print("   Using environment variables or defaults")

    print()

    # Validate Django settings
    django_ok, django_msg = validate_django_settings()
    print(django_msg)

    if not django_ok:
        print("\n❌ Django settings validation failed")
        return 1

    print()

    # Validate MongoDB connection
    mongo_ok, mongo_msg = validate_mongodb_connection()
    print(mongo_msg)

    print("\n" + "=" * 60)

    if mongo_ok and django_ok:
        print("✅ All validations passed!")
        print("\nNext steps:")
        print("1. Run migrations: python manage.py migrate")
        print("2. Run tests: python manage.py test")
        print("3. Create superuser: python manage.py createsuperuser")
        return 0
    else:
        print("❌ Some validations failed")
        print("\nPlease fix the issues above before proceeding")
        return 1


if __name__ == "__main__":
    sys.exit(main())
