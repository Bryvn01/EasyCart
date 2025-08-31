from django.urls import path
from . import views
from . import wishlist_views
from . import review_views

urlpatterns = [
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),

    # Wishlist endpoints
    path('wishlist/', wishlist_views.WishlistView.as_view(), name='wishlist-detail'),
    path('wishlist/add/', wishlist_views.add_to_wishlist, name='wishlist-add'),
    path('wishlist/remove/<int:item_id>/', wishlist_views.remove_from_wishlist, name='wishlist-remove'),
    path('wishlist/check/<int:product_id>/', wishlist_views.check_wishlist_status, name='wishlist-check'),

    # Review endpoints
    path('reviews/<int:product_id>/', review_views.ReviewListView.as_view(), name='review-list'),
    path('reviews/create/', review_views.ReviewCreateView.as_view(), name='review-create'),
    path('reviews/helpful/', review_views.mark_review_helpful, name='review-helpful'),
]
