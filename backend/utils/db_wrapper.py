"""
Database connection wrapper with retry logic for sleeping databases
"""

import time
from functools import wraps
from django.db import connection, OperationalError
from django.db.utils import DatabaseError
import logging

logger = logging.getLogger(__name__)


def retry_on_db_error(max_retries=3, delay=2, backoff=2):
    """
    Decorator to retry database operations when connection fails
    Useful for Railway free tier when database might be sleeping

    Args:
        max_retries: Maximum number of retry attempts
        delay: Initial delay between retries in seconds
        backoff: Multiplier for delay after each retry
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retry_delay = delay
            last_exception = None

            for attempt in range(max_retries + 1):
                try:
                    # Close existing connection to force reconnect
                    if attempt > 0:
                        connection.close()
                        logger.info(
                            f"Retry attempt {attempt}/{max_retries} for {func.__name__}"
                        )

                    return func(*args, **kwargs)

                except (OperationalError, DatabaseError) as e:
                    last_exception = e

                    if attempt < max_retries:
                        logger.warning(
                            f"Database error in {func.__name__}: {e}. "
                            f"Retrying in {retry_delay}s... ({attempt + 1}/{max_retries})"
                        )
                        time.sleep(retry_delay)
                        retry_delay *= backoff
                    else:
                        logger.error(
                            f"Database error in {func.__name__} after {max_retries} retries: {e}"
                        )

            raise last_exception

        return wrapper

    return decorator


def wake_database():
    """
    Explicitly wake up the database with a simple query
    Call this before critical operations
    """
    max_attempts = 3
    for attempt in range(max_attempts):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            logger.info("Database connection established")
            return True
        except (OperationalError, DatabaseError) as e:
            if attempt < max_attempts - 1:
                logger.warning(
                    f"Database wake attempt {attempt + 1} failed, retrying..."
                )
                time.sleep(2**attempt)  # Exponential backoff: 1s, 2s, 4s
            else:
                logger.error(
                    f"Failed to wake database after {max_attempts} attempts: {e}"
                )
                raise

    return False
