#!/usr/bin/env node

/**
 * Seed Products Script with Cloudinary Integration
 * 
 * This script seeds the MongoDB database with authentic Kenyan supermarket products
 * and uploads product images to Cloudinary for optimal delivery.
 * 
 * Usage:
 *   node scripts/seedProducts.js
 * 
 * Environment Variables Required:
 *   - MONGO_URI: MongoDB connection string
 *   - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 *   - CLOUDINARY_API_KEY: Your Cloudinary API key
 *   - CLOUDINARY_API_SECRET: Your Cloudinary API secret
 */

const mongoose = require('mongoose');
const { uploadFromUrl } = require('../utils/cloudinary');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Kenyan Product Data with Real Image URLs
const kenyanProducts = [
  // Staples - Essential Kenyan Food Items
  {
    name: "Jogoo Maize Flour 2kg",
    brand: "Jogoo",
    category: "Staples",
    price: 180,
    description: "Popular maize flour for ugali.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/jogoo.jpg",
    stock: 150,
    tags: ["maize", "flour", "ugali", "staple"]
  },
  {
    name: "Kabras Sugar 2kg",
    brand: "Kabras",
    category: "Staples",
    price: 250,
    description: "Refined Kenyan sugar.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/sugar.jpg",
    stock: 200,
    tags: ["sugar", "sweetener", "kenyan"]
  },
  {
    name: "Pembe Maize Flour 2kg",
    brand: "Pembe",
    category: "Staples",
    price: 190,
    description: "High-quality maize flour for traditional ugali.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/pembe-flour.jpg",
    stock: 180,
    tags: ["maize", "flour", "ugali"]
  },
  {
    name: "Mumias Sugar 2kg",
    brand: "Mumias",
    category: "Staples",
    price: 260,
    description: "Premium Kenyan refined sugar.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/mumias-sugar.jpg",
    stock: 170,
    tags: ["sugar", "sweetener"]
  },
  {
    name: "Ajab Flour 2kg",
    brand: "Ajab",
    category: "Staples",
    price: 200,
    description: "All purpose flour for baking and cooking.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/ajab-flour.jpg",
    stock: 160,
    tags: ["flour", "baking"]
  },
  {
    name: "Exe Atta Flour 2kg",
    brand: "Exe",
    category: "Staples",
    price: 220,
    description: "Wholemeal flour for healthy chapatis.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/exe-atta.jpg",
    stock: 140,
    tags: ["flour", "wholemeal", "healthy"]
  },
  {
    name: "Ndengu (Green Grams) 1kg",
    brand: "Local",
    category: "Staples",
    price: 150,
    description: "Fresh green grams for traditional Kenyan dishes.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/ndengu.jpg",
    stock: 120,
    tags: ["legumes", "ndengu", "protein"]
  },
  {
    name: "Red Kidney Beans 1kg",
    brand: "Local",
    category: "Staples",
    price: 160,
    description: "High-quality kidney beans.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/kidney-beans.jpg",
    stock: 130,
    tags: ["beans", "legumes", "protein"]
  },
  {
    name: "White Rice 2kg",
    brand: "Pishori",
    category: "Staples",
    price: 280,
    description: "Premium Kenyan Pishori rice.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/pishori-rice.jpg",
    stock: 150,
    tags: ["rice", "pishori", "staple"]
  },
  {
    name: "Spaghetti 500g",
    brand: "Pasta",
    category: "Staples",
    price: 120,
    description: "Quality pasta for quick meals.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/spaghetti.jpg",
    stock: 200,
    tags: ["pasta", "spaghetti"]
  },

  // Groceries & Food
  {
    name: "Fresh Fri Cooking Oil 3L",
    brand: "Fresh Fri",
    category: "Groceries",
    price: 950,
    description: "Pure cooking oil ideal for deep frying and cooking.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/cooking-oil.jpg",
    stock: 80,
    tags: ["cooking-oil", "kitchen", "essentials"]
  },
  {
    name: "Brookside Fresh Milk 500ml",
    brand: "Brookside",
    category: "Groceries",
    price: 65,
    description: "Pasteurized fresh milk.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/milk.jpg",
    stock: 100,
    tags: ["dairy", "milk", "fresh"]
  },
  {
    name: "Ketepa Pride Tea Leaves 250g",
    brand: "Ketepa",
    category: "Groceries",
    price: 280,
    description: "Authentic Kenyan tea from the highlands.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/ketepa-tea.jpg",
    stock: 90,
    tags: ["tea", "beverages", "kenyan"]
  },
  {
    name: "Blue Band Margarine 500g",
    brand: "Blue Band",
    category: "Groceries",
    price: 280,
    description: "Quality margarine for cooking and baking.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/blueband.jpg",
    stock: 110,
    tags: ["margarine", "dairy", "baking"]
  },
  {
    name: "Royco Mchuzi Mix 400g",
    brand: "Royco",
    category: "Groceries",
    price: 350,
    description: "Authentic Kenyan seasoning for stews.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/royco.jpg",
    stock: 120,
    tags: ["seasoning", "spices", "kenyan"]
  },

  // Beverages
  {
    name: "Coca-Cola 1.25L",
    brand: "Coca-Cola",
    category: "Beverages",
    price: 120,
    description: "Kenya's favorite soft drink. Refreshing and perfect for any occasion.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/coca-cola.jpg",
    stock: 150,
    tags: ["soda", "beverages", "refreshing"]
  },
  {
    name: "Minute Maid Mango Juice 1L",
    brand: "Minute Maid",
    category: "Beverages",
    price: 210,
    description: "Delicious real fruit juice, no added preservatives.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/mango-juice.jpg",
    stock: 100,
    tags: ["juice", "mango", "fruit"]
  },
  {
    name: "Kericho Gold Green Tea 25 Bags",
    brand: "Kericho Gold",
    category: "Beverages",
    price: 250,
    description: "Premium Kenyan tea for a healthy lifestyle.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/green-tea.jpg",
    stock: 80,
    tags: ["tea", "green-tea", "healthy"]
  },
  {
    name: "Del Monte Pineapple Juice 1L",
    brand: "Del Monte",
    category: "Beverages",
    price: 230,
    description: "Made from real pineapples, no added sugar.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/pineapple-juice.jpg",
    stock: 90,
    tags: ["juice", "pineapple", "tropical"]
  },
  {
    name: "Tusker Lager 500ml",
    brand: "Tusker",
    category: "Beverages",
    price: 180,
    description: "Kenya's premium lager beer.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/tusker.jpg",
    stock: 120,
    tags: ["beer", "lager", "kenyan"]
  },
  {
    name: "Stoney Tangawizi 300ml",
    brand: "Stoney",
    category: "Beverages",
    price: 60,
    description: "Ginger ale with a Kenyan twist.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/stoney.jpg",
    stock: 200,
    tags: ["soda", "ginger", "refreshing"]
  },

  // Household Items
  {
    name: "Harpic Toilet Cleaner 500ml",
    brand: "Harpic",
    category: "Household",
    price: 210,
    description: "Powerful cleaning, removes stains and kills germs.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/harpic.jpg",
    stock: 70,
    tags: ["cleaning", "bathroom", "household"]
  },
  {
    name: "Sunlight Washing Powder 1kg",
    brand: "Sunlight",
    category: "Household",
    price: 350,
    description: "Tough on stains, gentle on hands. Fresh fragrance.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/sunlight.jpg",
    stock: 100,
    tags: ["laundry", "detergent", "cleaning"]
  },
  {
    name: "Dettol Antiseptic 250ml",
    brand: "Dettol",
    category: "Household",
    price: 180,
    description: "Trusted protection against germs for your family.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/dettol.jpg",
    stock: 80,
    tags: ["antiseptic", "hygiene", "health"]
  },
  {
    name: "Jik Bleach 500ml",
    brand: "Jik",
    category: "Household",
    price: 120,
    description: "Effective for cleaning, whitening, and disinfecting.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/jik.jpg",
    stock: 90,
    tags: ["bleach", "disinfectant", "cleaning"]
  },
  {
    name: "Vim Dishwashing Liquid 750ml",
    brand: "Vim",
    category: "Household",
    price: 190,
    description: "Powerful grease removal for sparkling dishes.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/vim.jpg",
    stock: 110,
    tags: ["dishwashing", "cleaning", "kitchen"]
  },
  {
    name: "Omo Washing Powder 2kg",
    brand: "Omo",
    category: "Household",
    price: 620,
    description: "Deep cleaning power for the whole family.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/omo.jpg",
    stock: 85,
    tags: ["laundry", "detergent", "cleaning"]
  },

  // Personal Care
  {
    name: "Geisha Bar Soap 125g",
    brand: "Geisha",
    category: "Personal Care",
    price: 70,
    description: "Gentle on skin, long-lasting fragrance.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/geisha-soap.jpg",
    stock: 150,
    tags: ["soap", "bathing", "personal-care"]
  },
  {
    name: "Nivea Body Lotion 400ml",
    brand: "Nivea",
    category: "Personal Care",
    price: 520,
    description: "Deep moisture care for smooth, healthy skin.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/nivea-lotion.jpg",
    stock: 60,
    tags: ["lotion", "skincare", "moisturizer"]
  },
  {
    name: "Colgate Toothpaste 100ml",
    brand: "Colgate",
    category: "Personal Care",
    price: 150,
    description: "Fights cavities, freshens breath.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/colgate.jpg",
    stock: 120,
    tags: ["toothpaste", "dental", "oral-care"]
  },
  {
    name: "Always Sanitary Pads (10 pack)",
    brand: "Always",
    category: "Personal Care",
    price: 180,
    description: "Regular sanitary pads for feminine hygiene.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/pads.jpg",
    stock: 100,
    tags: ["feminine-hygiene", "sanitary-pads", "women"]
  },
  {
    name: "Vaseline Petroleum Jelly 250ml",
    brand: "Vaseline",
    category: "Personal Care",
    price: 220,
    description: "Pure petroleum jelly for skin protection.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/vaseline.jpg",
    stock: 90,
    tags: ["skincare", "moisturizer", "protection"]
  },
  {
    name: "Clear Shampoo 400ml",
    brand: "Clear",
    category: "Personal Care",
    price: 380,
    description: "Anti-dandruff shampoo for healthy hair.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/clear-shampoo.jpg",
    stock: 75,
    tags: ["shampoo", "hair-care", "anti-dandruff"]
  },
  {
    name: "Lux Body Wash 500ml",
    brand: "Lux",
    category: "Personal Care",
    price: 420,
    description: "Luxurious body wash for soft skin.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/lux-bodywash.jpg",
    stock: 65,
    tags: ["body-wash", "bathing", "skincare"]
  },

  // Electronics
  {
    name: "Bruhm 32\" Digital TV",
    brand: "Bruhm",
    category: "Electronics",
    price: 14500,
    description: "HD Ready TV with USB, HDMI, energy saving.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/bruhm-tv.jpg",
    stock: 25,
    tags: ["tv", "electronics", "entertainment"]
  },
  {
    name: "Ramtons Microwave 20L",
    brand: "Ramtons",
    category: "Electronics",
    price: 9500,
    description: "Compact, efficient, and easy to use microwave.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/microwave.jpg",
    stock: 20,
    tags: ["microwave", "kitchen", "appliances"]
  },
  {
    name: "Mika Blender 1.5L",
    brand: "Mika",
    category: "Electronics",
    price: 4200,
    description: "Powerful motor, durable glass jar, multi-speed.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/blender.jpg",
    stock: 35,
    tags: ["blender", "kitchen", "appliances"]
  },
  {
    name: "Von Hotpoint Electric Kettle 1.7L",
    brand: "Von Hotpoint",
    category: "Electronics",
    price: 2800,
    description: "Fast boiling, auto shut-off, stainless steel.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/kettle.jpg",
    stock: 40,
    tags: ["kettle", "kitchen", "appliances"]
  },
  {
    name: "Nunix Rechargeable Fan",
    brand: "Nunix",
    category: "Electronics",
    price: 3500,
    description: "Portable rechargeable fan with LED light.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/fan.jpg",
    stock: 30,
    tags: ["fan", "rechargeable", "portable"]
  },

  // Fashion
  {
    name: "Bata School Shoes - Black",
    brand: "Bata",
    category: "Fashion",
    price: 2500,
    description: "Durable leather shoes, comfortable fit for students.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/bata-shoes.jpg",
    stock: 50,
    tags: ["shoes", "school", "fashion"]
  },
  {
    name: "Kiondo Bag - Traditional Woven",
    brand: "Handmade",
    category: "Fashion",
    price: 1800,
    description: "Handwoven sisal bag, authentic African fashion.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/kiondo.jpg",
    stock: 30,
    tags: ["bags", "traditional", "handmade"]
  },
  {
    name: "Khanga Cloth - Vibrant Patterns",
    brand: "Local Artisan",
    category: "Fashion",
    price: 800,
    description: "Colorful Kenyan Khanga for clothing and decor.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/khanga.jpg",
    stock: 40,
    tags: ["fabric", "traditional", "kenyan"]
  },
  {
    name: "Maasai Sandals",
    brand: "Maasai",
    category: "Fashion",
    price: 1500,
    description: "Traditional handmade leather sandals.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/maasai-sandals.jpg",
    stock: 35,
    tags: ["sandals", "traditional", "leather"]
  },
  {
    name: "Lessos (Shuka) - Maasai Blanket",
    brand: "Maasai",
    category: "Fashion",
    price: 1200,
    description: "Traditional Maasai blanket with red patterns.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/shuka.jpg",
    stock: 25,
    tags: ["blanket", "traditional", "maasai"]
  },

  // Additional Kenyan Market Products
  {
    name: "Fresh Fri Cooking Oil 1L",
    brand: "Fresh Fri",
    category: "Staples",
    price: 320,
    description: "Pure vegetable cooking oil.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/oil.jpg",
    stock: 100,
    tags: ["cooking oil", "kitchen", "essentials"]
  },
  {
    name: "Pishori Rice 2kg",
    brand: "Pishori",
    category: "Staples",
    price: 450,
    description: "Premium aromatic Pishori rice.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/rice.jpg",
    stock: 120,
    tags: ["rice", "pishori", "premium"]
  },
  {
    name: "Exe All-Purpose Wheat Flour 2kg",
    brand: "Exe",
    category: "Staples",
    price: 200,
    description: "All-purpose wheat flour for chapati and baking.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/wheatflour.jpg",
    stock: 150,
    tags: ["flour", "wheat", "baking", "chapati"]
  },
  {
    name: "Tamarind Brown Lentils 500g",
    brand: "Tamarind",
    category: "Staples",
    price: 180,
    description: "Brown lentils for making ndengu, a common stew.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/lentils.jpg",
    stock: 100,
    tags: ["lentils", "legumes", "ndengu", "protein"]
  },
  {
    name: "Green Grams 500g",
    brand: "Local",
    category: "Staples",
    price: 150,
    description: "Dried green grams for making a nutritious stew.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/greengrams.jpg",
    stock: 110,
    tags: ["green grams", "legumes", "protein", "ndengu"]
  },
  {
    name: "Royco Mchuzi Mix 50g",
    brand: "Royco",
    category: "Staples",
    price: 35,
    description: "The quintessential Kenyan curry and soup seasoning.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/royco.jpg",
    stock: 200,
    tags: ["seasoning", "mchuzi", "spices", "kenyan"]
  },
  {
    name: "Ketepa Pride Tea 250g",
    brand: "Ketepa",
    category: "Beverages",
    price: 150,
    description: "Kenya's favorite black tea.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/tea.jpg",
    stock: 130,
    tags: ["tea", "beverages", "kenyan", "black tea"]
  },
  {
    name: "Dormans Instant Coffee 100g",
    brand: "Dormans",
    category: "Beverages",
    price: 450,
    description: "Premium Kenyan instant coffee.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/coffee.jpg",
    stock: 80,
    tags: ["coffee", "instant", "kenyan", "premium"]
  },
  {
    name: "Coca-Cola Soda 500ml",
    brand: "Coca-Cola",
    category: "Beverages",
    price: 70,
    description: "Classic fizzy drink.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/coke.jpg",
    stock: 200,
    tags: ["soda", "coca-cola", "beverages", "fizzy"]
  },
  {
    name: "Dasani Bottled Water 1L",
    brand: "Dasani",
    category: "Beverages",
    price: 60,
    description: "Purified bottled water.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/water.jpg",
    stock: 250,
    tags: ["water", "bottled", "purified"]
  },
  {
    name: "Del Monte Mango Juice 1L",
    brand: "Del Monte",
    category: "Beverages",
    price: 180,
    description: "Refreshing mango juice.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/juice.jpg",
    stock: 100,
    tags: ["juice", "mango", "fruit", "refreshing"]
  },
  {
    name: "Brookside Fresh Milk 500ml",
    brand: "Brookside",
    category: "Dairy",
    price: 65,
    description: "Fresh pasteurized milk.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/milk.jpg",
    stock: 120,
    tags: ["milk", "dairy", "fresh", "pasteurized"]
  },
  {
    name: "Daima Yoghurt 250ml",
    brand: "Daima",
    category: "Dairy",
    price: 80,
    description: "Creamy fruit yoghurt.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/yoghurt.jpg",
    stock: 90,
    tags: ["yoghurt", "dairy", "fruit", "creamy"]
  },
  {
    name: "KCC Butter 500g",
    brand: "KCC",
    category: "Dairy",
    price: 320,
    description: "Creamy salted butter for cooking and spreading.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/butter.jpg",
    stock: 70,
    tags: ["butter", "dairy", "cooking", "spreading"]
  },
  {
    name: "Supa Loaf Bread 400g",
    brand: "Supa Loaf",
    category: "Bakery",
    price: 70,
    description: "Soft white bread loaf.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/bread.jpg",
    stock: 150,
    tags: ["bread", "bakery", "white bread", "fresh"]
  },
  {
    name: "Blue Band Margarine 500g",
    brand: "Blue Band",
    category: "Spreads",
    price: 220,
    description: "Classic margarine spread.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/blueband.jpg",
    stock: 100,
    tags: ["margarine", "spread", "classic", "baking"]
  },
  {
    name: "Indomie Instant Noodles 70g",
    brand: "Indomie",
    category: "Snacks",
    price: 50,
    description: "Quick and tasty noodles.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/indomie.jpg",
    stock: 200,
    tags: ["noodles", "instant", "snacks", "quick meal"]
  },
  {
    name: "Krackles Potato Crisps 50g",
    brand: "Krackles",
    category: "Snacks",
    price: 60,
    description: "Crunchy potato crisps.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/crisps.jpg",
    stock: 180,
    tags: ["crisps", "snacks", "potato", "crunchy"]
  },
  {
    name: "Tropical Heat Biscuits (Nice)",
    brand: "Tropical Heat",
    category: "Snacks",
    price: 120,
    description: "Sweet Nice biscuits.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/biscuits.jpg",
    stock: 150,
    tags: ["biscuits", "snacks", "sweet", "nice"]
  },
  {
    name: "Sukuma Wiki (Kale) Bunch",
    brand: "Local Farm",
    category: "Fresh Produce",
    price: 20,
    description: "A large bunch of fresh kale, Kenya's most popular green vegetable.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/sukumawiki.jpg",
    stock: 100,
    tags: ["kale", "sukuma wiki", "vegetables", "fresh", "greens"]
  },
  {
    name: "Ripe Tomatoes 1kg",
    brand: "Local Farm",
    category: "Fresh Produce",
    price: 100,
    description: "Fresh, ripe tomatoes for cooking and salads.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/tomatoes.jpg",
    stock: 120,
    tags: ["tomatoes", "vegetables", "fresh", "cooking"]
  },
  {
    name: "Red Onions 1kg",
    brand: "Local Farm",
    category: "Fresh Produce",
    price: 80,
    description: "Fresh red onions for cooking and garnishing.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/onions.jpg",
    stock: 130,
    tags: ["onions", "vegetables", "fresh", "cooking"]
  },
  {
    name: "Irish Potatoes 1kg",
    brand: "Local Farm",
    category: "Fresh Produce",
    price: 60,
    description: "Fresh potatoes for boiling, frying, or mashing.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/potatoes.jpg",
    stock: 150,
    tags: ["potatoes", "vegetables", "fresh", "cooking"]
  },
  {
    name: "Cooking Bananas (Ndizi) 1kg",
    brand: "Local Farm",
    category: "Fresh Produce",
    price: 90,
    description: "Green bananas for boiling or making matoke.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/ndizi.jpg",
    stock: 80,
    tags: ["bananas", "ndizi", "matoke", "fresh"]
  },
  {
    name: "Beef Mince 500g",
    brand: "Local Butcher",
    category: "Meat & Poultry",
    price: 350,
    description: "Fresh lean beef mince for various dishes.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/beefmince.jpg",
    stock: 50,
    tags: ["beef", "mince", "meat", "fresh"]
  },
  {
    name: "Whole Chicken (Frozen)",
    brand: "Kenchic",
    category: "Meat & Poultry",
    price: 600,
    description: "Frozen whole chicken for roasting or stewing.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/chicken.jpg",
    stock: 60,
    tags: ["chicken", "poultry", "frozen", "whole"]
  },
  {
    name: "Tilapia Fish (Fresh)",
    brand: "Local Fishery",
    category: "Meat & Poultry",
    price: 400,
    description: "Fresh tilapia fish, a Kenyan favorite.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/fish.jpg",
    stock: 40,
    tags: ["fish", "tilapia", "fresh", "seafood"]
  },
  {
    name: "Sunlight Bar Soap 800g",
    brand: "Sunlight",
    category: "Household",
    price: 150,
    description: "Multipurpose laundry bar.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/soap.jpg",
    stock: 120,
    tags: ["soap", "laundry", "household", "cleaning"]
  },
  {
    name: "Ariel Washing Powder 1kg",
    brand: "Ariel",
    category: "Household",
    price: 350,
    description: "Powerful stain remover.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/ariel.jpg",
    stock: 90,
    tags: ["washing powder", "detergent", "household", "stain remover"]
  },
  {
    name: "Omo Detergent 1kg",
    brand: "Omo",
    category: "Household",
    price: 300,
    description: "Popular washing powder for clean clothes.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/omo.jpg",
    stock: 100,
    tags: ["detergent", "washing powder", "household", "cleaning"]
  },
  {
    name: "Bio Soap Bar 150g",
    brand: "Bio",
    category: "Household",
    price: 50,
    description: "Gentle bathing soap for personal hygiene.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/biosoap.jpg",
    stock: 150,
    tags: ["soap", "bathing", "personal care", "gentle"]
  },
  {
    name: "Colgate Toothpaste 100ml",
    brand: "Colgate",
    category: "Personal Care",
    price: 180,
    description: "Fluoride toothpaste for fresh breath.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/colgate.jpg",
    stock: 130,
    tags: ["toothpaste", "dental", "personal care", "fluoride"]
  },
  {
    name: "Geisha Beauty Soap 120g",
    brand: "Geisha",
    category: "Personal Care",
    price: 70,
    description: "Classic beauty soap for skin care.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/geisha.jpg",
    stock: 140,
    tags: ["soap", "beauty", "personal care", "skin care"]
  },
  {
    name: "Lifebuoy Hand Sanitizer 250ml",
    brand: "Lifebuoy",
    category: "Personal Care",
    price: 220,
    description: "Alcohol-based hand sanitizer for protection.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/sanitizer.jpg",
    stock: 110,
    tags: ["sanitizer", "hand sanitizer", "personal care", "protection"]
  },
  {
    name: "Always Sanitary Pads (10 pack)",
    brand: "Always",
    category: "Personal Care",
    price: 180,
    description: "Regular sanitary pads for feminine hygiene.",
    sourceImageUrl: "https://res.cloudinary.com/dvpr5bcrp/image/upload/pads.jpg",
    stock: 100,
    tags: ["sanitary pads", "feminine hygiene", "personal care"]
  }
];

// Category definitions
const categories = [
  { name: 'Staples', description: 'Essential Kenyan food staples and basics' },
  { name: 'Groceries', description: 'Daily grocery items and food products' },
  { name: 'Beverages', description: 'Drinks, juices, and beverages' },
  { name: 'Dairy', description: 'Dairy products including milk, yoghurt, and butter' },
  { name: 'Bakery', description: 'Fresh baked goods and bread products' },
  { name: 'Spreads', description: 'Spreads, jams, and condiments' },
  { name: 'Snacks', description: 'Snacks, crisps, and quick bites' },
  { name: 'Fresh Produce', description: 'Fresh fruits and vegetables' },
  { name: 'Meat & Poultry', description: 'Fresh and frozen meat, poultry, and fish' },
  { name: 'Household', description: 'Household cleaning and maintenance products' },
  { name: 'Personal Care', description: 'Personal hygiene and care products' },
  { name: 'Electronics', description: 'Electronic devices and appliances' },
  { name: 'Fashion', description: 'Clothing, shoes, and accessories' },
  { name: 'Health & Beauty', description: 'Health and beauty products' },
  { name: 'Sports & Fitness', description: 'Sports equipment and fitness gear' }
];

/**
 * Seed database with products and Cloudinary images
 */
async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding process...\n');

    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/easycart');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing products and categories...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Insert categories
    console.log('📁 Inserting categories...');
    await Category.insertMany(categories);
    console.log(`✅ Inserted ${categories.length} categories\n`);

    // Check Cloudinary configuration
    const useCloudinary = isCloudinaryConfigured();
    if (useCloudinary) {
      console.log('☁️  Cloudinary is configured - will upload images');
    } else {
      console.log('⚠️  Cloudinary is not configured - using source URLs directly');
      console.log('   To enable Cloudinary, set these environment variables:');
      console.log('   - CLOUDINARY_CLOUD_NAME');
      console.log('   - CLOUDINARY_API_KEY');
      console.log('   - CLOUDINARY_API_SECRET\n');
    }

    // Process and insert products
    console.log(`🛒 Processing ${kenyanProducts.length} products...\n`);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < kenyanProducts.length; i++) {
      const productData = kenyanProducts[i];
      const productNum = i + 1;
      
      try {
        console.log(`[${productNum}/${kenyanProducts.length}] Processing: ${productData.name}`);
        
        let imageUrl = productData.sourceImageUrl;

        // Upload to Cloudinary if configured
        if (useCloudinary) {
          try {
            console.log(`   ⬆️  Uploading to Cloudinary...`);
            const uploadResult = await uploadFromUrl(productData.sourceImageUrl, {
              folder: 'products'
            });
            imageUrl = uploadResult.url;
            console.log(`   ✅ Uploaded successfully`);
          } catch (uploadError) {
            console.log(`   ⚠️  Upload failed, using source URL: ${uploadError.message}`);
          }
        }

        // Create product document
        const product = new Product({
          name: productData.name,
          brand: productData.brand,
          category: productData.category,
          price: productData.price,
          description: productData.description,
          image: imageUrl,
          images: [{
            url: imageUrl,
            alt: productData.name,
            isPrimary: true
          }],
          stock: productData.stock,
          tags: productData.tags,
          isActive: true,
          isFeatured: productNum <= 8 // Mark first 8 as featured
        });

        await product.save();
        successCount++;
        console.log(`   💾 Saved to database\n`);
        
      } catch (error) {
        failCount++;
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SEEDING SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully seeded: ${successCount} products`);
    console.log(`❌ Failed: ${failCount} products`);
    console.log(`📁 Categories: ${categories.length}`);
    console.log(`☁️  Cloudinary: ${useCloudinary ? 'Enabled' : 'Disabled'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Product seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seed function
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, kenyanProducts, categories };
