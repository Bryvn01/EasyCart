from apps.products.models import Product, Category
from django.core.management.base import BaseCommand
def slugify(text):
    """Simple slugify function to create URL-friendly strings."""
    import re
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


# List of products to seed
PRODUCTS = [
    {"name": "Jogoo Maize Flour 2kg", "price": 180, "category": "Staples", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/jogoo.jpg", "description": "Popular maize flour for ugali."},
    {"name": "Kabras Sugar 2kg", "price": 250, "category": "Staples", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/sugar.jpg", "description": "Refined Kenyan sugar."},
    {"name": "Fresh Fri Cooking Oil 1L", "price": 320, "category": "Staples", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/oil.jpg", "description": "Pure vegetable cooking oil."},
    {"name": "Pishori Rice 2kg", "price": 450, "category": "Staples", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/rice.jpg", "description": "Premium aromatic Pishori rice."},
    {"name": "Exe All-Purpose Wheat Flour 2kg", "price": 200, "category": "Staples", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/wheatflour.jpg", "description": "All-purpose wheat flour for chapati and baking."},
    {"name": "Tamarind Brown Lentils 500g", "price": 180, "category": "Staples", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/lentils.jpg", "description": "Brown lentils for making ndengu, a common stew."},
    {"name": "Green Grams 500g", "price": 150, "category": "Staples", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/greengrams.jpg", "description": "Dried green grams for making a nutritious stew."},
    {"name": "Royco Mchuzi Mix 50g", "price": 35, "category": "Staples", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/royco.jpg", "description": "The quintessential Kenyan curry and soup seasoning."},
    {"name": "Ketepa Pride Tea 250g", "price": 150, "category": "Beverages", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/tea.jpg", "description": "Kenya's favorite black tea."},
    {"name": "Dormans Instant Coffee 100g", "price": 450, "category": "Beverages", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/coffee.jpg", "description": "Premium Kenyan instant coffee."},
    {"name": "Coca-Cola Soda 500ml", "price": 70, "category": "Beverages", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/coke.jpg", "description": "Classic fizzy drink."},
    {"name": "Dasani Bottled Water 1L", "price": 60, "category": "Beverages", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/water.jpg", "description": "Purified bottled water."},
    {"name": "Del Monte Mango Juice 1L", "price": 180, "category": "Beverages", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/juice.jpg", "description": "Refreshing mango juice."},
    {"name": "Brookside Fresh Milk 500ml", "price": 65, "category": "Dairy", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/milk.jpg", "description": "Fresh pasteurized milk."},
    {"name": "Daima Yoghurt 250ml", "price": 80, "category": "Dairy", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/yoghurt.jpg", "description": "Creamy fruit yoghurt."},
    {"name": "KCC Butter 500g", "price": 320, "category": "Dairy", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/butter.jpg", "description": "Creamy salted butter for cooking and spreading."},
    {"name": "Supa Loaf Bread 400g", "price": 70, "category": "Bakery", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/bread.jpg", "description": "Soft white bread loaf."},
    {"name": "Blue Band Margarine 500g", "price": 220, "category": "Spreads", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/blueband.jpg", "description": "Classic margarine spread."},
    {"name": "Indomie Instant Noodles 70g", "price": 50, "category": "Snacks", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/indomie.jpg", "description": "Quick and tasty noodles."},
    {"name": "Krackles Potato Crisps 50g", "price": 60, "category": "Snacks", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/crisps.jpg", "description": "Crunchy potato crisps."},
    {"name": "Tropical Heat Biscuits (Nice)", "price": 120, "category": "Snacks", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/biscuits.jpg", "description": "Sweet Nice biscuits."},
    {"name": "Sukuma Wiki (Kale) Bunch", "price": 20, "category": "Fresh Produce", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/sukumawiki.jpg", "description": "A large bunch of fresh kale, Kenya's most popular green vegetable."},
    {"name": "Ripe Tomatoes 1kg", "price": 100, "category": "Fresh Produce", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/tomatoes.jpg", "description": "Fresh, ripe tomatoes for cooking and salads."},
    {"name": "Red Onions 1kg", "price": 80, "category": "Fresh Produce", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/onions.jpg", "description": "Fresh red onions for cooking and garnishing."},
    {"name": "Irish Potatoes 1kg", "price": 60, "category": "Fresh Produce", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/potatoes.jpg", "description": "Fresh potatoes for boiling, frying, or mashing."},
    {"name": "Cooking Bananas (Ndizi) 1kg", "price": 90, "category": "Fresh Produce", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/ndizi.jpg", "description": "Green bananas for boiling or making matoke."},
    {"name": "Beef Mince 500g", "price": 350, "category": "Meat & Poultry", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/beefmince.jpg", "description": "Fresh lean beef mince for various dishes."},
    {"name": "Whole Chicken (Frozen)", "price": 600, "category": "Meat & Poultry", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/chicken.jpg", "description": "Frozen whole chicken for roasting or stewing."},
    {"name": "Tilapia Fish (Fresh)", "price": 400, "category": "Meat & Poultry", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/fish.jpg", "description": "Fresh tilapia fish, a Kenyan favorite."},
    {"name": "Sunlight Bar Soap 800g", "price": 150, "category": "Household", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/soap.jpg", "description": "Multipurpose laundry bar."},
    {"name": "Ariel Washing Powder 1kg", "price": 350, "category": "Household", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/ariel.jpg", "description": "Powerful stain remover."},
    {"name": "Omo Detergent 1kg", "price": 300, "category": "Household", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/omo.jpg", "description": "Popular washing powder for clean clothes."},
    {"name": "Bio Soap Bar 150g", "price": 50, "category": "Household", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/biosoap.jpg", "description": "Gentle bathing soap for personal hygiene."},
    {"name": "Colgate Toothpaste 100ml", "price": 180, "category": "Personal Care", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/colgate.jpg", "description": "Fluoride toothpaste for fresh breath."},
    {"name": "Geisha Beauty Soap 120g", "price": 70, "category": "Personal Care", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/geisha.jpg", "description": "Classic beauty soap for skin care."},
    {"name": "Lifebuoy Hand Sanitizer 250ml", "price": 220, "category": "Personal Care", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/sanitizer.jpg", "description": "Alcohol-based hand sanitizer for protection."},
    {"name": "Always Sanitary Pads (10 pack)", "price": 180, "category": "Personal Care", "image": "https://res.cloudinary.com/dvpr5bcrp/image/upload/pads.jpg", "description": "Regular sanitary pads for feminine hygiene."}
]

class Command(BaseCommand):
    help = 'Seed the PostgreSQL database with initial product and category data.'

    def handle(self, *args, **options):
        for item in PRODUCTS:
            category_obj, _ = Category.objects.get_or_create(name=item["category"])
            product, created = Product.objects.get_or_create(
                name=item["name"],
                defaults={
                    "price": item["price"],
                    "category": category_obj,
                    "image": item["image"],
                    "description": item["description"]
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created product: {product.name}"))
            else:
                self.stdout.write(f"Product already exists: {product.name}")
