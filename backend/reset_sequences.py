#!/usr/bin/env python
"""Reset PostgreSQL sequences for POS tables"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from django.db import connection

print("🔄 Resetting database sequences...")

with connection.cursor() as cursor:
    # Reset sequences for all POS tables
    cursor.execute(
        """
        SELECT setval(pg_get_serial_sequence('pos_possession', 'id'), 1, false);
        SELECT setval(pg_get_serial_sequence('pos_postransaction', 'id'), 1, false);
        SELECT setval(pg_get_serial_sequence('pos_postransactionitem', 'id'), 1, false);
    """
    )

print("✅ Database sequences reset successfully!")
