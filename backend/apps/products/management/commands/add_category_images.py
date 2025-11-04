from django.core.management.base import BaseCommand
from apps.products.models import Category


class Command(BaseCommand):
    help = 'Add professional images to categories'

    def handle(self, *args, **options):
        category_images = {
            'Staples': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
            'Dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80',
            'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
            'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
            'Spreads': 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&q=80',
            'Snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80',
            'Fresh Produce': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&q=80',
            'Meat & Poultry': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
            'Household': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80',
            'Personal Care': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
        }

        updated = 0
        not_found = 0

        self.stdout.write('\nAdding category images...\n')

        for name, url in category_images.items():
            try:
                category = Category.objects.get(name=name)
                category.image_url = url
                category.save()
                self.stdout.write(self.style.SUCCESS(f'[OK] {name}'))
                updated += 1
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'[SKIP] {name} (not found)'))
                not_found += 1

        self.stdout.write(f'\nSummary:')
        self.stdout.write(f'   Updated: {updated}')
        self.stdout.write(f'   Not found: {not_found}')
        self.stdout.write(self.style.SUCCESS('\nDone!\n'))
