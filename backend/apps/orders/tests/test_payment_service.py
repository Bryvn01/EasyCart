"""
Tests for payment services (M-Pesa, Card, PayPal).
Covers token generation, payment initiation, error handling.
"""

from django.test import TestCase
from unittest.mock import patch, MagicMock
import requests
from apps.orders.payment_service import (
    MpesaPaymentService,
    CardPaymentService,
    PayPalPaymentService,
)


class MpesaPaymentServiceTests(TestCase):
    """Tests for MpesaPaymentService"""

    def setUp(self):
        self.service = MpesaPaymentService()

    # ---------- get_access_token ----------

    @patch("apps.orders.payment_service.requests.get")
    @patch("apps.orders.payment_service.config")
    def test_get_access_token_success(self, mock_config, mock_get):
        """Valid credentials should return access token"""
        mock_config.side_effect = lambda key, default=None: {
            "MPESA_CONSUMER_KEY": "test_key",
            "MPESA_CONSUMER_SECRET": "test_secret",
            "MPESA_ENVIRONMENT": "sandbox",
        }.get(key, default)

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"access_token": "test_token"}
        mock_get.return_value = mock_response

        token = self.service.get_access_token()
        self.assertEqual(token, "test_token")

    @patch("apps.orders.payment_service.config")
    def test_get_access_token_missing_credentials(self, mock_config):
        """Missing credentials should return None"""
        mock_config.return_value = ""
        token = self.service.get_access_token()
        self.assertIsNone(token)

    @patch("apps.orders.payment_service.requests.get")
    @patch("apps.orders.payment_service.config")
    def test_get_access_token_http_error(self, mock_config, mock_get):
        """HTTP error should return None and log error"""
        mock_config.side_effect = lambda key, default=None: {
            "MPESA_CONSUMER_KEY": "test_key",
            "MPESA_CONSUMER_SECRET": "test_secret",
        }.get(key, default)

        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError()
        mock_get.return_value = mock_response

        token = self.service.get_access_token()
        self.assertIsNone(token)

    @patch("apps.orders.payment_service.requests.get")
    @patch("apps.orders.payment_service.config")
    def test_get_access_token_network_error(self, mock_config, mock_get):
        """Network error should return None"""
        mock_config.side_effect = lambda key, default=None: {
            "MPESA_CONSUMER_KEY": "test_key",
            "MPESA_CONSUMER_SECRET": "test_secret",
        }.get(key, default)

        mock_get.side_effect = requests.exceptions.ConnectionError()
        token = self.service.get_access_token()
        self.assertIsNone(token)

    # ---------- initiate_stk_push ----------

    @patch("apps.orders.payment_service.MpesaPaymentService.get_access_token")
    @patch("apps.orders.payment_service.requests.post")
    @patch("apps.orders.payment_service.config")
    def test_initiate_stk_push_success(self, mock_config, mock_post, mock_token):
        """Valid request should return API response"""
        mock_token.return_value = "valid_token"
        mock_config.side_effect = lambda key, default=None: {
            "MPESA_SHORTCODE": "174379",
            "MPESA_PASSKEY": "test_passkey",
            "MPESA_CALLBACK_URL": "https://example.com/callback",
        }.get(key, default)

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"ResponseCode": "0"}
        mock_post.return_value = mock_response

        result = self.service.initiate_stk_push("0712345678", 100, order_id=1)
        self.assertEqual(result["ResponseCode"], "0")

    @patch("apps.orders.payment_service.MpesaPaymentService.get_access_token")
    def test_initiate_stk_push_no_access_token(self, mock_token):
        """Missing token should return error dict"""
        mock_token.return_value = None
        result = self.service.initiate_stk_push("0712345678", 100, order_id=1)
        self.assertFalse(result["success"])
        self.assertIn("M-Pesa service unavailable", result["message"])

    @patch("apps.orders.payment_service.MpesaPaymentService.get_access_token")
    @patch("apps.orders.payment_service.requests.post")
    @patch("apps.orders.payment_service.config")
    def test_initiate_stk_push_http_error(self, mock_config, mock_post, mock_token):
        """HTTP error should return error dict"""
        mock_token.return_value = "valid_token"
        mock_config.side_effect = lambda key, default=None: {
            "MPESA_SHORTCODE": "174379",
            "MPESA_PASSKEY": "test_passkey",
        }.get(key, default)

        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError()
        mock_post.return_value = mock_response

        result = self.service.initiate_stk_push("0712345678", 100, order_id=1)
        self.assertFalse(result["success"])
        self.assertIn("failed", result["message"])

    @patch("apps.orders.payment_service.MpesaPaymentService.get_access_token")
    @patch("apps.orders.payment_service.requests.post")
    @patch("apps.orders.payment_service.config")
    def test_initiate_stk_push_network_error(self, mock_config, mock_post, mock_token):
        """Network error should return error dict"""
        mock_token.return_value = "valid_token"
        mock_config.side_effect = lambda key, default=None: {
            "MPESA_SHORTCODE": "174379",
            "MPESA_PASSKEY": "test_passkey",
        }.get(key, default)

        mock_post.side_effect = requests.exceptions.ConnectionError()
        result = self.service.initiate_stk_push("0712345678", 100, order_id=1)
        self.assertFalse(result["success"])


class CardPaymentServiceTests(TestCase):
    """Tests for CardPaymentService (Flutterwave)"""

    def setUp(self):
        self.service = CardPaymentService()

    @patch("apps.orders.payment_service.requests.post")
    def test_initiate_payment_success(self, mock_post):
        """Valid API key should return payment response"""
        self.service.api_key = "test_key"  # Set after init
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"status": "success"}
        mock_post.return_value = mock_response

        result = self.service.initiate_payment(
            100, "test@test.com", "0712345678", order_id=1
        )
        self.assertEqual(result["status"], "success")

    @patch.dict("os.environ", {"FLUTTERWAVE_API_KEY": ""})
    def test_initiate_payment_no_api_key(self):
        """Missing API key should return error"""
        result = self.service.initiate_payment(
            100, "test@test.com", "0712345678", order_id=1
        )
        self.assertEqual(result["status"], "error")
        self.assertIn("not configured", result["message"])

    @patch("apps.orders.payment_service.requests.post")
    @patch.dict("os.environ", {"FLUTTERWAVE_API_KEY": "test_key"})
    def test_initiate_payment_http_error(self, mock_post):
        """HTTP error should return error"""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError()
        mock_post.return_value = mock_response

        result = self.service.initiate_payment(
            100, "test@test.com", "0712345678", order_id=1
        )
        self.assertEqual(result["status"], "error")

    @patch("apps.orders.payment_service.requests.post")
    @patch.dict("os.environ", {"FLUTTERWAVE_API_KEY": "test_key"})
    def test_initiate_payment_network_error(self, mock_post):
        """Network error should return error"""
        mock_post.side_effect = requests.exceptions.ConnectionError()
        result = self.service.initiate_payment(
            100, "test@test.com", "0712345678", order_id=1
        )
        self.assertEqual(result["status"], "error")


class PayPalPaymentServiceTests(TestCase):
    """Tests for PayPalPaymentService"""

    def setUp(self):
        self.service = PayPalPaymentService()

    # ---------- get_access_token ----------

    @patch("apps.orders.payment_service.requests.post")
    def test_get_access_token_success(self, mock_post):
        """Valid credentials should return access token"""
        self.service.client_id = "test_id"
        self.service.client_secret = "test_secret"
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"access_token": "test_token"}
        mock_post.return_value = mock_response

        token = self.service.get_access_token()
        self.assertEqual(token, "test_token")

    def test_get_access_token_missing_credentials(self):
        """Missing credentials should return None"""
        token = self.service.get_access_token()
        self.assertIsNone(token)

    @patch("apps.orders.payment_service.requests.post")
    def test_get_access_token_http_error(self, mock_post):
        """HTTP error should return None"""
        self.service.client_id = "test_id"
        self.service.client_secret = "test_secret"
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError()
        mock_post.return_value = mock_response

        token = self.service.get_access_token()
        self.assertIsNone(token)

    # ---------- initiate_payment ----------

    @patch("apps.orders.payment_service.PayPalPaymentService.get_access_token")
    @patch("apps.orders.payment_service.requests.post")
    def test_initiate_payment_success(self, mock_post, mock_token):
        """Valid token should return payment URL"""
        mock_token.return_value = "valid_token"
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "id": "PAY-123",
            "links": [{"rel": "approve", "href": "https://paypal.com/approve"}],
        }
        mock_post.return_value = mock_response

        result = self.service.initiate_payment(
            100, "test@test.com", "0712345678", order_id=1
        )
        self.assertEqual(result["status"], "success")
        self.assertIsNotNone(result["approval_url"])

    @patch("apps.orders.payment_service.PayPalPaymentService.get_access_token")
    def test_initiate_payment_no_access_token(self, mock_token):
        """Missing token should return error"""
        mock_token.return_value = None
        result = self.service.initiate_payment(
            100, "test@test.com", "0712345678", order_id=1
        )
        self.assertEqual(result["status"], "error")

    @patch("apps.orders.payment_service.PayPalPaymentService.get_access_token")
    @patch("apps.orders.payment_service.requests.post")
    def test_initiate_payment_http_error(self, mock_post, mock_token):
        """HTTP error should return error"""
        mock_token.return_value = "valid_token"
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError()
        mock_post.return_value = mock_response

        result = self.service.initiate_payment(
            100, "test@test.com", "0712345678", order_id=1
        )
        self.assertEqual(result["status"], "error")

    @patch("apps.orders.payment_service.PayPalPaymentService.get_access_token")
    @patch("apps.orders.payment_service.requests.post")
    def test_initiate_payment_network_error(self, mock_post, mock_token):
        """Network error should return error"""
        mock_token.return_value = "valid_token"
        mock_post.side_effect = requests.exceptions.ConnectionError()
        result = self.service.initiate_payment(
            100, "test@test.com", "0712345678", order_id=1
        )
        self.assertEqual(result["status"], "error")
