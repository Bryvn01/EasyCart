import logging
from django.http import JsonResponse
from django.core.exceptions import ValidationError, PermissionDenied
from rest_framework.views import exception_handler
from rest_framework import status

logger = logging.getLogger(__name__)

class ErrorHandlingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        logger.error(f"Unhandled exception: {exception}", exc_info=True)
        
        if isinstance(exception, ValidationError):
            return JsonResponse({
                'error': 'Validation error',
                'details': exception.message_dict if hasattr(exception, 'message_dict') else str(exception)
            }, status=400)
        
        if isinstance(exception, PermissionDenied):
            return JsonResponse({
                'error': 'Permission denied',
                'message': 'You do not have permission to perform this action'
            }, status=403)
        
        # Generic error response for production
        return JsonResponse({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }, status=500)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'error': True,
            'message': 'An error occurred',
            'details': response.data
        }
        response.data = custom_response_data
    
    return response