"""
Test PostgreSQL API Endpoints
Run this to verify your backend is serving PostgreSQL data correctly
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"


def test_categories():
    """Test categories endpoint"""
    print("\n" + "=" * 50)
    print("Testing: GET /api/products/categories/")
    print("=" * 50)

    try:
        response = requests.get(f"{BASE_URL}/products/categories/")
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {len(data)} categories")
            print("\nCategories:")
            for cat in data[:5]:  # Show first 5
                print(f"  - {cat.get('name')} (ID: {cat.get('id')})")
            if len(data) > 5:
                print(f"  ... and {len(data) - 5} more")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("Make sure Django backend is running on port 8000")


def test_products():
    """Test products endpoint"""
    print("\n" + "=" * 50)
    print("Testing: GET /api/products/")
    print("=" * 50)

    try:
        response = requests.get(f"{BASE_URL}/products/")
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            total = data.get("count", 0)
            products = data.get("results", [])
            print(f"✅ Success! Found {total} total products")
            print(f"Returned {len(products)} products on this page")

            print("\nSample Products:")
            for product in products[:3]:  # Show first 3
                print(f"\n  Product: {product.get('name')}")
                print(f"  Price: ${product.get('price')}")
                print(f"  Category: {product.get('category', {}).get('name', 'N/A')}")
                print(f"  Stock: {product.get('stock')}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("Make sure Django backend is running on port 8000")


def test_product_detail():
    """Test getting first product detail"""
    print("\n" + "=" * 50)
    print("Testing: GET /api/products/{id}/")
    print("=" * 50)

    try:
        # First get a product ID
        response = requests.get(f"{BASE_URL}/products/")
        if response.status_code == 200:
            data = response.json()
            products = data.get("results", [])
            if products:
                product_id = products[0].get("id")

                # Now get the detail
                detail_response = requests.get(f"{BASE_URL}/products/{product_id}/")
                print(f"Status Code: {detail_response.status_code}")

                if detail_response.status_code == 200:
                    product = detail_response.json()
                    print(f"✅ Success! Retrieved product details")
                    print(f"\n  Name: {product.get('name')}")
                    print(f"  Price: ${product.get('price')}")
                    print(f"  Description: {product.get('description', 'N/A')[:100]}...")
                    print(f"  Category: {product.get('category', {}).get('name', 'N/A')}")
                    print(f"  Brand: {product.get('brand', 'N/A')}")
                    print(f"  Stock: {product.get('stock')}")
                else:
                    print(f"❌ Error: {detail_response.text}")
            else:
                print("No products found to test detail view")
    except Exception as e:
        print(f"❌ Connection Error: {e}")


def test_search():
    """Test product search"""
    print("\n" + "=" * 50)
    print("Testing: GET /api/products/?search=shirt")
    print("=" * 50)

    try:
        response = requests.get(f"{BASE_URL}/products/", params={"search": "shirt"})
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            total = data.get("count", 0)
            products = data.get("results", [])
            print(f"✅ Success! Found {total} products matching 'shirt'")

            for product in products[:3]:
                print(f"  - {product.get('name')}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")


if __name__ == "__main__":
    print("\n" + "🚀 TESTING POSTGRESQL API ENDPOINTS" + "\n")
    print("Make sure your Django backend is running:")
    print("  cd C:\\EasyCart\\backend")
    print("  python manage.py runserver")
    print("\n")

    test_categories()
    test_products()
    test_product_detail()
    test_search()

    print("\n" + "=" * 50)
    print("✅ API TESTING COMPLETE!")
    print("=" * 50)
    print("\nIf all tests passed, your PostgreSQL backend is working!")
    print("Now start your frontend:")
    print("  cd C:\\EasyCart\\frontend")
    print("  npm start")
    print("\n")
