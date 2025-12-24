"""
EasyCart Custom Middleware
Copyright (c) 2025 Bryvn01. All rights reserved.
"""

import logging
import json
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from .license import LicenseVerifier

logger = logging.getLogger(__name__)
audit_logger = logging.getLogger("audit")


class LicenseEnforcementMiddleware:
    """
    Middleware to enforce license restrictions on every request.
    Prevents unauthorized use of the platform.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip license check for static files and admin media
        if request.path.startswith("/static/") or request.path.startswith("/media/"):
            return self.get_response(request)

        # Check license periodically (every 5 minutes)
        license_info = cache.get("easycart_license_info")

        if not license_info:
            try:
                license_info = LicenseVerifier.get_license_info()
                cache.set("easycart_license_info", license_info, 300)  # 5 minutes
            except Exception as e:
                logger.error(f"License verification failed: {e}")
                return JsonResponse(
                    {
                        "error": "License verification failed",
                        "message": "Unable to verify EasyCart license. Contact support.",
                        "support": "admin@easycart.com",
                    },
                    status=500,
                )

        # Attach license info to request for use in views
        request.easycart_license = license_info

        # For DEMO licenses, add a header to all responses
        response = self.get_response(request)

        if license_info.get("license_type") == LicenseVerifier.LICENSE_DEMO:
            response["X-EasyCart-License"] = "DEMO"
            response["X-EasyCart-Info"] = (
                "Contact admin@easycart.com for commercial licensing"
            )

        return response


class DomainLockMiddleware:
    """
    Middleware to restrict the application to authorized domains only.
    Prevents running on unauthorized servers.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip for development (localhost)
        host = request.get_host().split(":")[0]  # Remove port

        # Allow localhost and 127.0.0.1 for development
        if host in ["localhost", "127.0.0.1", "testserver"]:
            return self.get_response(request)

        # Check if host is in ALLOWED_HOSTS
        allowed_hosts = settings.ALLOWED_HOSTS

        if "*" in allowed_hosts:
            logger.warning(f"Wildcard ALLOWED_HOSTS - Request from: {host}")
            return self.get_response(request)

        # Strict domain checking for production
        if host not in allowed_hosts:
            logger.error(f"Unauthorized domain access attempt: {host}")

            # Return HTML response for browsers, JSON for API
            if request.path.startswith("/api/"):
                return JsonResponse(
                    {
                        "error": "Unauthorized Domain",
                        "message": "This EasyCart installation is not licensed for this domain.",
                        "domain": host,
                        "contact": "admin@easycart.com",
                    },
                    status=403,
                )
            else:
                return HttpResponse(
                    f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Unauthorized Domain - EasyCart</title>
                        <style>
                            body {{
                                font-family: Arial, sans-serif;
                                text-align: center;
                                padding: 50px;
                                background: #f5f5f5;
                            }}
                            .container {{
                                background: white;
                                padding: 40px;
                                border-radius: 10px;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                max-width: 600px;
                                margin: 0 auto;
                            }}
                            h1 {{ color: #d32f2f; }}
                            .domain {{
                                color: #666;
                                font-family: monospace;
                                background: #f5f5f5;
                                padding: 10px;
                                border-radius: 5px;
                                margin: 20px 0;
                            }}
                            .contact {{
                                margin-top: 30px;
                                padding: 20px;
                                background: #e3f2fd;
                                border-radius: 5px;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>⚠️ Unauthorized Domain</h1>
                            <p>This EasyCart installation is not licensed for this domain.</p>
                            <div class="domain">Domain: {host}</div>
                            <p>This software is proprietary and protected by copyright law.</p>
                            <div class="contact">
                                <h3>To activate this domain:</h3>
                                <p>Contact: <strong>admin@easycart.com</strong></p>
                                <p>Visit: <strong>github.com/Bryvn01/EasyCart</strong></p>
                            </div>
                            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                                © 2025 Bryvn01. All rights reserved.
                            </p>
                        </div>
                    </body>
                    </html>
                    """,
                    status=403,
                )

        return self.get_response(request)


class BrandingMiddleware:
    """
    Add EasyCart branding and copyright information to responses.
    Makes it obvious if someone is using unauthorized copies.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Add headers to all responses
        response["X-Powered-By"] = "EasyCart v1.0.0"
        response["X-Copyright"] = "© 2025 Bryvn01. All rights reserved."
        response["X-License"] = "Proprietary - See LICENSE file"

        return response


class AuditLogMiddleware:
    """
    Middleware to log superadmin actions for audit trails.
    Logs all POST, PUT, PATCH, DELETE requests made by superadmin users.

    Logs include:
    - Timestamp
    - User information
    - HTTP method and path
    - Request body
    - Response status code
    - IP address
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only audit destructive methods
        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            # Check if user is authenticated and is superadmin
            if hasattr(request, "user") and request.user.is_authenticated:
                if request.user.is_superuser or request.user.is_staff:
                    # Capture request body before processing
                    try:
                        request_body = json.loads(request.body) if request.body else {}
                    except Exception:
                        request_body = request.POST.dict() if request.POST else {}

                    # Process request
                    response = self.get_response(request)

                    # Log the action after response
                    self._log_audit(request, response, request_body)

                    return response

        # For non-auditable requests, just pass through
        return self.get_response(request)

    def _log_audit(self, request, response, request_body):
        """
        Log audit information to audit logger.
        """
        try:
            # Get client IP
            ip = self._get_client_ip(request)

            # Prepare audit log entry
            audit_data = {
                "timestamp": timezone.now().isoformat(),
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": getattr(request.user, "email", ""),
                    "is_superuser": request.user.is_superuser,
                    "is_staff": request.user.is_staff,
                },
                "request": {
                    "method": request.method,
                    "path": request.path,
                    "query_params": dict(request.GET),
                    "body": self._sanitize_body(request_body),
                },
                "response": {
                    "status_code": response.status_code,
                },
                "ip_address": ip,
                "user_agent": request.META.get("HTTP_USER_AGENT", ""),
            }

            # Log as JSON for easy parsing
            audit_logger.info(json.dumps(audit_data))

        except Exception as e:
            logger.error(f"Failed to log audit entry: {e}")

    def _get_client_ip(self, request):
        """
        Get the real client IP address from request.
        Handles proxies and load balancers.
        """
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR", "")
        return ip

    def _sanitize_body(self, body):
        """
        Remove sensitive fields from request body before logging.
        """
        if not isinstance(body, dict):
            return body

        # List of sensitive field names to redact
        sensitive_fields = [
            "password",
            "password_confirmation",
            "token",
            "secret",
            "api_key",
            "access_token",
            "refresh_token",
            "credit_card",
            "cvv",
            "ssn",
        ]

        sanitized = body.copy()
        for field in sensitive_fields:
            if field in sanitized:
                sanitized[field] = "***REDACTED***"

        return sanitized
