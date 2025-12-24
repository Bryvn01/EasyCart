# Smart Notification Configuration - Best Practices

## 1. Multi-Channel Notifications

### Email + WhatsApp + SMS
```python
class NotificationService:
    def notify_order(self, order):
        # Send via all channels
        self.send_email(order)
        self.send_whatsapp(order)
        self.send_sms(order)  # Fallback if WhatsApp fails
```

**Add to `.env`:**
```env
# Email (SendGrid/Mailgun)
SENDGRID_API_KEY=your_key
FROM_EMAIL=orders@easycart.com

# SMS (Africa's Talking)
AT_API_KEY=your_key
AT_USERNAME=sandbox
```

## 2. Async Notifications with Celery (Recommended)

**Install:**
```bash
pip install celery redis
```

**Create `backend/apps/orders/tasks.py`:**
```python
from celery import shared_task
from .whatsapp_service import WhatsAppService
from .models import Order

@shared_task
def send_order_notifications(order_id):
    order = Order.objects.get(id=order_id)
    whatsapp = WhatsAppService()
    whatsapp.send_order_confirmation(order)
    whatsapp.send_admin_notification(order)
```

**Use in views:**
```python
# Instead of direct call
send_order_notifications.delay(order.id)  # Async
```

**Benefits:**
- ✅ Non-blocking (instant response)
- ✅ Retry on failure
- ✅ Queue management

## 3. User Notification Preferences

**Add to User model:**
```python
class UserNotificationPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email_enabled = models.BooleanField(default=True)
    whatsapp_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    order_updates = models.BooleanField(default=True)
    promotions = models.BooleanField(default=False)
```

**Check before sending:**
```python
if order.user.preferences.whatsapp_enabled:
    whatsapp.send_order_confirmation(order)
```

## 4. Smart Notification Timing

**Batch notifications:**
```python
# Don't send immediately for every status change
# Batch updates every 30 minutes
@shared_task
def send_batch_updates():
    orders = Order.objects.filter(
        status_changed_at__gte=timezone.now() - timedelta(minutes=30),
        notification_sent=False
    )
    for order in orders:
        send_notification(order)
        order.notification_sent = True
        order.save()
```

## 5. Rich Notifications with Images

**WhatsApp with product images:**
```python
def send_order_with_image(self, order):
    # Send image first
    self._send_media(
        to=f"whatsapp:+{order.phone_number}",
        media_url=order.items.first().product.image
    )
    # Then send details
    self._send_message(...)
```

## 6. Notification Templates

**Create `backend/apps/orders/notification_templates.py`:**
```python
TEMPLATES = {
    'order_confirmed': {
        'whatsapp': """
✅ *Order Confirmed!*
Order: #{order_id}
Total: KSh {total}
Track: {link}
""",
        'email_subject': 'Order #{order_id} Confirmed',
        'sms': 'Order #{order_id} confirmed. Total: KSh {total}'
    },
    'order_shipped': {
        'whatsapp': """
📦 *Order Shipped!*
Order: #{order_id}
Tracking: {tracking_number}
ETA: {eta}
""",
    }
}
```

## 7. Delivery Status Updates

**Track delivery stages:**
```python
ORDER_STAGES = [
    'confirmed',      # Send immediately
    'processing',     # Send after 1 hour
    'shipped',        # Send immediately
    'out_for_delivery', # Send immediately
    'delivered'       # Send + request review
]

def send_stage_notification(order, stage):
    if stage == 'delivered':
        # Send delivery confirmation + review request
        whatsapp.send_delivery_confirmation(order)
        whatsapp.send_review_request(order)
```

## 8. Admin Dashboard Notifications

**Real-time admin alerts:**
```python
# Send to multiple admins
ADMIN_PHONES = config('ADMIN_PHONES', default='').split(',')

def notify_all_admins(order):
    for phone in ADMIN_PHONES:
        whatsapp.send_admin_notification(order, phone)
```

## 9. Failed Notification Retry

**Add retry logic:**
```python
@shared_task(bind=True, max_retries=3)
def send_notification_with_retry(self, order_id):
    try:
        order = Order.objects.get(id=order_id)
        whatsapp = WhatsAppService()
        whatsapp.send_order_confirmation(order)
    except Exception as e:
        # Retry after 5 minutes
        raise self.retry(exc=e, countdown=300)
```

## 10. Notification Analytics

**Track delivery:**
```python
class NotificationLog(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    channel = models.CharField(max_length=20)  # whatsapp, email, sms
    status = models.CharField(max_length=20)   # sent, failed, delivered
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True)
    error_message = models.TextField(blank=True)
```

## 11. Cost Optimization

**Smart channel selection:**
```python
def send_smart_notification(order):
    # Try WhatsApp first (cheapest)
    if whatsapp.send(order):
        return

    # Fallback to SMS (more expensive)
    if sms.send(order):
        return

    # Last resort: Email (free)
    email.send(order)
```

## 12. Customer Support Integration

**Two-way messaging:**
```python
# Handle incoming WhatsApp messages
@api_view(['POST'])
def whatsapp_webhook(request):
    message = request.data.get('Body')
    from_number = request.data.get('From')

    # Check if it's an order inquiry
    if message.startswith('#'):
        order_id = message[1:]
        order = Order.objects.get(id=order_id)
        return send_order_status(order, from_number)
```

## Recommended Setup

### For Small Business (< 100 orders/day)
```env
# WhatsApp only
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
```

### For Medium Business (100-1000 orders/day)
```env
# WhatsApp + Email + Celery
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
SENDGRID_API_KEY=...
CELERY_BROKER_URL=redis://localhost:6379
```

### For Large Business (1000+ orders/day)
```env
# Multi-channel + Queue + Analytics
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
SENDGRID_API_KEY=...
AT_API_KEY=...
CELERY_BROKER_URL=redis://...
NOTIFICATION_QUEUE=high_priority
```

## Implementation Priority

1. ✅ **WhatsApp order confirmation** (Done)
2. 🔄 **Celery async processing** (High priority)
3. 📧 **Email notifications** (Medium priority)
4. 📊 **Notification preferences** (Medium priority)
5. 📱 **SMS fallback** (Low priority)
6. 🔔 **Push notifications** (Future)

## Quick Wins

### Add Email Notifications (5 min)
```bash
pip install sendgrid
```

```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_email(order):
    message = Mail(
        from_email='orders@easycart.com',
        to_emails=order.user.email,
        subject=f'Order #{order.id} Confirmed',
        html_content=f'<strong>Your order is confirmed!</strong>'
    )
    sg = SendGridAPIClient(config('SENDGRID_API_KEY'))
    sg.send(message)
```

### Add SMS Fallback (10 min)
```python
def send_sms(order):
    url = "https://api.africastalking.com/version1/messaging"
    data = {
        'username': config('AT_USERNAME'),
        'to': order.phone_number,
        'message': f'Order #{order.id} confirmed. Total: KSh {order.total_amount}'
    }
    requests.post(url, data=data, headers={'apiKey': config('AT_API_KEY')})
```

## Cost Comparison (Kenya)

| Channel | Cost per Message | Delivery Rate | Best For |
|---------|-----------------|---------------|----------|
| WhatsApp | KSh 0.50 | 98% | Order updates |
| SMS | KSh 0.80 | 95% | OTP, urgent |
| Email | Free | 85% | Receipts, marketing |
| Push | Free | 70% | App users only |

## Next Steps

1. Set up Celery for async notifications
2. Add email notifications
3. Implement user preferences
4. Add notification analytics
5. Set up SMS fallback
