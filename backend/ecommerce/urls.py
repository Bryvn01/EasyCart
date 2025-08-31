from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

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

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/admin/', include('apps.admin_dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)