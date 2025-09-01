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
        
        # Note: Product fields were already added in 0002_enhance_models.py, so no need to add them again here
    ]