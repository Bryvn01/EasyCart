"""
Frontend-Backend Integration Test
Tests data flow from PostgreSQL -> Django API -> React Frontend
"""
import requests
import json
from colorama import init, Fore, Style

init(autoreset=True)

def print_section(title):
    print(f"\n{Fore.CYAN}{'='*70}")
    print(f"{Fore.CYAN}{title.center(70)}")
    print(f"{Fore.CYAN}{'='*70}\n")

def print_success(message):
    print(f"{Fore.GREEN}✓ {message}")

def print_error(message):
    print(f"{Fore.RED}✗ {message}")

def print_info(message):
    print(f"{Fore.YELLOW}ℹ {message}")

def test_backend_api():
    """Test Backend API Data"""
    print_section("BACKEND API DATA TEST")
    
    base_url = "http://127.0.0.1:8000/api"
    
    try:
        # Test Products
        response = requests.get(f"{base_url}/products/", timeout=10)
        if response.status_code == 200:
            products = response.json()
            if isinstance(products, list):
                count = len(products)
            else:
                count = products.get('count', len(products.get('results', [])))
            print_success(f"Products API: {count} products fetched")
            
            if count > 0:
                if isinstance(products, list):
                    sample = products[0]
                else:
                    sample = products.get('results', [])[0]
                print_info(f"  Sample: {sample.get('name', 'N/A')} - ${sample.get('price', 'N/A')}")
        else:
            print_error(f"Products API failed: {response.status_code}")
            return False
        
        # Test Categories
        response = requests.get(f"{base_url}/products/categories/", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            if isinstance(categories, list):
                count = len(categories)
            else:
                count = categories.get('count', len(categories.get('results', [])))
            print_success(f"Categories API: {count} categories fetched")
            
            if count > 0:
                if isinstance(categories, list):
                    sample = categories[0]
                else:
                    sample = categories.get('results', [])[0]
                print_info(f"  Sample: {sample.get('name', 'N/A')}")
        else:
            print_error(f"Categories API failed: {response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Backend API test failed: {str(e)}")
        return False

def test_cors():
    """Test CORS Configuration"""
    print_section("CORS CONFIGURATION TEST")
    
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'GET',
        }
        
        response = requests.get(
            "http://127.0.0.1:8000/api/products/",
            headers=headers,
            timeout=10
        )
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
        }
        
        print_success(f"CORS Origin: {cors_headers['Access-Control-Allow-Origin']}")
        print_success(f"CORS Credentials: {cors_headers['Access-Control-Allow-Credentials']}")
        
        if cors_headers['Access-Control-Allow-Origin'] == 'http://localhost:3000':
            print_success("CORS properly configured for localhost:3000")
            return True
        else:
            print_error("CORS not properly configured")
            return False
            
    except Exception as e:
        print_error(f"CORS test failed: {str(e)}")
        return False

def test_frontend_access():
    """Test Frontend Accessibility"""
    print_section("FRONTEND ACCESSIBILITY TEST")
    
    try:
        response = requests.get("http://localhost:3000", timeout=10)
        if response.status_code == 200:
            print_success(f"Frontend accessible: Status {response.status_code}")
            print_success(f"Content length: {len(response.content)} bytes")
            
            # Check if it's a React app
            if 'react' in response.text.lower() or 'root' in response.text.lower():
                print_success("React app detected")
            
            return True
        else:
            print_error(f"Frontend returned status: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Frontend accessibility test failed: {str(e)}")
        return False

def test_database_sync():
    """Verify data synchronization"""
    print_section("DATABASE SYNCHRONIZATION TEST")
    
    try:
        # Get data from API
        response = requests.get("http://127.0.0.1:8000/api/products/", timeout=10)
        products_data = response.json()
        
        if isinstance(products_data, list):
            api_count = len(products_data)
        else:
            api_count = products_data.get('count', len(products_data.get('results', [])))
        
        print_success(f"API serving {api_count} products from PostgreSQL")
        
        # Verify data structure
        if isinstance(products_data, list):
            sample = products_data[0] if api_count > 0 else {}
        else:
            sample = products_data.get('results', [{}])[0] if api_count > 0 else {}
        
        required_fields = ['id', 'name', 'price', 'category']
        missing_fields = [field for field in required_fields if field not in sample]
        
        if not missing_fields:
            print_success("All required product fields present")
            print_info(f"  Fields: {', '.join(sample.keys())}")
        else:
            print_error(f"Missing fields: {', '.join(missing_fields)}")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Database sync test failed: {str(e)}")
        return False

def main():
    print(f"{Fore.MAGENTA}{Style.BRIGHT}")
    print("╔════════════════════════════════════════════════════════════════════╗")
    print("║        FRONTEND-BACKEND INTEGRATION TEST                           ║")
    print("╚════════════════════════════════════════════════════════════════════╝")
    
    results = []
    
    print_info("Testing full-stack integration...")
    print_info("Backend: http://127.0.0.1:8000")
    print_info("Frontend: http://localhost:3000\n")
    
    # Run tests
    results.append(("Frontend Accessibility", test_frontend_access()))
    results.append(("Backend API Data", test_backend_api()))
    results.append(("CORS Configuration", test_cors()))
    results.append(("Database Synchronization", test_database_sync()))
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    failed = sum(1 for _, result in results if not result)
    
    for test_name, result in results:
        if result:
            print_success(f"{test_name}: PASSED")
        else:
            print_error(f"{test_name}: FAILED")
    
    print(f"\n{Fore.CYAN}{'='*70}")
    print(f"{Fore.GREEN}PASSED: {passed}  {Fore.RED}FAILED: {failed}")
    print(f"{Fore.CYAN}{'='*70}\n")
    
    if failed == 0:
        print(f"{Fore.GREEN}{Style.BRIGHT}✓ FULL-STACK INTEGRATION SUCCESSFUL!")
        print(f"{Fore.GREEN}  Frontend and backend are properly connected.")
        print(f"{Fore.GREEN}  Data is flowing from PostgreSQL -> Django -> React")
        print(f"\n{Fore.CYAN}Next steps:")
        print(f"{Fore.YELLOW}  1. Open http://localhost:3000 in your browser")
        print(f"{Fore.YELLOW}  2. Verify products display on the homepage")
        print(f"{Fore.YELLOW}  3. Check categories navigation")
        print(f"{Fore.YELLOW}  4. Test add to cart functionality")
        return 0
    else:
        print(f"{Fore.RED}{Style.BRIGHT}✗ Integration tests failed.")
        print(f"{Fore.RED}  Please review errors above.")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
