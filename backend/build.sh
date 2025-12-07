#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
pip install -r requirements.txt

echo "⏳ Waiting for database..."
python wait_for_db.py

echo "🗄️ Running migrations..."
python manage.py migrate --noinput

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Build complete!"
