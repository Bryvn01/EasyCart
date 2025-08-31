import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Get credentials from environment variables
username = os.environ.get('SUPERUSER_USERNAME', 'admin')
email = os.environ.get('SUPERUSER_EMAIL', 'admin@ecommerce.com')
password = os.environ.get('SUPERUSER_PASSWORD')

if not password:
    print("Error: SUPERUSER_PASSWORD environment variable is required")
    exit(1)

# Create superuser if it doesn't exist
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print("Superuser created successfully!")
    print(f"Username: {username}")
else:
    print("Superuser already exists!")