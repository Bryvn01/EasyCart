#!/usr/bin/env node

/**
 * Seed Kenyan Products Script
 * 
 * This script seeds the MongoDB database with authentic Kenyan retail products
 * from the products_kenya.json data file. It optionally uploads product images 
 * to Cloudinary for optimal delivery.
 * 
 * Usage:
 *   npm run seed:kenya
 *   OR
 *   node scripts/seedKenyaProducts.js
 * 
 * Environment Variables Required:
 *   - MONGO_URI: MongoDB connection string
 * 
 * Optional (for Cloudinary image upload):
 *   - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 *   - CLOUDINARY_API_KEY: Your Cloudinary API key
 *   - CLOUDINARY_API_SECRET: Your Cloudinary API secret
 * 
 * Features:
 *   - Non-destructive: Only adds products, doesn't delete existing data
 *   - Supports Cloudinary image uploads (optional)
 *   - Falls back to source URLs if Cloudinary is not configured
 *   - Detailed progress logging with error handling
 *   - Creates necessary categories automatically
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

// Import Cloudinary utility if available
let uploadFromUrl;
try {
  const cloudinary = require('../utils/cloudinary');
  uploadFromUrl = cloudinary.uploadFromUrl;
} catch (error) {
  // Cloudinary utility not available, will use source URLs
  uploadFromUrl = null;
}

/**
 * Check if Cloudinary is configured
 * @returns {boolean} True if all Cloudinary credentials are present
 */
const isCloudinaryConfigured = () => {
  return !!(
    uploadFromUrl &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Load Kenyan products from JSON file
 * @returns {Array} Array of product objects
 */
const loadKenyaProducts = () => {
  try {
    const dataPath = path.join(__dirname, '../data/products_kenya.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Failed to load products data:', error.message);
    process.exit(1);
  }
};

/**
 * Extract unique categories from products
 * @param {Array} products - Array of product objects
 * @returns {Array} Array of unique category objects
 */
const extractCategories = (products) => {
  const categorySet = new Set();
  const categoryDescriptions = {
    'Staples': 'Essential Kenyan food staples and basics',
    'Groceries': 'Daily grocery items and food products',
    'Beverages': 'Drinks, juices, and beverages',
    'Household': 'Household cleaning and maintenance products',
    'Personal Care': 'Personal hygiene and care products',
    'Electronics': 'Electronic devices and appliances',
    'Fashion': 'Clothing, shoes, and accessories',
    'Health & Beauty': 'Health and beauty products',
    'Sports & Fitness': 'Sports equipment and fitness gear'
  };

  products.forEach(product => {
    if (product.category) {
      categorySet.add(product.category);
    }
  });

  return Array.from(categorySet).map(name => ({
    name,
    description: categoryDescriptions[name] || `${name} products`
  }));
};

/**
 * Seed database with Kenyan products
 */
async function seedKenyaProducts() {
  try {
    console.log('🇰🇪 Starting Kenyan products seeding process...\n');

    // Load products from JSON file
    console.log('📂 Loading products from data file...');
    const kenyaProducts = loadKenyaProducts();
    console.log(`✅ Loaded ${kenyaProducts.length} products from JSON\n`);

    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/easycart';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Extract and ensure categories exist
    console.log('📁 Processing categories...');
    const categories = extractCategories(kenyaProducts);
    
    // Insert categories that don't already exist
    for (const category of categories) {
      const existingCategory = await Category.findOne({ name: category.name });
      if (!existingCategory) {
        await Category.create(category);
        console.log(`   ➕ Created category: ${category.name}`);
      } else {
        console.log(`   ✓ Category already exists: ${category.name}`);
      }
    }
    console.log(`✅ Processed ${categories.length} categories\n`);

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
    console.log(`🛒 Processing ${kenyaProducts.length} products...\n`);
    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;

    for (let i = 0; i < kenyaProducts.length; i++) {
      const productData = kenyaProducts[i];
      const productNum = i + 1;
      
      try {
        console.log(`[${productNum}/${kenyaProducts.length}] Processing: ${productData.name}`);
        
        // Check if product already exists (by name and brand)
        const existingProduct = await Product.findOne({
          name: productData.name,
          brand: productData.brand
        });

        if (existingProduct) {
          console.log(`   ⏭️  Product already exists, skipping\n`);
          skippedCount++;
          continue;
        }

        let imageUrl = productData.sourceImageUrl;

        // Upload to Cloudinary if configured
        if (useCloudinary) {
          try {
            console.log(`   ⬆️  Uploading to Cloudinary...`);
            const uploadResult = await uploadFromUrl(productData.sourceImageUrl, {
              folder: 'products/kenya'
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
          tags: productData.tags || [],
          isActive: true,
          isFeatured: false
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
    console.log(`⏭️  Skipped (already exist): ${skippedCount} products`);
    console.log(`❌ Failed: ${failCount} products`);
    console.log(`📁 Categories processed: ${categories.length}`);
    console.log(`☁️  Cloudinary: ${useCloudinary ? 'Enabled' : 'Disabled'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Kenyan products seeding completed successfully!');
    
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

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedKenyaProducts();
}

module.exports = { seedKenyaProducts };
