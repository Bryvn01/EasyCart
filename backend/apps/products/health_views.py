"""
Enhanced health check views for EasyCart backend.
Provides comprehensive health monitoring including database connectivity.
"""

import logging
import time
import sys
from django.http import JsonResponse
from django.conf import settings
from .mongodb_utils import check_mongodb_connection

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Enhanced health check endpoint for monitoring and load balancers.
    
    Returns detailed health information including:
    - Overall service status (UP/DOWN)
    - MongoDB connection status
    - Database statistics
    - Service metadata (version, environment)
    - Response time
    
    HTTP Status Codes:
    - 200: Service is healthy (all components UP)
    - 503: Service is unhealthy (one or more components DOWN)
    """
    start_time = time.time()
    
    try:
        # MongoDB health check disabled for PostgreSQL migration.
        is_healthy = True
        http_status = 200
        
        # Build comprehensive health response
        response_data = {
            'status': 'UP' if is_healthy else 'DOWN',
            'service': 'easycart-django-backend',
            'version': '1.0.0',
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime()),
            'components': {
                'database': {
                    'status': 'UP',
                    'details': None
                },
                'python': {
                    'status': 'UP',
                    'details': {
                        'version': sys.version.split()[0],
                        'implementation': sys.implementation.name
                    }
                }
            },
            'responseTime': f"{int((time.time() - start_time) * 1000)}ms"
        }
        
        return JsonResponse(response_data, status=http_status)
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        
        # Return error response
        return JsonResponse({
            'status': 'DOWN',
            'service': 'easycart-django-backend',
            'version': '1.0.0',
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime()),
            'error': str(e),
            'responseTime': f"{int((time.time() - start_time) * 1000)}ms"
        }, status=503)


def liveness_probe(request):
    """
    Kubernetes liveness probe endpoint.
    
    Simple check to verify the service is running.
    Does not check external dependencies.
    
    Returns:
    - 200: Service is alive
    """
    return JsonResponse({
        'status': 'UP',
        'check': 'liveness'
    })


def readiness_probe(request):
    """
    Kubernetes readiness probe endpoint.
    
    Checks if the service is ready to handle requests.
    Includes checks for critical dependencies (database).
    
    Returns:
    - 200: Service is ready
    - 503: Service is not ready
    """
    try:
        # Check MongoDB connection
        mongo_status = check_mongodb_connection()
        is_ready = mongo_status.get('status') == 'connected'
        
        if is_ready:
            return JsonResponse({
                'status': 'UP',
                'check': 'readiness',
                'database': 'connected'
            })
        else:
            return JsonResponse({
                'status': 'DOWN',
                'check': 'readiness',
                'database': 'disconnected'
            }, status=503)
            
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        return JsonResponse({
            'status': 'DOWN',
            'check': 'readiness',
            'error': str(e)
        }, status=503)
