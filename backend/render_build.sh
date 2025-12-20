#!/bin/bash
#
# Render Build Script with Database Retry Logic
#
# This script handles Railway free tier database sleep/wake cycles during
# Render deployments by implementing retry logic before running migrations.
#

set -e  # Exit on error

echo "=================================================="
echo "EasyCart Backend - Render Build with DB Retry"
echo "=================================================="

# Change to backend directory
cd "$(dirname "$0")"

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Wait for database and run migrations with retry
echo ""
echo "🗄️  Waiting for database and running migrations..."
echo "   (Railway free tier may take 30-60s to wake up)"
echo ""

# Run migrations with retry logic
python migrate_with_retry.py --max-attempts 10 --timeout 90

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Migration failed after retries"
    echo "   Check Railway database status and DATABASE_URL"
    exit 1
fi

# Collect static files
echo ""
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "=================================================="
echo "✅ Build completed successfully!"
echo "=================================================="
