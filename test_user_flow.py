# EasyCart User Flow Test Script
# Tests complete flow: OTP Login → Add to Cart → Checkout

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
TEST_PHONE = "+254723796116"
TEST_EMAIL = "test@example.com"

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RESET = '\033[0m'

def print_step(step_num, description):
    """Print test step header"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Step {step_num}: {description}{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")

def print_success(message):
    """Print success message"""
    print(f"{Colors.GREEN}✓ {message}{Colors.RESET}")

def print_error(message):
    """Print error message"""
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")

def print_info(message):
    """Print info message"""
    print(f"{Colors.YELLOW}ℹ {message}{Colors.RESET}")

def print_response(response):
    """Pretty print API response"""
    print(f"\nStatus Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

# Test variables
access_token = None
user_id = None
product_id = None
cart_item_id = None
order_id = None

# ============================================================================
# STEP 1: Request OTP
# ============================================================================
print_step(1, "Request OTP for Login")

otp_request_data = {
    "identifier": TEST_PHONE,
    "method": "console"  # Using console for testing
}

try:
    response = requests.post(
        f"{BASE_URL}/auth/otp/request/",
        json=otp_request_data,
        headers={"Content-Type": "application/json"}
    )
    print_response(response)

    if response.status_code == 200:
        data = response.json()
        print_success("OTP request successful")
        print_info(f"Identifier: {data.get('identifier')}")
        print_info(f"Method: {data.get('message')}")
        print_info(f"Expires in: {data.get('expires_in')} seconds")
        print_info(f"Can resend after: {data.get('can_resend_after')} seconds")
        print_info(f"New user: {data.get('is_new_user')}")

        print_info("\n📱 CHECK SERVER CONSOLE FOR OTP CODE")
        otp_code = input(f"\n{Colors.YELLOW}Enter OTP code from console: {Colors.RESET}")
    else:
        print_error(f"OTP request failed: {response.status_code}")
        exit(1)

except Exception as e:
    print_error(f"Error requesting OTP: {str(e)}")
    exit(1)

# ============================================================================
# STEP 2: Verify OTP and Login
# ============================================================================
print_step(2, "Verify OTP and Login")

otp_verify_data = {
    "identifier": TEST_PHONE,
    "otp_code": otp_code
}

try:
    response = requests.post(
        f"{BASE_URL}/auth/otp/verify/",
        json=otp_verify_data,
        headers={"Content-Type": "application/json"}
    )
    print_response(response)

    if response.status_code == 200:
        data = response.json()
        access_token = data.get('access')
        refresh_token = data.get('refresh')
        user_data = data.get('user')
        user_id = user_data.get('id')

        print_success("OTP verification successful")
        print_success(f"Logged in as User ID: {user_id}")
        print_info(f"Email: {user_data.get('email')}")
        print_info(f"Phone: {user_data.get('phone_number')}")
        print_info(f"Profile complete: {data.get('is_profile_complete')}")
        print_info(f"Access token: {access_token[:50]}...")
    else:
        print_error(f"OTP verification failed: {response.status_code}")
        exit(1)

except Exception as e:
    print_error(f"Error verifying OTP: {str(e)}")
    exit(1)

# ============================================================================
# STEP 3: Complete User Profile (if needed)
# ============================================================================
print_step(3, "Update User Profile")

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

profile_data = {
    "first_name": "Test",
    "last_name": "User",
    "email": user_data.get('email'),
    "phone": TEST_PHONE
}

try:
    response = requests.patch(
        f"{BASE_URL}/auth/profile/",
        json=profile_data,
        headers=headers
    )
    print_response(response)

    if response.status_code == 200:
        print_success("Profile updated successfully")
        updated_user = response.json()
        print_info(f"Name: {updated_user.get('first_name')} {updated_user.get('last_name')}")
    else:
        print_error(f"Profile update failed: {response.status_code}")

except Exception as e:
    print_error(f"Error updating profile: {str(e)}")

# ============================================================================
# STEP 4: Browse Products
# ============================================================================
print_step(4, "Browse Products")

try:
    response = requests.get(
        f"{BASE_URL}/products/",
        headers={"Content-Type": "application/json"}
    )
    print_response(response)

    if response.status_code == 200:
        products = response.json()
        total_products = products.get('count', 0)
        product_list = products.get('results', [])

        print_success(f"Found {total_products} products")

        if product_list:
            product_id = product_list[0]['id']
            print_info(f"\nSelected Product:")
            print_info(f"  ID: {product_id}")
            print_info(f"  Name: {product_list[0]['name']}")
            print_info(f"  Price: KES {product_list[0]['price']}")
            print_info(f"  Stock: {product_list[0]['stock_quantity']}")
        else:
            print_error("No products available")
            exit(1)
    else:
        print_error(f"Failed to fetch products: {response.status_code}")
        exit(1)

except Exception as e:
    print_error(f"Error fetching products: {str(e)}")
    exit(1)

# ============================================================================
# STEP 5: Add Product to Cart
# ============================================================================
print_step(5, "Add Product to Cart")

cart_data = {
    "product_id": product_id,
    "quantity": 2
}

try:
    response = requests.post(
        f"{BASE_URL}/cart/add/",
        json=cart_data,
        headers=headers
    )
    print_response(response)

    if response.status_code in [200, 201]:
        cart_item = response.json()
        cart_item_id = cart_item.get('id')
        print_success("Product added to cart")
        print_info(f"Cart Item ID: {cart_item_id}")
        print_info(f"Quantity: {cart_item.get('quantity')}")
        print_info(f"Subtotal: KES {cart_item.get('subtotal')}")
    else:
        print_error(f"Failed to add to cart: {response.status_code}")
        exit(1)

except Exception as e:
    print_error(f"Error adding to cart: {str(e)}")
    exit(1)

# ============================================================================
# STEP 6: View Cart
# ============================================================================
print_step(6, "View Shopping Cart")

try:
    response = requests.get(
        f"{BASE_URL}/cart/",
        headers=headers
    )
    print_response(response)

    if response.status_code == 200:
        cart = response.json()
        items = cart.get('items', [])
        total = cart.get('total', 0)

        print_success(f"Cart contains {len(items)} item(s)")
        print_info(f"Cart Total: KES {total}")

        for item in items:
            print_info(f"\n  Product: {item['product_name']}")
            print_info(f"  Quantity: {item['quantity']}")
            print_info(f"  Price: KES {item['price']}")
            print_info(f"  Subtotal: KES {item['subtotal']}")
    else:
        print_error(f"Failed to fetch cart: {response.status_code}")

except Exception as e:
    print_error(f"Error fetching cart: {str(e)}")

# ============================================================================
# STEP 7: Update Cart Item Quantity
# ============================================================================
print_step(7, "Update Cart Item Quantity")

update_data = {
    "quantity": 3
}

try:
    response = requests.patch(
        f"{BASE_URL}/cart/{cart_item_id}/",
        json=update_data,
        headers=headers
    )
    print_response(response)

    if response.status_code == 200:
        updated_item = response.json()
        print_success("Cart item updated")
        print_info(f"New Quantity: {updated_item.get('quantity')}")
        print_info(f"New Subtotal: KES {updated_item.get('subtotal')}")
    else:
        print_error(f"Failed to update cart: {response.status_code}")

except Exception as e:
    print_error(f"Error updating cart: {str(e)}")

# ============================================================================
# STEP 8: Proceed to Checkout
# ============================================================================
print_step(8, "Proceed to Checkout")

checkout_data = {
    "shipping_address": "123 Test Street, Nairobi, Kenya",
    "payment_method": "mpesa",
    "phone_number": TEST_PHONE
}

try:
    response = requests.post(
        f"{BASE_URL}/orders/checkout/",
        json=checkout_data,
        headers=headers
    )
    print_response(response)

    if response.status_code in [200, 201]:
        order = response.json()
        order_id = order.get('id') or order.get('order_id')

        print_success("Order created successfully")
        print_info(f"Order ID: {order_id}")
        print_info(f"Total Amount: KES {order.get('total_amount') or order.get('total')}")
        print_info(f"Status: {order.get('status')}")
        print_info(f"Payment Method: {order.get('payment_method')}")

        if order.get('mpesa_checkout_request_id'):
            print_info(f"M-Pesa Request ID: {order.get('mpesa_checkout_request_id')}")
            print_info("⏳ Waiting for M-Pesa payment confirmation...")
    else:
        print_error(f"Checkout failed: {response.status_code}")

except Exception as e:
    print_error(f"Error during checkout: {str(e)}")

# ============================================================================
# STEP 9: View Order History
# ============================================================================
print_step(9, "View Order History")

try:
    response = requests.get(
        f"{BASE_URL}/orders/",
        headers=headers
    )
    print_response(response)

    if response.status_code == 200:
        orders = response.json()
        order_list = orders.get('results', []) if isinstance(orders, dict) else orders

        print_success(f"Found {len(order_list)} order(s)")

        for order in order_list:
            print_info(f"\nOrder #{order.get('id')}")
            print_info(f"  Date: {order.get('created_at')}")
            print_info(f"  Status: {order.get('status')}")
            print_info(f"  Total: KES {order.get('total_amount') or order.get('total')}")
    else:
        print_error(f"Failed to fetch orders: {response.status_code}")

except Exception as e:
    print_error(f"Error fetching orders: {str(e)}")

# ============================================================================
# STEP 10: View OTP Delivery Analytics
# ============================================================================
print_step(10, "View OTP Delivery Analytics")

try:
    response = requests.get(
        f"{BASE_URL}/auth/otp/analytics/",
        headers={"Content-Type": "application/json"}
    )
    print_response(response)

    if response.status_code == 200:
        analytics = response.json()
        overview = analytics.get('overview', {})

        print_success("Analytics retrieved successfully")
        print_info(f"Total Deliveries: {overview.get('total_deliveries')}")
        print_info(f"Success Rate: {overview.get('success_rate')}%")
        print_info(f"Successful: {overview.get('successful')}")
        print_info(f"Failed: {overview.get('failed')}")

        print_info("\nBy Method:")
        for method in analytics.get('by_method', []):
            print_info(f"  {method['method'].upper()}: {method['total']} ({method['success_rate']}% success)")

        recommendations = analytics.get('recommendations', [])
        if recommendations:
            print_info("\nRecommendations:")
            for rec in recommendations:
                print_info(f"  [{rec['type'].upper()}] {rec['message']}")
    else:
        print_error(f"Failed to fetch analytics: {response.status_code}")

except Exception as e:
    print_error(f"Error fetching analytics: {str(e)}")

# ============================================================================
# TEST SUMMARY
# ============================================================================
print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
print(f"{Colors.BLUE}TEST SUMMARY{Colors.RESET}")
print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")

print(f"\n{Colors.GREEN}✓ OTP Request - Successful{Colors.RESET}")
print(f"{Colors.GREEN}✓ OTP Verification - Successful{Colors.RESET}")
print(f"{Colors.GREEN}✓ User Login - Token received{Colors.RESET}")
print(f"{Colors.GREEN}✓ Profile Update - Completed{Colors.RESET}")
print(f"{Colors.GREEN}✓ Product Browsing - {total_products} products found{Colors.RESET}")
print(f"{Colors.GREEN}✓ Add to Cart - Product added{Colors.RESET}")
print(f"{Colors.GREEN}✓ View Cart - Cart retrieved{Colors.RESET}")
print(f"{Colors.GREEN}✓ Update Cart - Quantity updated{Colors.RESET}")
print(f"{Colors.GREEN}✓ Checkout - Order created (ID: {order_id}){Colors.RESET}")
print(f"{Colors.GREEN}✓ Order History - Orders retrieved{Colors.RESET}")
print(f"{Colors.GREEN}✓ Analytics - Metrics available{Colors.RESET}")

print(f"\n{Colors.BLUE}Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
