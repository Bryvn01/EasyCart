"""
Product caching utilities for Redis
"""

from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


def safe_delete_pattern(pattern):
    """Safely delete cache keys matching pattern, handling backends without delete_pattern"""
    try:
        if hasattr(cache, "delete_pattern"):
            cache.delete_pattern(pattern)
        else:
            # For backends without delete_pattern (like LocMemCache in tests)
            logger.debug(
                f"Cache backend doesn't support delete_pattern, skipping: {pattern}"
            )
    except Exception as e:
        logger.warning(f"Failed to delete cache pattern {pattern}: {e}")


class ProductCache:
    """Cache manager for product-related data"""

    PRODUCT_LIST_KEY = "products:list:{category}:{page}"
    PRODUCT_DETAIL_KEY = "products:detail:{id}"
    CATEGORY_LIST_KEY = "products:categories"
    FEATURED_PRODUCTS_KEY = "products:featured"

    TIMEOUT_SHORT = 300  # 5 minutes
    TIMEOUT_MEDIUM = 1800  # 30 minutes
    TIMEOUT_LONG = 3600  # 1 hour

    @classmethod
    def build_product_list_key(cls, category=None, page=1, query_fingerprint=None):
        """Build a cache key for product list responses."""
        if query_fingerprint:
            return f"products:list:{query_fingerprint}"
        return cls.PRODUCT_LIST_KEY.format(category=category or "all", page=page)

    @classmethod
    def get_product_list(cls, category=None, page=1, query_fingerprint=None):
        """Get cached product list"""
        key = cls.build_product_list_key(
            category=category, page=page, query_fingerprint=query_fingerprint
        )
        return cache.get(key)

    @classmethod
    def set_product_list(
        cls, data, category=None, page=1, query_fingerprint=None, timeout=None
    ):
        """Cache product list"""
        key = cls.build_product_list_key(
            category=category, page=page, query_fingerprint=query_fingerprint
        )
        cache.set(key, data, timeout or cls.TIMEOUT_SHORT)

    @classmethod
    def get_product_detail(cls, product_id):
        """Get cached product detail"""
        key = cls.PRODUCT_DETAIL_KEY.format(id=product_id)
        return cache.get(key)

    @classmethod
    def set_product_detail(cls, product_id, data, timeout=None):
        """Cache product detail"""
        key = cls.PRODUCT_DETAIL_KEY.format(id=product_id)
        cache.set(key, data, timeout or cls.TIMEOUT_MEDIUM)

    @classmethod
    def get_categories(cls):
        """Get cached categories"""
        return cache.get(cls.CATEGORY_LIST_KEY)

    @classmethod
    def set_categories(cls, data, timeout=None):
        """Cache categories"""
        cache.set(cls.CATEGORY_LIST_KEY, data, timeout or cls.TIMEOUT_LONG)

    @classmethod
    def invalidate_product(cls, product_id):
        """Invalidate product cache when updated"""
        key = cls.PRODUCT_DETAIL_KEY.format(id=product_id)
        cache.delete(key)
        # Also clear product lists
        safe_delete_pattern("products:list:*")

    @classmethod
    def invalidate_all(cls):
        """Clear all product caches"""
        safe_delete_pattern("products:*")


class CartCache:
    """Cache manager for shopping cart"""

    CART_KEY = "cart:{user_id}"
    TIMEOUT = 604800  # 7 days

    @classmethod
    def get_cart(cls, user_id):
        """Get user's cart from cache"""
        key = cls.CART_KEY.format(user_id=user_id)
        return cache.get(key, {})

    @classmethod
    def set_cart(cls, user_id, cart_data):
        """Save user's cart to cache"""
        key = cls.CART_KEY.format(user_id=user_id)
        cache.set(key, cart_data, cls.TIMEOUT)

    @classmethod
    def clear_cart(cls, user_id):
        """Clear user's cart"""
        key = cls.CART_KEY.format(user_id=user_id)
        cache.delete(key)
