// Realistic Kenyan e-commerce products with proper categorization
export const mockProducts = [
  // Electronics
  {
    id: 1,
    name: "Samsung Galaxy A54 5G",
    price: 45000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    category: "Electronics",
    description: "6.4-inch Super AMOLED display, 50MP triple camera, 5000mAh battery",
    stock: 25,
    rating: 4.6,
    brand: "Samsung"
  },
  {
    id: 2,
    name: "HP Pavilion 15 Laptop",
    price: 85000,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    category: "Electronics",
    description: "Intel Core i5, 8GB RAM, 512GB SSD, Windows 11",
    stock: 12,
    rating: 4.4,
    brand: "HP"
  },
  {
    id: 3,
    name: "JBL Tune 510BT Headphones",
    price: 6500,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: "Electronics",
    description: "Wireless Bluetooth headphones with 40-hour battery life",
    stock: 35,
    rating: 4.3,
    brand: "JBL"
  },
  {
    id: 4,
    name: "Xiaomi Redmi Watch 3",
    price: 12000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    category: "Electronics",
    description: "1.75-inch HD display, GPS, 12-day battery, health monitoring",
    stock: 18,
    rating: 4.2,
    brand: "Xiaomi"
  },
  {
    id: 5,
    name: "Anker PowerCore 10000mAh",
    price: 4200,
    image: "https://images.unsplash.com/photo-1609592806596-4d1b5e5e1e1e?w=400",
    category: "Electronics",
    description: "Portable power bank with fast charging technology",
    stock: 50,
    rating: 4.7,
    brand: "Anker"
  },

  // Fashion & Clothing
  {
    id: 6,
    name: "Kitenge African Print Dress",
    price: 3500,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
    category: "Fashion",
    description: "Beautiful traditional African print dress, 100% cotton",
    stock: 20,
    rating: 4.8,
    brand: "Local Artisan"
  },
  {
    id: 7,
    name: "Men's Polo Shirt",
    price: 2800,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    category: "Fashion",
    description: "Premium cotton polo shirt, available in multiple colors",
    stock: 40,
    rating: 4.5,
    brand: "Polo Kenya"
  },
  {
    id: 8,
    name: "Leather Sandals",
    price: 4500,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
    category: "Fashion",
    description: "Handcrafted genuine leather sandals, comfortable and durable",
    stock: 15,
    rating: 4.6,
    brand: "Bata Kenya"
  },
  {
    id: 9,
    name: "Maasai Beaded Jewelry Set",
    price: 1800,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
    category: "Fashion",
    description: "Authentic Maasai beaded necklace and bracelet set",
    stock: 25,
    rating: 4.9,
    brand: "Maasai Craft"
  },

  // Home & Living
  {
    id: 10,
    name: "Ceramic Dinner Set",
    price: 8500,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    category: "Home & Living",
    description: "24-piece ceramic dinner set for 6 people, dishwasher safe",
    stock: 10,
    rating: 4.4,
    brand: "Kenyan Ceramics"
  },
  {
    id: 11,
    name: "Sisal Basket",
    price: 2200,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    category: "Home & Living",
    description: "Handwoven sisal basket, perfect for storage and decoration",
    stock: 30,
    rating: 4.7,
    brand: "Kiondo Crafts"
  },
  {
    id: 12,
    name: "Mosquito Net - Double Bed",
    price: 1500,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    category: "Home & Living",
    description: "Treated mosquito net for double bed, long-lasting protection",
    stock: 45,
    rating: 4.5,
    brand: "SafeSleep"
  },

  // Food & Beverages
  {
    id: 13,
    name: "Kenyan AA Coffee Beans",
    price: 1200,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    category: "Food & Beverages",
    description: "Premium Kenyan AA coffee beans, 500g pack, freshly roasted",
    stock: 60,
    rating: 4.9,
    brand: "Java House"
  },
  {
    id: 14,
    name: "Ugali Flour - 2kg",
    price: 180,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    category: "Food & Beverages",
    description: "Premium white maize flour for making ugali, 2kg pack",
    stock: 100,
    rating: 4.6,
    brand: "Pembe Flour"
  },
  {
    id: 15,
    name: "Honey - Pure Natural",
    price: 800,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400",
    category: "Food & Beverages",
    description: "Pure natural honey from Kenyan beekeepers, 500ml jar",
    stock: 35,
    rating: 4.8,
    brand: "Baraka Honey"
  },
  {
    id: 16,
    name: "Chai Masala Tea",
    price: 450,
    image: "https://images.unsplash.com/photo-1594631661960-0e2e5c273b5d?w=400",
    category: "Food & Beverages",
    description: "Authentic Kenyan chai masala tea blend, 250g pack",
    stock: 80,
    rating: 4.7,
    brand: "Ketepa Tea"
  },

  // Health & Beauty
  {
    id: 17,
    name: "Shea Butter Body Lotion",
    price: 650,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
    category: "Health & Beauty",
    description: "Natural shea butter body lotion, 400ml, for all skin types",
    stock: 40,
    rating: 4.6,
    brand: "Naturals Kenya"
  },
  {
    id: 18,
    name: "Aloe Vera Gel",
    price: 380,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    category: "Health & Beauty",
    description: "Pure aloe vera gel for skin care and healing, 200ml",
    stock: 55,
    rating: 4.5,
    brand: "Aloe Kenya"
  },

  // Sports & Fitness
  {
    id: 19,
    name: "Yoga Mat",
    price: 2500,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
    category: "Sports & Fitness",
    description: "Non-slip yoga mat, 6mm thickness, eco-friendly material",
    stock: 22,
    rating: 4.4,
    brand: "FitLife Kenya"
  },
  {
    id: 20,
    name: "Football - Size 5",
    price: 1800,
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400",
    category: "Sports & Fitness",
    description: "Official size 5 football, suitable for matches and training",
    stock: 30,
    rating: 4.3,
    brand: "Mitre Kenya"
  },

  // Groceries & Daily Supplies
  {
    id: 21,
    name: "Fresh Sukuma Wiki - 1 Bunch",
    price: 20,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
    category: "Groceries",
    description: "Fresh collard greens, locally grown, rich in vitamins and minerals",
    stock: 150,
    rating: 4.7,
    brand: "Local Farm",
    weight: "250g"
  },
  {
    id: 22,
    name: "Brookside Milk - 500ml",
    price: 60,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    category: "Groceries",
    description: "Fresh pasteurized whole milk, rich in calcium and protein",
    stock: 80,
    rating: 4.6,
    brand: "Brookside",
    weight: "500ml"
  },
  {
    id: 23,
    name: "Royco Mchuzi Mix - 8g",
    price: 10,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
    category: "Groceries",
    description: "Beef flavored cooking seasoning, perfect for stews and soups",
    stock: 200,
    rating: 4.5,
    brand: "Royco",
    weight: "8g"
  },
  {
    id: 24,
    name: "Tomatoes - 1kg",
    price: 80,
    image: "https://images.unsplash.com/photo-1546470427-e5ac89cd0b50?w=400",
    category: "Groceries",
    description: "Fresh red tomatoes, perfect for cooking and salads",
    stock: 120,
    rating: 4.4,
    brand: "Local Farm",
    weight: "1kg"
  },
  {
    id: 25,
    name: "Onions - 1kg",
    price: 60,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400",
    category: "Groceries",
    description: "Fresh red onions, essential for Kenyan cooking",
    stock: 100,
    rating: 4.3,
    brand: "Local Farm",
    weight: "1kg"
  },
  {
    id: 26,
    name: "Rice - Pishori 2kg",
    price: 280,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    category: "Groceries",
    description: "Premium Pishori rice, aromatic and fluffy when cooked",
    stock: 60,
    rating: 4.8,
    brand: "Mwea Rice",
    weight: "2kg"
  },
  {
    id: 27,
    name: "Cooking Oil - 500ml",
    price: 180,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
    category: "Groceries",
    description: "Pure sunflower cooking oil, cholesterol free",
    stock: 90,
    rating: 4.5,
    brand: "Elianto",
    weight: "500ml"
  },
  {
    id: 28,
    name: "Bread - White Loaf",
    price: 55,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    category: "Groceries",
    description: "Fresh white bread loaf, soft and perfect for breakfast",
    stock: 40,
    rating: 4.4,
    brand: "Superloaf",
    weight: "400g"
  },
  {
    id: 29,
    name: "Eggs - Tray of 30",
    price: 420,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400",
    category: "Groceries",
    description: "Fresh farm eggs, high in protein and nutrients",
    stock: 35,
    rating: 4.7,
    brand: "Kenchic",
    weight: "30 pieces"
  },
  {
    id: 30,
    name: "Sugar - 2kg",
    price: 220,
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400",
    category: "Groceries",
    description: "Pure white granulated sugar, perfect for tea and baking",
    stock: 70,
    rating: 4.6,
    brand: "Mumias Sugar",
    weight: "2kg"
  },
  {
    id: 31,
    name: "Salt - 500g",
    price: 25,
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400",
    category: "Groceries",
    description: "Iodized table salt, essential for daily cooking",
    stock: 180,
    rating: 4.5,
    brand: "Kensalt",
    weight: "500g"
  },
  {
    id: 32,
    name: "Bananas - 1 Dozen",
    price: 120,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
    category: "Groceries",
    description: "Sweet ripe bananas, rich in potassium and natural sugars",
    stock: 85,
    rating: 4.6,
    brand: "Local Farm",
    weight: "12 pieces"
  },
  {
    id: 33,
    name: "Oranges - 1kg",
    price: 100,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400",
    category: "Groceries",
    description: "Juicy sweet oranges, high in vitamin C",
    stock: 95,
    rating: 4.5,
    brand: "Local Farm",
    weight: "1kg"
  },
  {
    id: 34,
    name: "Omo Washing Powder - 500g",
    price: 180,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    category: "Groceries",
    description: "Powerful laundry detergent for clean and fresh clothes",
    stock: 65,
    rating: 4.4,
    brand: "Omo",
    weight: "500g"
  },
  {
    id: 35,
    name: "Colgate Toothpaste - 75ml",
    price: 120,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    category: "Groceries",
    description: "Fluoride toothpaste for strong teeth and fresh breath",
    stock: 110,
    rating: 4.6,
    brand: "Colgate",
    weight: "75ml"
  },
  {
    id: 36,
    name: "Tissue Paper - 4 Rolls",
    price: 250,
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400",
    category: "Groceries",
    description: "Soft and absorbent toilet tissue, 4-roll pack",
    stock: 45,
    rating: 4.3,
    brand: "Softcare",
    weight: "4 rolls"
  },
  {
    id: 37,
    name: "Maize Flour - 2kg",
    price: 140,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    category: "Groceries",
    description: "Fine white maize flour for making ugali and porridge",
    stock: 75,
    rating: 4.7,
    brand: "Exe Flour",
    weight: "2kg"
  },
  {
    id: 38,
    name: "Beans - 1kg",
    price: 150,
    image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400",
    category: "Groceries",
    description: "Dried red kidney beans, high in protein and fiber",
    stock: 55,
    rating: 4.5,
    brand: "Local Farm",
    weight: "1kg"
  },
  {
    id: 39,
    name: "Chicken - Whole 1.5kg",
    price: 650,
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400",
    category: "Groceries",
    description: "Fresh whole chicken, free-range and hormone-free",
    stock: 25,
    rating: 4.8,
    brand: "Kenchic",
    weight: "1.5kg"
  },
  {
    id: 40,
    name: "Beef - 1kg",
    price: 800,
    image: "https://images.unsplash.com/photo-1588347818133-38c4106ca7b4?w=400",
    category: "Groceries",
    description: "Fresh lean beef cuts, perfect for stews and roasting",
    stock: 20,
    rating: 4.6,
    brand: "Local Butchery",
    weight: "1kg"
  }
];

export const mockCategories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Fashion" },
  { id: 3, name: "Home & Living" },
  { id: 4, name: "Food & Beverages" },
  { id: 5, name: "Health & Beauty" },
  { id: 6, name: "Sports & Fitness" },
  { id: 7, name: "Groceries" }
];