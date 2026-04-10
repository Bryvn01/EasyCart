from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.orders.models import Order, OrderNotification


def _license_info(license_type="dev", max_orders_per_day=100, email_support=True):
    return {
        "license_type": license_type,
        "features": {
            "max_orders_per_day": max_orders_per_day,
            "email_support": email_support,
        },
    }


@override_settings(
    FEATURE_NOTIFICATIONS=True,
    CELERY_TASK_ALWAYS_EAGER=True,
    CELERY_TASK_EAGER_PROPAGATES=True,
)
class OrderNotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="StrongPass123!",
        )
        self.staff = User.objects.create_user(
            username="staff",
            email="staff@example.com",
            password="StrongPass123!",
            is_staff=True,
            is_active=True,
        )
        self.order = Order.objects.create(
            user=self.customer,
            total_amount=Decimal("50.00"),
            shipping_address="123 Test Street",
            phone_number="+254712345678",
            status="pending",
        )

    @patch("apps.orders.tasks.send_mail", side_effect=Exception("SMTP down"))
    @patch("apps.core.license.LicenseVerifier.get_license_info")
    def test_email_graceful_degradation(self, mock_license, mock_send_mail):
        mock_license.return_value = _license_info(
            license_type="prod",
            max_orders_per_day=1000,
            email_support=True,
        )

        self.order.status = "processing"
        self.order.save(update_fields=["status"])

        self.assertEqual(OrderNotification.objects.count(), 1)
        self.assertTrue(mock_send_mail.called)

    @patch("apps.core.license.LicenseVerifier.get_license_info")
    def test_no_duplicate_notifications(self, mock_license):
        mock_license.return_value = _license_info()

        self.order.status = "processing"
        self.order.save(update_fields=["status"])
        self.order.status = "processing"
        self.order.save(update_fields=["status"])

        self.assertEqual(OrderNotification.objects.count(), 1)

    @patch("apps.core.license.LicenseVerifier.get_license_info")
    def test_notification_only_on_processing_status(self, mock_license):
        mock_license.return_value = _license_info()

        self.order.status = "shipped"
        self.order.save(update_fields=["status"])
        self.assertEqual(OrderNotification.objects.count(), 0)

        self.order.status = "processing"
        self.order.save(update_fields=["status"])
        self.assertEqual(OrderNotification.objects.filter(order_status="processing").count(), 1)

        self.order.status = "completed"
        self.order.save(update_fields=["status"])
        self.assertEqual(OrderNotification.objects.filter(order_status="completed").count(), 1)

    @patch("apps.core.license.LicenseVerifier.get_license_info")
    def test_demo_mode_respects_limits(self, mock_license):
        mock_license.return_value = _license_info(
            license_type="demo",
            max_orders_per_day=1,
            email_support=False,
        )

        extra_order = Order.objects.create(
            user=self.customer,
            total_amount=Decimal("75.00"),
            shipping_address="456 Test Avenue",
            phone_number="+254700000001",
            status="pending",
        )
        extra_order.status = "processing"
        extra_order.save(update_fields=["status"])

        self.assertEqual(OrderNotification.objects.count(), 0)

    @patch("apps.core.license.LicenseVerifier.get_license_info")
    def test_staff_notifications_endpoint(self, mock_license):
        mock_license.return_value = _license_info()
        self.order.status = "processing"
        self.order.save(update_fields=["status"])

        self.client.force_authenticate(self.staff)
        response = self.client.get(reverse("staff-notifications"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["unread"], 1)
        self.assertEqual(len(response.data["results"]), 1)

    def test_staff_notifications_endpoint_forbidden_for_non_staff(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(reverse("staff-notifications"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
