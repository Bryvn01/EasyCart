#!/bin/bash

###############################################################################
# Production Verification Script for EasyCart
# Post-Merge Verification: Live API Integration & Products Page Features
###############################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-https://easycart-backend.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://easycart-1-752r.onrender.com}"
ADMIN_URL="${ADMIN_URL:-https://easycart-admin.onrender.com}"

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Log functions
log_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Test API endpoint
test_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    log_info "Testing: $description"
    
    response=$(curl -s -w "\n%{http_code}" -X GET "$url" -H "Accept: application/json" 2>&1)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        log_success "$description (Status: $http_code)"
        echo "  Response preview: $(echo "$body" | head -c 100)..."
        return 0
    else
        log_error "$description (Expected: $expected_status, Got: $http_code)"
        echo "  Response: $body"
        return 1
    fi
}

# Test API with JSON validation
test_json_endpoint() {
    local url=$1
    local description=$2
    local expected_field=$3
    
    log_info "Testing: $description"
    
    response=$(curl -s -X GET "$url" -H "Accept: application/json" 2>&1)
    
    if echo "$response" | jq -e ".$expected_field" >/dev/null 2>&1; then
        log_success "$description - JSON structure valid"
        echo "  $expected_field: $(echo "$response" | jq -r ".$expected_field" | head -c 50)..."
        return 0
    else
        log_error "$description - Missing field: $expected_field"
        echo "  Response: $(echo "$response" | head -c 200)"
        return 1
    fi
}

# Main verification
main() {
    log_section "EasyCart Production Verification"
    echo "Backend URL: $BACKEND_URL"
    echo "Frontend URL: $FRONTEND_URL"
    echo "Admin URL: $ADMIN_URL"
    
    # 1. Backend Health Checks
    log_section "1. Backend API Health Checks"
    
    test_endpoint "$BACKEND_URL/api/health" 200 "Backend health endpoint"
    test_endpoint "$BACKEND_URL/" 200 "Backend root endpoint"
    
    # 2. Products API Endpoints
    log_section "2. Products API Endpoints"
    
    test_endpoint "$BACKEND_URL/api/products" 200 "Products list endpoint"
    test_json_endpoint "$BACKEND_URL/api/products" "Products with pagination" "results"
    
    # Check pagination
    log_info "Testing pagination..."
    response=$(curl -s "$BACKEND_URL/api/products?page=1&page_size=10")
    if echo "$response" | jq -e '.count' >/dev/null 2>&1; then
        total_count=$(echo "$response" | jq -r '.count')
        log_success "Pagination working (Total products: $total_count)"
    else
        log_error "Pagination not working properly"
    fi
    
    # 3. Filter and Search Tests
    log_section "3. Search and Filter Features"
    
    # Test search
    test_endpoint "$BACKEND_URL/api/products?search=unga" 200 "Search functionality"
    
    # Test category filter
    test_endpoint "$BACKEND_URL/api/products?category=1" 200 "Category filter"
    
    # Test price range filter
    test_endpoint "$BACKEND_URL/api/products?price_min=100&price_max=1000" 200 "Price range filter"
    
    # Test sorting
    test_endpoint "$BACKEND_URL/api/products?ordering=-price" 200 "Sorting by price"
    
    # 4. Categories API
    log_section "4. Categories API"
    
    test_endpoint "$BACKEND_URL/api/categories" 200 "Categories list endpoint"
    
    # 5. Frontend Accessibility
    log_section "5. Frontend Accessibility"
    
    test_endpoint "$FRONTEND_URL" 200 "Frontend home page"
    test_endpoint "$ADMIN_URL" 200 "Admin dashboard"
    
    # 6. CORS Configuration
    log_section "6. CORS Configuration"
    
    log_info "Testing CORS headers..."
    cors_response=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/products" \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: GET")
    
    if echo "$cors_response" | grep -i "access-control-allow-origin" >/dev/null; then
        log_success "CORS headers present"
    else
        log_error "CORS headers missing or misconfigured"
    fi
    
    # 7. Error Handling Tests
    log_section "7. Error Handling"
    
    # Test 404 handling
    test_endpoint "$BACKEND_URL/api/products/nonexistent-id-999999" 404 "404 error handling"
    
    # 8. Performance Check
    log_section "8. Performance Metrics"
    
    log_info "Measuring response time..."
    start_time=$(date +%s%N)
    curl -s "$BACKEND_URL/api/products" > /dev/null
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $response_time -lt 2000 ]; then
        log_success "Response time: ${response_time}ms (Good)"
    elif [ $response_time -lt 5000 ]; then
        log_warning "Response time: ${response_time}ms (Acceptable)"
    else
        log_error "Response time: ${response_time}ms (Too slow)"
    fi
    
    # 9. Image URL Handling
    log_section "9. Image URL Validation"
    
    log_info "Checking product images..."
    products_response=$(curl -s "$BACKEND_URL/api/products?page_size=5")
    
    if echo "$products_response" | jq -e '.results[0].image' >/dev/null 2>&1 || \
       echo "$products_response" | jq -e '.results[0].image_url' >/dev/null 2>&1; then
        log_success "Products have image URL fields"
        
        # Check if images are Cloudinary URLs or relative paths
        image_url=$(echo "$products_response" | jq -r '.results[0].image // .results[0].image_url // "none"')
        if [[ $image_url == *"cloudinary"* ]]; then
            log_success "Images using Cloudinary CDN"
        elif [[ $image_url == "/"* ]] || [[ $image_url == "http"* ]]; then
            log_success "Images using valid URL format"
        else
            log_warning "Image URL format may need validation: $image_url"
        fi
    else
        log_warning "No image URLs found in products (may need fallback handling)"
    fi
    
    # Summary
    log_section "Verification Summary"
    
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Warnings: $WARNINGS"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}✓ All critical tests passed!${NC}"
        echo "The system is ready for production use."
        exit 0
    else
        echo -e "\n${RED}✗ Some tests failed.${NC}"
        echo "Please review the failures above before deploying to production."
        exit 1
    fi
}

# Run main verification
main "$@"
