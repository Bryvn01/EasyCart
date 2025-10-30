
# DEPRECATED: This test file is obsolete after migration to PostgreSQL.
# All MongoDB integration tests have been removed.


def test_get_products():
    """Test fetching products from MongoDB."""
    print_header("Testing Product Fetch (First 5 Products)")
    
    try:
        products, total_count = get_products_from_mongodb(limit=5, skip=0)
        
        print(f"✅ Fetched {len(products)} products (Total: {total_count})")
        print()
        
        for i, product in enumerate(products, 1):
            print(f"{i}. Product Details:")
            print(f"   ID: {product.get('id')}")
            print(f"   Name: {product.get('name')}")
            print(f"   Price: {product.get('price')}")
            print(f"   Category: {product.get('category')}")
            print(f"   Stock: {product.get('stock', 0)}")
            print()
        
        return True
        
    except Exception as e:
        print(f"❌ Product fetch error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_product_filtering():
    """Test product filtering by category and price range."""
    print_header("Testing Product Filtering")
    
    try:
        # Test category filter
        print("📦 Filtering by category 'Electronics':")
        products, total = get_products_from_mongodb(category='Electronics', limit=3)
        print(f"   Found {total} electronics products")
        for product in products[:3]:
            print(f"   - {product.get('name')} (KES {product.get('price')})")
        print()
        
        # Test price range filter
        print("💰 Filtering by price range (100-500):")
        products, total = get_products_from_mongodb(price_min=100, price_max=500, limit=3)
        print(f"   Found {total} products in price range")
        for product in products[:3]:
            print(f"   - {product.get('name')} (KES {product.get('price')})")
        print()
        
        # Test search filter
        print("🔍 Searching for 'flour':")
        products, total = get_products_from_mongodb(search='flour', limit=3)
        print(f"   Found {total} products matching 'flour'")
        for product in products[:3]:
            print(f"   - {product.get('name')}")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ Filtering error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_get_product_by_id():
    """Test fetching a single product by ID."""
    print_header("Testing Single Product Fetch")
    
    try:
        # First get a product to get its ID
        products, _ = get_products_from_mongodb(limit=1)
        
        if not products:
            print("⚠️  No products available to test")
            return False
        
        product_id = products[0].get('id')
        print(f"🔍 Fetching product with ID: {product_id}")
        
        product = get_product_by_id_from_mongodb(product_id)
        
        if product:
            print("✅ Product found!")
            print(f"   Name: {product.get('name')}")
            print(f"   Price: KES {product.get('price')}")
            print(f"   Description: {product.get('description', 'N/A')[:80]}...")
            print(f"   Category: {product.get('category')}")
            print(f"   Stock: {product.get('stock', 0)}")
            return True
        else:
            print("❌ Product not found")
            return False
            
    except Exception as e:
        print(f"❌ Single product fetch error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_get_categories():
    """Test fetching categories from MongoDB."""
    print_header("Testing Categories Fetch")
    
    try:
        categories = get_categories_from_mongodb()
        
        print(f"✅ Fetched {len(categories)} categories")
        print()
        
        for i, category in enumerate(categories, 1):
            print(f"{i}. {category.get('name')}")
            if category.get('description'):
                print(f"   {category.get('description')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Categories fetch error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def run_all_tests():
    """Run all tests and report results."""
    print("\n" + "=" * 70)
    print("  DJANGO REST FRAMEWORK + MONGODB ATLAS INTEGRATION TEST")
    print("=" * 70)
    
    results = {
        'MongoDB Connection': test_mongodb_connection(),
        'Product Fetch': test_get_products(),
        'Product Filtering': test_product_filtering(),
        'Single Product Fetch': test_get_product_by_id(),
        'Categories Fetch': test_get_categories(),
    }
    
    # Print summary
    print_header("Test Summary")
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print()
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Django + MongoDB integration is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1


if __name__ == '__main__':
    try:
        exit_code = run_all_tests()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
