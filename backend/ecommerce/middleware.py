import logging
from django.http import JsonResponse
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import OperationalError
from rest_framework.views import exception_handler
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class DatabaseRetryMiddleware(MiddlewareMixin):
    """
    Retry database connections when database is starting up.
    Handles transient errors like "database system is starting up" from Railway.
    """

    MAX_RETRIES = 3
    RETRY_DELAY = 1  # seconds

    def process_exception(self, request, exception):
        if isinstance(exception, OperationalError):
            error_msg = str(exception).lower()
            # Check for transient database errors
            if any(
                msg in error_msg
                for msg in [
                    "database system is starting up",
                    "server closed the connection",
                    "connection refused",
                ]
            ):
                logger.warning(
                    f"Transient database error detected: {error_msg}. Request will be retried."
                )
                # Let Django's default error handling occur
                # The CONN_HEALTH_CHECKS will handle reconnection
                return JsonResponse(
                    {
                        "error": "Database temporarily unavailable",
                        "message": "Please try again in a moment",
                        "retry": True,
                    },
                    status=503,  # Service Unavailable
                )
        return None


class DisableCSRFForAPIMiddleware(MiddlewareMixin):
    """
    Disable CSRF protection for API endpoints that use JWT authentication.
    CSRF is not needed for stateless JWT authentication.
    """

    def process_request(self, request):
        if request.path.startswith("/api/"):
            setattr(request, "_dont_enforce_csrf_checks", True)
            logger.info(f"CSRF disabled for {request.path}")


class ErrorHandlingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        logger.error(f"Unhandled exception: {exception}", exc_info=True)

        if isinstance(exception, ValidationError):
            return JsonResponse(
                {
                    "error": "Validation error",
                    "details": (
                        exception.message_dict
                        if hasattr(exception, "message_dict")
                        else str(exception)
                    ),
                },
                status=400,
            )

        if isinstance(exception, PermissionDenied):
            return JsonResponse(
                {
                    "error": "Permission denied",
                    "message": "You do not have permission to perform this action",
                },
                status=403,
            )

        # Generic error response for production
        return JsonResponse(
            {
                "error": "Internal server error",
                "message": "An unexpected error occurred",
            },
            status=500,
        )


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_response_data = {
            "error": True,
            "message": "An error occurred",
            "details": response.data,
        }
        response.data = custom_response_data

    return response
