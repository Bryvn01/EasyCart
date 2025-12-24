#!/usr/bin/env python
"""
Database Migration Script: Railway → Render PostgreSQL
Usage: python migrate_to_render.py
"""

import os
import sys
import subprocess
from pathlib import Path

# Add project to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")

import django

django.setup()

from django.core.management import call_command
from django.db import connection


def print_step(step_num, message):
    """Print formatted step message"""
    print(f"\n{'='*60}")
    print(f"STEP {step_num}: {message}")
    print("=" * 60)


def check_database_connection():
    """Verify database connection"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✓ Connected to PostgreSQL")
            print(f"  Version: {version[:50]}...")
            return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False


def get_table_counts():
    """Get row counts for all tables"""
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                table_name,
                (xpath('/row/cnt/text()',
                    xml_count))[1]::text::int as row_count
            FROM (
                SELECT
                    table_name,
                    table_schema,
                    query_to_xml(
                        format('select count(*) as cnt from %I.%I',
                        table_schema, table_name),
                        false,
                        true,
                        ''
                    ) as xml_count
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'
            ) t
            ORDER BY row_count DESC;
        """
        )
        return cursor.fetchall()


def export_data():
    """Export data using Django's dumpdata"""
    print_step(1, "Exporting Data from Current Database")

    backup_file = BASE_DIR / "data_backup.json"

    print(f"Exporting to: {backup_file}")

    # Export excluding contenttypes and permissions (they'll be recreated)
    call_command(
        "dumpdata",
        "--natural-foreign",
        "--natural-primary",
        "--exclude",
        "contenttypes",
        "--exclude",
        "auth.Permission",
        "--indent",
        "2",
        "--output",
        str(backup_file),
    )

    # Get file size
    size_mb = backup_file.stat().st_size / (1024 * 1024)
    print(f"✓ Export complete: {size_mb:.2f} MB")

    return backup_file


def import_data(backup_file):
    """Import data into new database"""
    print_step(2, "Importing Data to Render Database")

    if not backup_file.exists():
        print(f"✗ Backup file not found: {backup_file}")
        return False

    print(f"Importing from: {backup_file}")

    try:
        call_command("loaddata", str(backup_file))
        print("✓ Import complete")
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False


def verify_migration():
    """Verify data was migrated successfully"""
    print_step(3, "Verifying Migration")

    print("\nTable counts in new database:")
    print("-" * 60)

    tables = get_table_counts()
    total_rows = 0

    for table_name, row_count in tables:
        if row_count > 0:
            print(f"  {table_name:30} {row_count:>10,} rows")
            total_rows += row_count

    print("-" * 60)
    print(f"  {'TOTAL':30} {total_rows:>10,} rows")

    return total_rows > 0


def main():
    """Main migration workflow"""
    print(
        """
╔════════════════════════════════════════════════════════════╗
║     Railway → Render PostgreSQL Migration Script          ║
╚════════════════════════════════════════════════════════════╝

This script will:
1. Export data from your current database (Railway)
2. Import data into Render PostgreSQL
3. Verify the migration

PREREQUISITES:
- Update backend/.env with Render database credentials
- Run migrations: python manage.py migrate
- Backup your current database (just in case!)

"""
    )

    response = input("Ready to proceed? (yes/no): ").strip().lower()
    if response != "yes":
        print("Migration cancelled.")
        return

    # Check connection
    print_step(0, "Checking Database Connection")
    if not check_database_connection():
        print("\n✗ Please check your database credentials in .env")
        return

    # Export data
    backup_file = export_data()

    # Confirm before import
    print(f"\n⚠️  About to import data to current database.")
    print(f"   Backup file: {backup_file}")
    response = input("\nContinue with import? (yes/no): ").strip().lower()
    if response != "yes":
        print("Import cancelled. Backup file saved.")
        return

    # Import data
    if not import_data(backup_file):
        print("\n✗ Migration failed during import")
        return

    # Verify
    if verify_migration():
        print("\n" + "=" * 60)
        print("✓ MIGRATION SUCCESSFUL!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Test your application thoroughly")
        print("2. Update Render environment variables")
        print("3. Deploy to Render")
        print("4. Keep Railway database as backup for 1-2 weeks")
        print(f"5. Backup file saved at: {backup_file}")
    else:
        print("\n✗ Migration verification failed - database appears empty")


if __name__ == "__main__":
    main()
