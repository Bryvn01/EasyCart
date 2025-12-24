# PowerShell Script for Render Database Setup
# Run this in PowerShell: .\setup_render_db.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Render Database Setup - Quick Start" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Step 1: Create Database on Render
Write-Host ""
Write-Host "STEP 1: Create Render PostgreSQL Database" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow
Write-Host "1. Go to: https://dashboard.render.com/"
Write-Host "2. Click 'New +' → 'PostgreSQL'"
Write-Host "3. Configure:"
Write-Host "   - Name: easycart-db"
Write-Host "   - Region: (Choose closest to your backend)"
Write-Host "   - Plan: Starter (`$7/month)"
Write-Host "4. Click 'Create Database'"
Write-Host ""
Read-Host "Press ENTER after you've created the database"

# Step 2: Get credentials
Write-Host ""
Write-Host "STEP 2: Get Database Credentials" -ForegroundColor Yellow
Write-Host "---------------------------------" -ForegroundColor Yellow
Write-Host "From Render dashboard, copy:"
Write-Host "  - Internal Database URL (for Render services)"
Write-Host "  - External Database URL (for local testing)"
Write-Host ""
Read-Host "Press ENTER when ready to continue"

# Step 3: Install dj-database-url
Write-Host ""
Write-Host "STEP 3: Install Required Package" -ForegroundColor Yellow
Write-Host "---------------------------------" -ForegroundColor Yellow
Set-Location backend
python -m pip install dj-database-url==2.2.0
Write-Host "✓ Package installed" -ForegroundColor Green

# Step 4: Export from Railway
Write-Host ""
Write-Host "STEP 4: Export Data from Railway" -ForegroundColor Yellow
Write-Host "---------------------------------" -ForegroundColor Yellow
Write-Host "Choose export method:"
Write-Host "  a) Django dumpdata (recommended for Windows)"
Write-Host "  b) Railway CLI (requires npm)"
Write-Host ""
$exportChoice = Read-Host "Enter choice (a/b)"

if ($exportChoice -eq "a") {
    Write-Host "Exporting with Django..." -ForegroundColor Cyan
    python manage.py dumpdata --natural-foreign --natural-primary `
        --exclude contenttypes --exclude auth.Permission `
        --indent 2 --output data_backup.json
    Write-Host "✓ Export complete: data_backup.json" -ForegroundColor Green
} else {
    Write-Host "Installing Railway CLI..." -ForegroundColor Cyan
    npm install -g @railway/cli
    Write-Host "Logging in to Railway..." -ForegroundColor Cyan
    railway login
    Write-Host "Linking to project..." -ForegroundColor Cyan
    railway link
    Write-Host "Exporting database..." -ForegroundColor Cyan
    railway db dump > railway_backup.sql
    Write-Host "✓ Export complete: railway_backup.sql" -ForegroundColor Green
}

# Step 5: Update local .env for testing
Write-Host ""
Write-Host "STEP 5: Update Local .env" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow
$databaseUrl = Read-Host "Paste the External Database URL from Render"

# Backup current .env
Copy-Item .env .env.backup
Write-Host "✓ Backup saved as .env.backup" -ForegroundColor Green

# Add DATABASE_URL to .env
Add-Content .env "`n# Render PostgreSQL (comment out for local dev)"
Add-Content .env "DATABASE_URL=$databaseUrl"
Write-Host "✓ .env updated" -ForegroundColor Green

# Step 6: Run migrations
Write-Host ""
Write-Host "STEP 6: Run Migrations on Render Database" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow
python manage.py migrate
Write-Host "✓ Migrations complete" -ForegroundColor Green

# Step 7: Import data
Write-Host ""
Write-Host "STEP 7: Import Data" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

if ($exportChoice -eq "a") {
    Write-Host "Importing Django data..." -ForegroundColor Cyan
    python migrate_to_render.py
} else {
    Write-Host "Importing SQL backup..." -ForegroundColor Cyan
    $env:PGPASSWORD = $databaseUrl.Split(':')[2].Split('@')[0]
    psql $databaseUrl -f railway_backup.sql
}

Write-Host "✓ Data imported" -ForegroundColor Green

# Step 8: Verify
Write-Host ""
Write-Host "STEP 8: Verify Migration" -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Yellow
python manage.py shell -c @"
from django.contrib.auth import get_user_model
from apps.products.models import Product
from apps.orders.models import Order

User = get_user_model()
print(f'Users: {User.objects.count()}')
print(f'Products: {Product.objects.count()}')
print(f'Orders: {Order.objects.count()}')
"@

Set-Location ..

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "✓ MIGRATION COMPLETE!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to Render Backend Service → Environment tab"
Write-Host "2. Click 'Link Database' → Select 'easycart-db'"
Write-Host "3. This adds DATABASE_URL automatically"
Write-Host "4. Remove these old Railway variables (if they exist):"
Write-Host "   - DB_HOST"
Write-Host "   - DB_PORT"
Write-Host "   - DB_NAME"
Write-Host "   - DB_USER"
Write-Host "   - DB_PASSWORD"
Write-Host "5. Click 'Save Changes' (triggers automatic redeploy)"
Write-Host "6. Test at: https://easycart-backend-2k8l.onrender.com/api/health/"
Write-Host ""
Write-Host "⚠️  Keep Railway database for 1-2 weeks as backup!" -ForegroundColor Yellow
Write-Host ""
