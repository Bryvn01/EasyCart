"""
Correlation ID Middleware
Injects unique request IDs for distributed tracing and log correlation.
"""

import uuid
from threading import current_thread
from django.utils.deprecation import MiddlewareMixin


class CorrelationIDMiddleware(MiddlewareMixin):
    """
    Add a unique correlation ID to each request for tracing across logs and services.
    The ID is:
    1. Injected into thread-local storage for logging
    2. Added to response headers for client-side tracing
    3. Propagated to downstream services
    """

    HEADER_NAME = "X-Correlation-ID"

    def process_request(self, request):
        # Check if correlation ID provided by client/load balancer
        correlation_id = request.META.get(
            f'HTTP_{self.HEADER_NAME.upper().replace("-", "_")}'
        )

        if not correlation_id:
            # Generate new correlation ID
            correlation_id = str(uuid.uuid4())

        # Store in request for access in views
        request.correlation_id = correlation_id

        # Store in thread-local for logging filter
        current_thread().correlation_id = correlation_id

    def process_response(self, request, response):
        # Add correlation ID to response headers
        if hasattr(request, "correlation_id"):
            response[self.HEADER_NAME] = request.correlation_id

        return response

    def process_exception(self, request, exception):
        # Ensure correlation ID is available even during exceptions
        if hasattr(request, "correlation_id"):
            current_thread().correlation_id = request.correlation_id
