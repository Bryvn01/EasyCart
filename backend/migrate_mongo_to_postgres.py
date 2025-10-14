import os
from pymongo import MongoClient

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
import django
django.setup()

from apps.products.models import Product
from apps.accounts.models import User

MONGO_URI = "mongodb+srv://<username>:<password>@cluster0.p7rcwl5.mongodb.net/easycart"
MONGO_DB = 'easycart'
client = MongoClient(MONGO_URI)
mongo_db = client[MONGO_DB]


print("Migrating products...")
from apps.products.models import Category
for doc in mongo_db['products'].find():
    doc.pop('_id', None)
    # Map category string to Category instance
    category_name = doc.pop('category', None)
    if category_name:
        category_obj, _ = Category.objects.get_or_create(name=category_name, defaults={"slug": category_name.lower().replace(" ", "-")})
        doc['category'] = category_obj
    # Only use fields that exist in Product model
    product_fields = {f.name for f in Product._meta.get_fields()}
    filtered_doc = {k: v for k, v in doc.items() if k in product_fields}
    try:
        Product.objects.create(**filtered_doc)
    except Exception as e:
        print(f"Error migrating product: {e}\nData: {filtered_doc}")


print("Migrating users...")
for doc in mongo_db['users'].find():
    doc.pop('_id', None)
    # Only use fields that exist in User model
    user_fields = {f.name for f in User._meta.get_fields()}
    filtered_doc = {k: v for k, v in doc.items() if k in user_fields}
    # Handle password: set unusable password if not present
    password = filtered_doc.pop('password', None)
    try:
        user = User(**filtered_doc)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
    except Exception as e:
        print(f"Error migrating user: {e}\nData: {filtered_doc}")

print("Migration complete.")