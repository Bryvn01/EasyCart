import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from django.db import connection

cursor = connection.cursor()
cursor.execute(
    """
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name='accounts_historicaluser'
    AND column_name LIKE 'email_%'
    ORDER BY column_name
"""
)

print("Columns in accounts_historicaluser starting with 'email_':")
for row in cursor.fetchall():
    print(f"  - {row[0]}")

cursor.execute(
    """
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name='accounts_user'
    AND column_name LIKE 'email%'
    ORDER BY column_name
"""
)

print("\nColumns in accounts_user starting with 'email':")
for row in cursor.fetchall():
    print(f"  - {row[0]}")
