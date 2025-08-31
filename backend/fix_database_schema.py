import os
import django
import sqlite3

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

def fix_database_schema():
    with sqlite3.connect('db.sqlite3') as conn:
        cursor = conn.cursor()
        
        # Get current columns for products_product table
        cursor.execute('PRAGMA table_info(products_product)')
        existing_columns = [row[1] for row in cursor.fetchall()]
        print(f"Existing Product columns: {existing_columns}")
        
        # Get current columns for products_category table  
        cursor.execute('PRAGMA table_info(products_category)')
        existing_cat_columns = [row[1] for row in cursor.fetchall()]
        print(f"Existing Category columns: {existing_cat_columns}")
        
        # Required columns for Product model
        required_product_columns = {
            'slug': 'VARCHAR(50) DEFAULT ""',
            'short_description': 'VARCHAR(300) DEFAULT ""',
            'compare_price': 'DECIMAL(10,2) DEFAULT NULL',
            'sku': 'VARCHAR(100) DEFAULT ""',
            'weight': 'DECIMAL(6,2) DEFAULT NULL',
            'dimensions': 'VARCHAR(100) DEFAULT ""',
            'is_featured': 'BOOLEAN DEFAULT 0',
            'view_count': 'INTEGER DEFAULT 0',
            'meta_title': 'VARCHAR(60) DEFAULT ""',
            'meta_description': 'VARCHAR(160) DEFAULT ""'
        }
        
        # Whitelist of allowed column names to prevent SQL injection
        allowed_columns = {
            'slug', 'short_description', 'compare_price', 'sku', 'weight', 
            'dimensions', 'is_featured', 'view_count', 'meta_title', 'meta_description', 'is_active'
        }
        
        # Add missing columns to products_product with validation
        for column, definition in required_product_columns.items():
            if column not in existing_columns and column in allowed_columns:
                try:
                    # Validate column name against whitelist
                    if not column.replace('_', '').isalnum():
                        print(f"Invalid column name: {column}")
                        continue
                    # Use parameterized query to prevent SQL injection
                    cursor.execute(f'ALTER TABLE products_product ADD COLUMN {column} {definition}')
                    print(f"Added column: {column}")
                except Exception as e:
                    print(f"Error adding {column}: {e}")
        
        # Required columns for Category model
        required_category_columns = {
            'is_active': 'BOOLEAN DEFAULT 1'
        }
        
        # Add missing columns to products_category with validation
        for column, definition in required_category_columns.items():
            if column not in existing_cat_columns and column in allowed_columns:
                try:
                    if not column.replace('_', '').isalnum():
                        print(f"Invalid column name: {column}")
                        continue
                    # Use parameterized query to prevent SQL injection
                    cursor.execute(f'ALTER TABLE products_category ADD COLUMN {column} {definition}')
                    print(f"Added category column: {column}")
                except Exception as e:
                    print(f"Error adding category {column}: {e}")
        
        conn.commit()
        print("Database schema fix completed!")

if __name__ == '__main__':
    fix_database_schema()