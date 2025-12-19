from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db import transaction
from apps.pos.models import POSTransaction, POSTransactionItem
from apps.products.models import Product


@receiver(post_save, sender=POSTransactionItem)
def reserve_inventory_on_item_create(sender, instance, created, **kwargs):
    """
    Reserve inventory when a POS transaction item is created.
    This happens when items are added to a pending transaction.
    """
    if created and instance.transaction.status == "pending":
        # Reduce stock immediately to prevent overselling
        product = instance.product
        product.stock -= instance.quantity
        product.save(update_fields=["stock"])


@receiver(post_save, sender=POSTransaction)
def update_inventory_on_transaction_complete(sender, instance, created, **kwargs):
    """
    Update inventory when transaction is completed or cancelled.
    """
    if not created:  # Only for updates, not creation
        # If transaction was just completed, inventory is already reduced
        # If transaction is cancelled, restore inventory
        if instance.status == "cancelled":
            for item in instance.items.all():
                product = item.product
                product.stock += item.quantity
                product.save(update_fields=["stock"])

        elif instance.status == "refunded":
            # Restore inventory on refund
            for item in instance.items.all():
                product = item.product
                product.stock += item.quantity
                product.save(update_fields=["stock"])


@receiver(post_save, sender=POSTransaction)
def update_session_totals(sender, instance, **kwargs):
    """
    Update POS session totals when transactions are completed.
    """
    if instance.status == "completed" and instance.session.status == "open":
        session = instance.session
        completed_transactions = session.transactions.filter(status="completed")

        session.total_sales = sum(t.total_amount for t in completed_transactions)
        session.total_transactions = completed_transactions.count()
        session.save(update_fields=["total_sales", "total_transactions"])
