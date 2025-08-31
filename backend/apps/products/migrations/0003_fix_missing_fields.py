# Generated migration to fix missing fields

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_enhance_models'),
    ]

    operations = [
        # Add missing fields to Category if they don't exist
        migrations.RunSQL(
            "ALTER TABLE products_category ADD COLUMN is_active BOOLEAN DEFAULT 1;",
            reverse_sql="ALTER TABLE products_category DROP COLUMN is_active;",
            state_operations=[
                migrations.AddField(
                    model_name='category',
                    name='is_active',
                    field=models.BooleanField(default=True),
                ),
            ]
        ),
        
        # Add missing fields to Product if they don't exist
        migrations.RunSQL(
            """
            ALTER TABLE products_product ADD COLUMN slug VARCHAR(50) DEFAULT '';
            ALTER TABLE products_product ADD COLUMN short_description VARCHAR(300) DEFAULT '';
            ALTER TABLE products_product ADD COLUMN compare_price DECIMAL(10,2) DEFAULT NULL;
            ALTER TABLE products_product ADD COLUMN sku VARCHAR(100) DEFAULT '';
            ALTER TABLE products_product ADD COLUMN weight DECIMAL(6,2) DEFAULT NULL;
            ALTER TABLE products_product ADD COLUMN dimensions VARCHAR(100) DEFAULT '';
            ALTER TABLE products_product ADD COLUMN is_featured BOOLEAN DEFAULT 0;
            ALTER TABLE products_product ADD COLUMN view_count INTEGER DEFAULT 0;
            ALTER TABLE products_product ADD COLUMN meta_title VARCHAR(60) DEFAULT '';
            ALTER TABLE products_product ADD COLUMN meta_description VARCHAR(160) DEFAULT '';
            """,
            reverse_sql="""
            ALTER TABLE products_product DROP COLUMN slug;
            ALTER TABLE products_product DROP COLUMN short_description;
            ALTER TABLE products_product DROP COLUMN compare_price;
            ALTER TABLE products_product DROP COLUMN sku;
            ALTER TABLE products_product DROP COLUMN weight;
            ALTER TABLE products_product DROP COLUMN dimensions;
            ALTER TABLE products_product DROP COLUMN is_featured;
            ALTER TABLE products_product DROP COLUMN view_count;
            ALTER TABLE products_product DROP COLUMN meta_title;
            ALTER TABLE products_product DROP COLUMN meta_description;
            """,
            state_operations=[
                migrations.AddField(
                    model_name='product',
                    name='slug',
                    field=models.SlugField(blank=True, unique=True),
                ),
                migrations.AddField(
                    model_name='product',
                    name='short_description',
                    field=models.CharField(blank=True, max_length=300),
                ),
                migrations.AddField(
                    model_name='product',
                    name='compare_price',
                    field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
                ),
                migrations.AddField(
                    model_name='product',
                    name='sku',
                    field=models.CharField(blank=True, max_length=100, unique=True),
                ),
                migrations.AddField(
                    model_name='product',
                    name='weight',
                    field=models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True),
                ),
                migrations.AddField(
                    model_name='product',
                    name='dimensions',
                    field=models.CharField(blank=True, max_length=100),
                ),
                migrations.AddField(
                    model_name='product',
                    name='is_featured',
                    field=models.BooleanField(default=False),
                ),
                migrations.AddField(
                    model_name='product',
                    name='view_count',
                    field=models.PositiveIntegerField(default=0),
                ),
                migrations.AddField(
                    model_name='product',
                    name='meta_title',
                    field=models.CharField(blank=True, max_length=60),
                ),
                migrations.AddField(
                    model_name='product',
                    name='meta_description',
                    field=models.CharField(blank=True, max_length=160),
                ),
            ]
        ),
    ]