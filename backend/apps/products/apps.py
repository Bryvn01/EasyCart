from django.apps import AppConfig
import logging
import os

logger = logging.getLogger(__name__)


class ProductsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.products"

    def ready(self):
        """MongoDB health check disabled (PostgreSQL only)."""
        # MongoDB health check disabled for PostgreSQL migration.
        pass
