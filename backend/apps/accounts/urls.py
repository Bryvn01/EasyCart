from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.profile, name='profile'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('send-verification-email/', views.send_verification_email, name='send_verification_email'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('change-password/', views.change_password, name='change_password'),
]