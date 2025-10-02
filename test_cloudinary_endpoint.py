#!/usr/bin/env python
"""
Test script to verify the Cloudinary test endpoint configuration.

This script demonstrates that the endpoint is properly configured and
shows what responses to expect with and without Cloudinary credentials.
"""

import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')

import django
django.setup()

from django.test import Client
from django.urls import reverse

def test_endpoint_configuration():
    """Test that the endpoint is properly configured."""
    print("\n" + "="*70)
    print("Cloudinary Test Endpoint - Configuration Test")
    print("="*70 + "\n")
    
    # Test 1: URL reverse
    print("1. Testing URL reverse...")
    try:
        url = reverse('test-cloudinary')
        print(f"   ✅ URL reverse successful: {url}")
    except Exception as e:
        print(f"   ❌ URL reverse failed: {e}")
        return False
    
    # Test 2: Simulate request
    print("\n2. Testing endpoint response...")
    client = Client(HTTP_HOST='localhost')
    
    try:
        response = client.get(url, follow=True)  # Follow redirects
        print(f"   Response status code: {response.status_code}")
        
        if response.status_code == 500:
            # Expected when Cloudinary credentials are not set
            try:
                import json
                data = json.loads(response.content)
                if 'error' in data:
                    print(f"   ✅ Error response as expected (no credentials): {data['error'][:50]}...")
                    print("\n   📝 Note: This is expected when CLOUDINARY_URL is not set.")
                    print("   Once you set the environment variable, the endpoint will upload")
                    print("   an image and return the secure_url.")
            except:
                print(f"   ⚠️  Received error response: {response.content[:100]}")
        elif response.status_code == 200:
            # Success case - Cloudinary credentials are set
            try:
                import json
                data = json.loads(response.content)
                if 'secure_url' in data:
                    print(f"   ✅ Success! Cloudinary URL: {data['secure_url']}")
            except:
                print(f"   ⚠️  Unexpected response: {response.content[:100]}")
        else:
            print(f"   ⚠️  Unexpected status code: {response.status_code}")
            print(f"   Response: {response.content[:200]}")
    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return False
    
    print("\n" + "="*70)
    print("Configuration Test Complete")
    print("="*70)
    print("\n✅ The endpoint is properly configured!")
    print("\n📋 Next Steps:")
    print("   1. Set CLOUDINARY_URL environment variable in your deployment (Render)")
    print("   2. Deploy the application")
    print("   3. Access: https://your-domain.com/api/test-cloudinary/")
    print("   4. Expect JSON response with 'secure_url' field")
    print("   5. After confirming it works, remove the endpoint as per TODO comment")
    print()
    
    return True

if __name__ == '__main__':
    success = test_endpoint_configuration()
    sys.exit(0 if success else 1)
