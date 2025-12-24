# EasyCart POS Module - Complete Documentation

## Overview

The Point of Sale (POS) module is a comprehensive solution for managing in-store sales at EasyCart. It integrates seamlessly with the existing e-commerce platform, providing real-time inventory synchronization, staff management, payment processing, and detailed analytics.

## Features

### ✅ Core Features Implemented

1. **Session Management**
   - Staff can open/close POS sessions (shifts)
   - Track opening and closing cash amounts
   - Session reconciliation with automatic discrepancy detection
   - Multi-session support for multiple staff members

2. **Point of Sale Terminal**
   - Fast product search by name or SKU
   - Real-time inventory checking
   - Quick add-to-cart functionality
   - Quantity adjustment
   - Discount application (percentage-based)
   - Support for walk-in customers or registered users
   - Customer information capture

3. **Payment Processing**
   - Multiple payment methods:
     - Cash (with change calculation)
     - Card (Credit/Debit)
     - M-Pesa
     - Airtel Money
   - Mixed payment support (future enhancement)
   - Payment reference tracking

4. **Receipt Management**
   - Automatic receipt generation
   - Print receipt functionality
   - Email receipt option
   - Receipt reprinting capability
   - Receipt history tracking

5. **Real-time Inventory Sync**
   - Automatic stock reduction on transaction creation
   - Stock restoration on cancellation/refund
   - Prevents overselling with stock validation
   - Signal-based inventory updates

6. **Staff Management & Permissions**
   - Role-based access control
   - Granular permissions:
     - Open/close sessions
     - Apply discounts
     - Void transactions
     - Process refunds
     - View reports
     - Manage cash
     - Override prices
   - Audit trail for all actions

7. **Analytics & Reporting**
   - Real-time dashboard with key metrics
   - Sales by payment method
   - Hourly and daily sales trends
   - Top-selling products
   - Session performance tracking
   - Staff performance metrics
   - Custom date range reports

8. **Discount System**
   - Predefined discount templates
   - Percentage or fixed amount discounts
   - Minimum purchase requirements
   - Usage limits and expiration dates
   - Automatic validation

## Architecture

### Backend (Django)

```
backend/apps/pos/
├── models.py           # Database models
├── serializers.py      # API serializers
├── views.py           # API endpoints
├── permissions.py     # Custom permissions
├── urls.py            # URL routing
├── admin.py           # Django admin
├── signals.py         # Inventory sync signals
├── utils.py           # Receipt generation utilities
└── apps.py            # App configuration
```

#### Database Models

1. **POSSession** - Manages staff shifts
2. **POSTransaction** - Individual sales transactions
3. **POSTransactionItem** - Line items in transactions
4. **POSPaymentSplit** - Mixed payment support
5. **POSStaffPermission** - Staff access control
6. **POSDiscount** - Discount templates
7. **POSReceipt** - Receipt records

### Frontend (React + Material-UI)

```
admin-dashboard/src/pages/POS/
├── index.jsx          # Route configuration
├── SessionManager.jsx # Session open/close
├── Terminal.jsx       # POS interface
└── Dashboard.jsx      # Analytics dashboard
```

## API Endpoints

### Sessions
- `GET /api/pos/sessions/` - List all sessions
- `POST /api/pos/sessions/` - Open new session
- `GET /api/pos/sessions/current/` - Get active session
- `POST /api/pos/sessions/{id}/close_session/` - Close session
- `POST /api/pos/sessions/{id}/reconcile/` - Reconcile session
- `GET /api/pos/sessions/{id}/summary/` - Session summary

### Transactions
- `GET /api/pos/transactions/` - List transactions
- `POST /api/pos/transactions/` - Create transaction
- `POST /api/pos/transactions/{id}/complete/` - Complete payment
- `POST /api/pos/transactions/{id}/void/` - Void transaction
- `POST /api/pos/transactions/{id}/refund/` - Process refund
- `POST /api/pos/transactions/{id}/print_receipt/` - Mark printed
- `POST /api/pos/transactions/{id}/email_receipt/` - Email receipt

### Products
- `GET /api/pos/products/` - Search products
- `GET /api/pos/products/barcode/?sku={sku}` - Search by SKU

### Discounts
- `GET /api/pos/discounts/` - List discounts
- `POST /api/pos/discounts/validate_code/` - Validate discount code

### Dashboard
- `GET /api/pos/dashboard/stats/` - Get dashboard statistics
- `GET /api/pos/dashboard/sales_report/` - Generate sales report

## Setup Instructions

### 1. Database Migration

```bash
cd backend
python manage.py makemigrations pos
python manage.py migrate
```

### 2. Create Superuser (if needed)

```bash
python manage.py createsuperuser
```

### 3. Grant POS Permissions

Access Django admin at `/admin/` and:
1. Go to **POS Staff Permissions**
2. Create permissions for staff members
3. Assign appropriate permissions:
   - `can_open_session`
   - `can_close_session`
   - `can_apply_discount`
   - etc.

### 4. Start Backend Server

```bash
python manage.py runserver
```

### 5. Start Frontend

```bash
cd admin-dashboard
npm install
npm start
```

### 6. Access POS

Navigate to: `http://localhost:3000/admin/pos/`

## Usage Guide

### Opening a Session

1. Navigate to **POS → Session Manager**
2. Enter opening cash amount
3. Click **Open Session**
4. System redirects to POS Terminal

### Making a Sale

1. **Search Products**: Type product name or scan barcode
2. **Add to Cart**: Click "Add to Cart" on products
3. **Adjust Quantities**: Use +/- buttons
4. **Apply Discount**: Enter discount percentage (optional)
5. **Add Customer Info**: Optional for walk-in customers
6. **Checkout**: Click "Checkout" button
7. **Select Payment Method**: Cash, Card, M-Pesa, or Airtel
8. **Complete Payment**:
   - For cash: Enter amount received
   - System calculates change
9. **Print Receipt**: After successful payment

### Closing a Session

1. Navigate to **Session Manager**
2. Enter closing cash amount
3. Add closing notes (optional)
4. Click **Close Session**
5. Review cash discrepancy report
6. Mark as reconciled when verified

### Viewing Reports

1. Navigate to **POS → Dashboard**
2. Select date range
3. View metrics:
   - Total sales
   - Transaction count
   - Average transaction value
   - Payment method breakdown
   - Top products
   - Hourly/daily trends

## Best Practices

### For Store Managers

1. **Daily Reconciliation**: Close and reconcile sessions daily
2. **Staff Training**: Ensure all staff understand the system
3. **Regular Audits**: Review POS reports regularly
4. **Discount Control**: Monitor discount usage
5. **Inventory Checks**: Compare POS data with physical inventory

### For Cashiers

1. **Session Management**: Always open session at shift start
2. **Accurate Counting**: Count cash carefully when opening/closing
3. **Customer Service**: Collect customer information when possible
4. **Receipt Printing**: Always offer receipts
5. **Stock Verification**: Check stock before adding items

### Security

1. **Access Control**: Only grant necessary permissions
2. **Session Ownership**: Staff should only access their own sessions
3. **Void Authorization**: Require manager approval for voids
4. **Cash Handling**: Follow cash management policies
5. **Audit Trail**: All actions are logged and traceable

## Industry Best Practices Implemented

### Retail Standards

✅ **Dual Pricing**: Support for both online and in-store pricing
✅ **Inventory Sync**: Real-time synchronization prevents overselling
✅ **Session Accountability**: Each session tied to specific staff member
✅ **Cash Reconciliation**: Automated discrepancy detection
✅ **Receipt Management**: Professional receipts with all required information

### Payment Processing

✅ **Multiple Payment Methods**: Support for local payment systems (M-Pesa, Airtel)
✅ **Change Calculation**: Automatic for cash transactions
✅ **Payment Audit Trail**: All payments tracked and referenced
✅ **Refund Process**: Formal refund workflow with inventory restoration

### Reporting & Analytics

✅ **Real-time Dashboard**: Live sales metrics
✅ **Historical Analysis**: Trend analysis by hour, day, week, month
✅ **Product Performance**: Track best and worst sellers
✅ **Staff Performance**: Session-based performance tracking
✅ **Custom Reports**: Flexible date range selection

### Data Integrity

✅ **Transaction Atomicity**: All-or-nothing transaction processing
✅ **Inventory Signals**: Automatic stock updates via Django signals
✅ **Audit Logging**: Historical records via django-simple-history
✅ **Data Validation**: Comprehensive input validation
✅ **Error Handling**: Graceful error recovery

## Future Enhancements

### Phase 2 Features

- [ ] **Offline Mode**
  - Local storage for offline transactions
  - Automatic sync when connection restored
  - Queue management for pending transactions

- [ ] **Advanced Features**
  - Barcode scanner integration
  - Receipt printer integration (ESC/POS)
  - Customer loyalty program
  - Gift cards and vouchers
  - Layaway/installment payments
  - Split payments (multiple methods)

- [ ] **Enhanced Analytics**
  - Predictive analytics
  - Inventory forecasting
  - Staff scheduling optimization
  - Customer segmentation

- [ ] **Mobile POS**
  - Tablet/mobile version
  - Bluetooth printer support
  - Offline-first architecture

## Troubleshooting

### Common Issues

**Issue**: Session won't open
- **Solution**: Check if user has `can_open_session` permission
- **Solution**: Verify no existing open session for user

**Issue**: Product not found in search
- **Solution**: Ensure product is marked as active
- **Solution**: Check product has stock > 0
- **Solution**: Verify SKU is correct

**Issue**: Payment fails
- **Solution**: Check network connection
- **Solution**: Verify sufficient stock
- **Solution**: Check backend logs for errors

**Issue**: Receipt won't print
- **Solution**: Check browser print settings
- **Solution**: Enable popups for the domain
- **Solution**: Verify transaction completed successfully

### Support

For technical support or questions:
- Email: support@easycart.com
- Documentation: `/docs/pos/`
- Admin: `/admin/` (for backend configuration)

## API Authentication

All POS endpoints require JWT authentication:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

Tokens are obtained via the login endpoint and stored in localStorage.

## Testing

### Manual Testing Checklist

- [ ] Open session with opening cash
- [ ] Search and add products to cart
- [ ] Apply discount
- [ ] Complete cash payment with change
- [ ] Complete card payment
- [ ] Complete M-Pesa payment
- [ ] Print receipt
- [ ] Void transaction
- [ ] Process refund
- [ ] Close session with reconciliation
- [ ] View dashboard analytics
- [ ] Filter reports by date

### Test Data

Create test products via Django admin:
1. Navigate to `/admin/products/product/`
2. Create products with various prices and stock levels
3. Ensure products are marked as active

## Performance Considerations

- Product search is optimized with database indexes
- Transaction creation uses atomic operations
- Dashboard uses aggregation queries for efficiency
- Frontend implements debounced search
- Lazy loading for large product lists

## Compliance & Regulations

### Tax Compliance

- Configure tax rates in settings
- Tax automatically calculated per transaction
- Tax reports available in dashboard
- Receipt includes tax breakdown

### Data Protection

- PII (customer data) stored securely
- Audit trail for all access
- GDPR-compliant data handling
- Secure payment information storage

## Conclusion

The EasyCart POS module provides a complete, production-ready solution for retail operations. It combines modern web technologies with industry best practices to deliver a robust, user-friendly point of sale system that integrates seamlessly with your e-commerce platform.

For additional assistance or custom features, please contact the development team.

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Author**: EasyCart Development Team
