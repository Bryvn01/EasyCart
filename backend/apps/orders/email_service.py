from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import os

class EmailService:
    @staticmethod
    def send_order_confirmation(order):
        subject = f'Order Confirmation - #{order.id}'
        html_message = f"""
        <h2>Order Confirmation</h2>
        <p>Dear {order.user.username},</p>
        <p>Your order #{order.id} has been confirmed!</p>
        <p><strong>Total Amount:</strong> KES {order.total_amount}</p>
        <p><strong>Payment Method:</strong> {order.payment_method.upper()}</p>
        <p>We'll notify you when your order is shipped.</p>
        <p>Thank you for shopping with us!</p>
        """
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [order.user.email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")
    
    @staticmethod
    def send_payment_confirmation(order):
        subject = f'Payment Confirmed - Order #{order.id}'
        html_message = f"""
        <h2>Payment Confirmed</h2>
        <p>Dear {order.user.username},</p>
        <p>Your payment for order #{order.id} has been confirmed!</p>
        <p><strong>Amount Paid:</strong> KES {order.total_amount}</p>
        <p><strong>Payment Reference:</strong> {order.payment_reference}</p>
        <p>Your order is now being processed.</p>
        """
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [order.user.email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")
    
    @staticmethod
    def send_order_status_update(order, old_status, new_status):
        subject = f'Order #{order.id} Status Update - {new_status.title()}'
        
        status_messages = {
            'processing': 'Your order is now being processed and prepared for shipment.',
            'shipped': 'Great news! Your order has been shipped and is on its way to you.',
            'delivered': 'Your order has been delivered. We hope you enjoy your purchase!',
            'cancelled': 'Your order has been cancelled as requested.'
        }
        
        status_message = status_messages.get(new_status, f'Your order status has been updated to {new_status}.')
        
        html_message = f"""
        <h2>Order Status Update</h2>
        <p>Dear {order.user.username},</p>
        <p>Your order <strong>#{order.id}</strong> status has been updated.</p>
        <p><strong>Previous Status:</strong> {old_status.title()}</p>
        <p><strong>New Status:</strong> {new_status.title()}</p>
        <hr>
        <p>{status_message}</p>
        <hr>
        <p><strong>Order Details:</strong></p>
        <ul>
            <li>Order ID: #{order.id}</li>
            <li>Total Amount: KES {order.total_amount}</li>
            <li>Payment Status: {order.payment_status.title()}</li>
        </ul>
        <p>Thank you for shopping with us!</p>
        """
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [order.user.email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")