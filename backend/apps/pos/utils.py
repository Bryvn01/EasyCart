"""
Receipt generation utilities for POS system.
"""

from decimal import Decimal
from django.utils import timezone
from apps.pos.models import POSReceipt


def generate_receipt_data(transaction):
    """
    Generate receipt data from a transaction.

    Args:
        transaction: POSTransaction instance

    Returns:
        dict: Receipt data
    """
    items = []
    for item in transaction.items.all():
        items.append(
            {
                "name": item.product_name,
                "sku": item.product_sku,
                "quantity": item.quantity,
                "unit_price": str(item.unit_price),
                "discount": str(item.discount_amount),
                "total": str(item.line_total),
            }
        )

    receipt_data = {
        "transaction_number": transaction.transaction_number,
        "date": transaction.created_at.isoformat(),
        "staff": transaction.session.staff.username,
        "customer": {
            "name": transaction.customer_name or "Walk-in Customer",
            "phone": transaction.customer_phone or "",
            "email": transaction.customer_email or "",
        },
        "items": items,
        "subtotal": str(transaction.subtotal),
        "discount": str(transaction.discount_amount),
        "tax": str(transaction.tax_amount),
        "total": str(transaction.total_amount),
        "payment": {
            "method": transaction.get_payment_method_display(),
            "amount_paid": str(transaction.amount_paid),
            "change": str(transaction.change_given),
            "reference": transaction.payment_reference or "",
        },
        "notes": transaction.notes or "",
    }

    return receipt_data


def create_receipt(transaction):
    """
    Create a receipt record for a transaction.

    Args:
        transaction: POSTransaction instance

    Returns:
        POSReceipt: Created receipt instance
    """
    receipt_data = generate_receipt_data(transaction)

    receipt = POSReceipt.objects.create(
        transaction=transaction,
        receipt_number=f"RCP-{transaction.transaction_number}",
        receipt_data=receipt_data,
    )

    return receipt


def format_receipt_text(receipt_data):
    """
    Format receipt data as plain text for printing.

    Args:
        receipt_data: dict with receipt information

    Returns:
        str: Formatted receipt text
    """
    lines = []
    lines.append("=" * 50)
    lines.append("EASYCART - SALES RECEIPT")
    lines.append("=" * 50)
    lines.append("")
    lines.append(f"Receipt #: {receipt_data['transaction_number']}")
    lines.append(f"Date: {receipt_data['date']}")
    lines.append(f"Cashier: {receipt_data['staff']}")
    lines.append("")

    if receipt_data["customer"]["name"] != "Walk-in Customer":
        lines.append(f"Customer: {receipt_data['customer']['name']}")
        if receipt_data["customer"]["phone"]:
            lines.append(f"Phone: {receipt_data['customer']['phone']}")
        lines.append("")

    lines.append("-" * 50)
    lines.append(f"{'Item':<25} {'Qty':>5} {'Price':>10} {'Total':>10}")
    lines.append("-" * 50)

    for item in receipt_data["items"]:
        lines.append(
            f"{item['name'][:25]:<25} {item['quantity']:>5} {item['unit_price']:>10} {item['total']:>10}"
        )
        if Decimal(item["discount"]) > 0:
            lines.append(f"  Discount: -{item['discount']}")

    lines.append("-" * 50)
    lines.append(f"{'Subtotal:':<40} {receipt_data['subtotal']:>10}")

    if Decimal(receipt_data["discount"]) > 0:
        lines.append(f"{'Discount:':<40} -{receipt_data['discount']:>10}")

    if Decimal(receipt_data["tax"]) > 0:
        lines.append(f"{'Tax:':<40} {receipt_data['tax']:>10}")

    lines.append("=" * 50)
    lines.append(f"{'TOTAL:':<40} {receipt_data['total']:>10}")
    lines.append("=" * 50)
    lines.append("")
    lines.append(f"Payment Method: {receipt_data['payment']['method']}")
    lines.append(f"Amount Paid: {receipt_data['payment']['amount_paid']}")

    if Decimal(receipt_data["payment"]["change"]) > 0:
        lines.append(f"Change: {receipt_data['payment']['change']}")

    if receipt_data["payment"]["reference"]:
        lines.append(f"Reference: {receipt_data['payment']['reference']}")

    lines.append("")
    lines.append("=" * 50)
    lines.append("Thank you for shopping with EasyCart!")
    lines.append("=" * 50)

    return "\n".join(lines)


def format_receipt_html(receipt_data):
    """
    Format receipt data as HTML for email/printing.

    Args:
        receipt_data: dict with receipt information

    Returns:
        str: HTML formatted receipt
    """
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; }}
            .header {{ text-align: center; border-bottom: 2px solid #000; padding: 10px; }}
            .info {{ margin: 10px 0; }}
            table {{ width: 100%; border-collapse: collapse; }}
            th, td {{ text-align: left; padding: 5px; }}
            .right {{ text-align: right; }}
            .total {{ border-top: 2px solid #000; border-bottom: 2px solid #000; font-weight: bold; }}
            .footer {{ text-align: center; margin-top: 20px; border-top: 2px solid #000; padding: 10px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h2>EASYCART</h2>
            <p>SALES RECEIPT</p>
        </div>

        <div class="info">
            <p><strong>Receipt #:</strong> {receipt_data['transaction_number']}</p>
            <p><strong>Date:</strong> {receipt_data['date']}</p>
            <p><strong>Cashier:</strong> {receipt_data['staff']}</p>
    """

    if receipt_data["customer"]["name"] != "Walk-in Customer":
        html += f"""
            <p><strong>Customer:</strong> {receipt_data['customer']['name']}</p>
        """
        if receipt_data["customer"]["phone"]:
            html += f"""
            <p><strong>Phone:</strong> {receipt_data['customer']['phone']}</p>
            """

    html += """
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="right">Qty</th>
                    <th class="right">Price</th>
                    <th class="right">Total</th>
                </tr>
            </thead>
            <tbody>
    """

    for item in receipt_data["items"]:
        html += f"""
                <tr>
                    <td>{item['name']}</td>
                    <td class="right">{item['quantity']}</td>
                    <td class="right">{item['unit_price']}</td>
                    <td class="right">{item['total']}</td>
                </tr>
        """
        if Decimal(item["discount"]) > 0:
            html += f"""
                <tr>
                    <td colspan="4" style="text-align: right; font-size: 0.9em;">Discount: -{item['discount']}</td>
                </tr>
            """

    html += f"""
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"><strong>Subtotal:</strong></td>
                    <td class="right"><strong>{receipt_data['subtotal']}</strong></td>
                </tr>
    """

    if Decimal(receipt_data["discount"]) > 0:
        html += f"""
                <tr>
                    <td colspan="3">Discount:</td>
                    <td class="right">-{receipt_data['discount']}</td>
                </tr>
        """

    if Decimal(receipt_data["tax"]) > 0:
        html += f"""
                <tr>
                    <td colspan="3">Tax:</td>
                    <td class="right">{receipt_data['tax']}</td>
                </tr>
        """

    html += f"""
                <tr class="total">
                    <td colspan="3"><strong>TOTAL:</strong></td>
                    <td class="right"><strong>{receipt_data['total']}</strong></td>
                </tr>
            </tfoot>
        </table>

        <div class="info">
            <p><strong>Payment Method:</strong> {receipt_data['payment']['method']}</p>
            <p><strong>Amount Paid:</strong> {receipt_data['payment']['amount_paid']}</p>
    """

    if Decimal(receipt_data["payment"]["change"]) > 0:
        html += f"""
            <p><strong>Change:</strong> {receipt_data['payment']['change']}</p>
        """

    if receipt_data["payment"]["reference"]:
        html += f"""
            <p><strong>Reference:</strong> {receipt_data['payment']['reference']}</p>
        """

    html += """
        </div>

        <div class="footer">
            <p>Thank you for shopping with EasyCart!</p>
        </div>
    </body>
    </html>
    """

    return html
