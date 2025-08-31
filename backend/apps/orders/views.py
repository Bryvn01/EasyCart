from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.text import get_valid_filename
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.utils.html import escape
from django.core.exceptions import ValidationError
import json
import re
from .models import Order, Cart, CartItem
from apps.products.models import Product
from .serializers import OrderSerializer, CartSerializer, CartItemSerializer
from .payment_service import MpesaPaymentService, CardPaymentService

class OrderListView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

@api_view(['GET'])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
def add_to_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    
    product = get_object_or_404(Product, id=product_id)
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, product=product,
        defaults={'quantity': quantity}
    )
    
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    return Response({'message': 'Item added to cart'}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def remove_from_cart(request, item_id):
    cart = get_object_or_404(Cart, user=request.user)
    # Sanitize item_id to prevent path traversal
    safe_item_id = re.sub(r'[.]{2,}|[/\\]|%2e|%2f|%5c', '', str(item_id))
    cart_item = get_object_or_404(CartItem, id=safe_item_id, cart=cart)
    cart_item.delete()
    return Response({'message': 'Item removed from cart'})

@api_view(['POST'])
def checkout(request):
    cart = get_object_or_404(Cart, user=request.user)
    if not cart.items.exists():
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    total_amount = sum(item.product.price * item.quantity for item in cart.items.all())
    
    # Sanitize and validate inputs
    raw_address = request.data.get('shipping_address', '').strip()
    # Prevent path traversal by removing dangerous characters
    shipping_address = re.sub(r'[.]{2,}|[/\\]', '', escape(raw_address))
    if not shipping_address or len(shipping_address) < 10:
        return Response({'error': 'Valid shipping address is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    payment_method = request.data.get('payment_method', 'mpesa')
    if payment_method not in ['mpesa', 'airtel', 'tkash', 'card', 'bank', 'cash']:
        return Response({'error': 'Invalid payment method'}, status=status.HTTP_400_BAD_REQUEST)
    
    phone_number = escape(request.data.get('phone_number', '').strip())
    if not re.match(r'^\+?[1-9]\d{1,14}$', phone_number):
        return Response({'error': 'Valid phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    order = Order.objects.create(
        user=request.user,
        total_amount=total_amount,
        shipping_address=shipping_address,
        payment_method=payment_method,
        phone_number=phone_number
    )
    
    for cart_item in cart.items.all():
        # Check stock availability
        if cart_item.product.stock < cart_item.quantity:
            return Response(
                {'error': f'Insufficient stock for {cart_item.product.name}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.items.create(
            product=cart_item.product,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        )
        
        # Update stock
        cart_item.product.stock -= cart_item.quantity
        cart_item.product.save()
    
    cart.items.all().delete()
    
    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def initiate_payment(request):
    order_id = request.data.get('order_id')
    payment_method = request.data.get('payment_method')
    phone_number = request.data.get('phone_number')
    
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    if payment_method == 'mpesa':
        mpesa_service = MpesaPaymentService()
        result = mpesa_service.initiate_stk_push(phone_number, order.total_amount, order_id)
        
        if result.get('ResponseCode') == '0':
            order.payment_status = 'processing'
            order.transaction_id = result.get('CheckoutRequestID')
            order.save()
            return Response({'success': True, 'message': 'Payment initiated', 'data': result})
        else:
            return Response({'success': False, 'message': result.get('errorMessage', 'Payment failed')}, 
                          status=status.HTTP_400_BAD_REQUEST)
    
    elif payment_method == 'card':
        card_service = CardPaymentService()
        result = card_service.initiate_payment(
            order.total_amount, 
            request.user.email, 
            phone_number, 
            order_id
        )
        
        if result.get('status') == 'success':
            order.payment_status = 'processing'
            order.save()
            return Response({'success': True, 'payment_url': result.get('data', {}).get('link')})
        else:
            return Response({'success': False, 'message': 'Payment initialization failed'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    
    return Response({'success': False, 'message': 'Invalid payment method'}, 
                   status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def mpesa_callback(request):
    try:
        callback_data = json.loads(request.body.decode('utf-8'))
        raw_checkout_id = str(callback_data.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID', ''))
        # Sanitize checkout request ID to prevent path traversal
        checkout_request_id = re.sub(r'[.]{2,}|[/\\]', '', escape(raw_checkout_id))
        result_code = callback_data.get('Body', {}).get('stkCallback', {}).get('ResultCode')
        
        if checkout_request_id:
            try:
                order = Order.objects.get(transaction_id=checkout_request_id)
                if result_code == 0:
                    order.payment_status = 'completed'
                    order.status = 'processing'
                    # Extract M-Pesa receipt number
                    callback_metadata = callback_data.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {})
                    items = callback_metadata.get('Item', [])
                    for item in items:
                        if item.get('Name') == 'MpesaReceiptNumber':
                            order.payment_reference = escape(str(item.get('Value', ''))[:100])
                            break
                else:
                    order.payment_status = 'failed'
                order.save()
            except Order.DoesNotExist:
                pass
        
        return JsonResponse({'ResultCode': 0, 'ResultDesc': escape('Success')})
    except:
        return JsonResponse({'ResultCode': 1, 'ResultDesc': escape('Error')})

@api_view(['GET'])
def payment_status(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return Response({
        'order_id': order.id,
        'payment_status': order.payment_status,
        'payment_method': order.payment_method,
        'payment_reference': order.payment_reference,
        'total_amount': order.total_amount
    })