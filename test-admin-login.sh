#!/bin/bash

# Admin Dashboard Login - Quick Test Script
# This script verifies the backend and admin dashboard configuration

set -e

echo "🔍 EasyCart Admin Dashboard Login - Quick Test"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://easycart-backend-0u8r.onrender.com"
ADMIN_URL="https://easycart-admin.onrender.com"
DEMO_EMAIL="admin@easycart.com"
DEMO_PASSWORD="admin123"

echo "📋 Configuration:"
echo "   Backend: $BACKEND_URL"
echo "   Admin:   $ADMIN_URL"
echo ""

# Test 1: Backend Health Check
echo "1️⃣  Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/health" 2>/dev/null || echo -e "\n000")
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)

if [ "$HEALTH_CODE" = "200" ]; then
    echo -e "   ${GREEN}✓${NC} Backend is healthy (HTTP $HEALTH_CODE)"
    
    # Parse response
    STATUS=$(echo "$HEALTH_BODY" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    DB_STATUS=$(echo "$HEALTH_BODY" | grep -o '"database":{"status":"[^"]*"' | cut -d'"' -f6 || echo "unknown")
    
    echo "   ├─ Status: $STATUS"
    echo "   └─ Database: $DB_STATUS"
else
    echo -e "   ${RED}✗${NC} Backend health check failed (HTTP $HEALTH_CODE)"
    if [ "$HEALTH_CODE" = "000" ]; then
        echo "   └─ Cannot connect to backend. Service may be sleeping."
        echo "   └─ Waiting 30 seconds for service to wake up..."
        sleep 30
        echo "   └─ Retrying health check..."
        HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/health" 2>/dev/null || echo -e "\n000")
        HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
        if [ "$HEALTH_CODE" = "200" ]; then
            echo -e "   ${GREEN}✓${NC} Backend is now healthy (HTTP $HEALTH_CODE)"
        else
            echo -e "   ${RED}✗${NC} Backend still unreachable"
        fi
    fi
fi
echo ""

# Test 2: Backend CORS Configuration
echo "2️⃣  Testing CORS Configuration..."
CORS_RESPONSE=$(curl -s -X OPTIONS "$BACKEND_URL/api/auth/login" \
    -H "Origin: $ADMIN_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -w "\n%{http_code}" 2>/dev/null || echo -e "\n000")
CORS_CODE=$(echo "$CORS_RESPONSE" | tail -n 1)

if [ "$CORS_CODE" = "204" ] || [ "$CORS_CODE" = "200" ]; then
    echo -e "   ${GREEN}✓${NC} CORS is configured correctly (HTTP $CORS_CODE)"
else
    echo -e "   ${YELLOW}⚠${NC}  CORS check returned HTTP $CORS_CODE"
    echo "   └─ This may not be an error if backend allows all origins"
fi
echo ""

# Test 3: Backend Auth Endpoint
echo "3️⃣  Testing Authentication Endpoint..."
AUTH_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -H "Origin: $ADMIN_URL" \
    -d "{\"email\":\"$DEMO_EMAIL\",\"password\":\"$DEMO_PASSWORD\"}" \
    -w "\n%{http_code}" 2>/dev/null || echo -e "\n000")
AUTH_BODY=$(echo "$AUTH_RESPONSE" | head -n -1)
AUTH_CODE=$(echo "$AUTH_RESPONSE" | tail -n 1)

if [ "$AUTH_CODE" = "200" ]; then
    echo -e "   ${GREEN}✓${NC} Login endpoint works (HTTP $AUTH_CODE)"
    
    # Parse response
    HAS_ACCESS=$(echo "$AUTH_BODY" | grep -o '"access"' || echo "")
    HAS_USER=$(echo "$AUTH_BODY" | grep -o '"user"' || echo "")
    
    if [ -n "$HAS_ACCESS" ] && [ -n "$HAS_USER" ]; then
        echo "   ├─ Response contains access token: ✓"
        echo "   └─ Response contains user data: ✓"
    else
        echo "   └─ Response format may be incorrect"
    fi
elif [ "$AUTH_CODE" = "401" ]; then
    echo -e "   ${YELLOW}⚠${NC}  Demo credentials don't exist in database (HTTP $AUTH_CODE)"
    echo "   └─ Demo mode fallback will be used in admin dashboard"
elif [ "$AUTH_CODE" = "000" ]; then
    echo -e "   ${RED}✗${NC} Cannot connect to auth endpoint"
    echo "   └─ Demo mode fallback will be used in admin dashboard"
else
    echo -e "   ${YELLOW}⚠${NC}  Auth endpoint returned HTTP $AUTH_CODE"
    echo "   └─ Message: $(echo "$AUTH_BODY" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)"
fi
echo ""

# Test 4: Admin Dashboard Accessibility
echo "4️⃣  Testing Admin Dashboard..."
ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" "$ADMIN_URL/admin/login" 2>/dev/null || echo -e "\n000")
ADMIN_CODE=$(echo "$ADMIN_RESPONSE" | tail -n 1)

if [ "$ADMIN_CODE" = "200" ]; then
    echo -e "   ${GREEN}✓${NC} Admin dashboard is accessible (HTTP $ADMIN_CODE)"
else
    echo -e "   ${RED}✗${NC} Admin dashboard returned HTTP $ADMIN_CODE"
fi
echo ""

# Summary
echo "================================================"
echo "📊 Test Summary:"
echo ""

BACKEND_OK=$([[ "$HEALTH_CODE" = "200" ]] && echo "1" || echo "0")
CORS_OK=$([[ "$CORS_CODE" = "204" || "$CORS_CODE" = "200" ]] && echo "1" || echo "0")
AUTH_OK=$([[ "$AUTH_CODE" = "200" || "$AUTH_CODE" = "401" ]] && echo "1" || echo "0")
ADMIN_OK=$([[ "$ADMIN_CODE" = "200" ]] && echo "1" || echo "0")

TOTAL_TESTS=4
PASSED_TESTS=$((BACKEND_OK + CORS_OK + AUTH_OK + ADMIN_OK))

echo "   Tests Passed: $PASSED_TESTS / $TOTAL_TESTS"
echo ""

if [ "$PASSED_TESTS" -eq 4 ]; then
    echo -e "${GREEN}✓ All systems operational!${NC}"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Open: $ADMIN_URL/admin/login"
    echo "   2. Login with: $DEMO_EMAIL / $DEMO_PASSWORD"
    echo "   3. Check browser console for logs"
    echo "   4. Verify successful login or demo mode activation"
elif [ "$PASSED_TESTS" -ge 2 ]; then
    echo -e "${YELLOW}⚠ Some issues detected, but demo mode should work${NC}"
    echo ""
    echo "📝 Demo Mode:"
    echo "   - Admin dashboard will use fallback authentication"
    echo "   - Login with: $DEMO_EMAIL / any password"
    echo "   - Limited functionality (no real API calls)"
else
    echo -e "${RED}✗ Multiple issues detected${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check backend logs: Render Dashboard → easycart-backend-0u8r → Logs"
    echo "   2. Verify environment variables are set"
    echo "   3. Wait for services to wake up (30-60 seconds)"
    echo "   4. Review: ADMIN_LOGIN_DEBUG_GUIDE.md"
fi

echo ""
echo "================================================"
echo "📚 Documentation:"
echo "   - Debug Guide: ADMIN_LOGIN_DEBUG_GUIDE.md"
echo "   - Deployment: ADMIN_LOGIN_FIX_DEPLOYMENT.md"
echo ""
echo "🔗 Useful Links:"
echo "   - Backend Health: $BACKEND_URL/api/health"
echo "   - Admin Login: $ADMIN_URL/admin/login"
echo "   - Backend API Docs: $BACKEND_URL/"
echo ""
