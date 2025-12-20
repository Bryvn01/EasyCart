#!/usr/bin/env python
"""
Migration wrapper with database retry logic for Railway PostgreSQL.

This script wraps Django migrations to handle Railway free tier database
sleep/wake cycles. It waits for the database to be available before running
migrations, preventing build failures on Render.

Usage:
    python migrate_with_retry.py [--max-attempts N] [--timeout SECONDS]
"""

import os
import sys
import argparse
import subprocess
import logging

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")

import django  # noqa: E402

django.setup()

from utils.db_startup import wait_for_database  # noqa: E402

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def run_migrations():
    """Run Django migrations."""
    logger.info("Starting Django migrations...")
    try:
        result = subprocess.run(
            ["python", "manage.py", "migrate", "--noinput"],
            check=True,
            capture_output=True,
            text=True,
        )
        logger.info("✓ Migrations completed successfully")
        logger.info(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"✗ Migration failed with exit code {e.returncode}")
        logger.error(f"STDOUT: {e.stdout}")
        logger.error(f"STDERR: {e.stderr}")
        return False


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Run Django migrations with database retry logic"
    )
    parser.add_argument(
        "--max-attempts",
        type=int,
        default=10,
        help="Maximum number of database connection attempts (default: 10)",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=90,
        help="Maximum total wait time in seconds (default: 90)",
    )
    args = parser.parse_args()

    logger.info("=" * 70)
    logger.info("Django Migration with Railway Database Retry")
    logger.info("=" * 70)

    # Wait for database to be available
    logger.info(
        f"Waiting for database (max {args.max_attempts} attempts, "
        f"{args.timeout}s timeout)..."
    )

    success, message = wait_for_database(
        max_attempts=args.max_attempts,
        initial_delay=2.0,
        max_delay=10.0,
        timeout=args.timeout,
    )

    if not success:
        logger.error("=" * 70)
        logger.error("CRITICAL: Database connection failed")
        logger.error("=" * 70)
        logger.error(message)
        logger.error("")
        logger.error("Possible causes:")
        logger.error("1. Railway database is sleeping (free tier sleeps after 15min)")
        logger.error("2. DATABASE_URL environment variable is incorrect")
        logger.error("3. Railway database is down or unreachable")
        logger.error("4. Network/firewall blocking connection")
        logger.error("")
        logger.error("Solutions:")
        logger.error("- Wait 60s and try again (database may be waking up)")
        logger.error("- Check DATABASE_URL in Render environment variables")
        logger.error("- Check Railway database status at railway.app")
        logger.error("- Consider upgrading Railway to Developer tier ($5/mo)")
        logger.error("=" * 70)
        sys.exit(1)

    logger.info("=" * 70)
    logger.info(message)
    logger.info("=" * 70)

    # Run migrations
    if run_migrations():
        logger.info("=" * 70)
        logger.info("✓ All migrations completed successfully!")
        logger.info("=" * 70)
        sys.exit(0)
    else:
        logger.error("=" * 70)
        logger.error("✗ Migration failed - see errors above")
        logger.error("=" * 70)
        sys.exit(1)


if __name__ == "__main__":
    main()
