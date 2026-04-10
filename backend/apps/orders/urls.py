from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views
from .admin_views import AdminOrderViewSet

admin_router = DefaultRouter()
admin_router.register(r"admin/orders", AdminOrderViewSet, basename="admin-order")

urlpatterns = [
    path("", views.OrderListView.as_view(), name="order-list"),
    path(
        "staff/notifications/",
        views.StaffNotificationsView.as_view(),
        name="staff-notifications",
    ),
    path("<int:pk>/", views.OrderDetailView.as_view(), name="order-detail"),
    path("cart/", views.get_cart, name="get-cart"),
    path("cart/add/", views.add_to_cart, name="add-to-cart"),
    path("cart/remove/<int:item_id>/", views.remove_from_cart, name="remove-from-cart"),
    path("cart/update/<int:item_id>/", views.update_cart_item, name="update-cart-item"),
    path(
        "cart/move-to-wishlist/<int:item_id>/",
        views.move_to_wishlist,
        name="move-to-wishlist",
    ),
    path("checkout/", views.checkout, name="checkout"),
    path("payment/initiate/", views.initiate_payment, name="initiate-payment"),
    path("payment/mpesa/callback/", views.mpesa_callback, name="mpesa-callback"),
    path("payment/status/<int:order_id>/", views.payment_status, name="payment-status"),
    path(
        "<int:pk>/update-status/",
        views.update_order_status,
        name="update-order-status",
    ),
    path("<int:pk>/cancel/", views.cancel_order, name="cancel-order"),
] + admin_router.urls
