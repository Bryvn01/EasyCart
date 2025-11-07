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
import requests
from .models import Order, Cart, CartItem
from apps.products.models import Product
from .serializers import OrderSerializer, CartSerializer, CartItemSerializer
from .payment_service import (
    MpesaPaymentService,
    CardPaymentService,
    StripePaymentService,
    PayPalPaymentService,
)


class OrderListView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


@api_view(["GET"])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)


@api_view(["POST"])
def add_to_cart(request):
    from .idempotency import idempotent_operation

    cart, created = Cart.objects.get_or_create(user=request.user)
    product_id = request.data.get("product_id")
    quantity = request.data.get("quantity", 1)

    # Validate quantity
    try:
        quantity = int(quantity)
        if quantity < 1 or quantity > 100:
            return Response(
                {"error": "Quantity must be between 1 and 100"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    except (ValueError, TypeError):
        return Response(
            {"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST
        )

    product = get_object_or_404(Product, id=product_id)

    # Check stock availability
    if product.stock < quantity:
        return Response(
            {"error": f"Only {product.stock} items available"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, product=product, defaults={"quantity": quantity}
    )

    if not created:
        # Check if adding quantity exceeds stock
        new_quantity = cart_item.quantity + quantity
        if new_quantity > product.stock:
            return Response(
                {
                    "error": f"Cannot add {quantity} more. Only {product.stock - cart_item.quantity} available"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        cart_item.quantity = new_quantity
        cart_item.save()

    return Response(
        {
            "message": "Item added to cart",
            "cart_item_id": cart_item.id,
            "quantity": cart_item.quantity,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["DELETE"])
def remove_from_cart(request, item_id):
    cart = get_object_or_404(Cart, user=request.user)
    # Sanitize item_id to prevent path traversal
    safe_item_id = re.sub(r"[.]{2,}|[/\\]|%2e|%2f|%5c", "", str(item_id))
    cart_item = get_object_or_404(CartItem, id=safe_item_id, cart=cart)
    cart_item.delete()
    return Response({"message": "Item removed from cart"})


@api_view(["PATCH"])
def update_cart_item(request, item_id):
    cart = get_object_or_404(Cart, user=request.user)
    # Sanitize item_id to prevent path traversal
    safe_item_id = re.sub(r"[.]{2,}|[/\\]|%2e|%2f|%5c", "", str(item_id))
    cart_item = get_object_or_404(CartItem, id=safe_item_id, cart=cart)

    quantity = request.data.get("quantity")
    if quantity is None:
        return Response(
            {"error": "Quantity is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        quantity = int(quantity)
        if quantity < 1:
            return Response(
                {"error": "Quantity must be at least 1"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if quantity > 100:
            return Response(
                {"error": "Quantity cannot exceed 100"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    except (ValueError, TypeError):
        return Response(
            {"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Check stock availability
    if cart_item.product.stock < quantity:
        return Response(
            {"error": f"Only {cart_item.product.stock} items available in stock"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cart_item.quantity = quantity
    cart_item.save()

    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data)


@api_view(["POST"])
def move_to_wishlist(request, item_id):
    """Move an item from cart to wishlist"""
    from apps.products.wishlist_models import Wishlist, WishlistItem

    cart = get_object_or_404(Cart, user=request.user)
    # Sanitize item_id to prevent path traversal
    safe_item_id = re.sub(r"[.]{2,}|[/\\]|%2e|%2f|%5c", "", str(item_id))
    cart_item = get_object_or_404(CartItem, id=safe_item_id, cart=cart)

    # Get or create wishlist
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)

    # Check if item already exists in wishlist
    if WishlistItem.objects.filter(
        wishlist=wishlist, product=cart_item.product
    ).exists():
        # Just remove from cart, don't add duplicate to wishlist
        cart_item.delete()
        return Response(
            {"message": "Item already in wishlist, removed from cart"},
            status=status.HTTP_200_OK,
        )

    # Add to wishlist
    wishlist_item = WishlistItem.objects.create(
        wishlist=wishlist, product=cart_item.product
    )

    # Remove from cart
    cart_item.delete()

    return Response(
        {
            "message": "Item moved to wishlist successfully",
            "wishlist_item_id": wishlist_item.id,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def checkout(request):
    """
    Enhanced checkout with atomic transactions and inventory locking
    Ensures all-or-nothing behavior for orders
    """
    from django.db import transaction
    from django.db.models import F
    
    cart = get_object_or_404(Cart, user=request.user)
    if not cart.items.exists():
        return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

    # Sanitize and validate inputs
    raw_address = request.data.get("shipping_address", "").strip()
    # Prevent path traversal by removing dangerous characters
    shipping_address = re.sub(r"[.]{2,}|[/\\]", "", escape(raw_address))
    if not shipping_address or len(shipping_address) < 10:
        return Response(
            {"error": "Valid shipping address is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    payment_method = request.data.get("payment_method", "mpesa")
    if payment_method not in [
        "mpesa",
        "airtel",
        "tkash",
        "card",
        "stripe",
        "paypal",
        "bank",
        "cash",
    ]:
        return Response(
            {"error": "Invalid payment method"}, status=status.HTTP_400_BAD_REQUEST
        )

    phone_number = escape(request.data.get("phone_number", "").strip())
    if not re.match(r"^\+?[1-9]\d{1,14}$", phone_number):
        return Response(
            {"error": "Valid phone number is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Use atomic transaction to ensure all-or-nothing behavior
        with transaction.atomic():
            # Select cart items with row-level locks to prevent race conditions
            cart_items = cart.items.select_related('product').select_for_update()
            
            # Pre-validate all items before creating order
            validation_errors = []
            total_amount = 0
            
            for cart_item in cart_items:
                # Refresh product from DB with lock to get latest stock
                product = Product.objects.select_for_update().get(id=cart_item.product.id)
                
                # Check stock availability
                if product.stock < cart_item.quantity:
                    validation_errors.append(
                        f"{product.name}: Only {product.stock} available, you requested {cart_item.quantity}"
                    )
                
                # Calculate total with current prices
                total_amount += product.price * cart_item.quantity
            
            # If any validation errors, abort before creating order
            if validation_errors:
                return Response(
                    {
                        "error": "Stock validation failed",
                        "details": validation_errors
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                shipping_address=shipping_address,
                payment_method=payment_method,
                phone_number=phone_number,
            )

            # Create order items and update stock atomically
            for cart_item in cart_items:
                # Get fresh product with lock
                product = Product.objects.select_for_update().get(id=cart_item.product.id)
                
                # Double-check stock (in case of concurrent operations)
                if product.stock < cart_item.quantity:
                    # This should rarely happen due to earlier validation
                    raise ValidationError(
                        f"Stock changed for {product.name}. Please refresh your cart."
                    )
                
                # Create order item
                order.items.create(
                    product=product,
                    quantity=cart_item.quantity,
                    price=product.price,  # Capture price at time of order
                )

                # Update stock using F() expression to prevent race conditions
                Product.objects.filter(id=product.id).update(
                    stock=F('stock') - cart_item.quantity
                )

            # Clear cart only after successful order creation
            cart.items.all().delete()

        # Transaction committed successfully
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        
    except ValidationError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        # Log the error for debugging
        print(f"Checkout error: {str(e)}")
        return Response(
            {"error": "Checkout failed. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def initiate_payment(request):
    order_id = request.data.get("order_id")
    payment_method = request.data.get("payment_method")
    phone_number = request.data.get("phone_number")

    order = get_object_or_404(Order, id=order_id, user=request.user)

    if payment_method == "mpesa":
        mpesa_service = MpesaPaymentService()
        try:
            result = mpesa_service.initiate_stk_push(
                phone_number, order.total_amount, order_id
            )
            if result.get("ResponseCode") == "0":
                order.payment_status = "processing"
                order.transaction_id = result.get("CheckoutRequestID")
                order.save()
                return Response(
                    {"success": True, "message": "Payment initiated", "data": result}
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": result.get("errorMessage", "Payment failed"),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except requests.exceptions.RequestException as e:
            # Handle network-related errors
            print(f"Network error processing M-Pesa payment: {e}")
            return Response(
                {
                    "success": False,
                    "message": "Payment service temporarily unavailable",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            # Handle other unexpected errors
            print(f"Unexpected error processing M-Pesa payment: {e}")
            return Response(
                {"success": False, "message": "Payment processing failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    elif payment_method == "card":
        card_service = CardPaymentService()
        try:
            result = card_service.initiate_payment(
                order.total_amount, request.user.email, phone_number, order_id
            )
            if result.get("status") == "success":
                order.payment_status = "processing"
                order.save()
                return Response(
                    {"success": True, "payment_url": result.get("data", {}).get("link")}
                )
            else:
                return Response(
                    {"success": False, "message": "Payment initialization failed"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except requests.exceptions.RequestException as e:
            # Handle network-related errors
            print(f"Network error processing card payment: {e}")
            return Response(
                {
                    "success": False,
                    "message": "Payment service temporarily unavailable",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            # Handle other unexpected errors
            print(f"Unexpected error processing card payment: {e}")
            return Response(
                {"success": False, "message": "Payment processing failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    elif payment_method == "stripe":
        stripe_service = StripePaymentService()
        try:
            result = stripe_service.initiate_payment(
                order.total_amount, request.user.email, phone_number, order_id
            )
            if result.get("status") == "success":
                order.payment_status = "processing"
                order.transaction_id = result.get("session_id")
                order.save()
                return Response(
                    {"success": True, "payment_url": result.get("checkout_url")}
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": result.get(
                            "message", "Payment initialization failed"
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            print(f"Error processing Stripe payment: {e}")
            return Response(
                {"success": False, "message": "Payment processing failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    elif payment_method == "paypal":
        paypal_service = PayPalPaymentService()
        try:
            result = paypal_service.initiate_payment(
                order.total_amount, request.user.email, phone_number, order_id
            )
            if result.get("status") == "success":
                order.payment_status = "processing"
                order.transaction_id = result.get("order_id")
                order.save()
                return Response(
                    {"success": True, "payment_url": result.get("approval_url")}
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": result.get(
                            "message", "Payment initialization failed"
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            print(f"Error processing PayPal payment: {e}")
            return Response(
                {"success": False, "message": "Payment processing failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    return Response(
        {"success": False, "message": "Invalid payment method"},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["POST"])
def mpesa_callback(request):
    try:
        callback_data = json.loads(request.body.decode("utf-8"))
        raw_checkout_id = str(
            callback_data.get("Body", {})
            .get("stkCallback", {})
            .get("CheckoutRequestID", "")
        )
        # Sanitize checkout request ID to prevent path traversal
        checkout_request_id = re.sub(r"[.]{2,}|[/\\]", "", escape(raw_checkout_id))
        result_code = (
            callback_data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
        )

        if checkout_request_id:
            try:
                order = Order.objects.get(transaction_id=checkout_request_id)
                if result_code == 0:
                    order.payment_status = "completed"
                    order.status = "processing"
                    # Extract M-Pesa receipt number
                    callback_metadata = (
                        callback_data.get("Body", {})
                        .get("stkCallback", {})
                        .get("CallbackMetadata", {})
                    )
                    items = callback_metadata.get("Item", [])
                    for item in items:
                        if item.get("Name") == "MpesaReceiptNumber":
                            order.payment_reference = escape(
                                str(item.get("Value", ""))[:100]
                            )
                            break
                else:
                    order.payment_status = "failed"
                order.save()
            except Order.DoesNotExist:
                pass

        return JsonResponse({"ResultCode": 0, "ResultDesc": escape("Success")})
    except BaseException:
        return JsonResponse({"ResultCode": 1, "ResultDesc": escape("Error")})


@api_view(["GET"])
def payment_status(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return Response(
        {
            "order_id": order.id,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "payment_reference": order.payment_reference,
            "total_amount": order.total_amount,
        }
    )
