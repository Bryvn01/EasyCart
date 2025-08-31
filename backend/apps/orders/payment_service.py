import requests
import base64
from datetime import datetime
from django.conf import settings
from django.utils.text import get_valid_filename
import os

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