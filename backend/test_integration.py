"""
Comprehensive Integration Test Script for EasyCart Backend
Tests API endpoints, database connectivity, and CORS configuration
"""

import os
import sys
import django
import requests
from colorama import init, Fore, Style

# Initialize colorama for Windows
init(autoreset=True)

# Setup Django environment
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.products.models import Category, Product
from apps.orders.models import Order
from django.db import connection

User = get_user_model()


def print_section(title):
    """Print a formatted section header"""
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}{title.center(60)}")
    print(f"{Fore.CYAN}{'='*60}\n")


def print_success(message):
    """Print success message"""
    print(f"{Fore.GREEN}✓ {message}")


def print_error(message):
    """Print error message"""
    print(f"{Fore.RED}✗ {message}")


def print_info(message):
    """Print info message"""
    print(f"{Fore.YELLOW}ℹ {message}")


def test_database_connection():
    """Test PostgreSQL database connection"""
    print_section("STEP 1: DATABASE CONNECTION TEST")

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print_success(f"PostgreSQL Connected: {version}")

            # Test database name
            cursor.execute("SELECT current_database();")
            db_name = cursor.fetchone()[0]
            print_success(f"Database Name: {db_name}")

            return True
    except Exception as e:
        print_error(f"Database Connection Failed: {str(e)}")
        return False


def test_models():
    """Test Django models and database tables"""
    print_section("STEP 2: DATABASE MODELS TEST")

    try:
        # Test User model
        user_count = User.objects.count()
        print_success(f"Users Table: {user_count} users found")

        # Test Category model
        category_count = Category.objects.count()
        print_success(f"Categories Table: {category_count} categories found")

        # Test Product model
        product_count = Product.objects.count()
        print_success(f"Products Table: {product_count} products found")

        # Test Order model
        order_count = Order.objects.count()
        print_success(f"Orders Table: {order_count} orders found")

        if category_count == 0:
            print_info("No categories found. Run: python manage.py seed_data")
        if product_count == 0:
            print_info("No products found. Run: python manage.py seed_data")

        return True
    except Exception as e:
        print_error(f"Model Test Failed: {str(e)}")
        return False


def test_api_endpoints():
    """Test API endpoints via HTTP requests"""
    print_section("STEP 3: API ENDPOINTS TEST")

    base_url = "http://127.0.0.1:8000"
    tests_passed = 0
    tests_failed = 0

    endpoints = [
        ("GET", "/", "API Root"),
        ("GET", "/api/health/", "Health Check"),
        ("GET", "/api/health/live/", "Liveness Probe"),
        ("GET", "/api/health/ready/", "Readiness Probe"),
        ("GET", "/api/products/", "Products List"),
        ("GET", "/api/products/categories/", "Categories List"),
        ("GET", "/api/auth/check/", "Auth Check"),
    ]

    print_info("Testing API endpoints (server must be running on port 8000)...\n")

    for method, endpoint, description in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            response = requests.get(url, timeout=5)

            if response.status_code in [200, 401]:  # 401 is expected for auth endpoints
                print_success(f"{description:<25} {endpoint:<30} [{response.status_code}]")
                tests_passed += 1
            else:
                print_error(f"{description:<25} {endpoint:<30} [{response.status_code}]")
                tests_failed += 1

        except requests.exceptions.ConnectionError:
            print_error(f"{description:<25} Server not running!")
            tests_failed += 1
        except Exception as e:
            print_error(f"{description:<25} {str(e)}")
            tests_failed += 1

    print(f"\n{Fore.CYAN}API Tests: {tests_passed} passed, {tests_failed} failed")
    return tests_failed == 0


def test_cors_configuration():
    """Test CORS configuration"""
    print_section("STEP 4: CORS CONFIGURATION TEST")

    from django.conf import settings

    try:
        cors_origins = settings.CORS_ALLOWED_ORIGINS
        print_success(f"CORS Origins Configured: {len(cors_origins)}")

        for origin in cors_origins:
            print_info(f"  - {origin}")

        print_success(f"CORS Credentials: {settings.CORS_ALLOW_CREDENTIALS}")

        if "http://localhost:3000" in cors_origins or "http://127.0.0.1:3000" in cors_origins:
            print_success("Local development origins configured correctly")
        else:
            print_error("Local development origins (localhost:3000) not found!")

        return True
    except Exception as e:
        print_error(f"CORS Configuration Test Failed: {str(e)}")
        return False


def test_environment_variables():
    """Test critical environment variables"""
    print_section("STEP 5: ENVIRONMENT VARIABLES TEST")

    from django.conf import settings

    checks = [
        ("SECRET_KEY", settings.SECRET_KEY != "django-insecure-change-me-in-production"),
        ("DEBUG", hasattr(settings, "DEBUG")),
        ("DATABASE", settings.DATABASES["default"]["ENGINE"] == "django.db.backends.postgresql"),
        ("ALLOWED_HOSTS", len(settings.ALLOWED_HOSTS) > 0),
    ]

    for name, check in checks:
        if check:
            print_success(f"{name} configured")
        else:
            print_error(f"{name} not properly configured")

    # Database details
    db = settings.DATABASES["default"]
    print_info(f"Database Engine: {db['ENGINE']}")
    print_info(f"Database Name: {db['NAME']}")
    print_info(f"Database Host: {db['HOST']}")
    print_info(f"Database Port: {db['PORT']}")

    return all(check for _, check in checks)


def main():
    """Run all tests"""
    print(f"{Fore.MAGENTA}{Style.BRIGHT}")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║         EASYCART BACKEND INTEGRATION TESTS                ║")
    print("╚═══════════════════════════════════════════════════════════╝")

    results = []

    # Run all tests
    results.append(("Database Connection", test_database_connection()))
    results.append(("Database Models", test_models()))
    results.append(("Environment Variables", test_environment_variables()))
    results.append(("CORS Configuration", test_cors_configuration()))

    # API tests require server to be running
    print_info("\nNote: API endpoint tests require Django server to be running")
    print_info("If server is not running, start it with: python manage.py runserver")

    try:
        response = requests.get("http://127.0.0.1:8000/api/health/", timeout=2)
        if response.status_code == 200:
            results.append(("API Endpoints", test_api_endpoints()))
        else:
            print_info("Server running but health check failed")
            results.append(("API Endpoints", False))
    except:
        print_info("Server not running - skipping API endpoint tests")
        results.append(("API Endpoints", None))

    # Print summary
    print_section("TEST SUMMARY")

    passed = sum(1 for _, result in results if result is True)
    failed = sum(1 for _, result in results if result is False)
    skipped = sum(1 for _, result in results if result is None)

    for test_name, result in results:
        if result is True:
            print_success(f"{test_name}: PASSED")
        elif result is False:
            print_error(f"{test_name}: FAILED")
        else:
            print_info(f"{test_name}: SKIPPED")

    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.GREEN}PASSED: {passed}  {Fore.RED}FAILED: {failed}  {Fore.YELLOW}SKIPPED: {skipped}")
    print(f"{Fore.CYAN}{'='*60}\n")

    if failed == 0 and skipped == 0:
        print(f"{Fore.GREEN}{Style.BRIGHT}✓ ALL TESTS PASSED! System is ready for use.")
        return 0
    elif failed == 0:
        print(f"{Fore.YELLOW}{Style.BRIGHT}⚠ All core tests passed. Start server for full testing.")
        return 0
    else:
        print(f"{Fore.RED}{Style.BRIGHT}✗ Some tests failed. Please review errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
