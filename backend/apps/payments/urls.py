from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, MPesaCallbackView

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('mpesa/callback/', MPesaCallbackView.as_view(), name='mpesa-callback'),
]
