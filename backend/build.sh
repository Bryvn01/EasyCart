#!/bin/bash
set -e

echo "=================================================="
echo "🚀 EasyCart Backend Build (Render)"
echo "=================================================="

echo ""
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "🗄️  Waiting for Railway PostgreSQL database..."
echo "    (Free tier may take 30-60s to wake from sleep)"
echo ""
python wait_for_db.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Database connection failed - see errors above"
    echo "   Retrying deployment may succeed once database wakes"
    exit 1
fi

echo ""
echo "📊 Running database migrations..."
python manage.py migrate --noinput

echo ""
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "=================================================="
echo "✅ Build completed successfully!"
echo "=================================================="
