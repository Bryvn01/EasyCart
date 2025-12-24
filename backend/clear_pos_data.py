#!/usr/bin/env python
"""Clear all POS data from database"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from apps.pos.models import POSSession, POSTransaction, POSTransactionItem

print("🗑️  Deleting all POS data...")

# Delete in correct order (children first)
item_count = POSTransactionItem.objects.all().delete()[0]
trans_count = POSTransaction.objects.all().delete()[0]
session_count = POSSession.objects.all().delete()[0]

print(f"✅ Deleted:")
print(f"   - {item_count} transaction items")
print(f"   - {trans_count} transactions")
print(f"   - {session_count} sessions")
print("\n✅ Database cleared successfully!")
