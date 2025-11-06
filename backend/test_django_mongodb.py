#!/usr/bin/env python3
"""
Django MongoDB Connection Test
Tests MongoDB Atlas connectivity from Django environment using PyMongo
"""

import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")

try:
    import django

    django.setup()
except Exception as e:
    print(f"❌ Error setting up Django: {e}")
    sys.exit(1)

from django.conf import settings
from decouple import config


def test_django_mongodb_connection():
    """Test MongoDB connection from Django using PyMongo"""

    print("\n" + "=" * 70)
    print("🔍 Django + MongoDB Connection Test - EasyCart")
    print("=" * 70 + "\n")

    # Step 1: Check Django configuration
    print("📊 Django Configuration:")
    print(f"   Django version: {django.get_version()}")
    print(f"   Settings module: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
    print(f"   DEBUG: {settings.DEBUG}")
    print()

    # Step 2: Check Django database configuration
    print("💾 Django ORM Database:")
    default_db = settings.DATABASES.get("default", {})
    print(f"   Engine: {default_db.get('ENGINE', 'Not set')}")
    print(f"   Name: {default_db.get('NAME', 'Not set')}")

    if "djongo" in default_db.get("ENGINE", "").lower():
        print("   ✅ Using Djongo (MongoDB connector)")
    elif "sqlite" in default_db.get("ENGINE", "").lower():
        print("   ⚠️  Using SQLite (not MongoDB)")
    elif "postgresql" in default_db.get("ENGINE", "").lower():
        print("   ⚠️  Using PostgreSQL (not MongoDB)")
    else:
        print(f"   ℹ️  Using: {default_db.get('ENGINE', 'Unknown')}")
    print()

    # Step 3: Check MONGO_URI configuration
    mongo_uri = getattr(settings, "MONGO_URI", None) or config("MONGO_URI", default="")

    if not mongo_uri:
        print("❌ MONGO_URI not configured in settings")
        print("💡 Set MONGO_URI in .env file:\n")
        print(
            "MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority\n"
        )
        return False

    # Mask password for safe logging
    masked_uri = mongo_uri
    if "@" in mongo_uri and ":" in mongo_uri:
        try:
            parts = mongo_uri.split("@")
            if len(parts) >= 2:
                creds = parts[0].split("//")[-1]
                if ":" in creds:
                    user = creds.split(":")[0]
                    masked_uri = mongo_uri.replace(creds, f"{user}:****")
        except:
            pass

    print("📊 MongoDB Configuration:")
    print(f"   MONGO_URI configured: ✅")
    print(f"   URI: {masked_uri}")

    # Extract database name
    db_name = "unknown"
    try:
        if ".net/" in mongo_uri:
            db_name = mongo_uri.split(".net/")[-1].split("?")[0]
    except:
        pass

    print(f"   Database name: {db_name}")

    if db_name == "easycart":
        print("   ✅ Correct database name (easycart)")
    elif db_name in ["admin", "test", ""]:
        print(f"   ❌ Wrong database name: {db_name}")
        print("   💡 Database should be 'easycart'")
    print()

    # Step 4: Test PyMongo connection
    print("🔗 Testing MongoDB connection with PyMongo...")

    try:
        from pymongo import MongoClient
        from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

        # Create MongoDB client
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
        )

        # Test connection
        client.admin.command("ping")
        print("✅ Successfully connected to MongoDB Atlas!\n")

        # Get database
        db = client[db_name] if db_name != "unknown" else client.get_database()
        print(f"📊 Database: {db.name}")

        # Step 5: Check collections
        print("\n📂 Collections:")
        collections = db.list_collection_names()
        print(f"   Found {len(collections)} collection(s): {', '.join(collections)}")

        if "products" in collections:
            print("   ✅ products collection exists")
        else:
            print("   ❌ products collection NOT found")

        if "categories" in collections:
            print("   ✅ categories collection exists")

        if "users" in collections:
            print("   ✅ users collection exists")
        print()

        # Step 6: Count products
        if "products" in collections:
            print("🔢 Counting products...")
            products_collection = db["products"]
            total_products = products_collection.count_documents({})
            print(f"   Total products: {total_products}")

            if total_products == 37:
                print("   ✅ PERFECT: Found exactly 37 products (expected count)")
            elif total_products == 0:
                print("   ⚠️  WARNING: 0 products found - database not seeded")
                print("   💡 Run: curl -X POST http://localhost:5000/api/seed")
            else:
                print(f"   ℹ️  Found {total_products} products in database")
            print()

            # Step 7: Get sample products
            if total_products > 0:
                print("📋 Sample products:")
                sample_products = list(products_collection.find().limit(5))
                for i, product in enumerate(sample_products, 1):
                    print(f"   {i}. {product.get('name', 'Unknown')}")
                    print(f"      Price: KES {product.get('price', 0):,.2f}")
                    print(f"      Category: {product.get('category', 'Unknown')}")
                    print(f"      Brand: {product.get('brand', 'Unknown')}")
                    print()

        # Step 8: Test Django Product model (queries different database!)
        print("⚠️  Django Product Model Test:")
        print("   Note: Django Product model queries SQLite/PostgreSQL, NOT MongoDB")

        try:
            from apps.products.models import Product

            django_product_count = Product.objects.count()
            print(f"   Django Product.objects.count(): {django_product_count}")
            print(
                f"   MongoDB products count: {total_products if 'products' in collections else 0}"
            )

            if django_product_count != total_products:
                print("\n   ⚠️  WARNING: Counts don't match!")
                print("   Django models and MongoDB are separate databases")
                print("   Use Node.js backend (/api/products) to access MongoDB data")
        except Exception as e:
            print(f"   Error querying Django model: {e}")
        print()

        # Final summary
        print("=" * 70)
        print("🎉 MongoDB Connection Test PASSED")
        print("=" * 70 + "\n")

        print("✅ Final Checklist:")
        print(
            f"   [{'✅' if db_name == 'easycart' else '❌'}] Database name is 'easycart'"
        )
        print(f"   [✅] MongoDB connected via PyMongo")
        print(
            f"   [{'✅' if 'products' in collections else '❌'}] products collection exists"
        )
        print(
            f"   [{'✅' if total_products > 0 else '⚠️ '}] Products in database: {total_products}"
        )
        print()

        print("📝 Important Notes:")
        print("   • Django ORM does NOT use MongoDB (uses SQLite/PostgreSQL)")
        print("   • Product data is in MongoDB, accessed via Node.js backend")
        print("   • Frontend should call: /api/products (Node.js backend)")
        print("   • Django is for admin panel and authentication only")
        print()

        if total_products == 0:
            print("⚠️  Next Step: Seed the database")
            print("   Run: curl -X POST http://localhost:5000/api/seed")
            print("   Or: cd backend && node routes/seed.js")

        client.close()
        return True

    except ImportError:
        print("❌ PyMongo not installed")
        print("💡 Install with: pip install pymongo")
        return False

    except ConnectionFailure as e:
        print(f"❌ MongoDB Connection Failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("   1. Check MONGO_URI in .env file")
        print("   2. Verify credentials in MongoDB Atlas")
        print("   3. Check network connectivity")
        print("   4. Add 0.0.0.0/0 to IP whitelist in Atlas")
        return False

    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {e}")
        return False


if __name__ == "__main__":
    success = test_django_mongodb_connection()
    sys.exit(0 if success else 1)
