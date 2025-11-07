# Caching Strategy - EasyCart

## Overview

EasyCart implements a multi-layer caching strategy using Redis (backend) and React Query (frontend) to achieve <200ms API response times and >80% cache hit ratio.

## Backend Caching (Redis)

### Configuration

Location: `backend/ecommerce/settings.py`

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'IGNORE_EXCEPTIONS': True,
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'CONNECTION_POOL_KWARGS': {'max_connections': 50},
        },
        'KEY_PREFIX': 'easycart',
        'TIMEOUT': 300,  # 5 minutes default
    }
}
```

### Cache Keys

**Product List**: `products:list:{category}:{page}`
- Timeout: 5 minutes (300s)
- Invalidated: On product create/update/delete

**Product Detail**: `products:detail:{id}`
- Timeout: 30 minutes (1800s)
- Invalidated: On product update/delete

**Categories**: `products:categories`
- Timeout: 1 hour (3600s)
- Invalidated: On category create/update/delete

**Cart**: `cart:{user_id}`
- Timeout: 7 days (604800s)
- Invalidated: On cart update/checkout

### Implementation

Location: `backend/apps/products/cache.py`

```python
class ProductCache:
    @classmethod
    def get_product_list(cls, category=None, page=1):
        key = cls.PRODUCT_LIST_KEY.format(category=category or "all", page=page)
        return cache.get(key)

    @classmethod
    def set_product_list(cls, data, category=None, page=1):
        key = cls.PRODUCT_LIST_KEY.format(category=category or "all", page=page)
        cache.set(key, data, cls.TIMEOUT_SHORT)

    @classmethod
    def invalidate_product(cls, product_id):
        cache.delete(cls.PRODUCT_DETAIL_KEY.format(id=product_id))
        cache.delete_pattern("products:list:*")
```

### Cache Flow

1. **Request arrives** → Check cache
2. **Cache hit** → Return cached data (fast path)
3. **Cache miss** → Query database → Cache result → Return data
4. **Cache invalidation** → On data modification → Clear relevant cache keys

## Frontend Caching (React Query)

### Configuration

Location: `frontend/src/App.js`

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      cacheTime: 10 * 60 * 1000,       // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});
```

### Query Keys

**Products**: `['products', { page, pageSize, search, category, ordering, priceRange }]`
- Stale time: 5 minutes
- Cache time: 10 minutes

**Product Detail**: `['product', id]`
- Stale time: 15 minutes
- Cache time: 10 minutes

**Categories**: `['categories']`
- Stale time: 1 hour
- Cache time: 2 hours

### Implementation

Location: `frontend/src/hooks/useProducts.js`

```javascript
export const useProducts = ({ page, pageSize, search, category, ordering, priceRange }) => {
  const queryKey = ['products', { page, pageSize, search, category, ordering, priceRange }];

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await productsAPI.getProducts(params);
      return processResponse(response);
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
  });

  return { products: data?.products, loading: isLoading, refetch };
};
```

### Cache Features

1. **Automatic Caching**: Query results cached automatically
2. **Smart Refetching**: Only refetch stale data
3. **Background Updates**: Keep UI responsive while refetching
4. **Cache Persistence**: Data persists across navigation
5. **Optimistic Updates**: Instant UI updates before server response

## Cache Invalidation Strategy

### Backend

**On Product Update**:
```python
def update_product(product_id, data):
    product = update_product_in_db(product_id, data)
    ProductCache.invalidate_product(product_id)
    return product
```

**On Product Delete**:
```python
def delete_product(product_id):
    delete_product_from_db(product_id)
    ProductCache.invalidate_product(product_id)
```

### Frontend

**Manual Invalidation**:
```javascript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries(['products']);

// Invalidate and refetch
queryClient.invalidateQueries(['product', productId]);
```

**Optimistic Updates**:
```javascript
const mutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async (newProduct) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['product', productId]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['product', productId]);
    
    // Optimistically update
    queryClient.setQueryData(['product', productId], newProduct);
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['product', productId], context.previous);
  },
});
```

## Performance Monitoring

### Cache Hit Rate

**Backend (Redis)**:
```python
import logging

logger = logging.getLogger(__name__)

def get_with_metrics(key):
    data = cache.get(key)
    if data:
        logger.info(f'Cache HIT: {key}')
    else:
        logger.info(f'Cache MISS: {key}')
    return data
```

**Frontend (React Query DevTools)**:
- Open DevTools in development
- Monitor query status (fresh, stale, inactive)
- View cache size and entries
- Track refetch patterns

### Metrics to Track

1. **Cache Hit Ratio**: Target >80%
2. **Average Response Time**: Target <200ms
3. **Cache Size**: Monitor memory usage
4. **Stale Data Rate**: Balance freshness vs performance

## Best Practices

### 1. Cache What's Frequently Accessed

✅ Product listings
✅ Category data
✅ User cart
✅ Product details

❌ Admin operations
❌ Real-time inventory
❌ Payment transactions

### 2. Set Appropriate TTLs

- **Frequently changing**: 5 minutes
- **Moderately stable**: 30 minutes
- **Rarely changing**: 1+ hour

### 3. Invalidate Strategically

- Invalidate specific keys when possible
- Use pattern matching for bulk invalidation
- Clear cache on data modifications

### 4. Monitor Performance

- Track cache hit rates
- Monitor response times
- Set up alerts for cache failures

### 5. Handle Cache Failures

```python
CACHES = {
    'default': {
        'OPTIONS': {
            'IGNORE_EXCEPTIONS': True,  # Don't crash if Redis is down
        }
    }
}
```

## Troubleshooting

### High Cache Miss Rate
1. Check TTL settings (may be too short)
2. Verify cache key consistency
3. Review invalidation patterns

### Stale Data Issues
1. Reduce stale time
2. Implement cache invalidation on updates
3. Use optimistic updates

### Memory Issues
1. Reduce cache time
2. Limit cache size
3. Clear inactive queries

### Redis Connection Issues
1. Check REDIS_URL configuration
2. Verify network connectivity
3. Check Redis server status

## Redis Deployment (Render.com)

### Setup

1. Add Redis service in Render dashboard
2. Get REDIS_URL from service info
3. Add to environment variables:
   ```
   REDIS_URL=redis://red-xxxxx:6379
   ```

### Configuration

```yaml
# render.yaml
services:
  - type: redis
    name: easycart-redis
    plan: starter
    maxmemoryPolicy: allkeys-lru
```

### Monitoring

- Check Redis metrics in Render dashboard
- Monitor memory usage
- Track connection count
- Review eviction statistics

## References

- [Redis Documentation](https://redis.io/documentation)
- [Django Redis](https://github.com/jazzband/django-redis)
- [React Query](https://tanstack.com/query/latest)
- [Caching Best Practices](https://web.dev/cache-api-quick-guide/)
