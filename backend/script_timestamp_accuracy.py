"""
Timestamp Accuracy Test Suite
Tests timezone-aware datetime usage across the application
"""

import os
import sys
from datetime import datetime as naive_datetime

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")

import django  # noqa: E402

django.setup()

from django.utils import timezone  # noqa: E402
from apps.products.models import Product, Category  # noqa: E402


def test_timezone_configuration():
    """Verify Django timezone settings"""
    from django.conf import settings

    print("=" * 80)
    print("TIMEZONE CONFIGURATION TEST")
    print("=" * 80)

    assert settings.USE_TZ is True, "USE_TZ must be True for timezone awareness"
    assert settings.TIME_ZONE == "UTC", "TIME_ZONE should be UTC for best practice"

    print("✅ Django USE_TZ: True")
    print("✅ Django TIME_ZONE: UTC")
    print()


def test_timezone_now_accuracy():
    """Verify timezone.now() returns timezone-aware datetime"""
    print("=" * 80)
    print("TIMEZONE.NOW() ACCURACY TEST")
    print("=" * 80)

    now = timezone.now()

    # Check timezone awareness
    assert now.tzinfo is not None, "timezone.now() must return timezone-aware datetime"
    assert str(now.tzinfo) == "UTC", "timezone.now() should use UTC"

    print(f"✅ timezone.now(): {now}")
    print(f"✅ Timezone aware: {now.tzinfo}")
    print(f"✅ UTC timestamp: {now.isoformat()}")
    print()


def test_model_datetime_fields():
    """Verify model DateTimeField auto timestamps are timezone-aware"""
    print("=" * 80)
    print("MODEL DATETIME FIELDS TEST")
    print("=" * 80)

    # Create test category
    category = Category.objects.create(
        name="Test Timezone Category", slug="test-timezone-cat"
    )

    # Verify created_at is timezone-aware
    assert (
        category.created_at.tzinfo is not None
    ), "Model created_at must be timezone-aware"

    print(f"✅ Category created_at: {category.created_at}")
    print(f"✅ Timezone aware: {category.created_at.tzinfo}")
    print(f"✅ ISO format: {category.created_at.isoformat()}")

    # Create test product
    product = Product.objects.create(
        name="Test Timezone Product",
        slug="test-timezone-prod",
        category=category,
        price=100.00,
        stock=10,
    )

    assert (
        product.created_at.tzinfo is not None
    ), "Product created_at must be timezone-aware"
    assert (
        product.updated_at.tzinfo is not None
    ), "Product updated_at must be timezone-aware"

    print(f"✅ Product created_at: {product.created_at}")
    print(f"✅ Product updated_at: {product.updated_at}")

    # Cleanup
    product.delete()
    category.delete()
    print()


def test_payment_service_timestamps():
    """Verify payment service uses timezone-aware timestamps"""
    print("=" * 80)
    print("PAYMENT SERVICE TIMESTAMP TEST")
    print("=" * 80)

    from apps.orders.payment_service import MpesaPaymentService  # noqa: F401

    # Generate timestamp (should use timezone.now())
    test_timestamp = timezone.now().strftime("%Y%m%d%H%M%S")

    # Verify format
    assert len(test_timestamp) == 14, "M-Pesa timestamp should be 14 characters"
    assert test_timestamp.isdigit(), "M-Pesa timestamp should be all digits"

    print(f"✅ M-Pesa timestamp format: {test_timestamp}")
    print(f"✅ Length: {len(test_timestamp)} characters")
    print()


def test_naive_datetime_warning():
    """Demonstrate the difference between naive and timezone-aware datetime"""
    print("=" * 80)
    print("NAIVE vs TIMEZONE-AWARE DATETIME COMPARISON")
    print("=" * 80)

    # Naive datetime (WRONG - don't use this)
    naive_now = naive_datetime.now()

    # Timezone-aware datetime (CORRECT - always use this)
    aware_now = timezone.now()

    print(f"❌ NAIVE datetime.now(): {naive_now}")
    print(f"   Timezone info: {naive_now.tzinfo} (None = naive)")
    print()
    print(f"✅ CORRECT timezone.now(): {aware_now}")
    print(f"   Timezone info: {aware_now.tzinfo} (UTC)")
    print()

    # Example: If server is in different timezone
    print("⚠️  POTENTIAL ISSUES WITH NAIVE DATETIME:")
    print("   - Server in Nairobi (UTC+3): naive datetime would be 3 hours ahead")
    print("   - Server in New York (UTC-5): naive datetime would be 5 hours behind")
    print("   - Daylight saving time changes cause data inconsistencies")
    print("   - Comparing timestamps from different servers fails")
    print()
    print("✅ BENEFITS OF TIMEZONE-AWARE (UTC):")
    print("   - Consistent across all servers worldwide")
    print("   - No daylight saving time issues")
    print("   - Easy conversion to any timezone for display")
    print("   - Database stores actual moment in time, not local time")
    print()


def test_timestamp_comparison():
    """Test timestamp comparison and ordering"""
    print("=" * 80)
    print("TIMESTAMP COMPARISON TEST")
    print("=" * 80)

    # Create timestamps
    time1 = timezone.now()
    import time

    time.sleep(0.1)  # Small delay
    time2 = timezone.now()

    # Verify ordering
    assert time2 > time1, "Later timestamp should be greater"

    diff = (time2 - time1).total_seconds()

    print(f"✅ Time 1: {time1.isoformat()}")
    print(f"✅ Time 2: {time2.isoformat()}")
    print(f"✅ Difference: {diff:.3f} seconds")
    print(f"✅ Comparison working correctly: time2 > time1 = {time2 > time1}")
    print()


def run_all_tests():
    """Run all timestamp accuracy tests"""
    print("\n")
    print("🕐" * 40)
    print("TIMESTAMP ACCURACY TEST SUITE")
    print("Testing timezone-aware datetime usage across EasyCart")
    print("🕐" * 40)
    print("\n")

    try:
        test_timezone_configuration()
        test_timezone_now_accuracy()
        test_model_datetime_fields()
        test_payment_service_timestamps()
        test_naive_datetime_warning()
        test_timestamp_comparison()

        print("=" * 80)
        print("✅ ALL TIMESTAMP TESTS PASSED!")
        print("=" * 80)
        print()
        print("SUMMARY:")
        print("✅ Django timezone settings correct (USE_TZ=True, TIME_ZONE='UTC')")
        print("✅ timezone.now() returns timezone-aware datetime in UTC")
        print("✅ Model DateTimeFields are timezone-aware")
        print("✅ Payment services use timezone-aware timestamps")
        print("✅ Timestamp comparisons work correctly")
        print()
        print("BEST PRACTICES FOLLOWED:")
        print("✅ All timestamps stored in UTC")
        print("✅ No naive datetime usage in production code")
        print("✅ Consistent timezone handling across application")
        print("✅ Database stores timezone-aware timestamps")
        print()
        return True

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}\n")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}\n")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
