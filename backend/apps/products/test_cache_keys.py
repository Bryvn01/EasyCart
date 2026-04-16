import hashlib
from urllib.parse import urlencode

from django.test import SimpleTestCase

from apps.products.cache import ProductCache


class ProductListCacheKeyRegressionTests(SimpleTestCase):
    def test_different_query_params_generate_distinct_cache_keys(self):
        params_name = [("ordering", "name"), ("page", "1"), ("page_size", "12")]
        params_price = [("ordering", "price"), ("page", "1"), ("page_size", "12")]

        fingerprint_name = hashlib.sha256(
            urlencode(sorted(params_name), doseq=True).encode("utf-8")
        ).hexdigest()
        fingerprint_price = hashlib.sha256(
            urlencode(sorted(params_price), doseq=True).encode("utf-8")
        ).hexdigest()

        key_name = ProductCache.build_product_list_key(
            query_fingerprint=fingerprint_name
        )
        key_price = ProductCache.build_product_list_key(
            query_fingerprint=fingerprint_price
        )

        self.assertNotEqual(fingerprint_name, fingerprint_price)
        self.assertNotEqual(key_name, key_price)
