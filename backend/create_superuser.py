from django.contrib.auth import get_user_model
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()


User = get_user_model()

username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@easycart.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if not password:
    print('ERROR: DJANGO_SUPERUSER_PASSWORD not set!')
    exit(1)

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superuser {username} created successfully!')
else:
    print(f'Superuser {username} already exists.')
