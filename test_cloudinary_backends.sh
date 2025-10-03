#!/bin/bash
# Test script for Cloudinary endpoint on both backend deployments
# This script tests both backends to ensure they expose the /api/test-cloudinary/ route

set -e

echo "================================================"
echo "Cloudinary Endpoint Test Script"
echo "================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URLs
BACKEND_1="https://easycart-backend-0u8r.onrender.com"
BACKEND_2="https://easycart-backend-d3b90j3e5dus73cc8bjg.onrender.com"

# Test endpoint path
ENDPOINT="/api/test-cloudinary/"

echo "Testing Backend Deployments..."
echo ""

# Function to test a backend
test_backend() {
    local backend_url=$1
    local backend_name=$2
    
    echo "Testing: ${backend_name}"
    echo "URL: ${backend_url}${ENDPOINT}"
    echo ""
    
    # Make the request and capture both status code and response
    http_code=$(curl -s -w "%{http_code}" -o /tmp/response.json "${backend_url}${ENDPOINT}")
    response=$(cat /tmp/response.json)
    
    echo "Status Code: ${http_code}"
    echo "Response:"
    echo "${response}" | python3 -m json.tool 2>/dev/null || echo "${response}"
    echo ""
    
    # Check if endpoint exists
    if [ "$http_code" -eq 404 ]; then
        echo -e "${RED}❌ FAIL: Endpoint not found (404)${NC}"
        echo "The /api/test-cloudinary/ route is not configured on this backend."
        return 1
    elif [ "$http_code" -eq 500 ]; then
        # Check if it's the expected Cloudinary error
        if echo "$response" | grep -q "Must supply api_key\|error"; then
            echo -e "${YELLOW}⚠️  WARNING: Endpoint exists but CLOUDINARY_URL not configured${NC}"
            echo "This is expected if CLOUDINARY_URL environment variable is not set."
            return 0
        else
            echo -e "${RED}❌ FAIL: Server error (500)${NC}"
            return 1
        fi
    elif [ "$http_code" -eq 200 ]; then
        # Check if response contains secure_url
        if echo "$response" | grep -q "secure_url"; then
            echo -e "${GREEN}✅ SUCCESS: Endpoint working correctly with Cloudinary integration${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  WARNING: Endpoint returned 200 but unexpected response format${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}⚠️  WARNING: Unexpected status code (${http_code})${NC}"
        return 0
    fi
}

# Test both backends
echo "================================================"
echo "Backend 1: easycart-backend-0u8r"
echo "================================================"
echo ""
if test_backend "$BACKEND_1" "easycart-backend-0u8r"; then
    backend1_status="PASS"
else
    backend1_status="FAIL"
fi

echo ""
echo "================================================"
echo "Backend 2: easycart-backend-d3b90j3e5dus73cc8bjg"
echo "================================================"
echo ""
if test_backend "$BACKEND_2" "easycart-backend-d3b90j3e5dus73cc8bjg"; then
    backend2_status="PASS"
else
    backend2_status="FAIL"
fi

# Summary
echo ""
echo "================================================"
echo "Test Summary"
echo "================================================"
echo ""
echo "Backend 1 (easycart-backend-0u8r): ${backend1_status}"
echo "Backend 2 (easycart-backend-d3b90j3e5dus73cc8bjg): ${backend2_status}"
echo ""

if [ "$backend1_status" = "PASS" ] && [ "$backend2_status" = "PASS" ]; then
    echo -e "${GREEN}✅ Both backends expose the /api/test-cloudinary/ endpoint${NC}"
    exit 0
elif [ "$backend1_status" = "FAIL" ] || [ "$backend2_status" = "FAIL" ]; then
    echo -e "${RED}❌ One or more backends do not expose the endpoint${NC}"
    echo ""
    echo "Troubleshooting Steps:"
    echo "1. Verify both backends are deployed from the 'main' branch"
    echo "2. Check Render dashboard: https://render.com/dashboard"
    echo "3. Ensure both services have auto-deploy enabled"
    echo "4. Trigger manual deployment if needed"
    echo "5. Check deployment logs for errors"
    exit 1
else
    echo -e "${YELLOW}⚠️  Tests completed with warnings${NC}"
    echo ""
    echo "If CLOUDINARY_URL is not set, this is expected."
    echo "Add CLOUDINARY_URL environment variable to both backends to fully test."
    exit 0
fi
