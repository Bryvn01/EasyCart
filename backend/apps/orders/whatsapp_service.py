import requests
from decouple import config


class WhatsAppService:
    """Send WhatsApp notifications using Twilio"""

    def __init__(self):
        self.account_sid = config("TWILIO_ACCOUNT_SID", default="")
        self.auth_token = config("TWILIO_AUTH_TOKEN", default="")
        self.whatsapp_from = config(
            "TWILIO_WHATSAPP_FROM", default="whatsapp:+14155238886"
        )
        self.admin_phone = config("ADMIN_WHATSAPP_NUMBER", default="")

    def send_order_confirmation(self, order):
        """Send order confirmation to customer"""
        if not self.account_sid or not self.auth_token:
            print("⚠️ Twilio not configured")
            return False

        customer_name = f"{order.user.first_name} {order.user.last_name}".strip()
        greeting = f"Dear {customer_name}," if customer_name else "Dear Customer,"

        customer_phone = f"whatsapp:+{order.phone_number}"
        message = f"""
{greeting}

Thank you for your order with EasyCart.

*ORDER CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━
Order ID: #{order.id}
Date: {order.created_at.strftime('%d %b %Y, %I:%M %p')}
Total Amount: KSh {order.total_amount:,.2f}
Status: {order.status.title()}

*ITEMS ORDERED*
{self._format_items(order)}

*DELIVERY ADDRESS*
{order.shipping_address}

*TRACK YOUR ORDER*
https://easycart-frontend-wj9x.onrender.com/orders/{order.id}

For any inquiries, please contact our support team.

Best regards,
EasyCart Team
"""
        return self._send_message(customer_phone, message)

    def send_admin_notification(self, order):
        """Send new order notification to admin"""
        if not self.admin_phone:
            return False

        admin_phone = f"whatsapp:+{self.admin_phone}"
        message = f"""
🔔 *New Order Received*

Order ID: #{order.id}
Customer: {order.user.first_name} {order.user.last_name}
Phone: {order.phone_number}
Total: KSh {order.total_amount}
Payment: {order.payment_method}

Items: {order.items.count()} items
{self._format_items(order)}

Delivery:
{order.shipping_address}

View: https://easycart-admin-08xf.onrender.com/orders/{order.id}
"""
        return self._send_message(admin_phone, message)

    def send_payment_success(self, order):
        """Send payment success notification"""
        customer_name = f"{order.user.first_name} {order.user.last_name}".strip()
        greeting = f"Dear {customer_name}," if customer_name else "Dear Customer,"

        customer_phone = f"whatsapp:+{order.phone_number}"
        message = f"""
{greeting}

Your payment has been successfully received.

*PAYMENT CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━
Order ID: #{order.id}
Amount Paid: KSh {order.total_amount:,.2f}
Payment Method: {order.payment_method.upper()}
Status: Confirmed ✓

Your order is now being processed and will be dispatched shortly.

*TRACK YOUR ORDER*
https://easycart-frontend-wj9x.onrender.com/orders/{order.id}

Thank you for choosing EasyCart.

Best regards,
EasyCart Team
"""
        return self._send_message(customer_phone, message)

    def _format_items(self, order):
        """Format order items for message"""
        items = []
        for item in order.items.all()[:5]:  # Show first 5 items
            items.append(f"• {item.product.name} x{item.quantity}")

        if order.items.count() > 5:
            items.append(f"... and {order.items.count() - 5} more items")

        return "\n".join(items)

    def _send_message(self, to, body):
        """Send WhatsApp message via Twilio"""
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"

        data = {"From": self.whatsapp_from, "To": to, "Body": body}

        try:
            response = requests.post(
                url, data=data, auth=(self.account_sid, self.auth_token), timeout=10
            )

            if response.status_code == 201:
                print(f"✅ WhatsApp sent to {to}")
                return True
            else:
                print(f"❌ WhatsApp failed: {response.text}")
                return False

        except Exception as e:
            print(f"❌ WhatsApp error: {e}")
            return False
