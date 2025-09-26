#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * This script helps diagnose MongoDB connection issues
 */

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns').promises;

const testMongoDBConnection = async () => {
  console.log('🔍 MongoDB Connection Diagnostics\n');
  
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('❌ No MongoDB URI found in environment variables');
    console.log('💡 Please set MONGODB_URI or MONGO_URI in your .env file');
    process.exit(1);
  }
  
  console.log('📋 Configuration:');
  console.log(`   URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  console.log(`   Node ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Node Version: ${process.version}\n`);
  
  // Test 1: URI Format Validation
  console.log('🧪 Test 1: URI Format Validation');
  try {
    const url = new URL(mongoUri);
    console.log(`   ✅ Protocol: ${url.protocol}`);
    console.log(`   ✅ Host: ${url.hostname}`);
    console.log(`   ✅ Database: ${url.pathname.substring(1) || 'default'}`);
    
    if (url.protocol === 'mongodb+srv:') {
      console.log('   ℹ️  Using SRV connection (requires DNS resolution)');
    }
  } catch (error) {
    console.log(`   ❌ Invalid URI format: ${error.message}`);
    process.exit(1);
  }
  
  // Test 2: DNS Resolution (for SRV connections)
  if (mongoUri.startsWith('mongodb+srv://')) {
    console.log('\n🧪 Test 2: DNS Resolution for SRV Records');
    try {
      const url = new URL(mongoUri);
      const srvRecord = `_mongodb._tcp.${url.hostname}`;
      console.log(`   🔍 Checking SRV record: ${srvRecord}`);
      
      const records = await dns.resolveSrv(srvRecord);
      console.log(`   ✅ SRV records found: ${records.length} entries`);
      records.forEach((record, i) => {
        console.log(`      ${i + 1}. ${record.name}:${record.port} (priority: ${record.priority})`);
      });
    } catch (error) {
      console.log(`   ❌ DNS resolution failed: ${error.message}`);
      console.log('   💡 This is likely the cause of the connection issue');
      console.log('   💡 Check your MongoDB Atlas cluster configuration');
    }
  }
  
  // Test 3: MongoDB Connection
  console.log('\n🧪 Test 3: MongoDB Connection Test');
  
  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    family: 4, // Force IPv4
  };
  
  if (mongoUri.startsWith('mongodb+srv://')) {
    mongoOptions.retryWrites = true;
    mongoOptions.w = 'majority';
  }
  
  try {
    console.log('   🔄 Attempting connection...');
    await mongoose.connect(mongoUri, mongoOptions);
    console.log('   ✅ MongoDB connection successful!');
    
    // Test basic operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`   ✅ Database accessible, ${collections.length} collections found`);
    
    await mongoose.disconnect();
    console.log('   ✅ Disconnected cleanly');
    
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    
    if (error.message.includes('querySrv ENOTFOUND')) {
      console.log('\n💡 Troubleshooting SRV DNS Issues:');
      console.log('   1. Verify your MongoDB Atlas cluster is running');
      console.log('   2. Check the connection string from MongoDB Atlas dashboard');
      console.log('   3. Ensure your deployment environment can resolve DNS');
      console.log('   4. Try adding family=4 to force IPv4');
      console.log('   5. Consider using a direct connection string instead of SRV');
    }
    
    process.exit(1);
  }
  
  console.log('\n🎉 All tests passed! MongoDB connection is working correctly.');
};

// Run the test
if (require.main === module) {
  testMongoDBConnection().catch(console.error);
}

module.exports = { testMongoDBConnection };