import logging
import time
from django.http import JsonResponse
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import OperationalError, connection
from rest_framework.views import exception_handler
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class DatabaseRetryMiddleware(MiddlewareMixin):
    """
    Middleware to handle transient database connection errors with automatic retry logic.
    Handles Railway free tier database sleep/wake cycles gracefully.
    """

    MAX_RETRIES = 3
    RETRY_DELAY = 2  # seconds (increased for Railway wake-up)
    MAX_DELAY = 8  # seconds

    def __call__(self, request):
        """
        Process request with automatic retry on transient database errors.

        This middleware will retry the entire request up to MAX_RETRIES times
        if a transient database error occurs, giving the database time to
        wake up (important for Railway free tier).
        """
        delay = self.RETRY_DELAY
        last_exception = None

        for attempt in range(self.MAX_RETRIES + 1):
            try:
                # Close stale connections before retry
                if attempt > 0:
                    connection.close()
                    logger.info(
                        f"Retrying request {request.path} (attempt {attempt + 1}/{self.MAX_RETRIES + 1}) "
                        f"after {delay}s delay"
                    )
                    time.sleep(delay)

                # Process the request
                response = self.get_response(request)

                # If we retried and succeeded, log it
                if attempt > 0:
                    logger.info(
                        f"Request {request.path} succeeded after {attempt + 1} attempts"
                    )

                return response

            except OperationalError as e:
                error_msg = str(e).lower()
                last_exception = e

                # Check if this is a transient error we should retry
                transient_errors = [
                    "database system is starting up",
                    "server closed the connection",
                    "connection refused",
                    "could not connect",
                    "timeout expired",
                ]

                is_transient = any(msg in error_msg for msg in transient_errors)

                if is_transient and attempt < self.MAX_RETRIES:
                    logger.warning(
                        f"Transient database error on {request.path} "
                        f"(attempt {attempt + 1}/{self.MAX_RETRIES + 1}): {error_msg}"
                    )
                    # Exponential backoff with cap
                    delay = min(delay * 1.5, self.MAX_DELAY)
                    continue
                else:
                    # Non-transient error or max retries exceeded
                    if attempt >= self.MAX_RETRIES:
                        logger.error(
                            f"Database connection failed after {self.MAX_RETRIES + 1} attempts "
                            f"for {request.path}: {error_msg}"
                        )
                    # Re-raise to let Django handle it
                    raise

        # If we exhausted retries, return 503
        if last_exception:
            logger.error(
                f"All retry attempts exhausted for {request.path}. "
                f"Last error: {last_exception}"
            )
            return JsonResponse(
                {
                    "error": "Database temporarily unavailable",
                    "message": "The database is waking up. Please try again in 30-60 seconds.",
                    "retry": True,
                    "attempts": self.MAX_RETRIES + 1,
                    "help": "Railway free tier databases sleep after 15min inactivity",
                },
                status=503,
            )

        # Should never reach here, but return normal response
        return self.get_response(request)


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
