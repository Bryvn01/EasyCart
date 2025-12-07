#!/bin/bash
# CI/CD Verification Script

set -e

echo "🔍 Verifying CI/CD Setup..."

# Check backend
echo "✅ Checking backend..."
cd backend
if [ -f "requirements.txt" ]; then
    echo "  ✓ requirements.txt found"
else
    echo "  ✗ requirements.txt missing"
    exit 1
fi

# Check frontend
echo "✅ Checking frontend..."
cd ../frontend
if [ -f "package.json" ]; then
    echo "  ✓ package.json found"
else
    echo "  ✗ package.json missing"
    exit 1
fi

if [ -f "jest.config.js" ]; then
    echo "  ✓ jest.config.js found"
else
    echo "  ✗ jest.config.js missing"
    exit 1
fi

# Check workflows
echo "✅ Checking GitHub workflows..."
cd ..
if [ -f ".github/workflows/ci.yml" ]; then
    echo "  ✓ ci.yml found"
else
    echo "  ✗ ci.yml missing"
    exit 1
fi

if [ -f ".github/workflows/required-checks.yml" ]; then
    echo "  ✓ required-checks.yml found"
else
    echo "  ✗ required-checks.yml missing"
    exit 1
fi

echo ""
echo "✅ All CI/CD checks passed!"
echo "🚀 Ready for deployment"
