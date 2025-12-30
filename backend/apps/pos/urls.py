from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.pos.views import (
    POSSessionViewSet,
    POSTransactionViewSet,
    POSProductSearchViewSet,
    POSDiscountViewSet,
    POSStaffPermissionViewSet,
    POSDashboardViewSet,
    PosAPIRootView,
)

router = DefaultRouter()
router.include_root_view = False  # Disable DRF's auto root view
router.register(r"sessions", POSSessionViewSet, basename="pos-session")
router.register(r"transactions", POSTransactionViewSet, basename="pos-transaction")
router.register(r"products", POSProductSearchViewSet, basename="pos-product")
router.register(r"discounts", POSDiscountViewSet, basename="pos-discount")
router.register(r"permissions", POSStaffPermissionViewSet, basename="pos-permission")
router.register(r"dashboard", POSDashboardViewSet, basename="pos-dashboard")

urlpatterns = [
    path("", PosAPIRootView.as_view(), name="api-root"),
    path("", include(router.urls)),
]
