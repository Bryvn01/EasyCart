from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Reset admin password"

    def handle(self, *args, **options):
        User = get_user_model()
        try:
            user = User.objects.get(username="admin")
            user.set_password("easycart2025")
            user.save()
            self.stdout.write(self.style.SUCCESS("Admin password reset to: easycart2025"))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR("Admin user not found"))
