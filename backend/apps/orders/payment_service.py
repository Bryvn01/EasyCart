import requests
import base64
from datetime import datetime
from django.conf import settings
from django.utils.text import get_valid_filename
import os
import stripe

class MpesaPaymentService:
    def __init__(self):
        self.consumer_key = os.environ.get('MPESA_CONSUMER_KEY', '')
        self.consumer_secret = os.environ.get('MPESA_CONSUMER_SECRET', '')
        self.business_shortcode = os.environ.get('MPESA_SHORTCODE', '174379')
        self.passkey = os.environ.get('MPESA_PASSKEY', '')
        self.callback_url = os.environ.get('MPESA_CALLBACK_URL', 'https://yourdomain.com/api/payments/mpesa/callback/')
        self.base_url = 'https://sandbox.safaricom.co.ke' if settings.DEBUG else 'https://api.safaricom.co.ke'

    def get_access_token(self):
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        if not self.consumer_key or not self.consumer_secret:
            return None

        credentials = base64.b64encode(f"{self.consumer_key}:{self.consumer_secret}".encode()).decode()

        headers = {
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json'
        }

        try:
            response = requests.get(url, headers=headers, timeout=30, verify=True)
            response.raise_for_status()
            return response.json().get('access_token')
        except requests.exceptions.RequestException:
            return None

    def initiate_stk_push(self, phone_number, amount, order_id):
        access_token = self.get_access_token()
        if not access_token:
            return {'success': False, 'message': 'Failed to get access token'}

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(f"{self.business_shortcode}{self.passkey}{timestamp}".encode()).decode()

        # Sanitize phone number
        phone_number = get_valid_filename(str(phone_number).replace('+', '').replace(' ', ''))

        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        payload = {
            'BusinessShortCode': self.business_shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(amount),
            'PartyA': phone_number,
            'PartyB': self.business_shortcode,
            'PhoneNumber': phone_number,
            'CallBackURL': self.callback_url,
            'AccountReference': f'Order-{order_id}',
            'TransactionDesc': f'Payment for Order {order_id}'
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30, verify=True)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return {'success': False, 'message': 'Payment request failed'}

class CardPaymentService:
    def __init__(self):
        self.api_key = os.environ.get('FLUTTERWAVE_API_KEY', '')
        self.base_url = 'https://api.flutterwave.com/v3'

    def initiate_payment(self, amount, email, phone, order_id):
        url = f"{self.base_url}/payments"
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        payload = {
            'tx_ref': f'order-{order_id}-{datetime.now().timestamp()}',
            'amount': str(amount),
            'currency': 'KES',
            'redirect_url': f'{os.environ.get("FRONTEND_URL", "http://localhost:3000")}/payment/success',
            'customer': {
                'email': email,
                'phonenumber': phone,
                'name': 'Customer'
            },
            'customizations': {
                'title': 'E-Commerce Payment',
                'description': f'Payment for Order {order_id}'
            }
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30, verify=True)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return {'status': 'error', 'message': 'Payment initialization failed'}

class StripePaymentService:
    def __init__(self):
        self.api_key = os.environ.get('STRIPE_SECRET_KEY', '')
        stripe.api_key = self.api_key

    def initiate_payment(self, amount, email, phone, order_id):
        if not self.api_key:
            return {'status': 'error', 'message': 'Stripe not configured'}

        try:
            # Create a Stripe Checkout Session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'kes',
                        'unit_amount': int(float(amount) * 100),  # Stripe expects amount in cents
                        'product_data': {
                            'name': f'Order #{order_id}',
                            'description': f'Payment for Order {order_id}',
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f'{os.environ.get("FRONTEND_URL", "http://localhost:3000")}/payment/success?order_id={order_id}',
                cancel_url=f'{os.environ.get("FRONTEND_URL", "http://localhost:3000")}/payment/cancel?order_id={order_id}',
                customer_email=email,
                metadata={
                    'order_id': str(order_id),
                    'phone': phone
                }
            )
            return {
                'status': 'success',
                'session_id': session.id,
                'checkout_url': session.url,
                'data': {'link': session.url}
            }
        except stripe.error.StripeError as e:
            return {'status': 'error', 'message': str(e)}
        except Exception as e:
            return {'status': 'error', 'message': 'Payment initialization failed'}

class PayPalPaymentService:
    def __init__(self):
        self.client_id = os.environ.get('PAYPAL_CLIENT_ID', '')
        self.client_secret = os.environ.get('PAYPAL_CLIENT_SECRET', '')
        self.mode = os.environ.get('PAYPAL_MODE', 'sandbox')  # sandbox or live
        self.base_url = 'https://api-m.sandbox.paypal.com' if self.mode == 'sandbox' else 'https://api-m.paypal.com'

    def get_access_token(self):
        if not self.client_id or not self.client_secret:
            return None

        url = f"{self.base_url}/v1/oauth2/token"
        headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
        }
        data = {
            'grant_type': 'client_credentials'
        }

        try:
            response = requests.post(
                url,
                headers=headers,
                data=data,
                auth=(self.client_id, self.client_secret),
                timeout=30
            )
            response.raise_for_status()
            return response.json().get('access_token')
        except requests.exceptions.RequestException:
            return None

    def initiate_payment(self, amount, email, phone, order_id):
        access_token = self.get_access_token()
        if not access_token:
            return {'status': 'error', 'message': 'PayPal not configured or authentication failed'}

        url = f"{self.base_url}/v2/checkout/orders"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }

        payload = {
            'intent': 'CAPTURE',
            'purchase_units': [{
                'reference_id': f'order-{order_id}',
                'amount': {
                    'currency_code': 'USD',  # PayPal requires USD or other supported currencies
                    'value': str(round(float(amount) / 130, 2))  # Convert KES to USD (approximate rate)
                },
                'description': f'Payment for Order {order_id}'
            }],
            'application_context': {
                'return_url': f'{os.environ.get("FRONTEND_URL", "http://localhost:3000")}/payment/success?order_id={order_id}',
                'cancel_url': f'{os.environ.get("FRONTEND_URL", "http://localhost:3000")}/payment/cancel?order_id={order_id}',
                'brand_name': 'EasyCart',
                'user_action': 'PAY_NOW'
            }
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30, verify=True)
            response.raise_for_status()
            result = response.json()

            # Find the approval URL
            approve_link = None
            for link in result.get('links', []):
                if link.get('rel') == 'approve':
                    approve_link = link.get('href')
                    break

            return {
                'status': 'success',
                'order_id': result.get('id'),
                'approval_url': approve_link,
                'data': {'link': approve_link}
            }
        except requests.exceptions.RequestException:
            return {'status': 'error', 'message': 'PayPal payment initialization failed'}
