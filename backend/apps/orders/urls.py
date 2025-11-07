from django.urls import path
from . import views

urlpatterns = [
    path("", views.OrderListView.as_view(), name="order-list"),
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
    path("cart/promo/apply/", views.apply_promo_code, name="apply-promo"),
    path("cart/promo/remove/", views.remove_promo_code, name="remove-promo"),
    path("checkout/", views.checkout, name="checkout"),
    path("payment/initiate/", views.initiate_payment, name="initiate-payment"),
    path("payment/mpesa/callback/", views.mpesa_callback, name="mpesa-callback"),
    path("payment/status/<int:order_id>/", views.payment_status, name="payment-status"),
]
