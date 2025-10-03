# Generated migration for adding Stripe and PayPal payment methods

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_order_payment_method_order_payment_reference_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='payment_method',
            field=models.CharField(
                choices=[
                    ('mpesa', 'M-Pesa'), 
                    ('airtel', 'Airtel Money'), 
                    ('tkash', 'T-Kash'), 
                    ('card', 'Credit/Debit Card'), 
                    ('stripe', 'Stripe'),
                    ('paypal', 'PayPal'),
                    ('bank', 'Bank Transfer'), 
                    ('cash', 'Cash on Delivery')
                ], 
                default='mpesa', 
                max_length=20
            ),
        ),
    ]
