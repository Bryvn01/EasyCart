"""
EasyCart Custom Middleware
Copyright (c) 2025 Bryvn01. All rights reserved.
"""

import logging
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from django.core.cache import cache
from .license import LicenseVerifier

logger = logging.getLogger(__name__)


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
