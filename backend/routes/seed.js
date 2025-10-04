const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

const router = express.Router();

const categories = [
  { name: 'Staples', description: 'Essential Kenyan food staples and basics' },
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Fashion', description: 'Clothing and accessories' },
  { name: 'Home & Living', description: 'Home decor and furniture' },
  { name: 'Food & Beverages', description: 'Food items and drinks' },
  { name: 'Health & Beauty', description: 'Health and beauty products' },
  { name: 'Sports & Fitness', description: 'Sports equipment and fitness gear' },
  { name: 'Groceries', description: 'Daily grocery items' },
  { name: 'Beverages', description: 'Drinks and beverages' },
  { name: 'Household', description: 'Household cleaning and maintenance' },
  { name: 'Personal Care', description: 'Personal hygiene and care products' }
];

const products = [
  // Groceries
  {
    name: "Ajab All Purpose Flour 2kg",
    brand: "Ajab",
    category: "Groceries",
    price: 320,
    description: "Ajab All Purpose Flour 2kg - perfect for chapati, mandazi, and baking. Soft, high quality, and trusted by Kenyan families.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/13/287123/1.jpg?0732", // Jumia
    stock: 100,
    tags: ["Top Seller", "Flash Sale"]
  },
  {
    name: "Mumias Sugar 1kg",
    brand: "Mumias",
    category: "Groceries",
    price: 220,
    description: "Mumias Sugar 1kg - Kenya's favorite sugar for tea and baking. Pure, sweet, and locally produced.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/41/287123/1.jpg?0732", // Jumia
    stock: 120,
    tags: ["Top Seller"]
  },
  {
    name: "Fresh Fri Cooking Oil 3L",
    brand: "Fresh Fri",
    category: "Groceries",
    price: 950,
    description: "Fresh Fri Pure Cooking Oil 3L - cholesterol free, ideal for deep frying and cooking.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/77/287123/1.jpg?0732", // Jumia
    stock: 60,
    tags: ["Flash Sale"]
  },
  {
    name: "Daima Fresh Milk 500ml",
    brand: "Daima",
    category: "Groceries",
    price: 65,
    description: "Daima Fresh Milk 500ml - pasteurized, creamy, and nutritious. Perfect for tea and drinking.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/10/287123/1.jpg?0732", // Jumia
    stock: 80,
    tags: ["New Arrival"]
  },
  {
    name: "Tropical Heat Tea Masala 100g",
    brand: "Tropical Heat",
    category: "Groceries",
    price: 180,
    description: "Tropical Heat Tea Masala 100g - authentic Kenyan blend for spiced tea. Aromatic and flavorful.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/12/287123/1.jpg?0732", // Jumia
    stock: 50,
    tags: ["Top Seller"]
  },
  {
    name: "Exe Wholemeal Atta 2kg",
    brand: "Exe",
    category: "Groceries",
    price: 340,
    description: "Exe Wholemeal Atta 2kg - nutritious, high-fiber flour for healthy chapatis and rotis.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/15/287123/1.jpg?0732", // Jumia
    stock: 70,
    tags: ["Top Seller"]
  },
  // Beverages
  {
    name: "Coca-Cola 1.25L",
    brand: "Coca-Cola",
    category: "Beverages",
    price: 120,
    description: "Coca-Cola 1.25L - Kenya's favorite soft drink. Refreshing and perfect for any occasion.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/18/287123/1.jpg?0732", // Jumia
    stock: 90,
    tags: ["Top Seller"]
  },
  {
    name: "Minute Maid Mango Juice 1L",
    brand: "Minute Maid",
    category: "Beverages",
    price: 210,
    description: "Minute Maid Mango Juice 1L - delicious, real fruit juice. No added preservatives.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/19/287123/1.jpg?0732", // Jumia
    stock: 60,
    tags: ["Flash Sale"]
  },
  {
    name: "Kericho Gold Green Tea 25 Bags",
    brand: "Kericho Gold",
    category: "Beverages",
    price: 250,
    description: "Kericho Gold Green Tea 25 Bags - premium Kenyan tea for a healthy lifestyle.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/20/287123/1.jpg?0732", // Jumia
    stock: 40,
    tags: ["New Arrival"]
  },
  {
    name: "Del Monte Pineapple Juice 1L",
    brand: "Del Monte",
    category: "Beverages",
    price: 230,
    description: "Del Monte Pineapple Juice 1L - made from real pineapples, no added sugar.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/21/287123/1.jpg?0732", // Jumia
    stock: 55,
    tags: ["Top Seller"]
  },
  // Household
  {
    name: "Harpic Toilet Cleaner 500ml",
    brand: "Harpic",
    category: "Household",
    price: 210,
    description: "Harpic Toilet Cleaner 500ml - powerful cleaning, removes stains and kills germs.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/22/287123/1.jpg?0732", // Jumia
    stock: 40,
    tags: ["Top Seller"]
  },
  {
    name: "Sunlight Washing Powder 1kg",
    brand: "Sunlight",
    category: "Household",
    price: 350,
    description: "Sunlight Washing Powder 1kg - tough on stains, gentle on hands. Fresh fragrance.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/23/287123/1.jpg?0732", // Jumia
    stock: 60,
    tags: ["Flash Sale"]
  },
  {
    name: "Dettol Antiseptic 250ml",
    brand: "Dettol",
    category: "Household",
    price: 180,
    description: "Dettol Antiseptic 250ml - trusted protection against germs for your family.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/24/287123/1.jpg?0732", // Jumia
    stock: 50,
    tags: ["Top Seller"]
  },
  {
    name: "Jik Bleach 500ml",
    brand: "Jik",
    category: "Household",
    price: 120,
    description: "Jik Bleach 500ml - effective for cleaning, whitening, and disinfecting.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/25/287123/1.jpg?0732", // Jumia
    stock: 70,
    tags: ["Top Seller"]
  },
  // Personal Care
  {
    name: "Geisha Bar Soap 125g",
    brand: "Geisha",
    category: "Personal Care",
    price: 70,
    description: "Geisha Bar Soap 125g - gentle on skin, long-lasting fragrance.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/26/287123/1.jpg?0732", // Jumia
    stock: 100,
    tags: ["Top Seller"]
  },
  {
    name: "Nivea Body Lotion 400ml",
    brand: "Nivea",
    category: "Personal Care",
    price: 520,
    description: "Nivea Body Lotion 400ml - deep moisture care for smooth, healthy skin.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/27/287123/1.jpg?0732", // Jumia
    stock: 30,
    tags: ["New Arrival"]
  },
  {
    name: "Colgate Toothpaste 100ml",
    brand: "Colgate",
    category: "Personal Care",
    price: 150,
    description: "Colgate Toothpaste 100ml - fights cavities, freshens breath.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/28/287123/1.jpg?0732", // Jumia
    stock: 80,
    tags: ["Top Seller"]
  },
  {
    name: "Always Sanitary Pads 8pcs",
    brand: "Always",
    category: "Personal Care",
    price: 120,
    description: "Always Sanitary Pads 8pcs - comfort and protection for women.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/29/287123/1.jpg?0732", // Jumia
    stock: 60,
    tags: ["Top Seller"]
  },
  // Electronics
  {
    name: "Bruhm 32\" Digital TV",
    brand: "Bruhm",
    category: "Electronics",
    price: 14500,
    description: "Bruhm 32-inch Digital TV - HD Ready, USB, HDMI, energy saving.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/30/287123/1.jpg?0732", // Jumia
    stock: 20,
    tags: ["Top Seller", "Flash Sale"]
  },
  {
    name: "Ramtons Microwave 20L",
    brand: "Ramtons",
    category: "Electronics",
    price: 9500,
    description: "Ramtons Microwave 20L - compact, efficient, and easy to use.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/31/287123/1.jpg?0732", // Jumia
    stock: 15,
    tags: ["Flash Sale"]
  },
  {
    name: "Mika Blender 1.5L",
    brand: "Mika",
    category: "Electronics",
    price: 4200,
    description: "Mika Blender 1.5L - powerful motor, durable glass jar, multi-speed.",
    image: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/32/287123/1.jpg?0732", // Jumia
    stock: 25,
    tags: ["New Arrival"]
  }
];

router.post('/', async (req, res) => {
  try {
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    await Category.insertMany(categories);
    await Product.insertMany(products);
    
    // Create admin user
    await User.deleteOne({ email: 'admin@easycart.com' });
    const admin = new User({
      email: 'admin@easycart.com',
      password: 'admin123',
      name: 'Admin User',
      username: 'admin',
      role: 'admin',
      is_admin: true
    });
    await admin.save();
    
    // Create test user
    await User.deleteOne({ email: 'test@easycart.com' });
    const testUser = new User({
      email: 'test@easycart.com',
      password: 'test123',
      name: 'Test User',
      username: 'testuser'
    });
    await testUser.save();
    
    res.json({ message: 'Database seeded successfully', products: products.length, categories: categories.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;