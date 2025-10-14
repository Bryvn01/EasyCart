#!/bin/bash

# EasyCart Production Deployment Script
# Usage: ./deploy.sh

set -e

echo "=================================="
echo "  EasyCart Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if .env files exist
if [ ! -f backend/.env ]; then
    print_error "Backend .env file not found!"
    exit 1
fi

if [ ! -f frontend/.env.production ]; then
    print_error "Frontend .env.production file not found!"
    exit 1
fi

print_status ".env files found"

# Backend Deployment
echo ""
echo "=================================="
echo "  Backend Deployment"
echo "=================================="

cd backend

# Install dependencies
print_status "Installing backend dependencies..."
pip install -r requirements.txt

# Run migrations
print_status "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
print_status "Collecting static files..."
python manage.py collectstatic --noinput

# Run tests
print_status "Running backend tests..."
python manage.py test

# Create logs directory
mkdir -p logs
touch logs/error.log logs/access.log

print_status "Backend deployment complete!"

cd ..

# Frontend Deployment
echo ""
echo "=================================="
echo "  Frontend Deployment"
echo "=================================="

cd frontend

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

# Run tests
print_status "Running frontend tests..."
CI=true npm test

# Build production bundle
print_status "Building production bundle..."
GENERATE_SOURCEMAP=false npm run build

print_status "Frontend deployment complete!"

cd ..

# Final checks
echo ""
echo "=================================="
echo "  Final Checks"
echo "=================================="

# Check Django secret key
if grep -q "django-insecure" backend/.env; then
    print_warning "Using default SECRET_KEY! Generate a secure one for production."
fi

# Check DEBUG setting
if grep -q "DEBUG=True" backend/.env; then
    print_error "DEBUG is set to True! This is not secure for production."
    exit 1
fi

print_status "All checks passed!"

echo ""
echo "=================================="
echo "  Deployment Summary"
echo "=================================="
echo ""
echo "Backend:"
echo "  ✓ Dependencies installed"
echo "  ✓ Migrations applied"
echo "  ✓ Static files collected"
echo "  ✓ Tests passed"
echo ""
echo "Frontend:"
echo "  ✓ Dependencies installed"
echo "  ✓ Tests passed"
echo "  ✓ Production build created"
echo ""
echo "Next Steps:"
echo "  1. Deploy backend: gunicorn easycart.wsgi:application"
echo "  2. Deploy frontend: Upload 'frontend/build' to hosting"
echo "  3. Configure DNS records"
echo "  4. Set up SSL certificate"
echo "  5. Configure monitoring"
echo ""
echo "=================================="
echo "  🚀 Ready to Launch!"
echo "=================================="
