import requests
from decouple import config
import logging

logger = logging.getLogger(__name__)


class WhatsAppService:
    """Send WhatsApp notifications using Ultramsg"""

    def __init__(self):
        self.instance_id = config("ULTRAMSG_INSTANCE_ID", default="")
        self.token = config("ULTRAMSG_TOKEN", default="")
        self.base_url = f"https://api.ultramsg.com/{self.instance_id}"
        self.admin_phone = config("ADMIN_WHATSAPP_NUMBER", default="")

    def send_order_confirmation(self, order):
        """Send order confirmation to customer"""
        if not self.instance_id or not self.token:
            logger.warning("Ultramsg not configured - skipping WhatsApp notification")
            print(f"   Order #{order.id} for {order.user.email}")
            return False

        customer_name = f"{order.user.first_name} {order.user.last_name}".strip()
        greeting = f"Dear {customer_name}," if customer_name else "Dear Customer,"

        # Ultramsg expects phone in format: 254XXXXXXXXX (no + or spaces)
        customer_phone = order.phone_number.replace("+", "").replace(" ", "")
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

        # Ultramsg expects phone in format: 254XXXXXXXXX (no + or spaces)
        admin_phone = self.admin_phone.replace("+", "").replace(" ", "")
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

        # Ultramsg expects phone in format: 254XXXXXXXXX (no + or spaces)
        customer_phone = order.phone_number.replace("+", "").replace(" ", "")
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
        """Send WhatsApp message via Ultramsg"""
        url = f"{self.base_url}/messages/chat"

        headers = {"Content-Type": "application/json"}

        data = {
            "token": self.token,
            "to": to,
            "body": body,
            "priority": 10,
            "referenceId": "",
        }

        try:
            response = requests.post(url, json=data, headers=headers, timeout=15)
            response_data = response.json()

            if response.status_code == 200 and response_data.get("sent") == "true":
                logger.info(f"✅ WhatsApp sent to {to} - ID: {response_data.get('id')}")
                return True
            else:
                error_msg = response_data.get("error", "Unknown error")
                logger.error(f"❌ WhatsApp failed: {error_msg}")
                return False

        except Exception as e:
            logger.error(f"❌ WhatsApp error: {e}")
            logger.error(f"   To: {to}")
            logger.error(f"   Instance: {self.instance_id}")
            return False
