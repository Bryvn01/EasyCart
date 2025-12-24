#!/usr/bin/env python
"""Truncate POS tables to completely reset data"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from django.db import connection

print("🗑️  Truncating POS tables (complete reset)...")

with connection.cursor() as cursor:
    cursor.execute(
        """
        TRUNCATE TABLE pos_postransactionitem, pos_postransaction, pos_possession
        RESTART IDENTITY CASCADE;
    """
    )

print("✅ All POS tables truncated and sequences reset!")
print("✅ Database is now clean and ready for fresh data")
