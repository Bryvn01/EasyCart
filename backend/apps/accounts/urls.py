from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from . import two_factor_views
from . import two_factor_login
from . import otp_views
from . import email_verification_views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("login/2fa/", two_factor_login.login_with_2fa, name="login-2fa"),
    path("admin/dashboard/", views.admin_dashboard, name="admin-dashboard"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", views.profile, name="profile"),
    path("profile/me/", views.profile, name="user-profile"),
    path("password/reset/", views.forgot_password, name="password-reset"),
    path("password/change/", views.change_password, name="change-password"),
    path("logout/", views.logout, name="logout"),
    path("forgot-password/", views.forgot_password, name="forgot_password"),
    path("reset-password/", views.reset_password, name="reset_password"),
    path("admin-access/", views.django_admin_access, name="django-admin-access"),
    # 2FA Endpoints
    path("2fa/setup/", two_factor_views.setup_2fa, name="2fa-setup"),
    path("2fa/enable/", two_factor_views.enable_2fa, name="2fa-enable"),
    path("2fa/disable/", two_factor_views.disable_2fa, name="2fa-disable"),
    path("2fa/verify/", two_factor_views.verify_2fa, name="2fa-verify"),
    path("2fa/enable", two_factor_views.enable_2fa, name="enable-2fa"),
    path("2fa/disable", two_factor_views.disable_2fa, name="disable-2fa"),
    path("2fa/verify", two_factor_views.verify_2fa, name="verify-2fa"),
    path("2fa/status/", two_factor_views.get_2fa_status, name="2fa-status"),
    # Customer Management Endpoints
    path("customers/", views.CustomerListView.as_view(), name="customer-list"),
    path(
        "customers/<int:pk>/",
        views.CustomerDetailView.as_view(),
        name="customer-detail",
    ),
    # OTP Authentication
    path("otp/request/", otp_views.request_otp, name="otp-request"),
    path("otp/verify/", otp_views.verify_otp_login, name="otp-verify"),
    path("otp/resend/", otp_views.resend_otp, name="otp-resend"),
    path("otp/analytics/", otp_views.otp_delivery_analytics, name="otp-analytics"),
    # Email Verification
    path(
        "email/send-verification/",
        email_verification_views.send_verification,
        name="email-send-verification",
    ),
    path("email/verify/", email_verification_views.verify_email, name="email-verify"),
    path(
        "email/status/",
        email_verification_views.verification_status,
        name="email-status",
    ),
    path(
        "email/resend-verification/",
        email_verification_views.resend_verification,
        name="email-resend-verification",
    ),
]
