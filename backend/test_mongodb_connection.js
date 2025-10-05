#!/usr/bin/env node
/**
 * MongoDB Connection Test Script
 * Tests connection to MongoDB Atlas and verifies easycart.products collection
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(emoji, color, message) {
  console.log(`${emoji} ${color}${message}${colors.reset}`);
}

async function testMongoDBConnection() {
  console.log('\n' + '='.repeat(70));
  log('🔍', colors.cyan, 'MongoDB Atlas Connection Test - EasyCart');
  console.log('='.repeat(70) + '\n');

  // Step 1: Check MONGO_URI environment variable
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    log('❌', colors.red, 'ERROR: MONGO_URI not found in environment variables');
    log('💡', colors.yellow, 'Solution: Set MONGO_URI in .env file or Render dashboard');
    console.log('\nExpected format:');
    console.log('mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  // Mask password in URI for safe logging
  const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
  log('✅', colors.green, 'MONGO_URI found in environment');
  console.log(`   URI: ${maskedUri}\n`);

  // Step 2: Validate URI format
  if (!mongoUri.includes('mongodb')) {
    log('❌', colors.red, 'ERROR: Invalid MONGO_URI format');
    process.exit(1);
  }

  // Check database name in URI
  const dbNameMatch = mongoUri.match(/\.net\/([^?]+)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
  
  console.log('📊 Database Configuration:');
  console.log(`   Database name: ${dbName}`);
  
  if (dbName === 'easycart') {
    log('   ✅', colors.green, 'Correct database name (easycart)');
  } else if (dbName === 'admin' || dbName === 'test' || dbName === '') {
    log('   ❌', colors.red, `Wrong database name: ${dbName}`);
    log('   💡', colors.yellow, 'Database should be "easycart"');
  } else {
    log('   ⚠️ ', colors.yellow, `Non-standard database name: ${dbName}`);
  }
  console.log();

  // Step 3: Test connection
  log('🔗', colors.cyan, 'Attempting to connect to MongoDB...');
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });

    log('✅', colors.green, 'Successfully connected to MongoDB Atlas!');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Connection state: ${mongoose.connection.readyState} (1=connected)\n`);

    // Step 4: Load Product model and test queries
    log('📦', colors.cyan, 'Loading Product model...');
    const Product = require('./models/Product');
    log('✅', colors.green, 'Product model loaded successfully\n');

    // Step 5: Count products
    log('🔢', colors.cyan, 'Counting products in database...');
    const totalProducts = await Product.countDocuments();
    
    console.log(`   Total products: ${totalProducts}`);
    
    if (totalProducts === 37) {
      log('   ✅', colors.green, 'PERFECT: Found exactly 37 products (expected count)');
    } else if (totalProducts === 0) {
      log('   ⚠️ ', colors.yellow, 'WARNING: 0 products found - database not seeded');
      log('   💡', colors.yellow, 'Run: curl -X POST http://localhost:5000/api/seed');
    } else if (totalProducts > 0) {
      log('   ℹ️ ', colors.blue, `Found ${totalProducts} products in database`);
    } else {
      log('   ⚠️ ', colors.yellow, 'No products found');
    }
    console.log();

    // Step 6: Get sample products
    if (totalProducts > 0) {
      log('📋', colors.cyan, 'Fetching sample products...');
      const sampleProducts = await Product.find().limit(5).select('name price category brand').lean();
      
      console.log('   Sample products:');
      sampleProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      Price: KES ${product.price.toLocaleString()}`);
        console.log(`      Category: ${product.category}`);
        console.log(`      Brand: ${product.brand}\n`);
      });
    }

    // Step 7: Check collections
    log('📂', colors.cyan, 'Checking collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`   Collections found: ${collectionNames.join(', ')}`);
    
    if (collectionNames.includes('products')) {
      log('   ✅', colors.green, 'products collection exists');
    } else {
      log('   ❌', colors.red, 'products collection NOT found');
    }
    
    if (collectionNames.includes('categories')) {
      log('   ✅', colors.green, 'categories collection exists');
    }
    console.log();

    // Final summary
    console.log('='.repeat(70));
    log('🎉', colors.green, 'MongoDB Connection Test PASSED');
    console.log('='.repeat(70) + '\n');

    console.log('✅ Final Checklist:');
    console.log(`   [${dbName === 'easycart' ? '✅' : '❌'}] Database name is 'easycart'`);
    console.log(`   [${mongoose.connection.readyState === 1 ? '✅' : '❌'}] MongoDB connected`);
    console.log(`   [${collectionNames.includes('products') ? '✅' : '❌'}] products collection exists`);
    console.log(`   [${totalProducts > 0 ? '✅' : '⚠️ '}] Products in database: ${totalProducts}`);
    console.log();

    if (totalProducts === 0) {
      console.log('⚠️  Next Step: Seed the database');
      console.log('   Run: curl -X POST http://localhost:5000/api/seed');
      console.log('   Or: node routes/seed.js\n');
    } else {
      console.log('✅ Backend is correctly configured!');
      console.log('   Products can be fetched via: /api/products\n');
    }

  } catch (error) {
    console.log();
    log('❌', colors.red, 'MongoDB Connection Failed');
    console.log(`   Error: ${error.message}\n`);

    console.log('🔧 Troubleshooting:');
    
    if (error.message.includes('authentication failed')) {
      console.log('   ❌ Authentication error - check username/password');
      console.log('   💡 Verify credentials in MongoDB Atlas dashboard');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('   ❌ Network error - cannot reach MongoDB Atlas');
      console.log('   💡 Check internet connection and firewall settings');
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('   ❌ IP whitelist error');
      console.log('   💡 Add 0.0.0.0/0 to IP whitelist in MongoDB Atlas');
    } else {
      console.log('   ❌ Unknown error - check MONGO_URI format');
      console.log('   💡 Expected format:');
      console.log('      mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart?retryWrites=true&w=majority');
    }
    console.log();

    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log('🔌', colors.blue, 'MongoDB connection closed');
  }
}

// Run the test
testMongoDBConnection().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
