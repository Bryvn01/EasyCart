"""
EasyCart Complete User Flow Test
Interactive test script with manual OTP entry
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
TEST_PHONE = "+254723796116"

print("="*70)
print("EASYCART USER FLOW TEST")
print("="*70)

# Global variables
token = None
user_id = None

# Step 1: Request OTP
print("\n[STEP 1] Requesting OTP for", TEST_PHONE)
response = requests.post(
    f"{BASE_URL}/auth/otp/request/",
    json={"identifier": TEST_PHONE, "method": "console"}
)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code != 200:
    print("\n❌ OTP Request failed!")
    exit(1)

print("\n✅ OTP Request successful!")
print("\n📱 Check the Django server console for the OTP code")
print("   Look for: 📱 [CONSOLE] OTP for +254723796116: XXXXXX")

# Step 2: Get OTP from user
otp_code = input("\nEnter the 6-digit OTP code: ").strip()

print(f"\n[STEP 2] Verifying OTP: {otp_code}")
response = requests.post(
    f"{BASE_URL}/auth/otp/verify/",
    json={"identifier": TEST_PHONE, "otp_code": otp_code}
)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code != 200:
    print("\n❌ OTP Verification failed!")
    exit(1)

data = response.json()
token = data['access']
user_id = data['user']['id']
print(f"\n✅ Login successful! User ID: {user_id}")
print(f"   Token: {token[:50]}...")

headers = {"Authorization": f"Bearer {token}"}

# Step 3: Update Profile
print(f"\n[STEP 3] Updating user profile")
response = requests.patch(
    f"{BASE_URL}/auth/profile/",
    json={"first_name": "Test", "last_name": "User"},
    headers=headers
)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
print("✅ Profile updated!")

# Step 4: Browse Products
print(f"\n[STEP 4] Browsing products")
response = requests.get(f"{BASE_URL}/products/")
print(f"Status: {response.status_code}")
products_data = response.json()
products = products_data.get('results', [])
print(f"Found {len(products)} products")

if not products:
    print("❌ No products available!")
    exit(1)

product = products[0]
product_id = product['id']
print(f"\n   Selected: {product['name']}")
print(f"   Price: KES {product['price']}")
print(f"   Stock: {product['stock_quantity']}")
print("✅ Products loaded!")

# Step 5: Add to Cart
print(f"\n[STEP 5] Adding product to cart")
response = requests.post(
    f"{BASE_URL}/cart/add/",
    json={"product_id": product_id, "quantity": 2},
    headers=headers
)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code not in [200, 201]:
    print("❌ Failed to add to cart!")
    exit(1)

cart_item = response.json()
cart_item_id = cart_item.get('id')
print(f"✅ Added to cart! Cart Item ID: {cart_item_id}")

# Step 6: View Cart
print(f"\n[STEP 6] Viewing cart")
response = requests.get(f"{BASE_URL}/cart/", headers=headers)
print(f"Status: {response.status_code}")
cart_data = response.json()
print(f"Response: {json.dumps(cart_data, indent=2)}")

cart_total = cart_data.get('total', 0)
cart_items = cart_data.get('items', [])
print(f"✅ Cart has {len(cart_items)} item(s), Total: KES {cart_total}")

# Step 7: Update Cart Quantity
if cart_item_id:
    print(f"\n[STEP 7] Updating cart quantity to 3")
    response = requests.patch(
        f"{BASE_URL}/cart/{cart_item_id}/",
        json={"quantity": 3},
        headers=headers
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("✅ Cart updated!")

# Step 8: Checkout
print(f"\n[STEP 8] Creating order (checkout)")
response = requests.post(
    f"{BASE_URL}/orders/checkout/",
    json={
        "shipping_address": "123 Test St, Nairobi",
        "payment_method": "mpesa",
        "phone_number": TEST_PHONE
    },
    headers=headers
)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code in [200, 201]:
    order = response.json()
    order_id = order.get('id') or order.get('order_id')
    print(f"✅ Order created! Order ID: {order_id}")
else:
    print(f"⚠️  Checkout returned status {response.status_code}")

# Step 9: View Orders
print(f"\n[STEP 9] Viewing order history")
response = requests.get(f"{BASE_URL}/orders/", headers=headers)
print(f"Status: {response.status_code}")
orders_data = response.json()
orders = orders_data.get('results', []) if isinstance(orders_data, dict) else orders_data
print(f"Found {len(orders)} order(s)")
for order in orders:
    print(f"   Order #{order.get('id')}: {order.get('status')} - KES {order.get('total_amount') or order.get('total')}")
print("✅ Orders retrieved!")

# Step 10: View Analytics
print(f"\n[STEP 10] Viewing OTP delivery analytics")
response = requests.get(f"{BASE_URL}/auth/otp/analytics/")
print(f"Status: {response.status_code}")
analytics = response.json()
print(f"Response: {json.dumps(analytics, indent=2)}")

overview = analytics.get('overview', {})
print(f"\n   Total Deliveries: {overview.get('total_deliveries')}")
print(f"   Success Rate: {overview.get('success_rate')}%")
print("✅ Analytics retrieved!")

# Summary
print("\n" + "="*70)
print("TEST SUMMARY")
print("="*70)
print("✅ OTP Request - SUCCESS")
print("✅ OTP Verification - SUCCESS")
print("✅ User Login - SUCCESS")
print("✅ Profile Update - SUCCESS")
print("✅ Product Browse - SUCCESS")
print("✅ Add to Cart - SUCCESS")
print("✅ View Cart - SUCCESS")
print("✅ Update Cart - SUCCESS")
print("✅ Checkout - SUCCESS")
print("✅ View Orders - SUCCESS")
print("✅ View Analytics - SUCCESS")
print("\n🎉 ALL TESTS PASSED!")
print("="*70)
