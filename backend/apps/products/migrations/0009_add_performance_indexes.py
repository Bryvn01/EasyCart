# Generated migration for performance indexes

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0008_add_category_image_url'),
    ]

    operations = [
        # Add composite index for category and created_at for faster category filtering with ordering
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['category', '-created_at'], name='product_cat_date_idx'),
        ),
        # Add composite index for price and stock for inventory queries
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['price', 'stock'], name='product_price_stock_idx'),
        ),
        # Add index on is_active for common filtering
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['is_active', '-created_at'], name='product_active_date_idx'),
        ),
    ]
