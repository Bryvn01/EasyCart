"""
EasyCart License Verification System
Copyright (c) 2025 Bryvn01. All rights reserved.
"""

import os
import hashlib
import socket
import logging
from datetime import datetime
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)


class LicenseVerifier:
    """
    Verifies EasyCart installation license and domain authorization.
    This prevents unauthorized use of the platform.
    """

    # License types
    LICENSE_DEMO = "demo"
    LICENSE_DEVELOPMENT = "dev"
    LICENSE_PRODUCTION = "prod"
    LICENSE_ENTERPRISE = "enterprise"

    @staticmethod
    def get_installation_id():
        """Generate unique installation ID based on machine characteristics"""
        try:
            hostname = socket.gethostname()
            # Create a unique ID based on hostname and a secret
            installation_string = f"{hostname}-{settings.SECRET_KEY[:10]}"
            installation_id = hashlib.sha256(installation_string.encode()).hexdigest()
            return installation_id
        except Exception as e:
            logger.error(f"Error generating installation ID: {e}")
            return None

    @staticmethod
    def verify_license_key():
        """Verify the license key from environment"""
        license_key = os.getenv("EASYCART_LICENSE_KEY", "")

        if not license_key:
            logger.warning("No EASYCART_LICENSE_KEY found. Running in DEMO mode.")
            return LicenseVerifier.LICENSE_DEMO

        # Simple validation - in production, this would check against a license server
        # For now, we check the format
        if license_key.startswith("EC-DEV-"):
            return LicenseVerifier.LICENSE_DEVELOPMENT
        elif license_key.startswith("EC-PROD-"):
            return LicenseVerifier.LICENSE_PRODUCTION
        elif license_key.startswith("EC-ENT-"):
            return LicenseVerifier.LICENSE_ENTERPRISE
        else:
            logger.warning(f"Invalid license key format: {license_key[:10]}...")
            return LicenseVerifier.LICENSE_DEMO

    @staticmethod
    def verify_domain():
        """Verify the domain is authorized for this license"""
        allowed_hosts = getattr(settings, "ALLOWED_HOSTS", [])

        if "*" in allowed_hosts:
            logger.warning(
                "Wildcard ALLOWED_HOSTS detected. This is not secure for production!"
            )
            return False

        if not allowed_hosts or allowed_hosts == ["*"]:
            logger.error("No specific ALLOWED_HOSTS configured!")
            return False

        return True

    @staticmethod
    def get_license_info():
        """Get comprehensive license information"""
        license_type = LicenseVerifier.verify_license_key()
        installation_id = LicenseVerifier.get_installation_id()
        domain_valid = LicenseVerifier.verify_domain()

        # Define feature availability based on license type
        features = {
            LicenseVerifier.LICENSE_DEMO: {
                "max_products": 50,
                "max_orders_per_day": 10,
                "max_customers": 100,
                "advanced_analytics": False,
                "email_support": False,
                "payment_gateways": ["test"],
                "api_access": False,
                "custom_branding": False,
            },
            LicenseVerifier.LICENSE_DEVELOPMENT: {
                "max_products": 500,
                "max_orders_per_day": 100,
                "max_customers": 1000,
                "advanced_analytics": True,
                "email_support": True,
                "payment_gateways": ["test", "stripe", "paypal"],
                "api_access": True,
                "custom_branding": False,
            },
            LicenseVerifier.LICENSE_PRODUCTION: {
                "max_products": 10000,
                "max_orders_per_day": 1000,
                "max_customers": 50000,
                "advanced_analytics": True,
                "email_support": True,
                "payment_gateways": ["stripe", "paypal", "mpesa", "airtel"],
                "api_access": True,
                "custom_branding": True,
            },
            LicenseVerifier.LICENSE_ENTERPRISE: {
                "max_products": -1,  # Unlimited
                "max_orders_per_day": -1,  # Unlimited
                "max_customers": -1,  # Unlimited
                "advanced_analytics": True,
                "email_support": True,
                "payment_gateways": ["stripe", "paypal", "mpesa", "airtel", "custom"],
                "api_access": True,
                "custom_branding": True,
            },
        }

        return {
            "license_type": license_type,
            "installation_id": installation_id,
            "domain_valid": domain_valid,
            "features": features.get(
                license_type, features[LicenseVerifier.LICENSE_DEMO]
            ),
            "activated_at": datetime.now().isoformat(),
        }

    @staticmethod
    def check_feature_limit(feature_name, current_count):
        """Check if a feature limit has been reached"""
        license_info = cache.get("easycart_license_info")

        if not license_info:
            license_info = LicenseVerifier.get_license_info()
            cache.set("easycart_license_info", license_info, 3600)  # Cache for 1 hour

        features = license_info.get("features", {})
        limit = features.get(feature_name, 0)

        # -1 means unlimited
        if limit == -1:
            return True

        return current_count < limit

    @staticmethod
    def enforce_license():
        """Enforce license restrictions - call this on startup"""
        license_info = LicenseVerifier.get_license_info()

        logger.info("=" * 70)
        logger.info("EasyCart License Information")
        logger.info("=" * 70)
        logger.info(f"License Type: {license_info['license_type'].upper()}")
        logger.info(f"Installation ID: {license_info['installation_id']}")
        logger.info(
            f"Domain Validation: {'[PASSED]' if license_info['domain_valid'] else '[FAILED]'}"
        )
        logger.info("-" * 70)
        logger.info("Feature Limits:")
        for key, value in license_info["features"].items():
            if isinstance(value, int):
                display = "Unlimited" if value == -1 else str(value)
            else:
                display = str(value)
            logger.info(f"  {key}: {display}")
        logger.info("=" * 70)

        if license_info["license_type"] == LicenseVerifier.LICENSE_DEMO:
            logger.warning("[!] RUNNING IN DEMO MODE - Limited Features")
            logger.warning("[!] For commercial licensing: admin@easycart.com")

        # Cache license info
        cache.set("easycart_license_info", license_info, 3600)

        return license_info


class LicenseException(Exception):
    """Exception raised when license validation fails"""

    pass
