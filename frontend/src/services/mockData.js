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
  }
];

export const mockCategories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Fashion" },
  { id: 3, name: "Home & Living" },
  { id: 4, name: "Food & Beverages" },
  { id: 5, name: "Health & Beauty" },
  { id: 6, name: "Sports & Fitness" }
];