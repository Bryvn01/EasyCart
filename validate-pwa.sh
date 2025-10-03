#!/bin/bash
# PWA Validation Script for EasyCart

echo "=== EasyCart PWA Validation Script ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter for checks
PASSED=0
FAILED=0

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        ((FAILED++))
        return 1
    fi
}

# Function to check content in file
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $3"
        ((FAILED++))
        return 1
    fi
}

echo "Checking PWA Files..."
echo "---"

# Check manifest.json
check_file "frontend/public/manifest.json" "PWA manifest.json exists"
check_content "frontend/public/manifest.json" "EasyCart" "Manifest contains app name"
check_content "frontend/public/manifest.json" "standalone" "Manifest configured for standalone mode"

# Check service worker
check_file "frontend/public/service-worker.js" "Service worker file exists"
check_content "frontend/public/service-worker.js" "addEventListener" "Service worker has event listeners"

# Check service worker registration
check_file "frontend/src/serviceWorkerRegistration.js" "Service worker registration utility exists"
check_content "frontend/src/index.js" "serviceWorkerRegistration" "Service worker registered in index.js"

# Check PWA icons
check_file "frontend/public/icon-192x192.png" "PWA icon 192x192 exists"
check_file "frontend/public/icon-512x512.png" "PWA icon 512x512 exists"

# Check HTML meta tags
check_content "frontend/public/index.html" "theme-color" "Theme color meta tag present"
check_content "frontend/public/index.html" "manifest.json" "Manifest link in HTML"
check_content "frontend/public/index.html" "apple-mobile-web-app-capable" "Apple mobile web app meta tag present"

# Check mobile CSS
check_file "frontend/src/styles/mobile-pwa.css" "Mobile PWA CSS file exists"
check_content "frontend/src/styles/mobile-pwa.css" "min-height: 44px" "Touch target sizes configured"
check_content "frontend/src/styles/mobile-pwa.css" "safe-area-inset" "Safe area insets configured"

# Check PWA components
check_file "frontend/src/components/PWAInstallPrompt.js" "PWA install prompt component exists"
check_file "frontend/src/components/NetworkStatus.js" "Network status component exists"
check_content "frontend/src/App.js" "PWAInstallPrompt" "PWA install prompt imported in App"
check_content "frontend/src/App.js" "NetworkStatus" "Network status imported in App"

echo ""
echo "---"
echo "Build Check..."

# Check if build directory exists and contains PWA files
if [ -d "frontend/build" ]; then
    check_file "frontend/build/manifest.json" "Manifest in build output"
    check_file "frontend/build/service-worker.js" "Service worker in build output"
    check_file "frontend/build/icon-192x192.png" "Icon 192 in build output"
    check_file "frontend/build/icon-512x512.png" "Icon 512 in build output"
else
    echo -e "${RED}✗${NC} Build directory not found (run 'npm run build' first)"
    ((FAILED+=4))
fi

echo ""
echo "=== Summary ==="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All PWA checks passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some PWA checks failed. Please review the output above.${NC}"
    exit 1
fi
