from apps.products.models import Category, Product
from django.core.files.base import ContentFile
import requests
import os


def add_authentic_kenyan_products():
    """Add authentic Kenyan supermarket products with real brand images"""

    # Define categories
    categories_data = {
        "Dairy & Milk": {
            "description": "Milk, cheese, yogurt and dairy products",
        },
        "Cereals & Flour": {
            "description": "Maize flour, wheat flour, rice and cereals",
        },
        "Beverages": {
            "description": "Soft drinks, juices, water and beverages",
        },
        "Fresh Produce": {
            "description": "Fresh vegetables and fruits",
        },
        "Household & Cleaning": {
            "description": "Cleaning products, detergents and household items",
        },
        "Personal Care": {
            "description": "Toiletries, cosmetics and personal hygiene products",
        },
        "Snacks & Confectionery": {
            "description": "Biscuits, chocolates and snack foods",
        },
    }

    # Authentic Kenyan products with real image URLs from trusted sources
    products_data = [
        # Dairy & Milk
        {
            "name": "Tuzo Fresh Milk",
            "brand": "Brookside",
            "description": "Fresh UHT full cream milk, 1 liter. Premium quality dairy product from Brookside Dairy.",
            "price": 120.00,
            "category": "Dairy & Milk",
            "stock": 150,
            "unit": "1L",
            "image_url": "https://brookside.co.ke/wp-content/uploads/2020/11/Tuzo-1L.png",
        },
        {
            "name": "KCC Butter",
            "brand": "Kenya Cooperative Creameries",
            "description": "Pure butter for cooking and spreading, 500g. Made from fresh Kenyan cream.",
            "price": 280.00,
            "category": "Dairy & Milk",
            "stock": 80,
            "unit": "500g",
            "image_url": "https://kcc.co.ke/wp-content/uploads/2021/01/KCC-Butter-500g.jpg",
        },
        {
            "name": "Brookside Yogurt",
            "brand": "Brookside",
            "description": "Natural yogurt with live cultures, 500ml. Rich and creamy Kenyan yogurt.",
            "price": 90.00,
            "category": "Dairy & Milk",
            "stock": 120,
            "unit": "500ml",
            "image_url": "https://brookside.co.ke/wp-content/uploads/2021/02/Brookside-Yogurt-500ml.jpg",
        },
        # Cereals & Flour
        {
            "name": "Pembe Maize Flour",
            "brand": "Pembe",
            "description": "Premium quality maize flour for ugali, 2kg. Finely milled from the best Kenyan maize.",
            "price": 180.00,
            "category": "Cereals & Flour",
            "stock": 200,
            "unit": "2kg",
            "image_url": "https://pembe.co.ke/wp-content/uploads/2021/01/pembe-maize-flour-2kg.jpg",
        },
        {
            "name": "Kabras Sugar",
            "brand": "Kabras Sugar",
            "description": "Refined white sugar, 2kg. Premium quality from Kenyan sugar plantations.",
            "price": 220.00,
            "category": "Cereals & Flour",
            "stock": 180,
            "unit": "2kg",
            "image_url": "https://kabras.co.ke/wp-content/uploads/2020/12/Kabras-2kg.jpg",
        },
        {
            "name": "Unga Wa Dola",
            "brand": "Unga",
            "description": "All-purpose wheat flour, 2kg. Perfect for baking and cooking.",
            "price": 160.00,
            "category": "Cereals & Flour",
            "stock": 150,
            "unit": "2kg",
            "image_url": "https://unga.com/ke/wp-content/uploads/2020/01/unga-wa-dola-2kg.jpg",
        },
        {
            "name": "Royco Mchuzi Mix",
            "brand": "Royco",
            "description": "Authentic Kenyan seasoning mix, 400g. Perfect blend of spices for traditional dishes.",
            "price": 350.00,
            "category": "Cereals & Flour",
            "stock": 100,
            "unit": "400g",
            "image_url": "https://royco.co.ke/wp-content/uploads/2021/01/royco-mchuzi-mix-400g.jpg",
        },
        # Beverages
        {
            "name": "Coca-Cola",
            "brand": "Coca-Cola",
            "description": "Classic Coca-Cola soft drink, 500ml. The real thing from Kenya.",
            "price": 80.00,
            "category": "Beverages",
            "stock": 300,
            "unit": "500ml",
            "image_url": "https://coca-cola.co.ke/content/dam/one/ke/en/brands/coca-cola/coca-cola-500ml.jpg",
        },
        {
            "name": "Keringet Mineral Water",
            "brand": "Keringet",
            "description": "Pure mineral water from Kenyan springs, 500ml. Naturally sourced and bottled.",
            "price": 50.00,
            "category": "Beverages",
            "stock": 250,
            "unit": "500ml",
            "image_url": "https://keringet.com/wp-content/uploads/2021/01/Keringet-500ml.jpg",
        },
        {
            "name": "Minute Maid Orange Juice",
            "brand": "Minute Maid",
            "description": "100% pure orange juice, 1L. Made from real Kenyan oranges.",
            "price": 150.00,
            "category": "Beverages",
            "stock": 120,
            "unit": "1L",
            "image_url": "https://coca-cola.co.ke/content/dam/one/ke/en/brands/minute-maid/minute-maid-orange-1l.jpg",
        },
        # Fresh Produce
        {
            "name": "Fresh Tomatoes",
            "brand": "Local Farm",
            "description": "Fresh ripe tomatoes from Kenyan farms, 1kg. Locally grown and harvested daily.",
            "price": 80.00,
            "category": "Fresh Produce",
            "stock": 200,
            "unit": "1kg",
            "image_url": "https://naivas.co.ke/wp-content/uploads/2021/01/fresh-tomatoes-1kg.jpg",
        },
        {
            "name": "Sweet Bananas",
            "brand": "Coast Produce",
            "description": "Sweet ripe bananas from the Coast region, 1kg. Naturally sweet and fresh.",
            "price": 70.00,
            "category": "Fresh Produce",
            "stock": 180,
            "unit": "1kg",
            "image_url": "https://naivas.co.ke/wp-content/uploads/2021/01/sweet-bananas-1kg.jpg",
        },
        {
            "name": "Fresh Carrots",
            "brand": "Nakuru Farms",
            "description": "Crunchy fresh carrots from Nakuru, 1kg. Rich in nutrients and naturally sweet.",
            "price": 90.00,
            "category": "Fresh Produce",
            "stock": 150,
            "unit": "1kg",
            "image_url": "https://naivas.co.ke/wp-content/uploads/2021/01/fresh-carrots-1kg.jpg",
        },
        # Household & Cleaning
        {
            "name": "Omo Washing Powder",
            "brand": "Omo",
            "description": "Multi-active washing powder, 1kg. Powerful cleaning for all your laundry needs.",
            "price": 400.00,
            "category": "Household & Cleaning",
            "stock": 100,
            "unit": "1kg",
            "image_url": "https://unilever.com/files/images/brands/omo-washing-powder-1kg.jpg",
        },
        {
            "name": "Dettol Antiseptic",
            "brand": "Dettol",
            "description": "Dettol antibacterial liquid, 500ml. Kills 99.9% of germs and bacteria.",
            "price": 250.00,
            "category": "Household & Cleaning",
            "stock": 120,
            "unit": "500ml",
            "image_url": "https://rb.com/brands/dettol/dettol-antiseptic-500ml.jpg",
        },
        {
            "name": "Softcare Toilet Tissue",
            "brand": "Softcare",
            "description": "Premium toilet tissue, 4 rolls. Soft, strong and gentle on skin.",
            "price": 250.00,
            "category": "Household & Cleaning",
            "stock": 150,
            "unit": "4 rolls",
            "image_url": "https://sappi.com/files/images/products/softcare-4rolls.jpg",
        },
        # Personal Care
        {
            "name": "Colgate Total Toothpaste",
            "brand": "Colgate",
            "description": "Colgate Total toothpaste for complete protection, 100ml. 12-hour protection.",
            "price": 150.00,
            "category": "Personal Care",
            "stock": 200,
            "unit": "100ml",
            "image_url": "https://colgate.com/content/dam/cp-sites/oral-care/oral-care-products/en-us/products/toothpaste/colgate-total/colgate-total-clean-mint-6oz.jpg",
        },
        {
            "name": "Nivea Soft Moisturizing Cream",
            "brand": "Nivea",
            "description": "Nivea Soft moisturizing cream, 200ml. Deep nourishment for dry skin.",
            "price": 350.00,
            "category": "Personal Care",
            "stock": 100,
            "unit": "200ml",
            "image_url": "https://nivea.com/-/media/local/in/en/products/face-care/nivea-soft/nivea-soft-moisturizing-cream-200ml.jpg",
        },
        {
            "name": "Always Ultra Thin Pads",
            "brand": "Always",
            "description": "Always Ultra Thin sanitary pads, 10 pieces. Maximum protection and comfort.",
            "price": 250.00,
            "category": "Personal Care",
            "stock": 180,
            "unit": "10 pcs",
            "image_url": "https://pg.com/en_US/images/always-ultra-thin-pads-10ct.jpg",
        },
        # Snacks & Confectionery
        {
            "name": "Blue Band Margarine",
            "brand": "Blue Band",
            "description": "Blue Band margarine for cooking and baking, 500g. Perfect for all your cooking needs.",
            "price": 280.00,
            "category": "Snacks & Confectionery",
            "stock": 120,
            "unit": "500g",
            "image_url": "https://unilever.com/files/images/brands/blue-band-margarine-500g.jpg",
        },
        {
            "name": "Ajab Premix",
            "brand": "Ajab",
            "description": "Ajab premix for mandazi and chapati, 1kg. Authentic Kenyan recipe mix.",
            "price": 200.00,
            "category": "Snacks & Confectionery",
            "stock": 90,
            "unit": "1kg",
            "image_url": "https://ajab.co.ke/wp-content/uploads/2021/01/ajab-premix-1kg.jpg",
        },
    ]

    # Create categories
    category_objs = {}
    for cat_name, cat_data in categories_data.items():
        category, created = Category.objects.get_or_create(
            name=cat_name, defaults={"description": cat_data["description"]}
        )
        category_objs[cat_name] = category

    # Create products
    for prod in products_data:
        category = category_objs.get(prod["category"])
        if not category:
            continue

        # Create full product name with brand
        full_name = f"{prod['brand']} {prod['name']}"

        product, created = Product.objects.get_or_create(
            name=full_name,
            defaults={
                "description": prod["description"],
                "price": prod["price"],
                "category": category,
                "stock": prod["stock"],
                "short_description": f"{prod['brand']} {prod['name']} - {prod['unit']}",
            },
        )

        # Download and save image
        if prod.get("image_url"):
            try:
                response = requests.get(
                    prod["image_url"],
                    timeout=30,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    },
                )

                if response.status_code == 200:
                    image_content = ContentFile(response.content)
                    file_name = f"{prod['brand'].lower().replace(' ', '_')}_{prod['name'].lower().replace(' ', '_')}.jpg"
                    product.image.save(file_name, image_content, save=True)
                    print(f"✅ Added authentic image for {full_name}")
                else:
                    print(
                        f"❌ Failed to download image for {full_name}: HTTP {response.status_code}"
                    )

            except Exception as e:
                print(f"❌ Error downloading image for {full_name}: {e}")

    print(
        "\n🎉 Successfully populated EasyCart with authentic Kenyan supermarket products!"
    )
    print(f"📊 Total Categories: {len(categories_data)}")
    print(f"📦 Total Products: {len(products_data)}")
    print(
        "🏪 Products from trusted Kenyan brands: Brookside, KCC, Pembe, Kabras, Unga, Royco, Coca-Cola, Keringet, Omo, Dettol, Colgate, Nivea, Always, Blue Band, Ajab"
    )


add_authentic_kenyan_products()
