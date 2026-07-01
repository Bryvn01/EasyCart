"""
Tests for WhatsAppService (order confirmation, admin notification, payment success).
Covers credential checks, message formatting, and sending via Twilio.
"""

from django.test import TestCase
from unittest.mock import patch, MagicMock
import requests
from apps.orders.whatsapp_service import WhatsAppService


class WhatsAppServiceTests(TestCase):
    """Tests for WhatsAppService"""

    def setUp(self):
        # Create a mock order with all required attributes
        self.order = MagicMock()
        self.order.id = 123
        self.order.total_amount = 1500.00
        self.order.payment_method = "mpesa"
        self.order.payment_reference = "REF-ABC123"
        self.order.status = "processing"
        self.order.shipping_address = "123 Test St, Nairobi"
        self.order.created_at = MagicMock()
        self.order.created_at.strftime.return_value = "01 Jul 2026, 10:30 AM"
        self.order.user = MagicMock()
        self.order.user.first_name = "Brian"
        self.order.user.last_name = "Makokha"
        self.order.user.email = "brian@example.com"
        self.order.phone_number = "254712345678"

        # Mock items queryset
        mock_item = MagicMock()
        mock_item.product.name = "Test Product"
        mock_item.quantity = 2
        self.order.items.all.return_value = [mock_item]
        self.order.items.count.return_value = 1

        # Service with credentials mocked
        with patch("apps.orders.whatsapp_service.config") as mock_config:
            mock_config.side_effect = lambda key, default=None: {
                "TWILIO_ACCOUNT_SID": "test_sid",
                "TWILIO_AUTH_TOKEN": "test_token",
                "TWILIO_WHATSAPP_FROM": "whatsapp:+14155238886",
                "ADMIN_WHATSAPP_NUMBER": "254700000000",
            }.get(key, default)
            self.service = WhatsAppService()

    # ---------- Initialization ----------

    @patch("apps.orders.whatsapp_service.config")
    def test_init_with_credentials(self, mock_config):
        """Service should store credentials from config"""
        mock_config.side_effect = lambda key, default=None: {
            "TWILIO_ACCOUNT_SID": "test_sid",
            "TWILIO_AUTH_TOKEN": "test_token",
        }.get(key, default)
        svc = WhatsAppService()
        self.assertEqual(svc.account_sid, "test_sid")
        self.assertEqual(svc.auth_token, "test_token")

    @patch("apps.orders.whatsapp_service.config")
    def test_init_without_credentials(self, mock_config):
        """Service should default to empty strings when config missing"""
        mock_config.return_value = ""
        svc = WhatsAppService()
        self.assertEqual(svc.account_sid, "")
        self.assertEqual(svc.auth_token, "")

    # ---------- send_order_confirmation ----------

    @patch("apps.orders.whatsapp_service.config")
    def test_send_order_confirmation_no_credentials(self, mock_config):
        """Should return False when Twilio not configured"""
        mock_config.return_value = ""
        svc = WhatsAppService()
        result = svc.send_order_confirmation(self.order)
        self.assertFalse(result)

    @patch("apps.orders.whatsapp_service.requests.post")
    def test_send_order_confirmation_success(self, mock_post):
        """Should send WhatsApp message and return True"""
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_post.return_value = mock_response

        result = self.service.send_order_confirmation(self.order)
        self.assertTrue(result)
        self.assertTrue(mock_post.called)

    @patch("apps.orders.whatsapp_service.requests.post")
    def test_send_order_confirmation_message_content(self, mock_post):
        """Message should contain order details"""
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_post.return_value = mock_response

        self.service.send_order_confirmation(self.order)

        call_kwargs = mock_post.call_args.kwargs
        body = call_kwargs.get("data", {}).get("Body", "")
        self.assertIn("#123", body)
        self.assertIn("1,500.00", body)
        self.assertIn("Test Product", body)

    # ---------- send_admin_notification ----------

    def test_send_admin_notification_no_admin_phone(self):
        """Should return False when admin phone not configured"""
        self.service.admin_phone = ""  # Override
        result = self.service.send_admin_notification(self.order)
        self.assertFalse(result)

    @patch("apps.orders.whatsapp_service.requests.post")
    def test_send_admin_notification_success(self, mock_post):
        """Should send admin notification and return True"""
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_post.return_value = mock_response

        result = self.service.send_admin_notification(self.order)
        self.assertTrue(result)
        self.assertTrue(mock_post.called)

    # ---------- send_payment_success ----------

    @patch("apps.orders.whatsapp_service.config")
    def test_send_payment_success_no_credentials(self, mock_config):
        """Should return False when Twilio not configured"""
        mock_config.return_value = ""
        svc = WhatsAppService()
        result = svc.send_payment_success(self.order)
        self.assertFalse(result)

    @patch("apps.orders.whatsapp_service.requests.post")
    def test_send_payment_success_sends_message(self, mock_post):
        """Should send payment confirmation and return True"""
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_post.return_value = mock_response

        result = self.service.send_payment_success(self.order)
        self.assertTrue(result)
        self.assertTrue(mock_post.called)

    # ---------- _send_message ----------

    @patch("apps.orders.whatsapp_service.requests.post")
    def test_send_message_http_error(self, mock_post):
        """Should return False on non-201 response"""
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = "Bad Request"
        mock_post.return_value = mock_response

        result = self.service.send_order_confirmation(self.order)
        self.assertFalse(result)

    @patch("apps.orders.whatsapp_service.requests.post")
    def test_send_message_network_error(self, mock_post):
        """Should return False on network error"""
        mock_post.side_effect = requests.exceptions.ConnectionError()

        result = self.service.send_order_confirmation(self.order)
        self.assertFalse(result)

    # ---------- _format_items ----------

    def test_format_items_multiple_items(self):
        """Should format items with bullet points"""
        mock_item1 = MagicMock()
        mock_item1.product.name = "Item A"
        mock_item1.quantity = 2
        mock_item2 = MagicMock()
        mock_item2.product.name = "Item B"
        mock_item2.quantity = 1
        self.order.items.all.return_value = [mock_item1, mock_item2]
        self.order.items.count.return_value = 2

        # Access via public method that uses _format_items
        with patch("apps.orders.whatsapp_service.requests.post") as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 201
            mock_post.return_value = mock_response
            self.service.send_order_confirmation(self.order)
            body = mock_post.call_args.kwargs.get("data", {}).get("Body", "")
            self.assertIn("Item A x2", body)
            self.assertIn("Item B x1", body)

    def test_format_items_more_than_five(self):
        """Should truncate list at 5 items"""
        items = []
        for i in range(6):
            item = MagicMock()
            item.product.name = f"Item {i + 1}"
            item.quantity = 1
            items.append(item)
        self.order.items.all.return_value = items
        self.order.items.count.return_value = 6

        with patch("apps.orders.whatsapp_service.requests.post") as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 201
            mock_post.return_value = mock_response
            self.service.send_order_confirmation(self.order)
            body = mock_post.call_args.kwargs.get("data", {}).get("Body", "")
            self.assertIn("... and 1 more items", body)
