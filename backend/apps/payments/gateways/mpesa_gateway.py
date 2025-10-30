import requests
import base64
import datetime
from django.conf import settings
from ..models import Payment, PaymentLog

class MPesaGateway:
    BASE_URL = 'https://sandbox.safaricom.co.ke'
    OAUTH_URL = f'{BASE_URL}/oauth/v1/generate?grant_type=client_credentials'
    STK_PUSH_URL = f'{BASE_URL}/mpesa/stkpush/v1/processrequest'

    @staticmethod
    def get_access_token() -> str:
        consumer_key = settings.MPESA_CONSUMER_KEY
        consumer_secret = settings.MPESA_CONSUMER_SECRET
        auth = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()
        headers = {"Authorization": f"Basic {auth}"}
        response = requests.get(MPesaGateway.OAUTH_URL, headers=headers)
        if response.status_code == 200:
            return response.json().get('access_token')
        PaymentLog.objects.create(payment=None, event='mpesa_oauth_error', message=str(response.text))
        raise Exception('Failed to obtain M-Pesa access token')

    @staticmethod
    def initiate_stk_push(payment: Payment, phone_number: str) -> dict:
        access_token = MPesaGateway.get_access_token()
        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        shortcode = settings.MPESA_SHORTCODE
        passkey = settings.MPESA_PASSKEY
        password = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()
        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": str(int(payment.amount)),
            "PartyA": phone_number,
            "PartyB": shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": f"ORDER{payment.order.id}",
            "TransactionDesc": f"Payment for Order {payment.order.id}"
        }
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        response = requests.post(MPesaGateway.STK_PUSH_URL, json=payload, headers=headers)
        PaymentLog.objects.create(payment=payment, event='mpesa_stk_push', message=str(response.text))
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"STK Push failed: {response.text}")

    @staticmethod
    def handle_callback(callback_data: dict) -> bool:
        # Validate and update payment/order status
        try:
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            meta = stk_callback.get('CallbackMetadata', {})
            payment = Payment.objects.filter(transaction_id=checkout_request_id).first()
            if not payment:
                PaymentLog.objects.create(payment=None, event='mpesa_callback_error', message=f'Payment not found for {checkout_request_id}')
                return False
            if result_code == 0:
                payment.status = 'succeeded'
                payment.order.status = 'processing'
                payment.order.save()
            else:
                payment.status = 'failed'
            payment.raw_response = stk_callback
            payment.save()
            PaymentLog.objects.create(payment=payment, event='mpesa_callback', message=str(stk_callback))
            return True
        except Exception as e:
            PaymentLog.objects.create(payment=None, event='mpesa_callback_exception', message=str(e))
            return False
