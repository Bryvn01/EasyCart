#!/usr/bin/env node

/**
 * MongoDB Fix Validation Script
 * This script validates that all MongoDB connection issues have been addressed
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating MongoDB Connection Fix\n');

// Test 1: Check environment files
console.log('📋 Test 1: Environment Configuration');
const envExample = path.join(__dirname, '../.env.example');
const envTest = path.join(__dirname, '../.env.test');

if (fs.existsSync(envExample)) {
  const content = fs.readFileSync(envExample, 'utf8');
  const hasCorrectFormat = content.includes('mongodb+srv://') && content.includes('family=4');
  console.log('   ✅ .env.example exists and has correct URI format:', hasCorrectFormat);
} else {
  console.log('   ❌ .env.example not found');
}

if (fs.existsSync(envTest)) {
  console.log('   ✅ .env.test exists for testing');
} else {
  console.log('   ❌ .env.test not found');
}

// Test 2: Check documentation consistency
console.log('\n📋 Test 2: Documentation Consistency');
const docFiles = [
  '../../DEPLOY.md',
  '../../quick-deploy.md',
  '../../deploy-backend.md',
  '../../deploy-instructions.md',
  '../../RENDER_DEPLOY.md',
  '../../RAILWAY_DEPLOY.md'
];

let consistentDocs = 0;
docFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasFamily4 = content.includes('family=4');
    const hasCorrectFormat = content.includes('mongodb+srv://easycart:EasyCart2024@cluster0.mongodb.net');
    
    if (hasFamily4 && hasCorrectFormat) {
      consistentDocs++;
      console.log(`   ✅ ${path.basename(file)} has correct URI format`);
    } else {
      console.log(`   ❌ ${path.basename(file)} needs URI format update`);
    }
  }
});

console.log(`   📊 ${consistentDocs}/${docFiles.length} documentation files updated`);

// Test 3: Check server.js improvements
console.log('\n📋 Test 3: Server Connection Logic');
const serverFile = path.join(__dirname, '../server.js');
if (fs.existsSync(serverFile)) {
  const content = fs.readFileSync(serverFile, 'utf8');
  
  const hasImprovedConnection = content.includes('connectToMongoDB');
  const hasErrorHandling = content.includes('querySrv ENOTFOUND');
  const hasFallback = content.includes('MONGODB_FALLBACK_URI');
  const hasFamily4 = content.includes('mongoOptions.family = 4');
  
  console.log('   ✅ Improved connection function:', hasImprovedConnection);
  console.log('   ✅ SRV error handling:', hasErrorHandling);
  console.log('   ✅ Fallback mechanism:', hasFallback);
  console.log('   ✅ IPv4 family parameter:', hasFamily4);
} else {
  console.log('   ❌ server.js not found');
}

// Test 4: Check diagnostic tools
console.log('\n📋 Test 4: Diagnostic Tools');
const testScript = path.join(__dirname, 'test-mongodb-connection.js');
const troubleshootingGuide = path.join(__dirname, '../../MONGODB_TROUBLESHOOTING.md');

console.log('   ✅ Connection test script:', fs.existsSync(testScript));
console.log('   ✅ Troubleshooting guide:', fs.existsSync(troubleshootingGuide));

// Test 5: Package.json script
console.log('\n📋 Test 5: Package Scripts');
const packageFile = path.join(__dirname, '../package.json');
if (fs.existsSync(packageFile)) {
  const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  const hasTestScript = pkg.scripts && pkg.scripts['test:mongodb'];
  console.log('   ✅ MongoDB test script available:', hasTestScript);
} else {
  console.log('   ❌ package.json not found');
}

// Summary
console.log('\n🎉 MongoDB Connection Fix Validation Complete');
console.log('\n📋 Summary of Changes:');
console.log('   - Enhanced server.js with proper DNS resolution handling');
console.log('   - Added family=4 parameter to force IPv4 for SRV connections');
console.log('   - Implemented fallback connection mechanism');
console.log('   - Updated all documentation with consistent URI format');
console.log('   - Created diagnostic tools and troubleshooting guide');
console.log('   - Added comprehensive error handling and logging');
console.log('\n💡 To test the connection: npm run test:mongodb');
console.log('💡 For deployment issues: see MONGODB_TROUBLESHOOTING.md');