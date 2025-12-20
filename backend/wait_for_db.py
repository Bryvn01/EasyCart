#!/usr/bin/env python
"""
Database readiness check with Railway PostgreSQL retry logic.

This script waits for the database to be available before proceeding with
migrations. It handles Railway free tier sleep/wake cycles gracefully.
"""
import os
import sys
import logging

# Set up Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")

import django  # noqa: E402

django.setup()

from utils.db_startup import wait_for_database  # noqa: E402

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    """Wait for database with retry logic."""
    logger.info("=" * 70)
    logger.info("Waiting for Railway PostgreSQL database...")
    logger.info("(Free tier databases sleep after 15min inactivity)")
    logger.info("=" * 70)

    # Use our enhanced wait_for_database utility with aggressive retries
    success, message = wait_for_database(
        max_attempts=15,  # Up to 15 attempts
        initial_delay=3.0,  # Start with 3 seconds
        max_delay=10.0,  # Cap at 10 seconds
        timeout=120,  # 2 minute timeout for Railway wake-up
    )

    if success:
        logger.info("=" * 70)
        logger.info("✅ " + message)
        logger.info("=" * 70)
        sys.exit(0)
    else:
        logger.error("=" * 70)
        logger.error("❌ Database connection failed after retries")
        logger.error("=" * 70)
        logger.error(message)
        logger.error("")
        logger.error("Troubleshooting steps:")
        logger.error("1. Check Railway database status at railway.app")
        logger.error("2. Verify DATABASE_URL in Render environment variables")
        logger.error("3. Try triggering a new deployment in 60 seconds")
        logger.error("4. Consider upgrading Railway to Developer tier ($5/mo)")
        logger.error("=" * 70)
        sys.exit(1)


if __name__ == "__main__":
    main()
