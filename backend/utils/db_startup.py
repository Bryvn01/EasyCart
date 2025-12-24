"""
Database startup check module for Railway PostgreSQL.

This module ensures the database is ready before the application starts,
handling Railway free tier database sleep/wake cycles gracefully.
"""

import logging
import time
from typing import Tuple

from django.db import connection, connections
from django.db.utils import OperationalError

logger = logging.getLogger(__name__)


def wait_for_database(
    max_attempts: int = 10,
    initial_delay: float = 2.0,
    max_delay: float = 10.0,
    timeout: int = 90,
) -> Tuple[bool, str]:
    """
    Wait for database to become available with exponential backoff.

    Args:
        max_attempts: Maximum number of connection attempts
        initial_delay: Initial delay between retries in seconds
        max_delay: Maximum delay between retries in seconds
        timeout: Maximum total wait time in seconds

    Returns:
        Tuple of (success: bool, message: str)
    """
    logger.info("Checking database connectivity...")
    start_time = time.time()
    delay = initial_delay

    for attempt in range(1, max_attempts + 1):
        elapsed = time.time() - start_time

        if elapsed > timeout:
            msg = f"Database connection timeout after {elapsed:.1f}s (max {timeout}s)"
            logger.error(msg)
            return False, msg

        try:
            # Close stale connections
            connection.close()

            # Attempt connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()

                if result and result[0] == 1:
                    success_msg = f"✓ Database ready (attempt {attempt}/{max_attempts}, took {elapsed:.1f}s)"
                    logger.info(success_msg)
                    return True, success_msg

        except OperationalError as e:
            error_msg = str(e).lower()

            # Distinguish between transient and permanent errors
            is_transient = any(
                keyword in error_msg
                for keyword in [
                    "server closed the connection",
                    "connection refused",
                    "could not connect",
                    "timeout",
                    "database system is starting up",
                ]
            )

            if is_transient:
                logger.warning(
                    f"Database not ready (attempt {attempt}/{max_attempts}): {error_msg}. "
                    f"Retrying in {delay:.1f}s... (Railway free tier may take 30-60s to wake)"
                )

                if attempt < max_attempts:
                    time.sleep(delay)
                    # Exponential backoff with cap
                    delay = min(delay * 1.5, max_delay)
            else:
                # Non-transient error - fail immediately
                error = f"Permanent database error: {e}"
                logger.error(error)
                return False, error

        except Exception as e:
            logger.error(f"Unexpected database error: {e}")
            if attempt < max_attempts:
                time.sleep(delay)
                delay = min(delay * 1.5, max_delay)

    # Max attempts exceeded
    failure_msg = f"Failed to connect to database after {max_attempts} attempts ({time.time() - start_time:.1f}s)"
    logger.error(failure_msg)
    return False, failure_msg


def close_old_connections():
    """Close all old database connections to prevent stale connection issues."""
    for conn in connections.all():
        conn.close_if_unusable_or_obsolete()


def validate_database_config():
    """
    Validate database configuration for production readiness.

    Returns:
        Tuple of (valid: bool, warnings: list)
    """
    from django.conf import settings

    warnings = []
    db_config = settings.DATABASES.get("default", {})

    # Check connection timeout
    options = db_config.get("OPTIONS", {})
    connect_timeout = options.get("connect_timeout", 0)

    if connect_timeout < 20:
        warnings.append(
            f"connect_timeout is {connect_timeout}s. Recommend ≥30s for Railway free tier."
        )

    # Check keepalive settings
    if not options.get("keepalives"):
        warnings.append(
            "TCP keepalive not enabled. Add keepalives=1 to prevent connection drops."
        )

    # Check connection pooling
    conn_max_age = db_config.get("CONN_MAX_AGE", 0)
    if conn_max_age > 300:
        warnings.append(
            f"CONN_MAX_AGE is {conn_max_age}s. Railway may close connections after 15min inactivity."
        )

    if warnings:
        logger.warning(
            "Database configuration warnings:\n"
            + "\n".join(f"  - {w}" for w in warnings)
        )

    return len(warnings) == 0, warnings
