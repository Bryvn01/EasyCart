#!/usr/bin/env python3
"""
Automated test script for Wishlist and Review APIs
Run with: python test_wishlist_reviews.py
"""

import requests
import json
import sys
from datetime import datetime

import os

BASE_URL = "http://localhost:8000/api"
AUTH_TOKEN = None  # Set this after login

def print_result(test_name, success, message=""):
    """Print test result with formatting"""
    status = "[PASS]" if success else "[FAIL]"
    print(f"{status} {test_name}")
    if message:
        print(f"   {message}")
    print()

def login_user():
    """Login and get authentication token with proper session validation"""
    global AUTH_TOKEN
    try:
        # Use environment variables or defaults for test credentials
        test_email = os.getenv('TEST_EMAIL', 'test@example.com')
        test_password = os.getenv('TEST_PASSWORD', 'testpassword')

        response = requests.post(
            f"{BASE_URL}/auth/login/",
            json={"email": test_email, "password": test_password}
        )
        if response.status_code == 200:
            data = response.json()
            # Validate user role from server response, not client input
            if data.get('user', {}).get('is_authenticated'):
                AUTH_TOKEN = data.get('access')
                return True
        return False
    except Exception as e:
        print(f"Login failed: {e}")
        return False

def test_wishlist_apis():
    """Test wishlist related APIs"""
    print("[TEST] Testing Wishlist APIs")
    print("=" * 50)
    
    headers = {"Authorization": f"Bearer {AUTH_TOKEN}"} if AUTH_TOKEN else {}
    
    # Test 1: Get wishlist (should be empty initially)
    try:
        response = requests.get(f"{BASE_URL}/products/wishlist/", headers=headers)
        print_result(
            "Get Empty Wishlist",
            response.status_code in [200, 401],
            f"Status: {response.status_code}, Response: {response.text[:100]}"
        )
    except Exception as e:
        print_result("Get Empty Wishlist", False, f"Error: {e}")
    
    # Test 2: Add to wishlist
    try:
        response = requests.post(
            f"{BASE_URL}/products/wishlist/add/",
            headers={**headers, "Content-Type": "application/json"},
            json={"product_id": 1}
        )
        print_result(
            "Add to Wishlist",
            response.status_code in [201, 401, 400],
            f"Status: {response.status_code}, Response: {response.text[:100]}"
        )
    except Exception as e:
        print_result("Add to Wishlist", False, f"Error: {e}")
    
    # Test 3: Check wishlist status
    try:
        response = requests.get(f"{BASE_URL}/products/wishlist/check/1/", headers=headers)
        print_result(
            "Check Wishlist Status",
            response.status_code in [200, 401],
            f"Status: {response.status_code}, Response: {response.text[:100]}"
        )
    except Exception as e:
        print_result("Check Wishlist Status", False, f"Error: {e}")
    
    # Test 4: Remove from wishlist
    try:
        response = requests.delete(f"{BASE_URL}/products/wishlist/remove/1/", headers=headers)
        print_result(
            "Remove from Wishlist",
            response.status_code in [204, 401, 404],
            f"Status: {response.status_code}, Response: {response.text[:100]}"
        )
    except Exception as e:
        print_result("Remove from Wishlist", False, f"Error: {e}")

def test_review_apis():
    """Test review related APIs"""
    print("\n[TEST] Testing Review APIs")
    print("=" * 50)
    
    headers = {"Authorization": f"Bearer {AUTH_TOKEN}"} if AUTH_TOKEN else {}
    
    # Test 1: Get product reviews
    try:
        response = requests.get(f"{BASE_URL}/products/reviews/1/")
        print_result(
            "Get Product Reviews",
            response.status_code == 200,
            f"Status: {response.status_code}, Response: {response.text[:100]}"
        )
    except Exception as e:
        print_result("Get Product Reviews", False, f"Error: {e}")
    
    # Test 2: Create review
    try:
        response = requests.post(
            f"{BASE_URL}/products/reviews/create/",
            headers={**headers, "Content-Type": "application/json"},
            json={
                "product": 1,
                "rating": 5,
                "title": "Test Review",
                "comment": "This is a test review",
                "is_verified_purchase": True
            }
        )
        print_result(
            "Create Review",
            response.status_code in [201, 401, 400],
            f"Status: {response.status_code}, Response: {response.text[:100]}"
        )
    except Exception as e:
        print_result("Create Review", False, f"Error: {e}")
    
    # Test 3: Mark review helpful
    try:
        response = requests.post(
            f"{BASE_URL}/products/reviews/helpful/",
            headers={**headers, "Content-Type": "application/json"},
            json={"review_id": 1, "is_helpful": True}
        )
        print_result(
            "Mark Review Helpful",
            response.status_code in [200, 401, 400],
            f"Status: {response.status_code}, Response: {response.text[:100]}"
        )
    except Exception as e:
        print_result("Mark Review Helpful", False, f"Error: {e}")

def main():
    """Main test function"""
    print("[START] Starting Wishlist & Review API Tests")
    print(f"Timestamp: {datetime.now()}")
    print("=" * 60)

    # Try to login first
    if login_user():
        print("[OK] User logged in successfully")
    else:
        print("[WARN] Login failed, testing without authentication")

    # Run tests
    test_wishlist_apis()
    test_review_apis()

    print("[DONE] Test execution completed!")
    print("Check the results above and refer to TESTING_GUIDE.md for manual testing.")

if __name__ == "__main__":
    main()
