#!/usr/bin/env python3
"""
Performance Testing Script for EasyCart API
Tests API response times and database query efficiency
"""

import requests
import time
import statistics
import sys
from colorama import init, Fore, Style

init(autoreset=True)

API_BASE_URL = "http://localhost:8000/api"

def print_header(text):
    """Print colored header"""
    print(f"\n{Fore.CYAN}{'=' * 60}")
    print(f"{Fore.CYAN}{text:^60}")
    print(f"{Fore.CYAN}{'=' * 60}\n")

def print_success(text):
    """Print success message"""
    print(f"{Fore.GREEN}✓ {text}")

def print_warning(text):
    """Print warning message"""
    print(f"{Fore.YELLOW}⚠ {text}")

def print_error(text):
    """Print error message"""
    print(f"{Fore.RED}✗ {text}")

def print_metric(label, value, unit="ms", threshold=None):
    """Print metric with color based on threshold"""
    if threshold:
        if value <= threshold:
            color = Fore.GREEN
            status = "✓ EXCELLENT"
        elif value <= threshold * 1.5:
            color = Fore.YELLOW
            status = "⚠ GOOD"
        else:
            color = Fore.RED
            status = "✗ NEEDS IMPROVEMENT"
        print(f"{color}{label:30} {value:>8.1f} {unit:>4} {status}")
    else:
        print(f"{Fore.WHITE}{label:30} {value:>8.1f} {unit:>4}")

def test_api_endpoint(endpoint, name, threshold_ms=300):
    """Test API endpoint performance"""
    print(f"\n{Fore.BLUE}Testing: {name}")
    print(f"{Fore.WHITE}Endpoint: {endpoint}")

    times = []
    errors = 0

    # Warm-up request
    try:
        requests.get(f"{API_BASE_URL}{endpoint}", timeout=5)
    except:
        pass

    # Run 5 test requests
    for i in range(5):
        try:
            start = time.time()
            response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=10)
            end = time.time()

            elapsed_ms = (end - start) * 1000
            times.append(elapsed_ms)

            if response.status_code != 200:
                errors += 1
                print_error(f"Request {i+1}: Status {response.status_code}")
            else:
                status = "✓" if elapsed_ms <= threshold_ms else "⚠"
                print(f"{Fore.WHITE}  Request {i+1}: {elapsed_ms:>6.1f} ms {status}")
        except Exception as e:
            errors += 1
            print_error(f"Request {i+1}: {str(e)}")

    if times:
        avg = statistics.mean(times)
        min_time = min(times)
        max_time = max(times)

        print(f"\n{Fore.CYAN}Results:")
        print_metric("Average Response Time", avg, "ms", threshold_ms)
        print_metric("Fastest Response", min_time, "ms")
        print_metric("Slowest Response", max_time, "ms")

        if errors > 0:
            print_error(f"Errors: {errors}/5")

        return avg
    else:
        print_error("All requests failed!")
        return None

def test_database_queries():
    """Test database query efficiency"""
    print_header("DATABASE QUERY EFFICIENCY TEST")

    try:
        # Test products endpoint with Django Debug Toolbar headers
        response = requests.get(
            f"{API_BASE_URL}/products/?page=1&page_size=20",
            headers={'X-Requested-With': 'XMLHttpRequest'}
        )

        if response.status_code == 200:
            data = response.json()
            product_count = len(data.get('results', []))
            print_success(f"Retrieved {product_count} products")

            # Check response headers for query count (if Django Debug Toolbar is enabled)
            if 'X-DB-Query-Count' in response.headers:
                query_count = int(response.headers['X-DB-Query-Count'])
                print_metric("Database Queries", query_count, "queries", 3)
            else:
                print_warning("Django Debug Toolbar not enabled - can't count queries")
        else:
            print_error(f"Failed to retrieve products: Status {response.status_code}")

    except Exception as e:
        print_error(f"Error testing database queries: {str(e)}")

def main():
    """Main test function"""
    print_header("EASYCART PERFORMANCE TEST SUITE")
    print(f"{Fore.WHITE}API Base URL: {API_BASE_URL}\n")

    # Check if server is running
    try:
        response = requests.get(f"{API_BASE_URL}/products/", timeout=5)
        print_success("Backend server is running!")
    except requests.exceptions.ConnectionError:
        print_error("Backend server is not running!")
        print(f"{Fore.YELLOW}Please start the server with: python manage.py runserver")
        sys.exit(1)
    except Exception as e:
        print_error(f"Error connecting to server: {str(e)}")
        sys.exit(1)

    # Test endpoints
    results = {}

    print_header("API ENDPOINT PERFORMANCE TESTS")

    # Test Products List
    results['products'] = test_api_endpoint(
        "/products/?page=1&page_size=20",
        "Products List (20 items)",
        threshold_ms=300
    )

    # Test Categories
    results['categories'] = test_api_endpoint(
        "/categories/",
        "Categories List",
        threshold_ms=100
    )

    # Test Products with Search
    results['search'] = test_api_endpoint(
        "/products/?search=phone&page=1",
        "Products Search",
        threshold_ms=400
    )

    # Test Products with Filters
    results['filters'] = test_api_endpoint(
        "/products/?category=Electronics&page=1",
        "Products with Category Filter",
        threshold_ms=300
    )

    # Test Database Queries
    test_database_queries()

    # Summary
    print_header("PERFORMANCE SUMMARY")

    valid_results = {k: v for k, v in results.items() if v is not None}

    if valid_results:
        avg_response = statistics.mean(valid_results.values())
        print_metric("Overall Average Response", avg_response, "ms", 300)

        print(f"\n{Fore.CYAN}Endpoint Breakdown:")
        for endpoint, time_ms in valid_results.items():
            threshold = 300 if endpoint != 'categories' else 100
            print_metric(f"  {endpoint.capitalize()}", time_ms, "ms", threshold)

        # Performance Grade
        print(f"\n{Fore.CYAN}Performance Grade:")
        if avg_response <= 200:
            grade = "A+"
            color = Fore.GREEN
            status = "EXCELLENT - Enterprise Grade"
        elif avg_response <= 300:
            grade = "A"
            color = Fore.GREEN
            status = "VERY GOOD - Production Ready"
        elif avg_response <= 500:
            grade = "B"
            color = Fore.YELLOW
            status = "GOOD - Minor Optimizations Needed"
        elif avg_response <= 800:
            grade = "C"
            color = Fore.YELLOW
            status = "FAIR - Optimizations Recommended"
        else:
            grade = "D"
            color = Fore.RED
            status = "POOR - Requires Optimization"

        print(f"{color}  Grade: {grade}")
        print(f"{color}  Status: {status}")
        print(f"{color}  Average: {avg_response:.1f} ms\n")

        # Optimization suggestions
        if avg_response > 300:
            print(f"\n{Fore.YELLOW}Optimization Suggestions:")
            print(f"{Fore.YELLOW}  • Check database indexes")
            print(f"{Fore.YELLOW}  • Verify N+1 queries are resolved")
            print(f"{Fore.YELLOW}  • Consider enabling caching")
            print(f"{Fore.YELLOW}  • Review select_related() usage")
    else:
        print_error("No valid test results available")

    print(f"\n{Fore.CYAN}{'=' * 60}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Fore.YELLOW}Test interrupted by user")
        sys.exit(0)
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
        sys.exit(1)
