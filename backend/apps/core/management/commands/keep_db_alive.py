"""
Django management command to keep Railway database awake
Usage: python manage.py keep_db_alive
"""

from django.core.management.base import BaseCommand
from django.db import connection
import time


class Command(BaseCommand):
    help = "Pings database every 5 minutes to prevent Railway free tier from sleeping"

    def add_arguments(self, parser):
        parser.add_argument(
            "--interval",
            type=int,
            default=300,  # 5 minutes
            help="Ping interval in seconds (default: 300)",
        )

    def handle(self, *args, **options):
        interval = options["interval"]
        self.stdout.write(
            self.style.SUCCESS(f"Starting database keep-alive (every {interval}s)...")
        )

        try:
            while True:
                try:
                    with connection.cursor() as cursor:
                        cursor.execute("SELECT 1")
                        cursor.fetchone()

                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Database ping successful at {time.strftime("%H:%M:%S")}'
                        )
                    )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"✗ Database ping failed: {e}"))

                time.sleep(interval)

        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("\nStopping keep-alive service..."))
