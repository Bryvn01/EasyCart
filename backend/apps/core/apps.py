"""
EasyCart Core Application Configuration
Copyright (c) 2025 Bryvn01. All rights reserved.
"""

from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"

    def ready(self):
        """
        Called when Django starts. Initialize license verification.
        """
        # Only run in main process, not in migration or other commands
        import sys

        if "runserver" in sys.argv or "gunicorn" in sys.argv[0]:
            try:
                from .license import LicenseVerifier

                LicenseVerifier.enforce_license()
            except Exception as e:
                logger.error(f"License enforcement failed: {e}")
