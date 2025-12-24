#!/bin/bash
# Quick Setup Script for Render Database Migration

echo "=================================="
echo "Render Database Setup - Quick Start"
echo "=================================="

# Step 1: Create Database on Render
echo ""
echo "STEP 1: Create Render PostgreSQL Database"
echo "------------------------------------------"
echo "1. Go to: https://dashboard.render.com/"
echo "2. Click 'New +' → 'PostgreSQL'"
echo "3. Configure:"
echo "   - Name: easycart-db"
echo "   - Region: (Choose closest to your backend)"
echo "   - Plan: Starter (\$7/month)"
echo "4. Click 'Create Database'"
echo ""
read -p "Press ENTER after you've created the database..."

# Step 2: Get credentials
echo ""
echo "STEP 2: Get Database Credentials"
echo "---------------------------------"
echo "Copy these from Render dashboard:"
echo "  - Internal Database URL"
echo "  - External Database URL"
echo ""
read -p "Press ENTER when ready to continue..."

# Step 3: Export from Railway
echo ""
echo "STEP 3: Export Data from Railway"
echo "---------------------------------"
echo "Choose export method:"
echo "  a) Railway CLI (recommended)"
echo "  b) Django dumpdata"
echo ""
read -p "Enter choice (a/b): " export_choice

if [ "$export_choice" = "a" ]; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
    echo "Logging in to Railway..."
    railway login
    echo "Linking to project..."
    railway link
    echo "Exporting database..."
    railway db dump > railway_backup.sql
    echo "✓ Export complete: railway_backup.sql"
else
    echo "Exporting with Django..."
    cd backend
    python manage.py dumpdata --natural-foreign --natural-primary \
        --exclude contenttypes --exclude auth.Permission \
        --indent 2 --output data_backup.json
    echo "✓ Export complete: data_backup.json"
    cd ..
fi

# Step 4: Update local .env for testing
echo ""
echo "STEP 4: Update Local .env"
echo "-------------------------"
echo "Paste the External Database URL from Render:"
read -p "DATABASE_URL: " database_url

# Backup current .env
cp backend/.env backend/.env.backup

# Add DATABASE_URL to .env
echo "" >> backend/.env
echo "# Render PostgreSQL (comment out for local dev)" >> backend/.env
echo "DATABASE_URL=$database_url" >> backend/.env

echo "✓ .env updated (backup saved as .env.backup)"

# Step 5: Run migrations
echo ""
echo "STEP 5: Run Migrations on Render Database"
echo "------------------------------------------"
cd backend
python manage.py migrate
echo "✓ Migrations complete"

# Step 6: Import data
echo ""
echo "STEP 6: Import Data"
echo "-------------------"

if [ "$export_choice" = "a" ]; then
    echo "Importing SQL backup..."
    psql "$database_url" < ../railway_backup.sql
else
    echo "Importing Django data..."
    python migrate_to_render.py
fi

echo "✓ Data imported"

# Step 7: Verify
echo ""
echo "STEP 7: Verify Migration"
echo "------------------------"
python manage.py shell -c "
from django.contrib.auth import get_user_model
from apps.products.models import Product
from apps.orders.models import Order

User = get_user_model()
print(f'Users: {User.objects.count()}')
print(f'Products: {Product.objects.count()}')
print(f'Orders: {Order.objects.count()}')
"

cd ..

echo ""
echo "=================================="
echo "✓ MIGRATION COMPLETE!"
echo "=================================="
echo ""
echo "Next Steps:"
echo "1. Go to Render Backend Service → Environment"
echo "2. Click 'Link Database' → Select 'easycart-db'"
echo "3. Remove old Railway env vars (DB_HOST, DB_PORT, etc.)"
echo "4. Redeploy your backend service"
echo "5. Test at: https://easycart-backend-2k8l.onrender.com/api/health/"
echo ""
echo "Keep Railway database for 1-2 weeks as backup!"
echo ""
