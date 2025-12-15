"""
Advanced Cache Management Utilities
Implements cache tagging, invalidation strategies, and cache warming for optimal performance.
"""

import hashlib
import logging
from typing import Any, List, Callable
from functools import wraps
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)


class CacheManager:
    """
    Advanced cache management with tagging and invalidation support.
    """

    # Cache TTL configurations (in seconds)
    TTL_SHORT = 60  # 1 minute - frequently changing data
    TTL_MEDIUM = 300  # 5 minutes - moderate change frequency
    TTL_LONG = 1800  # 30 minutes - relatively static
    TTL_VERY_LONG = 3600  # 1 hour - very stable data
    TTL_DAY = 86400  # 1 day - static reference data

    # Cache key prefixes for organization
    PREFIX_PRODUCT = "product"
    PREFIX_CART = "cart"
    PREFIX_USER = "user"
    PREFIX_ORDER = "order"
    PREFIX_CATEGORY = "category"

    @staticmethod
    def generate_key(*args, **kwargs) -> str:
        """
        Generate consistent cache key from arguments.

        Args:
            *args: Positional arguments to include in key
            **kwargs: Keyword arguments to include in key

        Returns:
            Consistent cache key string
        """
        # Sort kwargs for consistency
        sorted_kwargs = sorted(kwargs.items())

        # Create key components
        key_parts = [str(arg) for arg in args]
        key_parts.extend([f"{k}={v}" for k, v in sorted_kwargs])

        # Join and hash if too long
        key_string = ":".join(key_parts)

        if len(key_string) > 200:
            # Hash long keys to keep Redis key size manageable
            key_hash = hashlib.md5(key_string.encode()).hexdigest()
            return f"cached:{key_hash}"

        return f"cached:{key_string}"

    @staticmethod
    def get_or_set(
        key: str, default_fn: Callable, ttl: int = TTL_MEDIUM, tags: List[str] = None
    ) -> Any:
        """
        Get from cache or compute and store if missing.

        Args:
            key: Cache key
            default_fn: Function to compute value if cache miss
            ttl: Time to live in seconds
            tags: List of tags for cache invalidation

        Returns:
            Cached or computed value
        """
        value = cache.get(key)

        if value is not None:
            logger.debug(f"Cache HIT: {key}")
            return value

        logger.debug(f"Cache MISS: {key}")
        value = default_fn()

        # Store in cache
        cache.set(key, value, timeout=ttl)

        # Store tags for invalidation
        if tags:
            CacheManager._add_tags(key, tags)

        return value

    @staticmethod
    def invalidate_by_tag(tag: str):
        """
        Invalidate all cache entries with a specific tag.

        Args:
            tag: Tag to invalidate
        """
        tag_key = f"tag:{tag}"
        keys = cache.get(tag_key, [])

        if keys:
            logger.info(f"Invalidating {len(keys)} cache entries for tag: {tag}")
            cache.delete_many(keys)
            cache.delete(tag_key)

    @staticmethod
    def invalidate_pattern(pattern: str):
        """
        Invalidate cache entries matching a pattern.
        Note: Requires Redis backend with keys() support.

        Args:
            pattern: Pattern to match (e.g., 'product:*')
        """
        try:
            from django_redis import get_redis_connection

            redis_conn = get_redis_connection("default")
            keys = redis_conn.keys(
                f"{settings.CACHES['default']['KEY_PREFIX']}:{pattern}"
            )

            if keys:
                logger.info(
                    f"Invalidating {len(keys)} cache entries matching: {pattern}"
                )
                redis_conn.delete(*keys)
        except Exception as e:
            logger.error(f"Pattern invalidation failed: {e}")

    @staticmethod
    def _add_tags(key: str, tags: List[str]):
        """
        Associate cache key with tags for invalidation.

        Args:
            key: Cache key
            tags: List of tags
        """
        for tag in tags:
            tag_key = f"tag:{tag}"
            tagged_keys = cache.get(tag_key, [])

            if key not in tagged_keys:
                tagged_keys.append(key)
                cache.set(tag_key, tagged_keys, timeout=None)  # Tags don't expire

    @staticmethod
    def warm_cache(data_loaders: dict):
        """
        Pre-populate cache with frequently accessed data.

        Args:
            data_loaders: Dict of {cache_key: loader_function}
        """
        logger.info(f"Warming cache with {len(data_loaders)} entries")

        for key, loader in data_loaders.items():
            try:
                value = loader()
                cache.set(key, value, timeout=CacheManager.TTL_LONG)
                logger.debug(f"Cache warmed: {key}")
            except Exception as e:
                logger.error(f"Cache warming failed for {key}: {e}")


def cached_view(
    ttl: int = CacheManager.TTL_MEDIUM, key_prefix: str = "", tags: List[str] = None
):
    """
    Decorator for caching view results.

    Args:
        ttl: Cache time-to-live in seconds
        key_prefix: Prefix for cache key
        tags: Tags for cache invalidation

    Example:
        @cached_view(ttl=300, key_prefix='products', tags=['products'])
        def get_product_list(request):
            ...
    """

    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Build cache key from request parameters
            query_params = sorted(request.GET.items())
            cache_key = CacheManager.generate_key(
                key_prefix,
                func.__name__,
                *args,
                **{k: v for k, v in query_params},
                **kwargs,
            )

            # Try to get from cache
            def compute():
                return func(request, *args, **kwargs)

            return CacheManager.get_or_set(cache_key, compute, ttl=ttl, tags=tags)

        return wrapper

    return decorator


def invalidate_user_cache(user_id: int):
    """
    Invalidate all cache entries for a specific user.

    Args:
        user_id: User ID
    """
    CacheManager.invalidate_by_tag(f"user:{user_id}")


def invalidate_product_cache(product_id: int = None):
    """
    Invalidate product cache entries.

    Args:
        product_id: Optional specific product ID, or all products if None
    """
    if product_id:
        CacheManager.invalidate_by_tag(f"product:{product_id}")
    else:
        CacheManager.invalidate_by_tag("products")


def invalidate_cart_cache(user_id: int):
    """
    Invalidate cart cache for a user.

    Args:
        user_id: User ID
    """
    CacheManager.invalidate_pattern(f"cart:{user_id}:*")


def get_cache_stats() -> dict:
    """
    Get cache statistics for monitoring.

    Returns:
        Dict with cache metrics
    """
    try:
        from django_redis import get_redis_connection

        redis_conn = get_redis_connection("default")
        info = redis_conn.info("stats")

        return {
            "hits": info.get("keyspace_hits", 0),
            "misses": info.get("keyspace_misses", 0),
            "hit_rate": (
                info.get("keyspace_hits", 0)
                / (info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0))
                if (info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0)) > 0
                else 0
            )
            * 100,
        }
    except Exception as e:
        logger.error(f"Failed to get cache stats: {e}")
        return {}
