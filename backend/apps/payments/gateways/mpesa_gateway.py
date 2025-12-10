import requests
import base64
from django.utils import timezone
from django.conf import settings
from ..models import Payment, PaymentLog


class MPesaGateway:
    BASE_URL = "https://sandbox.safaricom.co.ke"
    OAUTH_URL = f"{BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    STK_PUSH_URL = f"{BASE_URL}/mpesa/stkpush/v1/processrequest"

    @staticmethod
    def get_access_token() -> str:
        consumer_key = settings.MPESA_CONSUMER_KEY
        consumer_secret = settings.MPESA_CONSUMER_SECRET

        if not consumer_key or not consumer_secret:
            raise ValueError("M-Pesa credentials not configured")

        auth = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()
        headers = {"Authorization": f"Basic {auth}"}

        try:
            response = requests.get(MPesaGateway.OAUTH_URL, headers=headers, timeout=30)
            if response.status_code == 200:
                return response.json().get("access_token")
            # Log error without exposing sensitive data
            PaymentLog.objects.create(
                payment=None,
                event="mpesa_oauth_error",
                message=f"Status: {response.status_code}",
            )
            raise Exception("Failed to obtain M-Pesa access token")
        except requests.exceptions.RequestException as e:
            PaymentLog.objects.create(
                payment=None, event="mpesa_oauth_error", message="Network error"
            )
            raise Exception("M-Pesa service unavailable") from e

    @staticmethod
    def initiate_stk_push(payment: Payment, phone_number: str) -> dict:
        import re

        # Validate phone number format
        clean_phone = re.sub(r"[^0-9+]", "", str(phone_number))
        if not re.match(r"^\+?254[0-9]{9}$|^0[0-9]{9}$", clean_phone):
            raise ValueError("Invalid phone number format")

        access_token = MPesaGateway.get_access_token()
        timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
        shortcode = settings.MPESA_SHORTCODE
        passkey = settings.MPESA_PASSKEY

        if not shortcode or not passkey:
            raise ValueError("M-Pesa configuration incomplete")

        password = base64.b64encode(
            f"{shortcode}{passkey}{timestamp}".encode()
        ).decode()

        # Sanitize order ID to prevent injection
        safe_order_id = str(payment.order.id)[:20]

        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": str(int(payment.amount)),
            "PartyA": clean_phone,
            "PartyB": shortcode,
            "PhoneNumber": clean_phone,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": f"ORDER{safe_order_id}",
            "TransactionDesc": f"Payment for Order {safe_order_id}",
        }
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                MPesaGateway.STK_PUSH_URL, json=payload, headers=headers, timeout=30
            )
            # Log without sensitive data
            PaymentLog.objects.create(
                payment=payment,
                event="mpesa_stk_push",
                message=f"Status: {response.status_code}",
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"STK Push failed with status {response.status_code}")
        except requests.exceptions.RequestException as e:
            PaymentLog.objects.create(
                payment=payment, event="mpesa_stk_push_error", message="Network error"
            )
            raise Exception("M-Pesa service unavailable") from e

    @staticmethod
    def handle_callback(callback_data: dict) -> bool:
        import logging

        logger = logging.getLogger(__name__)

        try:
            body = callback_data.get("Body", {})
            stk_callback = body.get("stkCallback", {})
            checkout_request_id = str(stk_callback.get("CheckoutRequestID", ""))[:100]
            result_code = stk_callback.get("ResultCode")

            if not checkout_request_id:
                logger.warning("M-Pesa callback missing CheckoutRequestID")
                return False

            payment = Payment.objects.filter(transaction_id=checkout_request_id).first()
            if not payment:
                PaymentLog.objects.create(
                    payment=None,
                    event="mpesa_callback_error",
                    message="Payment not found",
                )
                return False

            if result_code == 0:
                payment.status = "succeeded"
                payment.order.status = "processing"
                payment.order.save()
            else:
                payment.status = "failed"

            # Store sanitized callback data
            payment.raw_response = {
                "result_code": result_code,
                "timestamp": timezone.now().isoformat(),
            }
            payment.save()
            PaymentLog.objects.create(
                payment=payment,
                event="mpesa_callback",
                message=f"Result: {result_code}",
            )
            return True
        except Exception as e:
            logger.error(f"M-Pesa callback error: {str(e)}")
            PaymentLog.objects.create(
                payment=None,
                event="mpesa_callback_exception",
                message="Callback processing failed",
            )
            return False
