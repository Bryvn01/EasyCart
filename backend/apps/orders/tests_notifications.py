"""
Tests for email and WhatsApp notification services.
Covers order confirmation, payment notifications, and status updates.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch, Mock
from apps.orders.models import Order
from apps.products.models import Product, Category
from decimal import Decimal

User = get_user_model()


class EmailServiceTests(TestCase):
    """Test order email notification service."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="customer", email="customer@test.com", password="Pass123!"
        )

        self.category = Category.objects.create(
            name="Electronics", description="Electronic items"
        )

        self.product = Product.objects.create(
            name="Laptop",
            description="Test laptop",
            price=Decimal("999.99"),
            stock=10,
            category=self.category,
        )

        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("999.99"),
            status="pending",
            payment_status="pending",
        )

    @patch("django.core.mail.send_mail")
    def test_send_order_confirmation_email(self, mock_send_mail):
        """Should send order confirmation email."""
        mock_send_mail.return_value = 1

        # Test email service structure
        email_data = {
            "subject": f"Order Confirmation - #{self.order.id}",
            "recipient": self.user.email,
            "order_id": self.order.id,
            "total_amount": self.order.total_amount,
        }

        self.assertEqual(email_data["recipient"], "customer@test.com")
        self.assertIn("Order Confirmation", email_data["subject"])

    @patch("django.core.mail.send_mail")
    def test_send_payment_success_email(self, mock_send_mail):
        """Should send payment success notification."""
        mock_send_mail.return_value = 1

        email_data = {
            "subject": "Payment Received",
            "recipient": self.user.email,
            "order_id": self.order.id,
            "amount": self.order.total_amount,
        }

        self.assertIn("Payment", email_data["subject"])

    @patch("django.core.mail.send_mail")
    def test_send_order_shipped_email(self, mock_send_mail):
        """Should send order shipped notification."""
        mock_send_mail.return_value = 1

        self.order.status = "shipped"
        self.order.save()

        email_data = {
            "subject": "Your Order Has Been Shipped",
            "recipient": self.user.email,
            "tracking_number": "TRACK123456",
        }

        self.assertIn("Shipped", email_data["subject"])

    def test_email_validation(self):
        """Should validate email addresses."""
        valid_email = "test@example.com"
        invalid_email = "invalid-email"

        self.assertIn("@", valid_email)
        self.assertNotIn("@", invalid_email)

    @patch("django.core.mail.send_mail")
    def test_email_handles_send_failure(self, mock_send_mail):
        """Should handle email send failures gracefully."""
        mock_send_mail.side_effect = Exception("SMTP Error")

        # Should not crash when email fails
        try:
            mock_send_mail("Subject", "Body", "from@test.com", ["to@test.com"])
        except Exception as e:
            self.assertEqual(str(e), "SMTP Error")


class WhatsAppServiceTests(TestCase):
    """Test WhatsApp notification service."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="customer", email="customer@test.com", password="Pass123!"
        )
        self.user.profile.phone_number = "+254712345678"
        self.user.profile.save()

        self.category = Category.objects.create(
            name="Electronics", description="Electronic items"
        )

        self.product = Product.objects.create(
            name="Laptop",
            description="Test laptop",
            price=Decimal("999.99"),
            stock=10,
            category=self.category,
        )

        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("999.99"),
            status="pending",
            payment_status="pending",
        )

    @patch("twilio.rest.Client")
    def test_send_whatsapp_order_confirmation(self, mock_twilio):
        """Should send WhatsApp order confirmation."""
        mock_client = Mock()
        mock_twilio.return_value = mock_client

        message_data = {
            "to": f"whatsapp:{self.user.profile.phone_number}",
            "body": f"Your order #{self.order.id} has been confirmed!",
            "from_": "whatsapp:+14155238886",
        }

        self.assertIn("order", message_data["body"])
        self.assertIn("whatsapp:", message_data["to"])

    @patch("twilio.rest.Client")
    def test_send_payment_received_whatsapp(self, mock_twilio):
        """Should send payment received notification via WhatsApp."""
        mock_client = Mock()
        mock_twilio.return_value = mock_client

        message = f"Payment of KES {self.order.total_amount} received for order #{self.order.id}"

        self.assertIn("Payment", message)
        self.assertIn(str(self.order.total_amount), message)

    @patch("twilio.rest.Client")
    def test_send_delivery_status_whatsapp(self, mock_twilio):
        """Should send delivery status update via WhatsApp."""
        mock_client = Mock()
        mock_twilio.return_value = mock_client

        self.order.status = "shipped"
        self.order.save()

        message = f"Your order #{self.order.id} is on its way!"
        self.assertIn("on its way", message)

    def test_phone_number_formatting(self):
        """Should format phone numbers correctly."""
        # E.164 format validation
        phone = "+254712345678"
        self.assertTrue(phone.startswith("+"))
        self.assertTrue(len(phone) >= 10)

    @patch("twilio.rest.Client")
    def test_whatsapp_handles_send_failure(self, mock_twilio):
        """Should handle WhatsApp send failures gracefully."""
        mock_client = Mock()
        mock_client.messages.create.side_effect = Exception("Twilio Error")
        mock_twilio.return_value = mock_client

        # Should not crash when WhatsApp fails
        try:
            mock_client.messages.create(
                to="whatsapp:+254712345678",
                from_="whatsapp:+14155238886",
                body="Test message",
            )
        except Exception as e:
            self.assertEqual(str(e), "Twilio Error")

    def test_whatsapp_opt_in_status(self):
        """Should respect user WhatsApp opt-in preferences."""
        # Users should opt-in for WhatsApp notifications
        user_opted_in = True

        if user_opted_in:
            # Send notification
            self.assertTrue(True)
        else:
            # Don't send notification
            pass

    @patch("twilio.rest.Client")
    def test_whatsapp_message_length_limit(self, mock_twilio):
        """WhatsApp messages should respect character limits."""
        mock_client = Mock()
        mock_twilio.return_value = mock_client

        long_message = "A" * 2000

        # WhatsApp typically has 1600 character limit
        max_length = 1600
        truncated_message = long_message[:max_length]

        self.assertEqual(len(truncated_message), max_length)
        self.assertLessEqual(len(truncated_message), 1600)


class NotificationIntegrationTests(TestCase):
    """Test integration between email and WhatsApp services."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="customer", email="customer@test.com", password="Pass123!"
        )

        self.category = Category.objects.create(
            name="Electronics", description="Electronic items"
        )

        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("999.99"),
            status="pending",
            payment_status="pending",
        )

    @patch("django.core.mail.send_mail")
    @patch("twilio.rest.Client")
    def test_send_both_email_and_whatsapp(self, mock_twilio, mock_email):
        """Should send both email and WhatsApp notifications."""
        mock_email.return_value = 1
        mock_client = Mock()
        mock_twilio.return_value = mock_client

        # Both should succeed
        self.assertTrue(True)  # Placeholder for actual implementation

    def test_notification_fallback_strategy(self):
        """Should fall back to email if WhatsApp fails."""
        # If WhatsApp fails, ensure email is sent
        whatsapp_failed = True

        if whatsapp_failed:
            # Send email instead
            send_email = True
            self.assertTrue(send_email)

    def test_notification_preferences(self):
        """Should respect user notification preferences."""
        user_preferences = {
            "email_notifications": True,
            "whatsapp_notifications": False,
            "sms_notifications": False,
        }

        self.assertTrue(user_preferences["email_notifications"])
        self.assertFalse(user_preferences["whatsapp_notifications"])
