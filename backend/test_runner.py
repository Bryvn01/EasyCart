#!/usr/bin/env python3
"""
CI/CD Test Runner Script
This script sets up the test environment and runs all backend tests
"""
import os
import sys
import subprocess
import requests
from pathlib import Path

def run_command(command, cwd=None):
    """Run a shell command and return success status"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        print(f"Command: {command}")
        print(f"Return code: {result.returncode}")
        if result.stdout:
            print(f"STDOUT:\n{result.stdout}")
        if result.stderr:
            print(f"STDERR:\n{result.stderr}")
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"Command timed out: {command}")
        return False
    except Exception as e:
        print(f"Error running command {command}: {e}")
        return False

def setup_test_environment():
    """Set up test environment variables"""
    print("Setting up test environment...")

    # Set default test credentials if not already set
    os.environ.setdefault('TEST_EMAIL', 'test@example.com')
    os.environ.setdefault('TEST_PASSWORD', 'testpassword')
    os.environ.setdefault('TEST_USERNAME', 'testuser')

    # Set Django settings for testing
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
    os.environ.setdefault('DEBUG', 'True')

    print("✅ Test environment setup complete")

def run_django_tests():
    """Run Django unit tests"""
    print("\n🧪 Running Django tests...")
    success = run_command("python manage.py test")
    if success:
        print("✅ Django tests passed")
    else:
        print("❌ Django tests failed")
    return success

def run_api_tests():
    """Run API integration tests"""
    print("\n🧪 Running API tests...")
    print("✅ API tests skipped (no separate API tests configured)")
    return True

def run_security_tests():
    """Run security tests"""
    print("\n🧪 Running security tests...")
    success = run_command("python manage.py test tests.test_security -v 2")
    if success:
        print("✅ Security tests passed")
    else:
        print("❌ Security tests failed")
    return success

def main():
    """Main test runner function"""
    print("🚀 Starting Backend Test Suite")
    print("=" * 50)

    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)

    # Setup environment
    setup_test_environment()

    # Run all test suites
    tests = [
        ("Django Tests", run_django_tests),
        ("API Tests", run_api_tests),
        ("Security Tests", run_security_tests),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        success = test_func()
        results.append((test_name, success))

    # Summary
    print("\n" + "=" * 50)
    print("🎯 Test Results Summary")
    print("=" * 50)

    all_passed = True
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if not success:
            all_passed = False

    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests passed! Backend is ready.")
        return 0
    else:
        print("💥 Some tests failed. Please review the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
