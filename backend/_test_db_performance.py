import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from django.db import connection, reset_queries
from apps.products.models import Product, Category

print("\n" + "=" * 60)
print("  DATABASE QUERY OPTIMIZATION TEST")
print("=" * 60 + "\n")

# Test 1: Products with select_related
print("[TEST 1] Products Query Optimization")
reset_queries()
products = list(Product.objects.select_related("category").all()[:20])
query_count = len(connection.queries)

print(f"  [OK] Loaded {len(products)} products")
print(f"  [QUERIES] Database queries: {query_count}")

if query_count <= 2:
    print(f"  [SUCCESS] Performance: EXCELLENT (Target: <=2 queries)")
    status = "PASS"
elif query_count <= 5:
    print(f"  [WARNING] Performance: GOOD (Target: <=2 queries)")
    status = "PASS"
else:
    print(f"  [FAIL] Performance: NEEDS WORK (Target: <=2 queries)")
    status = "FAIL"

# Test 2: Categories with annotation
print(f"\n[TEST 2] Categories Query Optimization")
reset_queries()
from django.db.models import Count, Q

categories = list(
    Category.objects.annotate(
        _products_count=Count("products", filter=Q(products__is_active=True))
    ).all()
)
query_count = len(connection.queries)

print(f"  [OK] Loaded {len(categories)} categories")
print(f"  [QUERIES] Database queries: {query_count}")

if query_count == 1:
    print(f"  [SUCCESS] Performance: EXCELLENT (Target: 1 query)")
    cat_status = "PASS"
elif query_count <= 3:
    print(f"  [WARNING] Performance: GOOD (Target: 1 query)")
    cat_status = "PASS"
else:
    print(f"  [FAIL] Performance: NEEDS WORK (Target: 1 query)")
    cat_status = "FAIL"

# Test 3: Check indexes
print(f"\n[TEST 3] Database Indexes Check")
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute(
        """
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'products_product'
        AND indexname LIKE '%created_at%'
           OR indexname LIKE '%view_count%'
           OR indexname LIKE '%name%'
    """
    )
    indexes = cursor.fetchall()

if len(indexes) >= 3:
    print(f"  [OK] Found {len(indexes)} performance indexes")
    print(f"  [SUCCESS] Indexes: INSTALLED")
    idx_status = "PASS"
else:
    print(f"  [WARNING] Found only {len(indexes)} indexes (expected 3+)")
    idx_status = "FAIL"

# Summary
print(f"\n" + "=" * 60)
print("  SUMMARY")
print("=" * 60)
print(f"  Products Query: {status}")
print(f"  Categories Query: {cat_status}")
print(f"  Database Indexes: {idx_status}")

if status == "PASS" and cat_status == "PASS" and idx_status == "PASS":
    print(f"\n  [SUCCESS] ALL TESTS PASSED - Enterprise Grade Performance!")
else:
    print(f"\n  [WARNING] Some tests need attention")

print("=" * 60 + "\n")
