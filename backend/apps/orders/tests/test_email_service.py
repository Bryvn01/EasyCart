"""
Tests for EmailService (order confirmation and payment confirmation emails).
Covers successful sending, exception handling, and template content.
"""

from django.test import TestCase
from unittest.mock import patch, MagicMock
from apps.orders.email_service import EmailService


class EmailServiceTests(TestCase):
    """Tests for EmailService static methods"""

    def setUp(self):
        # Create a mock order with all required attributes
        self.order = MagicMock()
        self.order.id = 123
        self.order.total_amount = 1500.00
        self.order.payment_method = "mpesa"
        self.order.payment_reference = "REF-ABC123"
        self.order.user = MagicMock()
        self.order.user.username = "testuser"
        self.order.user.email = "test@example.com"

    # ---------- send_order_confirmation ----------

    @patch("apps.orders.email_service.send_mail")
    @patch("apps.orders.email_service.settings")
    def test_send_order_confirmation_success(self, mock_settings, mock_send_mail):
        """Should send email with correct subject and content"""
        mock_settings.DEFAULT_FROM_EMAIL = "noreply@easycart.com"
        mock_send_mail.return_value = 1  # Simulate successful send

        EmailService.send_order_confirmation(self.order)

        # Verify send_mail was called once
        self.assertTrue(mock_send_mail.called)

        # send_mail(subject, message, from_email, recipient_list, html_message=..., fail_silently=False)
        call_args = mock_send_mail.call_args
        # subject is first positional arg
        self.assertIn("Order Confirmation - #123", call_args[0][0])
        # recipient_list is fourth positional arg (index 3)
        self.assertIn("test@example.com", call_args[0][3])
        # Check html_message keyword arg
        self.assertIn("KES 1500.0", call_args[1].get("html_message", ""))

    @patch("apps.orders.email_service.send_mail")
    def test_send_order_confirmation_includes_order_id(self, mock_send_mail):
        """Email should contain the order ID"""
        mock_send_mail.return_value = 1

        EmailService.send_order_confirmation(self.order)

        call_args = mock_send_mail.call_args
        html_message = call_args[1].get("html_message", "")
        self.assertIn("#123", html_message)

    @patch("apps.orders.email_service.send_mail")
    def test_send_order_confirmation_includes_amount(self, mock_send_mail):
        """Email should contain the total amount"""
        mock_send_mail.return_value = 1

        EmailService.send_order_confirmation(self.order)

        call_args = mock_send_mail.call_args
        html_message = call_args[1].get("html_message", "")
        self.assertIn("KES 1500.0", html_message)

    @patch("apps.orders.email_service.send_mail")
    def test_send_order_confirmation_includes_payment_method(self, mock_send_mail):
        """Email should mention the payment method"""
        mock_send_mail.return_value = 1

        EmailService.send_order_confirmation(self.order)

        call_args = mock_send_mail.call_args
        html_message = call_args[1].get("html_message", "")
        self.assertIn("MPESA", html_message)

    @patch("apps.orders.email_service.send_mail")
    def test_send_order_confirmation_includes_username(self, mock_send_mail):
        """Email should address the user by username"""
        mock_send_mail.return_value = 1

        EmailService.send_order_confirmation(self.order)

        call_args = mock_send_mail.call_args
        html_message = call_args[1].get("html_message", "")
        self.assertIn("testuser", html_message)

    @patch("apps.orders.email_service.send_mail")
    def test_send_order_confirmation_fail_silently_false(self, mock_send_mail):
        """Exception should be caught and logged, not raised"""
        mock_send_mail.side_effect = Exception("SMTP server down")

        # Should not raise an exception
        try:
            EmailService.send_order_confirmation(self.order)
        except Exception:
            self.fail("send_order_confirmation raised an exception unexpectedly")

    # ---------- send_payment_confirmation ----------

    @patch("apps.orders.email_service.send_mail")
    @patch("apps.orders.email_service.settings")
    def test_send_payment_confirmation_success(self, mock_settings, mock_send_mail):
        """Should send payment confirmation with correct details"""
        mock_settings.DEFAULT_FROM_EMAIL = "noreply@easycart.com"
        mock_send_mail.return_value = 1

        EmailService.send_payment_confirmation(self.order)

        self.assertTrue(mock_send_mail.called)
        call_args = mock_send_mail.call_args
        # subject is first positional arg
        self.assertIn("Payment Confirmed - Order #123", call_args[0][0])
        # recipient_list is fourth positional arg (index 3)
        self.assertIn("test@example.com", call_args[0][3])

    @patch("apps.orders.email_service.send_mail")
    def test_send_payment_confirmation_includes_payment_reference(self, mock_send_mail):
        """Payment email should include the payment reference"""
        mock_send_mail.return_value = 1

        EmailService.send_payment_confirmation(self.order)

        call_args = mock_send_mail.call_args
        html_message = call_args[1].get("html_message", "")
        self.assertIn("REF-ABC123", html_message)

    @patch("apps.orders.email_service.send_mail")
    def test_send_payment_confirmation_fail_silently_false(self, mock_send_mail):
        """Exception should be caught and logged, not raised"""
        mock_send_mail.side_effect = Exception("SMTP server down")

        try:
            EmailService.send_payment_confirmation(self.order)
        except Exception:
            self.fail("send_payment_confirmation raised an exception unexpectedly")
