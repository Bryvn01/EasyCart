#!/usr/bin/env python
import sys
import time
import psycopg2
from decouple import config


def wait_for_db(max_retries=30, delay=2):
    """Wait for database to be ready"""
    db_config = {
        "dbname": config("DB_NAME"),
        "user": config("DB_USER"),
        "password": config("DB_PASSWORD"),
        "host": config("DB_HOST"),
        "port": config("DB_PORT", default=5432, cast=int),
    }

    for i in range(max_retries):
        try:
            conn = psycopg2.connect(**db_config)
            conn.close()
            print("✅ Database is ready!")
            return True
        except psycopg2.OperationalError:
            if i < max_retries - 1:
                print(f"⏳ Waiting for database... ({i + 1}/{max_retries})")
                time.sleep(delay)
            else:
                print(f"❌ Database not ready after {max_retries} attempts")
                sys.exit(1)
    return False


if __name__ == "__main__":
    wait_for_db()
