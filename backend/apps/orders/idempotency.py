"""
Idempotency middleware for cart and checkout operations
Prevents duplicate cart additions and duplicate charges
"""
import hashlib
import json
from django.core.cache import cache
from django.http import JsonResponse
from functools import wraps


def generate_idempotency_key(user_id, operation, data):
    """Generate idempotency key from user, operation, and data"""
    content = f"{user_id}:{operation}:{json.dumps(data, sort_keys=True)}"
    return hashlib.sha256(content.encode()).hexdigest()


def idempotent_operation(operation_name, ttl=300):
    """
    Decorator to make operations idempotent
    TTL is in seconds (default 5 minutes)
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if request.method not in ['POST', 'PUT', 'PATCH']:
                return view_func(request, *args, **kwargs)
            
            # Get idempotency key from header or generate from request
            idempotency_key = request.headers.get('X-Idempotency-Key')
            
            if not idempotency_key:
                # Generate key from user and request data
                user_id = request.user.id if request.user.is_authenticated else 'anonymous'
                try:
                    data = json.loads(request.body.decode('utf-8')) if request.body else {}
                except (json.JSONDecodeError, UnicodeDecodeError):
                    data = {}
                
                idempotency_key = generate_idempotency_key(user_id, operation_name, data)
            
            cache_key = f"idempotency:{operation_name}:{idempotency_key}"
            
            # Check if operation already processed
            cached_response = cache.get(cache_key)
            if cached_response:
                return JsonResponse(cached_response, status=cached_response.get('status', 200))
            
            # Process the operation
            response = view_func(request, *args, **kwargs)
            
            # Cache successful responses
            if hasattr(response, 'status_code') and 200 <= response.status_code < 300:
                try:
                    response_data = json.loads(response.content.decode('utf-8'))
                    response_data['status'] = response.status_code
                    cache.set(cache_key, response_data, ttl)
                except (json.JSONDecodeError, AttributeError):
                    pass
            
            return response
        
        return wrapper
    return decorator


class IdempotencyMiddleware:
    """
    Middleware to handle idempotency for cart and payment operations
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.idempotent_paths = [
            '/api/orders/cart/add/',
            '/api/orders/checkout/',
            '/api/payments/initiate/'
        ]
    
    def __call__(self, request):
        # Check if path requires idempotency
        if any(request.path.startswith(path) for path in self.idempotent_paths):
            if request.method in ['POST', 'PUT', 'PATCH']:
                idempotency_key = request.headers.get('X-Idempotency-Key')
                
                if idempotency_key:
                    cache_key = f"idempotency:{request.path}:{idempotency_key}"
                    cached_response = cache.get(cache_key)
                    
                    if cached_response:
                        return JsonResponse(cached_response)
        
        response = self.get_response(request)
        return response
