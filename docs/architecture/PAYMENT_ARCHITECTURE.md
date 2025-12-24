# Payment Gateway Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          EASYCART PAYMENT SYSTEM                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────────────┐
│   Customer   │────────▶│   Frontend   │────────▶│   Backend (Django)   │
│   Browser    │         │   (React)    │         │    REST API          │
└──────────────┘         └──────────────┘         └──────────────────────┘
                                │                           │
                                │                           │
                                ▼                           ▼
                    ┌─────────────────────┐    ┌──────────────────────┐
                    │  Cart.js            │    │  views.py            │
                    │  - Payment Method   │    │  - checkout()        │
                    │  - Checkout Form    │    │  - initiate_payment()│
                    └─────────────────────┘    └──────────────────────┘
                                                          │
                    ┌─────────────────────┐              │
                    │  PaymentModal.js    │              ▼
                    │  - Payment UI       │    ┌──────────────────────┐
                    │  - Method Selection │    │  payment_service.py  │
                    └─────────────────────┘    │                      │
                                                │  ┌────────────────┐ │
                                                │  │ MpesaService   │ │
                                                │  ├────────────────┤ │
                                                │  │ FlutterwaveS.  │ │
                                                │  ├────────────────┤ │
                                                │  │ StripeService  │ │
                                                │  ├────────────────┤ │
                                                │  │ PayPalService  │ │
                                                │  └────────────────┘ │
                                                └──────────────────────┘
                                                          │
                    ┌─────────────────────────────────────┴─────────────┐
                    │                                                   │
                    ▼                                                   ▼
        ┌─────────────────────┐                          ┌─────────────────────┐
        │  M-Pesa/Safaricom   │                          │   Stripe/PayPal     │
        │  - STK Push         │                          │   - Checkout Pages  │
        │  - Callback         │                          │   - Webhooks        │
        └─────────────────────┘                          └─────────────────────┘
                    │                                                   │
                    └─────────────────────┬───────────────────────────┘
                                          │
                                          ▼
                              ┌──────────────────────┐
                              │   Database (Order)   │
                              │   - payment_status   │
                              │   - payment_method   │
                              │   - transaction_id   │
                              └──────────────────────┘
                                          │
                                          ▼
                              ┌──────────────────────┐
                              │  Admin Dashboard     │
                              │  - Payment Analytics │
                              │  - Order History     │
                              └──────────────────────┘
```

## Payment Flow Diagram

### 1. Checkout Flow
```
Customer                Frontend              Backend              Payment Gateway
   │                       │                     │                      │
   │  Add to Cart          │                     │                      │
   ├──────────────────────▶│                     │                      │
   │                       │                     │                      │
   │  Checkout             │                     │                      │
   ├──────────────────────▶│                     │                      │
   │                       │                     │                      │
   │  Select Payment       │                     │                      │
   │  Method (Stripe)      │                     │                      │
   ├──────────────────────▶│                     │                      │
   │                       │                     │                      │
   │  Click "Pay Now"      │  POST /checkout     │                      │
   ├──────────────────────▶├────────────────────▶│                      │
   │                       │                     │  Create Order        │
   │                       │                     │  (status: pending)   │
   │                       │                     │                      │
   │                       │  Order Created      │                      │
   │                       │◀────────────────────┤                      │
   │                       │  (order_id: 123)    │                      │
   │  Payment Modal Opens  │                     │                      │
   │◀──────────────────────┤                     │                      │
   │                       │                     │                      │
   │  Confirm Payment      │  POST /initiate     │                      │
   ├──────────────────────▶├────────────────────▶│                      │
   │                       │                     │  Call StripeService  │
   │                       │                     │  .initiate_payment() │
   │                       │                     ├─────────────────────▶│
   │                       │                     │                      │
   │                       │                     │  Create Session      │
   │                       │                     │◀─────────────────────┤
   │                       │                     │  (checkout_url)      │
   │                       │  Payment URL        │                      │
   │                       │◀────────────────────┤                      │
   │  Redirect to Stripe   │                     │                      │
   │◀──────────────────────┤                     │                      │
   ├──────────────────────────────────────────────────────────────────▶│
   │                       │                     │                      │
   │  Complete Payment     │                     │                      │
   ├──────────────────────────────────────────────────────────────────▶│
   │                       │                     │                      │
   │                       │                     │  Webhook Callback    │
   │                       │                     │◀─────────────────────┤
   │                       │                     │                      │
   │                       │                     │  Update Order        │
   │                       │                     │  (status: completed) │
   │                       │                     │                      │
   │  Success Page         │                     │                      │
   │◀──────────────────────────────────────────────────────────────────┤
   │                       │                     │                      │
```

### 2. M-Pesa Flow (STK Push)
```
Customer Phone          Backend              M-Pesa API            Safaricom
   │                       │                     │                      │
   │                       │  POST /initiate     │                      │
   │                       │  (payment_method:   │                      │
   │                       │   mpesa)            │                      │
   │                       │◀────────────────────┤                      │
   │                       │                     │                      │
   │                       │  Get Access Token   │                      │
   │                       ├────────────────────▶│                      │
   │                       │◀────────────────────┤                      │
   │                       │                     │                      │
   │                       │  STK Push Request   │                      │
   │                       ├────────────────────▶│                      │
   │                       │                     │                      │
   │                       │                     │  Send STK Prompt     │
   │                       │                     ├─────────────────────▶│
   │  📱 Payment Prompt    │                     │                      │
   │◀──────────────────────────────────────────────────────────────────┤
   │                       │                     │                      │
   │  Enter PIN            │                     │                      │
   ├──────────────────────────────────────────────────────────────────▶│
   │                       │                     │                      │
   │                       │                     │  Payment Processed   │
   │                       │                     │◀─────────────────────┤
   │                       │                     │                      │
   │                       │  Callback           │                      │
   │                       │◀────────────────────┤                      │
   │                       │  (ResultCode: 0)    │                      │
   │                       │                     │                      │
   │                       │  Update Order       │                      │
   │                       │  Save Receipt #     │                      │
   │                       │                     │                      │
   │  ✅ Confirmation SMS  │                     │                      │
   │◀──────────────────────────────────────────────────────────────────┤
```

## Database Schema

### Order Table
```
┌──────────────────────────────────────────────────────────┐
│                      orders_order                        │
├──────────────────────────────────────────────────────────┤
│  id                  INTEGER PRIMARY KEY                 │
│  user_id             INTEGER FOREIGN KEY                 │
│  total_amount        DECIMAL(10,2)                       │
│  status              VARCHAR(20)                         │
│    ├─ pending                                            │
│    ├─ processing                                         │
│    ├─ shipped                                            │
│    ├─ delivered                                          │
│    └─ cancelled                                          │
│  shipping_address    TEXT                                │
│  phone_number        VARCHAR(15)                         │
│  payment_method      VARCHAR(20)                         │
│    ├─ mpesa          ────────────────┐                   │
│    ├─ airtel                         │                   │
│    ├─ tkash                          │                   │
│    ├─ card           (Flutterwave)   │                   │
│    ├─ stripe         (NEW)           │                   │
│    ├─ paypal         (NEW)           │                   │
│    ├─ bank                           │                   │
│    └─ cash                           │                   │
│  payment_status      VARCHAR(20) ◀───┘                   │
│    ├─ pending                                            │
│    ├─ processing                                         │
│    ├─ completed                                          │
│    ├─ failed                                             │
│    └─ cancelled                                          │
│  payment_reference   VARCHAR(100) NULLABLE               │
│  transaction_id      VARCHAR(100) NULLABLE               │
│  created_at          DATETIME                            │
│  updated_at          DATETIME                            │
└──────────────────────────────────────────────────────────┘
```

## Admin Dashboard Analytics

```
┌────────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 📦 Orders    │  │ 💰 Revenue   │  │ 👥 Customers │        │
│  │ 150          │  │ KES 750,000  │  │ 45 active    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │            Payment Methods Breakdown                    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  💳 M-Pesa          80 orders     KES 400,000    53%   │  │
│  │  💳 Stripe          40 orders     KES 200,000    27%   │  │
│  │  💰 PayPal          30 orders     KES 150,000    20%   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │            Payment Status                               │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  ✓ Completed        120 orders                    80%  │  │
│  │  ⏳ Pending          20 orders                    13%  │  │
│  │  ✗ Failed           10 orders                     7%   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │            Recent Orders                                │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  #123  john@example.com    KES 5,000  [Stripe] ✓       │  │
│  │  #122  jane@example.com    KES 3,500  [M-Pesa] ✓       │  │
│  │  #121  bob@example.com     KES 7,200  [PayPal] ⏳      │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. INPUT VALIDATION                                        │
│     ├─ Phone number regex validation                       │
│     ├─ Email validation                                     │
│     ├─ Address sanitization (XSS prevention)                │
│     └─ Payment method whitelist                             │
│                                                             │
│  2. AUTHENTICATION                                          │
│     ├─ JWT token validation                                 │
│     ├─ User session verification                            │
│     └─ Admin role checking                                  │
│                                                             │
│  3. AUTHORIZATION                                           │
│     ├─ Order ownership validation                           │
│     ├─ Admin-only endpoints                                 │
│     └─ Payment gateway credentials                          │
│                                                             │
│  4. DATA PROTECTION                                         │
│     ├─ HTTPS for all payment URLs                           │
│     ├─ Environment variables for secrets                    │
│     ├─ Database encryption                                  │
│     └─ SQL injection prevention (ORM)                       │
│                                                             │
│  5. PAYMENT GATEWAY SECURITY                                │
│     ├─ API key authentication                               │
│     ├─ Webhook signature verification                       │
│     ├─ Callback URL validation                              │
│     └─ Transaction ID tracking                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

```
┌──────────────────────────────────────────────────────────────┐
│                  EXTERNAL INTEGRATIONS                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  M-Pesa (Safaricom)                                          │
│  ├─ API: https://sandbox.safaricom.co.ke                    │
│  ├─ Authentication: OAuth 2.0 (Consumer Key/Secret)          │
│  ├─ Callback: POST /api/payments/mpesa/callback/            │
│  └─ Features: STK Push, Payment Status                       │
│                                                              │
│  Flutterwave                                                 │
│  ├─ API: https://api.flutterwave.com/v3                     │
│  ├─ Authentication: Bearer Token (Secret Key)                │
│  ├─ Redirect: Custom success/cancel URLs                    │
│  └─ Features: Card processing, Hosted checkout               │
│                                                              │
│  Stripe                                                      │
│  ├─ API: https://api.stripe.com/v1                          │
│  ├─ Authentication: Bearer Token (Secret Key)                │
│  ├─ Webhook: POST /api/payments/stripe/webhook/             │
│  └─ Features: Checkout Sessions, Payment Intents             │
│                                                              │
│  PayPal                                                      │
│  ├─ API: https://api-m.sandbox.paypal.com                   │
│  ├─ Authentication: OAuth 2.0 (Client ID/Secret)             │
│  ├─ Redirect: Return URL, Cancel URL                        │
│  └─ Features: Order creation, Payment capture                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## File Structure

```
EasyCart/
├── backend/
│   ├── apps/
│   │   ├── orders/
│   │   │   ├── payment_service.py          ← Payment gateway classes
│   │   │   ├── views.py                    ← Payment endpoints
│   │   │   ├── models.py                   ← Order with payment fields
│   │   │   ├── admin.py                    ← Enhanced admin interface
│   │   │   ├── urls.py                     ← Payment routes
│   │   │   └── migrations/
│   │   │       └── 0003_add_stripe_paypal_payment_methods.py
│   │   └── admin_dashboard/
│   │       └── views.py                    ← Payment analytics API
│   └── .env.example                        ← All payment gateway configs
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Cart.js                     ← Checkout with payment selection
│   │   │   └── AdminDashboard.js           ← Payment analytics UI
│   │   └── components/
│   │       └── PaymentModal.js             ← Payment confirmation modal
└── Documentation/
    ├── PAYMENT_GATEWAY_GUIDE.md            ← Setup instructions
    ├── PAYMENT_IMPLEMENTATION_SUMMARY.md   ← Technical overview
    └── PAYMENT_ARCHITECTURE.md             ← This file
```
