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
  // Groceries & Food
  {
    name: "Ajab All Purpose Flour 2kg",
    brand: "Ajab",
    category: "Groceries",
    price: 320,
    description: "Ajab All Purpose Flour 2kg - perfect for chapati, mandazi, and baking. Soft, high quality, and trusted by Kenyan families.",
    sourceImageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80",
    stock: 100,
    tags: ["flour", "baking", "kenyan"]
  },
  {
    name: "Mumias Sugar 2kg",
    brand: "Mumias",
    category: "Groceries",
    price: 440,
    description: "Mumias Sugar 2kg - Kenya's favorite sugar for tea and baking. Pure, sweet, and locally produced.",
    sourceImageUrl: "https://images.unsplash.com/photo-1563171085-3e1363ca5c32?w=800&q=80",
    stock: 120,
    tags: ["sugar", "sweetener", "kenyan"]
  },
  {
    name: "Fresh Fri Cooking Oil 3L",
    brand: "Fresh Fri",
    category: "Groceries",
    price: 950,
    description: "Fresh Fri Pure Cooking Oil 3L - cholesterol free, ideal for deep frying and cooking.",
    sourceImageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
    stock: 60,
    tags: ["cooking-oil", "kitchen", "essentials"]
  },
  {
    name: "Brookside Fresh Milk 500ml",
    brand: "Brookside",
    category: "Groceries",
    price: 65,
    description: "Brookside Fresh Milk 500ml - pasteurized, creamy, and nutritious. Perfect for tea and drinking.",
    sourceImageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80",
    stock: 80,
    tags: ["dairy", "milk", "fresh"]
  },
  {
    name: "Ketepa Pride Tea Leaves 250g",
    brand: "Ketepa",
    category: "Groceries",
    price: 280,
    description: "Ketepa Pride Tea Leaves 250g - authentic Kenyan tea from the highlands. Rich flavor and aroma.",
    sourceImageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
    stock: 70,
    tags: ["tea", "beverages", "kenyan"]
  },
  {
    name: "Exe Wholemeal Atta 2kg",
    brand: "Exe",
    category: "Groceries",
    price: 340,
    description: "Exe Wholemeal Atta 2kg - nutritious, high-fiber flour for healthy chapatis and rotis.",
    sourceImageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    stock: 90,
    tags: ["flour", "wholemeal", "healthy"]
  },
  {
    name: "Tropical Heat Maize Meal 2kg",
    brand: "Tropical Heat",
    category: "Groceries",
    price: 180,
    description: "Tropical Heat Maize Meal 2kg - traditional Kenyan staple for ugali. Finely milled and nutritious.",
    sourceImageUrl: "https://images.unsplash.com/photo-1584253687451-2b8a2767eb37?w=800&q=80",
    stock: 150,
    tags: ["maize", "ugali", "staple"]
  },
  {
    name: "Kenya Cane Sugar 1kg",
    brand: "Kenya Cane",
    category: "Groceries",
    price: 230,
    description: "Kenya Cane Brown Sugar 1kg - natural brown sugar with rich molasses flavor.",
    sourceImageUrl: "https://images.unsplash.com/photo-1587241321921-91a834d82f0e?w=800&q=80",
    stock: 100,
    tags: ["sugar", "brown-sugar", "natural"]
  },

  // Beverages
  {
    name: "Coca-Cola 1.25L",
    brand: "Coca-Cola",
    category: "Beverages",
    price: 120,
    description: "Coca-Cola 1.25L - Kenya's favorite soft drink. Refreshing and perfect for any occasion.",
    sourceImageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80",
    stock: 90,
    tags: ["soda", "beverages", "refreshing"]
  },
  {
    name: "Minute Maid Mango Juice 1L",
    brand: "Minute Maid",
    category: "Beverages",
    price: 210,
    description: "Minute Maid Mango Juice 1L - delicious, real fruit juice. No added preservatives.",
    sourceImageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
    stock: 60,
    tags: ["juice", "mango", "fruit"]
  },
  {
    name: "Kericho Gold Green Tea 25 Bags",
    brand: "Kericho Gold",
    category: "Beverages",
    price: 250,
    description: "Kericho Gold Green Tea 25 Bags - premium Kenyan tea for a healthy lifestyle.",
    sourceImageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
    stock: 40,
    tags: ["tea", "green-tea", "healthy"]
  },
  {
    name: "Del Monte Pineapple Juice 1L",
    brand: "Del Monte",
    category: "Beverages",
    price: 230,
    description: "Del Monte Pineapple Juice 1L - made from real pineapples, no added sugar.",
    sourceImageUrl: "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=800&q=80",
    stock: 55,
    tags: ["juice", "pineapple", "tropical"]
  },

  // Household Items
  {
    name: "Harpic Toilet Cleaner 500ml",
    brand: "Harpic",
    category: "Household",
    price: 210,
    description: "Harpic Toilet Cleaner 500ml - powerful cleaning, removes stains and kills germs.",
    sourceImageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=80",
    stock: 40,
    tags: ["cleaning", "bathroom", "household"]
  },
  {
    name: "Sunlight Washing Powder 1kg",
    brand: "Sunlight",
    category: "Household",
    price: 350,
    description: "Sunlight Washing Powder 1kg - tough on stains, gentle on hands. Fresh fragrance.",
    sourceImageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80",
    stock: 60,
    tags: ["laundry", "detergent", "cleaning"]
  },
  {
    name: "Dettol Antiseptic 250ml",
    brand: "Dettol",
    category: "Household",
    price: 180,
    description: "Dettol Antiseptic 250ml - trusted protection against germs for your family.",
    sourceImageUrl: "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=800&q=80",
    stock: 50,
    tags: ["antiseptic", "hygiene", "health"]
  },
  {
    name: "Jik Bleach 500ml",
    brand: "Jik",
    category: "Household",
    price: 120,
    description: "Jik Bleach 500ml - effective for cleaning, whitening, and disinfecting.",
    sourceImageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80",
    stock: 70,
    tags: ["bleach", "disinfectant", "cleaning"]
  },

  // Personal Care
  {
    name: "Geisha Bar Soap 125g",
    brand: "Geisha",
    category: "Personal Care",
    price: 70,
    description: "Geisha Bar Soap 125g - gentle on skin, long-lasting fragrance.",
    sourceImageUrl: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
    stock: 100,
    tags: ["soap", "bathing", "personal-care"]
  },
  {
    name: "Nivea Body Lotion 400ml",
    brand: "Nivea",
    category: "Personal Care",
    price: 520,
    description: "Nivea Body Lotion 400ml - deep moisture care for smooth, healthy skin.",
    sourceImageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    stock: 30,
    tags: ["lotion", "skincare", "moisturizer"]
  },
  {
    name: "Colgate Toothpaste 100ml",
    brand: "Colgate",
    category: "Personal Care",
    price: 150,
    description: "Colgate Toothpaste 100ml - fights cavities, freshens breath.",
    sourceImageUrl: "https://images.unsplash.com/photo-1622368443980-e3f1acd66b3a?w=800&q=80",
    stock: 80,
    tags: ["toothpaste", "dental", "oral-care"]
  },
  {
    name: "Always Sanitary Pads 8pcs",
    brand: "Always",
    category: "Personal Care",
    price: 120,
    description: "Always Sanitary Pads 8pcs - comfort and protection for women.",
    sourceImageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80",
    stock: 60,
    tags: ["feminine-hygiene", "sanitary-pads", "women"]
  },

  // Electronics
  {
    name: "Bruhm 32\" Digital TV",
    brand: "Bruhm",
    category: "Electronics",
    price: 14500,
    description: "Bruhm 32-inch Digital TV - HD Ready, USB, HDMI, energy saving.",
    sourceImageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80",
    stock: 20,
    tags: ["tv", "electronics", "entertainment"]
  },
  {
    name: "Ramtons Microwave 20L",
    brand: "Ramtons",
    category: "Electronics",
    price: 9500,
    description: "Ramtons Microwave 20L - compact, efficient, and easy to use.",
    sourceImageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80",
    stock: 15,
    tags: ["microwave", "kitchen", "appliances"]
  },
  {
    name: "Mika Blender 1.5L",
    brand: "Mika",
    category: "Electronics",
    price: 4200,
    description: "Mika Blender 1.5L - powerful motor, durable glass jar, multi-speed.",
    sourceImageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80",
    stock: 25,
    tags: ["blender", "kitchen", "appliances"]
  },
  {
    name: "Von Hotpoint Electric Kettle 1.7L",
    brand: "Von Hotpoint",
    category: "Electronics",
    price: 2800,
    description: "Von Hotpoint Electric Kettle 1.7L - fast boiling, auto shut-off, stainless steel.",
    sourceImageUrl: "https://images.unsplash.com/photo-1606929254400-6bdef0c1ee37?w=800&q=80",
    stock: 35,
    tags: ["kettle", "kitchen", "appliances"]
  },

  // Fashion
  {
    name: "Bata School Shoes - Black",
    brand: "Bata",
    category: "Fashion",
    price: 2500,
    description: "Bata School Shoes - durable leather, comfortable fit for students.",
    sourceImageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
    stock: 45,
    tags: ["shoes", "school", "fashion"]
  },
  {
    name: "Kiondo Bag - Traditional Woven",
    brand: "Handmade",
    category: "Fashion",
    price: 1800,
    description: "Traditional Kenyan Kiondo Bag - handwoven sisal, authentic African fashion.",
    sourceImageUrl: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
    stock: 20,
    tags: ["bags", "traditional", "handmade"]
  },
  {
    name: "Khanga Cloth - Vibrant Patterns",
    brand: "Local Artisan",
    category: "Fashion",
    price: 800,
    description: "Authentic Kenyan Khanga - colorful patterns, versatile fabric for clothing and decor.",
    sourceImageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    stock: 30,
    tags: ["fabric", "traditional", "kenyan"]
  }
];

// Category definitions
const categories = [
  { name: 'Groceries', description: 'Daily grocery items and food products' },
  { name: 'Beverages', description: 'Drinks, juices, and beverages' },
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
