from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from apps.products.health_views import health_check, liveness_probe, readiness_probe

def api_root(request):
    return JsonResponse({
        'message': 'E-Commerce API',
        'admin': '/admin/',
        'endpoints': {
            'products': '/api/products/',
            'categories': '/api/products/categories/',
            'auth': '/api/auth/',
            'orders': '/api/orders/',
            'payments': '/api/payments/',
            'health': '/api/health/',
            'liveness': '/api/health/live/',
            'readiness': '/api/health/ready/'
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/health/', health_check, name='health-check'),
    path('api/health/live/', liveness_probe, name='liveness-probe'),
    path('api/health/ready/', readiness_probe, name='readiness-probe'),
    path('admin/', admin.site.urls, name='django-admin'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/admin/', include('apps.admin_dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)