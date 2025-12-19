from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.pos.views import (
    POSSessionViewSet,
    POSTransactionViewSet,
    POSProductSearchViewSet,
    POSDiscountViewSet,
    POSStaffPermissionViewSet,
    POSDashboardViewSet,
)

router = DefaultRouter()
router.register(r"sessions", POSSessionViewSet, basename="pos-session")
router.register(r"transactions", POSTransactionViewSet, basename="pos-transaction")
router.register(r"products", POSProductSearchViewSet, basename="pos-product")
router.register(r"discounts", POSDiscountViewSet, basename="pos-discount")
router.register(r"permissions", POSStaffPermissionViewSet, basename="pos-permission")
router.register(r"dashboard", POSDashboardViewSet, basename="pos-dashboard")

urlpatterns = [
    path("", include(router.urls)),
]
