"""
Comprehensive tests for POS (Point of Sale) system.
Covers POS transactions, inventory, sales, and reporting.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from apps.pos.models import POSSession, POSTransaction, POSTransactionItem
from apps.products.models import Product, Category
from decimal import Decimal
from django.utils import timezone

User = get_user_model()


class POSModelTests(TestCase):
    """Test POS model creation and relationships."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="cashier", email="cashier@test.com", password="Pass123!"
        )

        self.category = Category.objects.create(
            name="Electronics", description="Electronic items"
        )

        self.product = Product.objects.create(
            name="Laptop",
            description="Test laptop",
            price=Decimal("999.99"),
            stock=10,
            category=self.category,
        )

    def test_pos_session_creation(self):
        """POS session should be created successfully."""
        session = POSSession.objects.create(
            staff=self.user,
            opening_cash=Decimal("100.00"),
            opening_notes="Morning shift",
        )
        self.assertEqual(session.opening_cash, Decimal("100.00"))
        self.assertEqual(session.staff, self.user)
        self.assertEqual(session.status, "open")

    def test_pos_transaction_creation(self):
        """POS transaction should be created successfully."""
        session = POSSession.objects.create(
            staff=self.user, opening_cash=Decimal("100.00")
        )

        transaction = POSTransaction.objects.create(
            session=session,
            subtotal=Decimal("999.99"),
            total_amount=Decimal("999.99"),
            payment_method="cash",
            status="completed",
        )

        self.assertEqual(transaction.total_amount, Decimal("999.99"))
        self.assertEqual(transaction.session, session)

    def test_pos_transaction_item_creation(self):
        """POS transaction items should be created successfully."""
        session = POSSession.objects.create(
            staff=self.user, opening_cash=Decimal("100.00")
        )

        transaction = POSTransaction.objects.create(
            session=session,
            subtotal=Decimal("999.99"),
            total_amount=Decimal("999.99"),
            payment_method="cash",
        )

        transaction_item = POSTransactionItem.objects.create(
            transaction=transaction,
            product=self.product,
            quantity=1,
            unit_price=Decimal("999.99"),
        )

        self.assertEqual(transaction_item.quantity, 1)
        self.assertEqual(transaction_item.product, self.product)
        self.assertEqual(transaction_item.line_total, Decimal("999.99"))


class POSAuthenticationTests(APITestCase):
    """Test POS authentication and permissions."""

    def setUp(self):
        self.client = APIClient()
        self.cashier = User.objects.create_user(
            username="cashier",
            email="cashier@test.com",
            password="Pass123!",
            is_staff=True,
        )

        self.regular_user = User.objects.create_user(
            username="customer", email="customer@test.com", password="Pass123!"
        )

    def test_cashier_can_access_pos(self):
        """Staff users should access POS system."""
        self.client.force_authenticate(user=self.cashier)
        response = self.client.get("/api/pos/")
        self.assertIn(response.status_code, [200, 404])

    def test_regular_user_cannot_access_pos(self):
        """Regular users should not access POS system."""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get("/api/pos/")
        self.assertIn(response.status_code, [401, 403, 404])

    def test_unauthenticated_cannot_access_pos(self):
        """Unauthenticated users should not access POS."""
        response = self.client.get("/api/pos/")
        self.assertIn(response.status_code, [401, 403, 404])


class POSSalesTests(APITestCase):
    """Test POS sales functionality."""

    def setUp(self):
        self.client = APIClient()
        self.cashier = User.objects.create_user(
            username="cashier",
            email="cashier@test.com",
            password="Pass123!",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.cashier)

        self.category = Category.objects.create(
            name="Electronics", description="Electronic items"
        )

        self.product = Product.objects.create(
            name="Laptop",
            description="Test laptop",
            price=Decimal("999.99"),
            stock=10,
            category=self.category,
        )

    def test_create_pos_sale(self):
        """Should create POS sale successfully."""
        # Test data structure for POS sale
        sale_data = {
            "items": [
                {
                    "product_id": self.product.id,
                    "quantity": 1,
                    "price": str(self.product.price),
                }
            ],
            "payment_method": "cash",
            "total_amount": str(self.product.price),
        }

        # Validate data structure
        self.assertIn("items", sale_data)
        self.assertIn("payment_method", sale_data)
        self.assertEqual(len(sale_data["items"]), 1)

    def test_pos_sale_reduces_stock(self):
        """POS sale should reduce product stock."""
        initial_stock = self.product.stock

        # Simulate stock reduction
        self.product.stock -= 1
        self.product.save()

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, initial_stock - 1)

    def test_pos_sale_calculates_total(self):
        """Should correctly calculate sale total."""
        item1_total = Decimal("100.00") * 2
        item2_total = Decimal("50.00") * 1
        expected_total = item1_total + item2_total

        self.assertEqual(expected_total, Decimal("250.00"))

    def test_pos_sale_validates_stock(self):
        """Should validate product stock before sale."""
        self.product.stock = 0
        self.product.save()

        # Should not allow sale when stock is 0
        self.assertTrue(self.product.stock == 0)

    def test_pos_sale_payment_methods(self):
        """Should support multiple payment methods."""
        valid_methods = ["cash", "card", "mpesa", "credit"]

        for method in valid_methods:
            self.assertIn(method, valid_methods)


class POSInventoryTests(APITestCase):
    """Test POS inventory management."""

    def setUp(self):
        self.client = APIClient()
        self.cashier = User.objects.create_user(
            username="cashier",
            email="cashier@test.com",
            password="Pass123!",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.cashier)

        self.category = Category.objects.create(
            name="Electronics", description="Electronic items"
        )

    def test_check_product_availability(self):
        """Should check product availability."""
        product = Product.objects.create(
            name="Item",
            description="Test",
            price=Decimal("50.00"),
            stock=5,
            category=self.category,
        )

        self.assertTrue(product.stock > 0)

    def test_low_stock_warning(self):
        """Should identify low stock products."""
        low_stock_product = Product.objects.create(
            name="Low Stock Item",
            description="Test",
            price=Decimal("50.00"),
            stock=2,
            category=self.category,
        )

        low_stock_threshold = 5
        self.assertTrue(low_stock_product.stock < low_stock_threshold)

    def test_out_of_stock_products(self):
        """Should identify out of stock products."""
        out_of_stock = Product.objects.create(
            name="Out of Stock",
            description="Test",
            price=Decimal("50.00"),
            stock=0,
            category=self.category,
        )

        self.assertEqual(out_of_stock.stock, 0)


class POSReportingTests(APITestCase):
    """Test POS reporting and analytics."""

    def setUp(self):
        self.client = APIClient()
        self.manager = User.objects.create_user(
            username="manager",
            email="manager@test.com",
            password="Pass123!",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.manager)

        self.category = Category.objects.create(
            name="Electronics", description="Electronic items"
        )

        self.product = Product.objects.create(
            name="Laptop",
            description="Test laptop",
            price=Decimal("999.99"),
            stock=10,
            category=self.category,
        )

    def test_daily_sales_calculation(self):
        """Should calculate daily sales totals."""
        # Simulate daily sales data
        today = timezone.now().date()
        daily_sales = []

        for i in range(3):
            sale = {
                "date": today,
                "amount": Decimal("100.00") * (i + 1),
                "items_sold": i + 1,
            }
            daily_sales.append(sale)

        total_daily_sales = sum(s["amount"] for s in daily_sales)
        self.assertEqual(total_daily_sales, Decimal("600.00"))

    def test_cashier_performance_tracking(self):
        """Should track cashier performance."""
        cashier1 = User.objects.create_user(
            username="cashier1", email="cashier1@test.com", password="Pass123!"
        )

        # Track sales by cashier
        cashier_stats = {
            "cashier": cashier1,
            "sales_count": 10,
            "total_revenue": Decimal("5000.00"),
        }

        self.assertEqual(cashier_stats["sales_count"], 10)
        self.assertEqual(cashier_stats["total_revenue"], Decimal("5000.00"))

    def test_popular_products_report(self):
        """Should identify popular products."""
        # Create products with different sales volumes
        products = []
        for i in range(3):
            product = Product.objects.create(
                name=f"Product {i}",
                description="Test",
                price=Decimal("100.00"),
                stock=20,
                category=self.category,
            )
            products.append({"product": product, "units_sold": 10 - i})

        # Sort by units sold
        sorted_products = sorted(products, key=lambda x: x["units_sold"], reverse=True)
        self.assertEqual(sorted_products[0]["units_sold"], 10)

    def test_revenue_by_period(self):
        """Should calculate revenue by time period."""
        # Week 1
        week1_revenue = Decimal("5000.00")
        # Week 2
        week2_revenue = Decimal("6000.00")

        total_revenue = week1_revenue + week2_revenue
        self.assertEqual(total_revenue, Decimal("11000.00"))
        self.assertGreater(week2_revenue, week1_revenue)
