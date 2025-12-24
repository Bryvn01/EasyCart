#!/usr/bin/env python
"""Verify POS data calculations"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from apps.pos.models import POSTransaction, POSTransactionItem
from django.db.models import Sum, Count, Avg
from decimal import Decimal

print("=" * 60)
print("POS DATABASE VERIFICATION")
print("=" * 60)

# Get all completed transactions
transactions = POSTransaction.objects.filter(status="completed")
print(f"\n✓ Total Completed Transactions: {transactions.count()}")

# Calculate aggregate stats
stats = transactions.aggregate(
    total_sales=Sum("total_amount"),
    total_transactions=Count("id"),
    average_transaction=Avg("total_amount"),
)

print(f"✓ Total Sales: KES {stats['total_sales']:,.2f}")
print(f"✓ Average Transaction: KES {stats['average_transaction']:,.2f}")

# Payment method breakdown
print("\n" + "=" * 60)
print("PAYMENT METHOD BREAKDOWN")
print("=" * 60)

payment_breakdown = (
    transactions.values("payment_method")
    .annotate(total=Sum("total_amount"), count=Count("id"))
    .order_by("-total")
)

for item in payment_breakdown:
    print(
        f"  {item['payment_method'].upper():15} : KES {item['total']:>12,.2f}  ({item['count']:>4} transactions)"
    )

# Calculate totals for display
cash_total = next(
    (item["total"] for item in payment_breakdown if item["payment_method"] == "cash"),
    Decimal("0"),
)
card_total = next(
    (item["total"] for item in payment_breakdown if item["payment_method"] == "card"),
    Decimal("0"),
)
mobile_total = sum(
    item["total"]
    for item in payment_breakdown
    if item["payment_method"] in ["mpesa", "airtel"]
)

print(f"\n  Dashboard Should Show:")
print(f"  - Cash Sales: KES {cash_total:,.2f}")
print(f"  - Card Sales: KES {card_total:,.2f}")
print(f"  - Mobile Money: KES {mobile_total:,.2f}")

# Top products
print("\n" + "=" * 60)
print("TOP 10 PRODUCTS BY REVENUE")
print("=" * 60)

top_products = (
    POSTransactionItem.objects.filter(transaction__status="completed")
    .values("product__name", "product__sku")
    .annotate(total_quantity=Sum("quantity"), total_revenue=Sum("line_total"))
    .order_by("-total_revenue")[:10]
)

for idx, product in enumerate(top_products, 1):
    print(
        f"  {idx:2}. {product['product__name'][:40]:40} SKU: {product['product__sku']:10} Qty: {product['total_quantity']:>5}  Revenue: KES {product['total_revenue']:>10,.2f}"
    )

# Verify calculations match
print("\n" + "=" * 60)
print("VERIFICATION SUMMARY")
print("=" * 60)

payment_sum = sum(item["total"] for item in payment_breakdown)
print(f"✓ Sum of Payment Methods: KES {payment_sum:,.2f}")
print(f"✓ Total Sales (Should Match): KES {stats['total_sales']:,.2f}")
print(
    f"{'✓ MATCH!' if abs(payment_sum - stats['total_sales']) < 0.01 else '✗ MISMATCH!'}"
)

print("\n" + "=" * 60)
print("The figures shown in the dashboard are calculated from the")
print("database and should match the values shown above.")
print("=" * 60)
