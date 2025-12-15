import requests
import base64
import logging
from django.utils import timezone
from django.conf import settings
from ..models import Payment, PaymentLog
from utils.security_helpers import verify_mpesa_signature, mask_phone_number

logger = logging.getLogger(__name__)


class MPesaGateway:
    """
    M-Pesa STK Push Payment Gateway

    Environment-aware configuration:
    - Sandbox: MPESA_ENVIRONMENT=sandbox (default for development)
    - Production: MPESA_ENVIRONMENT=production (requires production credentials)
    """

    def __init__(self):
        self.environment = getattr(settings, "MPESA_ENVIRONMENT", "sandbox")

        if self.environment == "production":
            self.BASE_URL = "https://api.safaricom.co.ke"
        else:
            self.BASE_URL = "https://sandbox.safaricom.co.ke"

        self.OAUTH_URL = (
            f"{self.BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
        )
        self.STK_PUSH_URL = f"{self.BASE_URL}/mpesa/stkpush/v1/processrequest"

        # Log environment (never log credentials)
        logger.info(f"M-Pesa gateway initialized in {self.environment} mode")

    def get_access_token(self) -> str:
        """
        Obtain M-Pesa OAuth access token.
        Implements proper error handling and logging without exposing credentials.
        """
        consumer_key = settings.MPESA_CONSUMER_KEY
        consumer_secret = settings.MPESA_CONSUMER_SECRET

        if not consumer_key or not consumer_secret:
            logger.error("M-Pesa credentials not configured in environment")
            raise ValueError("M-Pesa credentials not configured")

        auth = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()
        headers = {"Authorization": f"Basic {auth}"}

        try:
            response = requests.get(self.OAUTH_URL, headers=headers, timeout=30)
            if response.status_code == 200:
                logger.info("M-Pesa OAuth token obtained successfully")
                return response.json().get("access_token")

            # Log error without exposing sensitive data
            PaymentLog.objects.create(
                payment=None,
                event="mpesa_oauth_error",
                message=f"Status: {response.status_code}, Env: {self.environment}",
            )
            logger.error(f"M-Pesa OAuth failed with status {response.status_code}")
            raise Exception("Failed to obtain M-Pesa access token")
        except requests.exceptions.RequestException as e:
            PaymentLog.objects.create(
                payment=None,
                event="mpesa_oauth_error",
                message=f"Network error in {self.environment} mode",
            )
            logger.error(f"M-Pesa OAuth network error: {type(e).__name__}")
            raise Exception("M-Pesa service unavailable") from e

    def initiate_stk_push(self, payment: Payment, phone_number: str) -> dict:
        """
        Initiate M-Pesa STK Push payment request.

        Args:
            payment: Payment object to process
            phone_number: Customer phone number (Kenyan format)

        Returns:
            M-Pesa API response dict

        Raises:
            ValueError: Invalid phone number or configuration
            Exception: M-Pesa API errors
        """
        import re

        # Validate and normalize phone number
        clean_phone = re.sub(r"[^0-9+]", "", str(phone_number))

        # Support formats: +254..., 254..., 07..., 01...
        if clean_phone.startswith("+254"):
            clean_phone = clean_phone[1:]  # Remove +
        elif clean_phone.startswith("0"):
            clean_phone = "254" + clean_phone[1:]  # Convert 07... to 2547...

        if not re.match(r"^254[0-9]{9}$", clean_phone):
            logger.warning(
                f"Invalid phone number format attempt: {mask_phone_number(phone_number)}"
            )
            raise ValueError(
                "Invalid phone number format. Use +254XXXXXXXXX or 07XXXXXXXX"
            )

        access_token = self.get_access_token()
        timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
        shortcode = settings.MPESA_SHORTCODE
        passkey = settings.MPESA_PASSKEY

        if not shortcode or not passkey:
            logger.error("M-Pesa shortcode or passkey not configured")
            raise ValueError("M-Pesa configuration incomplete")

        password = base64.b64encode(
            f"{shortcode}{passkey}{timestamp}".encode()
        ).decode()

        # Sanitize order ID to prevent injection
        safe_order_id = str(payment.order.id)[:20]

        # Ensure amount is integer (M-Pesa doesn't accept decimals)
        amount = int(float(payment.amount))

        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": str(amount),
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
            logger.info(
                f"Initiating M-Pesa STK Push for Order {safe_order_id}, "
                f"Amount: {amount}, Phone: {mask_phone_number(clean_phone)}"
            )

            response = requests.post(
                self.STK_PUSH_URL, json=payload, headers=headers, timeout=30
            )

            # Log response for debugging
            response_body = response.text
            PaymentLog.objects.create(
                payment=payment,
                event="mpesa_stk_push",
                message=f"Status: {response.status_code}, Response: {response_body[:500]}",
            )

            if response.status_code == 200:
                response_data = response.json()
                logger.info(
                    f"STK Push initiated successfully for Order {safe_order_id}, "
                    f"CheckoutRequestID: {response_data.get('CheckoutRequestID', 'N/A')}"
                )
                return response_data
            else:
                logger.error(
                    f"STK Push failed with status {response.status_code}, "
                    f"Response: {response_body}"
                )
                raise Exception(f"STK Push failed: {response_body}")

        except requests.exceptions.RequestException as e:
            PaymentLog.objects.create(
                payment=payment,
                event="mpesa_stk_push_error",
                message=f"Network error in {self.environment} mode",
            )
            logger.error(f"M-Pesa STK Push network error: {type(e).__name__}")
            raise Exception("M-Pesa service unavailable") from e

    @staticmethod
    def handle_callback(callback_data: dict) -> bool:
        """
        Handle M-Pesa payment callback/webhook.

        SECURITY: Verifies callback signature to prevent webhook spoofing.

        Args:
            callback_data: Callback payload from M-Pesa

        Returns:
            True if callback processed successfully, False otherwise
        """
        logger.info("Processing M-Pesa callback")

        # Verify webhook signature in production
        if not verify_mpesa_signature(callback_data):
            logger.error(
                "M-Pesa callback signature verification failed - potential spoofing attempt"
            )
            PaymentLog.objects.create(
                payment=None,
                event="mpesa_callback_security_error",
                message="Invalid signature",
            )
            return False

        try:
            body = callback_data.get("Body", {})
            stk_callback = body.get("stkCallback", {})
            checkout_request_id = str(stk_callback.get("CheckoutRequestID", ""))[:100]
            result_code = stk_callback.get("ResultCode")
            result_desc = stk_callback.get("ResultDesc", "")

            if not checkout_request_id:
                logger.warning("M-Pesa callback missing CheckoutRequestID")
                return False

            payment = Payment.objects.filter(transaction_id=checkout_request_id).first()

            if not payment:
                logger.warning(
                    f"M-Pesa callback for unknown payment: "
                    f"CheckoutRequestID={checkout_request_id[:20]}***"
                )
                PaymentLog.objects.create(
                    payment=None,
                    event="mpesa_callback_error",
                    message="Payment not found",
                )
                return False

            # Process callback based on result code
            if result_code == 0:
                # Success
                payment.status = "succeeded"
                payment.order.status = "processing"
                payment.order.save()

                logger.info(
                    f"M-Pesa payment successful for Order {payment.order.id}, "
                    f"Amount: {payment.amount}"
                )
            else:
                # Payment failed
                payment.status = "failed"
                logger.warning(
                    f"M-Pesa payment failed for Order {payment.order.id}, "
                    f"ResultCode: {result_code}, Desc: {result_desc}"
                )

            # Store sanitized callback data (no PII)
            payment.raw_response = {
                "result_code": result_code,
                "result_desc": result_desc[:200],  # Limit description length
                "timestamp": timezone.now().isoformat(),
                "checkout_request_id": checkout_request_id,
            }
            payment.save()

            PaymentLog.objects.create(
                payment=payment,
                event="mpesa_callback_processed",
                message=f"Result: {result_code}",
            )

            return True

        except Exception as e:
            logger.error(
                f"M-Pesa callback processing error: {type(e).__name__} - {str(e)}"
            )
            PaymentLog.objects.create(
                payment=None,
                event="mpesa_callback_exception",
                message="Callback processing failed",
            )
            return False
