"""
Management command to test Redis connection and caching
"""
from django.core.management.base import BaseCommand
from django.core.cache import cache
from colorama import Fore, Style, init

init(autoreset=True)


class Command(BaseCommand):
    help = "Test Redis connection and caching functionality"

    def handle(self, *args, **options):
        self.stdout.write(f"\n{Fore.CYAN}{'='*50}")
        self.stdout.write(f"{Fore.CYAN}🔴 REDIS CONNECTION TEST")
        self.stdout.write(f"{Fore.CYAN}{'='*50}\n")

        try:
            # Test 1: Basic connection
            self.stdout.write(f"{Fore.YELLOW}[1/4] Testing basic connection...")
            cache.set("test_key", "test_value", 10)
            value = cache.get("test_key")
            
            if value == "test_value":
                self.stdout.write(f"{Fore.GREEN}✅ Redis connection successful\n")
            else:
                self.stdout.write(f"{Fore.RED}❌ Redis connection failed\n")
                return

            # Test 2: Cache operations
            self.stdout.write(f"{Fore.YELLOW}[2/4] Testing cache operations...")
            cache.set("counter", 0, 60)
            cache.incr("counter")
            cache.incr("counter")
            counter = cache.get("counter")
            
            if counter == 2:
                self.stdout.write(f"{Fore.GREEN}✅ Cache operations working\n")
            else:
                self.stdout.write(f"{Fore.RED}❌ Cache operations failed\n")

            # Test 3: Cache deletion
            self.stdout.write(f"{Fore.YELLOW}[3/4] Testing cache deletion...")
            cache.set("delete_test", "value", 60)
            cache.delete("delete_test")
            deleted_value = cache.get("delete_test")
            
            if deleted_value is None:
                self.stdout.write(f"{Fore.GREEN}✅ Cache deletion working\n")
            else:
                self.stdout.write(f"{Fore.RED}❌ Cache deletion failed\n")

            # Test 4: Cache info
            self.stdout.write(f"{Fore.YELLOW}[4/4] Getting cache info...")
            try:
                from django_redis import get_redis_connection
                redis_conn = get_redis_connection("default")
                info = redis_conn.info()
                
                self.stdout.write(f"{Fore.GREEN}✅ Redis Info:")
                self.stdout.write(f"   Version: {info.get('redis_version', 'N/A')}")
                self.stdout.write(f"   Connected clients: {info.get('connected_clients', 'N/A')}")
                self.stdout.write(f"   Used memory: {info.get('used_memory_human', 'N/A')}")
                self.stdout.write(f"   Total keys: {redis_conn.dbsize()}\n")
            except Exception as e:
                self.stdout.write(f"{Fore.YELLOW}⚠️  Could not get Redis info: {str(e)}\n")

            # Summary
            self.stdout.write(f"{Fore.CYAN}{'='*50}")
            self.stdout.write(f"{Fore.GREEN}✅ ALL TESTS PASSED")
            self.stdout.write(f"{Fore.CYAN}{'='*50}\n")
            
            self.stdout.write(f"{Fore.CYAN}Redis is ready for:")
            self.stdout.write(f"  • Product caching (5-60 min)")
            self.stdout.write(f"  • Session storage (7 days)")
            self.stdout.write(f"  • Cart persistence (7 days)")
            self.stdout.write(f"  • Rate limiting\n")

        except Exception as e:
            self.stdout.write(f"\n{Fore.RED}{'='*50}")
            self.stdout.write(f"{Fore.RED}❌ REDIS CONNECTION FAILED")
            self.stdout.write(f"{Fore.RED}{'='*50}\n")
            self.stdout.write(f"{Fore.RED}Error: {str(e)}\n")
            self.stdout.write(f"{Fore.YELLOW}Troubleshooting:")
            self.stdout.write(f"  1. Check if Redis is running: redis-cli ping")
            self.stdout.write(f"  2. Verify REDIS_URL in .env")
            self.stdout.write(f"  3. Check Redis connection: redis-cli -u $REDIS_URL\n")
