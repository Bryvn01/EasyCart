from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from apps.products.mongodb_utils import check_mongodb_connection

def api_root(request):
    return JsonResponse({
        'message': 'E-Commerce API',
        'admin': '/admin/',
        'endpoints': {
            'products': '/api/products/',
            'categories': '/api/products/categories/',
            'auth': '/api/auth/',
            'orders': '/api/orders/',
            'health': '/api/health/'
        }
    })

def health_check(request):
    """Health check endpoint for monitoring and load balancers"""
    try:
        # Check MongoDB connection
        mongo_status = check_mongodb_connection()
        
        return JsonResponse({
            'status': 'healthy',
            'service': 'easycart-backend',
            'version': '1.0.0',
            'database': mongo_status
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'service': 'easycart-backend',
            'version': '1.0.0',
            'error': str(e)
        }, status=500)

urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/admin/', include('apps.admin_dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)