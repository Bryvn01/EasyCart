from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from .views import test_cloudinary

def api_root(request):
    return JsonResponse({
        'message': 'E-Commerce API',
        'admin': '/admin/',
        'endpoints': {
            'products': '/api/products/',
            'auth': '/api/auth/',
            'orders': '/api/orders/'
        }
    })

def health_check(request):
    """Health check endpoint for monitoring and load balancers"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'easycart-backend',
        'version': '1.0.0'
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/health/', health_check, name='health-check'),
    # TODO: Remove this endpoint after confirming Cloudinary integration.
    path('api/test-cloudinary/', test_cloudinary, name='test-cloudinary'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/admin/', include('apps.admin_dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)