# POS Module - Quick Start Guide

## Prerequisites

Before starting, ensure you have:
1. **Django Backend Running** on port 8000
2. **PostgreSQL Database** running
3. **Admin Dashboard** configured to connect to port 8000

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1  # On Windows
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd admin-dashboard

# Install dependencies (including @mui/icons-material)
npm install

# Verify .env configuration
# REACT_APP_API_URL should be http://localhost:8000/api
```

## Initial Setup (One-Time)

### 1. Run Database Migrations

```bash
cd backend
python manage.py makemigrations pos
python manage.py migrate
```

### 2. Create POS Staff Permissions

#### Option A: Via Django Admin (Recommended)

1. Start the backend server:
   ```bash
   python manage.py runserver
   ```

2. Access Django Admin: `http://localhost:8000/admin/`

3. Navigate to **POS → POS Staff Permissions**

4. Click **Add POS Staff Permission**

5. For each staff member, add these permissions:
   - `can_open_session`
   - `can_close_session`
   - `can_apply_discount`
   - `can_void_transaction`
   - `can_refund`
   - `can_view_reports`
   - `can_manage_cash`

#### Option B: Via Django Shell

```bash
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from apps.pos.models import POSStaffPermission

User = get_user_model()

# Get staff user
staff = User.objects.get(email='staff@example.com')

# Grant all POS permissions
permissions = [
    'can_open_session',
    'can_close_session',
    'can_apply_discount',
    'can_void_transaction',
    'can_refund',
    'can_view_reports',
    'can_manage_cash',
    'can_override_price',
]

for perm in permissions:
    POSStaffPermission.objects.create(
        staff=staff,
        permission=perm,
        granted_by=staff  # or another admin user
    )

print(f"Granted {len(permissions)} permissions to {staff.username}")
```

### 3. Add Test Products (Optional)

```python
from apps.products.models import Product, Category

# Create a test category
category = Category.objects.create(
    name="Test Category",
    description="For POS testing"
)

# Create test products
products_data = [
    {"name": "Test Product 1", "price": 100, "stock": 50},
    {"name": "Test Product 2", "price": 250, "stock": 30},
    {"name": "Test Product 3", "price": 500, "stock": 20},
]

for data in products_data:
    Product.objects.create(
        name=data["name"],
        price=data["price"],
        stock=data["stock"],
        category=category,
        description="Test product for POS",
        is_active=True
    )
```

## Daily Operations

### Opening a Shift

1. Navigate to: `http://localhost:3000/admin/pos/session`
2. Enter opening cash amount (e.g., 5000.00)
3. Click **Open Session**
4. You'll be redirected to the POS Terminal

### Processing Sales

1. **Search Product**:
   - Type product name or SKU in search box
   - Products appear as cards below

2. **Add to Cart**:
   - Click "Add to Cart" on desired product
   - Item appears in cart on right side

3. **Adjust Quantities**:
   - Use +/- buttons to change quantity
   - Click trash icon to remove item

4. **Apply Discount** (Optional):
   - Enter percentage in "Discount %" field
   - Discount automatically applied to total

5. **Checkout**:
   - Click "Checkout" button
   - Enter customer info (optional)
   - Select payment method
   - For cash: enter amount received
   - Click "Complete Payment"

6. **Print Receipt**:
   - After successful payment, click "Print Receipt"
   - Receipt opens in new window

### Closing a Shift

1. Navigate to: `http://localhost:3000/admin/pos/session`
2. Count cash in register
3. Enter closing cash amount
4. Add closing notes (optional)
5. Click **Close Session**
6. Review discrepancy report (if any)

### Viewing Reports

1. Navigate to: `http://localhost:3000/admin/pos/dashboard`
2. Select date range (Today, Week, Month, or Custom)
3. View:
   - Total sales
   - Transaction count
   - Average transaction value
   - Payment method breakdown
   - Top products
   - Sales trends

## Common Tasks

### Void a Transaction

1. Go to POS Dashboard
2. Find transaction in recent list
3. Click transaction
4. Click "Void Transaction"
5. Enter reason
6. Confirm (requires `can_void_transaction` permission)

### Process a Refund

1. Go to POS Dashboard
2. Find completed transaction
3. Click "Refund"
4. Enter reason
5. Confirm (requires `can_refund` permission)
6. Inventory automatically restored

### Create Discount Code

1. Go to Django Admin: `/admin/`
2. Navigate to **POS → POS Discounts**
3. Click **Add POS Discount**
4. Fill in details:
   - Name (e.g., "Holiday Sale")
   - Code (e.g., "HOLIDAY20")
   - Discount Type (Percentage or Fixed)
   - Value (e.g., 20 for 20%)
   - Min Purchase Amount (optional)
   - Valid From/Until dates
5. Click **Save**

### Check Session History

1. Go to Django Admin: `/admin/`
2. Navigate to **POS → POS Sessions**
3. Filter by:
   - Staff member
   - Status (Open, Closed, Reconciled)
   - Date range
4. Click session to view details

## Troubleshooting

### "No active POS session" Error

**Problem**: Trying to access POS Terminal without open session

**Solution**:
1. Go to Session Manager
2. Open a new session
3. Then access Terminal

### Product Not Found in Search

**Problem**: Product doesn't appear in search results

**Solutions**:
- Verify product is marked as "Active" in Django admin
- Check product has stock > 0
- Ensure correct spelling in search
- Try searching by SKU instead

### Payment Fails

**Problem**: "Payment failed" error during checkout

**Solutions**:
1. Check internet connection
2. Verify sufficient stock for all items
3. Check browser console for errors
4. Try refreshing the page
5. Check backend logs: `backend/logs/`

### Receipt Won't Print

**Problem**: Print dialog doesn't open

**Solutions**:
- Allow popups for the domain in browser settings
- Check browser print settings
- Try downloading as PDF instead
- Verify transaction completed successfully

### Permission Denied Errors

**Problem**: "Permission denied" when trying to perform action

**Solution**:
1. Check user has required permission
2. Go to Django Admin → POS Staff Permissions
3. Add missing permission for user
4. Log out and log back in

## API Testing (Developer)

### Test Session Creation

```bash
curl -X POST http://localhost:8000/api/pos/sessions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"opening_cash": 5000.00}'
```

### Test Transaction Creation

```bash
curl -X POST http://localhost:8000/api/pos/transactions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session": 1,
    "customer_name": "Test Customer",
    "payment_method": "cash",
    "discount_percentage": 0,
    "tax_amount": 0,
    "items": [
      {
        "product": 1,
        "quantity": 2,
        "unit_price": 100.00,
        "discount_percentage": 0
      }
    ]
  }'
```

### Test Product Search

```bash
curl -X GET "http://localhost:8000/api/pos/products/?search=test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Production Deployment Checklist

- [ ] Run migrations on production database
- [ ] Create POS staff users and permissions
- [ ] Configure tax rates in settings
- [ ] Set up receipt printer (if using)
- [ ] Train staff on system usage
- [ ] Test all payment methods
- [ ] Configure backup procedures
- [ ] Set up monitoring and alerts
- [ ] Document custom workflows
- [ ] Create emergency procedures

## Support Resources

- **Full Documentation**: `POS_MODULE_DOCUMENTATION.md`
- **Django Admin**: `http://localhost:8000/admin/`
- **API Documentation**: `http://localhost:8000/api/`
- **Backend Logs**: `backend/logs/`
- **Frontend Console**: Browser Developer Tools (F12)

## Next Steps

1. **Test the System**: Run through complete sale workflow
2. **Train Staff**: Show team how to use POS
3. **Configure Settings**: Adjust tax rates, receipt format, etc.
4. **Set Up Hardware**: Connect barcode scanner, receipt printer
5. **Go Live**: Start using for real transactions

---

For detailed information, see the complete [POS Module Documentation](POS_MODULE_DOCUMENTATION.md).
