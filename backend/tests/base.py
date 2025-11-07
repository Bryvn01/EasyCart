"""
Base test classes with common configuration.
"""

from django.test import TestCase, override_settings
from rest_framework.test import APITestCase


# Disable rate limiting and caching for tests
@override_settings(
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
)
class BaseAPITestCase(APITestCase):
    """
    Base test case for API tests with common configuration.
    Disables caching and rate limiting for consistent test execution.
    """
    pass
