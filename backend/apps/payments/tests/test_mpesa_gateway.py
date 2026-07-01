from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from apps.payments.models import Payment, PaymentLog
from apps.orders.models import Order
from django.contrib.auth import get_user_model
from apps.payments.gateways.mpesa_gateway import MPesaGateway

User = get_user_model()


class MPesaGatewayTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testpayer", password="TestP@ssw0rd!2024"
        )
        self.order = Order.objects.create(
            user=self.user,
            total_amount=100,
            shipping_address="123 Test St",
            phone_number="0700000000",
            payment_method="mpesa",
            payment_status="pending",
        )
        self.payment = Payment.objects.create(
            user=self.user,
            order=self.order,
            method="mpesa",
            amount=100,
            currency="KES",
            transaction_id="ws_CO_test123",
            status="pending",
        )
        self.gateway = MPesaGateway()

    # ---------- Phone validation (placeholder) ----------
    def test_phone_validation_accepts_07_format(self):
        # Will be implemented after confirming utility functions
        pass

    # ---------- get_access_token ----------
    @patch("apps.payments.gateways.mpesa_gateway.requests.get")
    @override_settings(
        MPESA_CONSUMER_KEY="test_key", MPESA_CONSUMER_SECRET="test_secret"
    )
    def test_get_access_token_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"access_token": "test_token_123"}
        mock_get.return_value = mock_response

        token = self.gateway.get_access_token()
        self.assertEqual(token, "test_token_123")
        self.assertTrue(mock_get.called)

    @override_settings(MPESA_CONSUMER_KEY="", MPESA_CONSUMER_SECRET="")
    def test_get_access_token_missing_credentials(self):
        with self.assertRaises(ValueError):
            self.gateway.get_access_token()

    @patch("apps.payments.gateways.mpesa_gateway.PaymentLog.objects.create")
    @patch("apps.payments.gateways.mpesa_gateway.requests.get")
    @override_settings(
        MPESA_CONSUMER_KEY="test_key", MPESA_CONSUMER_SECRET="test_secret"
    )
    def test_get_access_token_http_error(self, mock_get, mock_log_create):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_get.return_value = mock_response

        with self.assertRaises(Exception):
            self.gateway.get_access_token()

        # Verify the log was created (mocked, so we can check the call)
        self.assertTrue(mock_log_create.called)
        call_args = mock_log_create.call_args[1]
        self.assertEqual(call_args["event"], "mpesa_oauth_error")

    # ---------- initiate_stk_push ----------
    @patch("apps.payments.gateways.mpesa_gateway.requests.post")
    @patch.object(MPesaGateway, "get_access_token", return_value="test_token")
    @override_settings(
        MPESA_SHORTCODE="174379",
        MPESA_PASSKEY="test_passkey",
        MPESA_CALLBACK_URL="https://example.com/callback",
    )
    def test_initiate_stk_push_success(self, mock_token, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"CheckoutRequestID": "ws_CO_123"}
        mock_post.return_value = mock_response

        result = self.gateway.initiate_stk_push(self.payment, "0712345678")
        self.assertEqual(result["CheckoutRequestID"], "ws_CO_123")
        self.assertTrue(PaymentLog.objects.filter(event="mpesa_stk_push").exists())

    @patch("apps.payments.gateways.mpesa_gateway.requests.post")
    @patch.object(MPesaGateway, "get_access_token", return_value="test_token")
    @override_settings(
        MPESA_SHORTCODE="174379",
        MPESA_PASSKEY="test_passkey",
        MPESA_CALLBACK_URL="https://example.com/callback",
    )
    def test_initiate_stk_push_http_error(self, mock_token, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_post.return_value = mock_response

        with self.assertRaises(Exception):
            self.gateway.initiate_stk_push(self.payment, "0712345678")

    def test_initiate_stk_push_invalid_phone(self):
        with self.assertRaises(ValueError):
            self.gateway.initiate_stk_push(self.payment, "12345")

    # ---------- handle_callback ----------
    @patch(
        "apps.payments.gateways.mpesa_gateway.verify_mpesa_signature", return_value=True
    )
    def test_handle_callback_success(self, mock_verify):
        callback_data = {
            "Body": {
                "stkCallback": {
                    "CheckoutRequestID": "ws_CO_test123",
                    "ResultCode": 0,
                    "ResultDesc": "Success",
                }
            }
        }
        result = MPesaGateway.handle_callback(callback_data)
        self.payment.refresh_from_db()
        self.order.refresh_from_db()
        self.assertEqual(self.payment.status, "succeeded")
        self.assertEqual(self.order.status, "processing")
        self.assertTrue(result)

    @patch(
        "apps.payments.gateways.mpesa_gateway.verify_mpesa_signature", return_value=True
    )
    def test_handle_callback_failure(self, mock_verify):
        callback_data = {
            "Body": {
                "stkCallback": {
                    "CheckoutRequestID": "ws_CO_test123",
                    "ResultCode": 1,
                    "ResultDesc": "Insufficient funds",
                }
            }
        }
        result = MPesaGateway.handle_callback(callback_data)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, "failed")
        self.assertTrue(result)

    @patch(
        "apps.payments.gateways.mpesa_gateway.verify_mpesa_signature",
        return_value=False,
    )
    @patch("apps.payments.gateways.mpesa_gateway.PaymentLog.objects.create")
    def test_handle_callback_invalid_signature(self, mock_log_create, mock_verify):
        callback_data = {
            "Body": {
                "stkCallback": {
                    "CheckoutRequestID": "ws_CO_test123",
                    "ResultCode": 0,
                }
            }
        }
        result = MPesaGateway.handle_callback(callback_data)
        self.payment.refresh_from_db()
        self.assertFalse(result)
        self.assertEqual(self.payment.status, "pending")  # Unchanged

    def test_handle_callback_missing_request_id(self):
        callback_data = {"Body": {"stkCallback": {"ResultCode": 0}}}
        result = MPesaGateway.handle_callback(callback_data)
        self.assertFalse(result)
