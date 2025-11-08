"""
🔍 EasyCart Login Diagnostic Tool
Tests the login endpoint to ensure it's working correctly
"""

import requests
import json

API_URL = "http://localhost:8000/api"

def test_login_endpoint():
    """Test if login endpoint accepts requests without CSRF error"""

    print("\n" + "="*60)
    print("🔍 EASYCART LOGIN DIAGNOSTIC TEST")
    print("="*60)

    # Test 1: Health Check
    print("\n[1/4] Testing API Health...")
    try:
        response = requests.get(f"{API_URL}/health/")
        if response.status_code == 200:
            print("✅ API Health: OPERATIONAL")
        else:
            print(f"❌ API Health: {response.status_code}")
    except Exception as e:
        print(f"❌ API Health: {str(e)}")
        return

    # Test 2: Login endpoint availability
    print("\n[2/4] Testing Login Endpoint Accessibility...")
    test_credentials = {
        "email": "test@example.com",
        "password": "wrongpassword"
    }

    try:
        response = requests.post(
            f"{API_URL}/auth/login/",
            json=test_credentials,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 400:
            print("✅ Login Endpoint: ACCESSIBLE (400 = Invalid credentials, expected)")
        elif response.status_code == 403:
            print("❌ Login Endpoint: CSRF ERROR - Middleware not working!")
            print(f"   Response: {response.text}")
        else:
            print(f"⚠️  Login Endpoint: Status {response.status_code}")
            print(f"   Response: {response.text[:200]}")

    except Exception as e:
        print(f"❌ Login Endpoint Error: {str(e)}")

    # Test 3: Registration endpoint
    print("\n[3/4] Testing Registration Endpoint...")
    try:
        response = requests.post(
            f"{API_URL}/auth/register/",
            json={
                "username": "testuser",
                "email": "test@test.com",
                "password": "test",
                "password_confirm": "test"
            },
            headers={"Content-Type": "application/json"}
        )

        if response.status_code in [201, 400]:  # 201=success, 400=validation error
            print("✅ Registration Endpoint: ACCESSIBLE")
        elif response.status_code == 403:
            print("❌ Registration Endpoint: CSRF ERROR!")
        else:
            print(f"⚠️  Registration Endpoint: Status {response.status_code}")

    except Exception as e:
        print(f"❌ Registration Endpoint Error: {str(e)}")

    # Test 4: Products endpoint (should work without auth)
    print("\n[4/4] Testing Products Endpoint...")
    try:
        response = requests.get(f"{API_URL}/products/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Products Endpoint: {len(data.get('results', []))} products loaded")
        else:
            print(f"❌ Products Endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Products Endpoint Error: {str(e)}")

    print("\n" + "="*60)
    print("📊 DIAGNOSTIC COMPLETE")
    print("="*60)
    print("\n✅ If all tests show ✅, login should work!")
    print("❌ If you see CSRF ERROR, the middleware fix didn't apply.")
    print("\n")

if __name__ == "__main__":
    test_login_endpoint()
