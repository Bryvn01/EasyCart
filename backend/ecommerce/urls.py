from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from apps.products.health_views import health_check
from utils.health_checks import (
    HealthCheckView,
    ReadinessCheckView,
    LivenessCheckView,
    MetricsView,
)


def api_root(request):
    """
    API root endpoint following REST best practices.

    Returns:
    - Service metadata (name, version, description)
    - Available API endpoints with descriptions
    - API documentation link
    - Health check endpoints

    HTTP Status: 200 OK
    """
    endpoints = {
        "products": {
            "url": "/api/products/",
            "description": "Product catalog and inventory management",
            "methods": ["GET", "POST", "PUT", "DELETE"],
        },
        "categories": {
            "url": "/api/products/categories/",
            "description": "Product category management",
            "methods": ["GET", "POST", "PUT", "DELETE"],
        },
        "auth": {
            "url": "/api/auth/",
            "description": "Authentication and user management",
            "methods": ["POST"],
            "endpoints": {
                "login": "/api/auth/login/",
                "register": "/api/auth/register/",
                "otp_request": "/api/auth/otp/request/",
                "otp_verify": "/api/auth/otp/verify/",
                "profile": "/api/auth/profile/",
            },
        },
        "orders": {
            "url": "/api/orders/",
            "description": "Order processing and management",
            "methods": ["GET", "POST", "PUT", "DELETE"],
        },
        "payments": {
            "url": "/api/payments/",
            "description": "Payment processing and transactions",
            "methods": ["GET", "POST"],
        },
        "health": {
            "url": "/api/health/",
            "description": "Comprehensive health check with component status",
            "methods": ["GET"],
        },
        "liveness": {
            "url": "/api/health/live/",
            "description": "Kubernetes liveness probe (service running)",
            "methods": ["GET"],
        },
        "readiness": {
            "url": "/api/health/ready/",
            "description": "Kubernetes readiness probe (service ready)",
            "methods": ["GET"],
        },
    }

    response_data = {
        "name": "EasyCart E-Commerce API",
        "version": "1.0.0",
        "description": "RESTful API for EasyCart online shopping platform",
        "status": "operational",
        "api_version": "v1",
        "endpoints": endpoints,
        "documentation": "/api/docs/",  # Future: API documentation
        "support": {"email": "support@easycart.com", "website": "https://easycart.com"},
    }

    # Only expose admin URL in debug mode (security best practice)
    if settings.DEBUG:
        response_data["admin"] = {
            "url": "/admin/",
            "description": "Django admin interface (development only)",
            "methods": ["GET", "POST"],
        }

    return JsonResponse(response_data, json_dumps_params={"indent": 2})


urlpatterns = [
    path("", api_root, name="api-root"),
    path("api/", api_root, name="api-root-explicit"),
    # Enhanced health checks with comprehensive monitoring
    path("api/health/", HealthCheckView.as_view(), name="health-check-enhanced"),
    path("api/health/ready/", ReadinessCheckView.as_view(), name="readiness-check"),
    path("api/health/live/", LivenessCheckView.as_view(), name="liveness-check"),
    path(
        "api/health/legacy/", health_check, name="health-check-legacy"
    ),  # Keep old endpoint for backward compatibility
    path(
        "api/metrics/", MetricsView.as_view(), name="metrics"
    ),  # Staff-only metrics endpoint
    path("admin/", admin.site.urls, name="django-admin"),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/products/", include("apps.products.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/admin/", include("apps.admin_dashboard.urls")),
    path("api/support/", include("apps.support.urls")),
    path("api/pos/", include("apps.pos.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
