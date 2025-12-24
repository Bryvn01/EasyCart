"""
Script to populate POS system with sample data for dashboard testing.
"""

import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
from random import randint, choice, uniform

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.pos.models import POSSession, POSTransaction, POSTransactionItem
from apps.products.models import Product

User = get_user_model()


def create_sample_pos_data(force_recreate=False):
    """Create sample POS data for dashboard testing."""

    print("🚀 Starting POS data population...")

    # Check if data already exists
    existing_sessions = POSSession.objects.count()
    existing_transactions = POSTransaction.objects.count()

    if existing_sessions > 0 or existing_transactions > 0:
        print(f"\n⚠️  Found existing POS data:")
        print(f"   📊 {existing_sessions} sessions")
        print(f"   💰 {existing_transactions} transactions")

        if not force_recreate:
            response = input(
                "\n❓ Do you want to clear existing data and create new sample data? (yes/no): "
            )
            if response.lower() not in ["yes", "y"]:
                print(
                    "✅ Keeping existing data. Dashboard should already have data to display."
                )
                return

        print("\n🗑️  Clearing existing POS data...")
        POSTransactionItem.objects.all().delete()
        POSTransaction.objects.all().delete()
        POSSession.objects.all().delete()
        print("✅ Existing data cleared")

    # Get or create admin user for POS staff
    admin_user, created = User.objects.get_or_create(
        username="admin",
        defaults={
            "email": "admin@easycart.com",
            "is_staff": True,
            "is_superuser": True,
        },
    )

    if created:
        admin_user.set_password("admin123")
        admin_user.save()
        print(f"✅ Created admin user: {admin_user.username}")
    else:
        print(f"✅ Using existing admin user: {admin_user.username}")

    # Get available products
    products = list(Product.objects.filter(is_active=True, stock__gt=0)[:50])

    if not products:
        print("❌ No products available. Please add products first.")
        return

    print(f"📦 Found {len(products)} products")

    # Create POS sessions and transactions for the last 30 days
    sessions_created = 0
    transactions_created = 0

    # Generate data for last 30 days
    for day_offset in range(30, 0, -1):
        # Create 1-3 sessions per day
        num_sessions = randint(1, 3)

        for session_num in range(num_sessions):
            # Calculate session time (during business hours 8 AM - 9 PM)
            session_date = timezone.now() - timedelta(days=day_offset)
            opening_hour = randint(8, 12)
            closing_hour = opening_hour + randint(4, 9)

            opened_at = session_date.replace(
                hour=opening_hour, minute=randint(0, 59), second=0, microsecond=0
            )

            # Some sessions are still open (last 2 days)
            if day_offset <= 2 and randint(1, 3) == 1:
                closed_at = None
                status = "open"
                closing_cash = None
            else:
                closed_at = session_date.replace(
                    hour=closing_hour, minute=randint(0, 59), second=0, microsecond=0
                )
                status = choice(["closed", "reconciled"])
                closing_cash = Decimal(str(randint(5000, 50000)))

            # Create POS session
            session = POSSession.objects.create(
                staff=admin_user,
                status=status,
                opening_cash=Decimal(str(randint(5000, 10000))),
                closing_cash=closing_cash,
                opened_at=opened_at,
                closed_at=closed_at,
            )

            sessions_created += 1

            # Create transactions for this session
            if status != "open":
                session_duration = (closed_at - opened_at).total_seconds() / 3600
                num_transactions = int(session_duration * randint(3, 8))
            else:
                num_transactions = randint(1, 5)

            for trans_num in range(num_transactions):
                # Calculate transaction time within session
                if closed_at:
                    trans_offset = randint(
                        0, int((closed_at - opened_at).total_seconds())
                    )
                    created_at = opened_at + timedelta(seconds=trans_offset)
                else:
                    trans_offset = randint(
                        0, int((timezone.now() - opened_at).total_seconds())
                    )
                    created_at = opened_at + timedelta(seconds=trans_offset)

                # Random payment method
                payment_method = choice(["cash", "cash", "card", "mpesa", "airtel"])

                # Create transaction with initial values
                transaction = POSTransaction.objects.create(
                    session=session,
                    status="completed",
                    payment_method=payment_method,
                    customer_name=choice(
                        [
                            "John Doe",
                            "Jane Smith",
                            "Alice Johnson",
                            "Bob Wilson",
                            "Walk-in Customer",
                        ]
                    ),
                    customer_phone=choice(
                        [
                            "0712345678",
                            "0723456789",
                            "0734567890",
                            "0745678901",
                            "0756789012",
                        ]
                    ),
                    subtotal=Decimal("0"),
                    discount_amount=Decimal("0"),
                    discount_percentage=0,
                    tax_amount=Decimal("0"),
                    total_amount=Decimal("0"),
                    amount_paid=Decimal("0"),
                    change_given=Decimal("0"),
                    created_at=created_at,
                    completed_at=created_at + timedelta(minutes=randint(1, 5)),
                )

                # Add 1-5 items to transaction
                num_items = randint(1, 5)
                subtotal = Decimal("0")

                for _ in range(num_items):
                    product = choice(products)
                    quantity = randint(1, 3)
                    unit_price = product.price

                    # Random discount 0-20%
                    discount_percentage = choice([0, 0, 0, 5, 10, 15, 20])
                    discount_amount = (
                        unit_price * quantity * discount_percentage
                    ) / 100
                    line_total = (unit_price * quantity) - discount_amount

                    POSTransactionItem.objects.create(
                        transaction=transaction,
                        product=product,
                        unit_price=unit_price,
                        quantity=quantity,
                        discount_percentage=discount_percentage,
                        discount_amount=discount_amount,
                        line_total=line_total,
                    )

                    subtotal += line_total

                # Update transaction totals
                tax_rate = Decimal("0.16")  # 16% VAT in Kenya
                tax_amount = subtotal * tax_rate
                total_amount = subtotal + tax_amount

                transaction.subtotal = subtotal
                transaction.tax_amount = tax_amount
                transaction.total_amount = total_amount
                transaction.amount_paid = total_amount
                transaction.change_given = Decimal("0")
                transaction.save()

                transactions_created += 1

    print(f"\n✅ Successfully created:")
    print(f"   📊 {sessions_created} POS sessions")
    print(f"   💰 {transactions_created} transactions")
    print(f"\n🎉 POS dashboard is now ready with sample data!")
    print(f"\n🌐 Access the dashboard at: http://localhost:3000/admin/pos/dashboard")


if __name__ == "__main__":
    try:
        # Check for --force flag
        force = "--force" in sys.argv or "-f" in sys.argv
        create_sample_pos_data(force_recreate=force)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
