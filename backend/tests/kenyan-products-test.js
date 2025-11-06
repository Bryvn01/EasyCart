#!/usr/bin/env node

/**
 * Kenyan Products Integration Test
 *
 * This script validates the Kenyan product seeding data structure
 * and ensures all required fields are present.
 */

const { kenyanProducts, categories } = require('../scripts/seedProducts.js');

let allTestsPassed = true;

console.log('🧪 Kenyan Products Integration Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Verify categories exist
console.log('Test 1: Categories');
if (categories && Array.isArray(categories) && categories.length > 0) {
  console.log('  ✅ Categories array exists and has items');
  console.log(`  ✅ Total categories: ${categories.length}`);
} else {
  console.log('  ❌ Categories array is missing or empty');
  allTestsPassed = false;
}

// Test 2: Verify Staples category exists
const staplesCategory = categories.find(c => c.name === 'Staples');
if (staplesCategory) {
  console.log('  ✅ Staples category exists');
  console.log(`  ✅ Description: "${staplesCategory.description}"`);
} else {
  console.log('  ❌ Staples category not found');
  allTestsPassed = false;
}

console.log();

// Test 3: Verify products exist
console.log('Test 2: Products');
if (kenyanProducts && Array.isArray(kenyanProducts) && kenyanProducts.length > 0) {
  console.log('  ✅ Products array exists and has items');
  console.log(`  ✅ Total products: ${kenyanProducts.length}`);
} else {
  console.log('  ❌ Products array is missing or empty');
  allTestsPassed = false;
}

// Test 4: Verify minimum product count (40+)
if (kenyanProducts.length >= 40) {
  console.log(`  ✅ Has 40+ products (${kenyanProducts.length})`);
} else {
  console.log(`  ❌ Less than 40 products (${kenyanProducts.length})`);
  allTestsPassed = false;
}

console.log();

// Test 5: Verify all products have required fields
console.log('Test 3: Required Fields');
const requiredFields = ['name', 'brand', 'category', 'price', 'description', 'sourceImageUrl', 'stock', 'tags'];
const missingFields = new Set();

kenyanProducts.forEach((product, index) => {
  requiredFields.forEach(field => {
    if (!(field in product) || product[field] === undefined || product[field] === null) {
      missingFields.add(field);
      if (missingFields.size <= 5) { // Only show first 5 errors
        console.log(`  ❌ Product ${index + 1} ("${product.name}") is missing field: ${field}`);
      }
    }
  });
});

if (missingFields.size === 0) {
  console.log('  ✅ All products have all required fields');
} else {
  console.log(`  ❌ ${missingFields.size} field(s) are missing in some products`);
  allTestsPassed = false;
}

console.log();

// Test 6: Verify Staples products exist
console.log('Test 4: Staples Category Products');
const staplesProducts = kenyanProducts.filter(p => p.category === 'Staples');
if (staplesProducts.length > 0) {
  console.log(`  ✅ Found ${staplesProducts.length} Staples products`);
  console.log('  Sample Staples products:');
  staplesProducts.slice(0, 3).forEach(p => {
    console.log(`    - ${p.name} (KSh ${p.price})`);
  });
} else {
  console.log('  ❌ No products found in Staples category');
  allTestsPassed = false;
}

console.log();

// Test 7: Verify specific required products
console.log('Test 5: Required Kenyan Products');
const requiredProducts = [
  'Jogoo Maize Flour 2kg',
  'Kabras Sugar 2kg',
  'Always Sanitary Pads (10 pack)'
];

requiredProducts.forEach(productName => {
  const product = kenyanProducts.find(p => p.name === productName);
  if (product) {
    console.log(`  ✅ "${productName}" exists (KSh ${product.price})`);
  } else {
    console.log(`  ❌ "${productName}" not found`);
    allTestsPassed = false;
  }
});

console.log();

// Test 8: Verify Cloudinary URLs
console.log('Test 6: Cloudinary URLs');
const cloudinaryPattern = /https:\/\/res\.cloudinary\.com\/dvpr5bcrp\//;
const hasCloudinaryUrls = kenyanProducts.every(p => cloudinaryPattern.test(p.sourceImageUrl));
if (hasCloudinaryUrls) {
  console.log('  ✅ All products use Cloudinary URLs (dvpr5bcrp)');
} else {
  const nonCloudinary = kenyanProducts.filter(p => !cloudinaryPattern.test(p.sourceImageUrl));
  console.log(`  ⚠️  ${nonCloudinary.length} product(s) don't use Cloudinary URLs`);
  if (nonCloudinary.length <= 3) {
    nonCloudinary.forEach(p => console.log(`    - ${p.name}: ${p.sourceImageUrl}`));
  }
}

console.log();

// Test 9: Price range validation
console.log('Test 7: Price Range (KSh)');
const prices = kenyanProducts.map(p => p.price);
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);
const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

console.log(`  ✅ Min price: KSh ${minPrice}`);
console.log(`  ✅ Max price: KSh ${maxPrice}`);
console.log(`  ✅ Average price: KSh ${avgPrice}`);

if (minPrice > 0 && maxPrice > minPrice) {
  console.log('  ✅ Price range is valid');
} else {
  console.log('  ❌ Invalid price range');
  allTestsPassed = false;
}

console.log();

// Test 10: Stock validation
console.log('Test 8: Stock Levels');
const hasValidStock = kenyanProducts.every(p => typeof p.stock === 'number' && p.stock >= 0);
if (hasValidStock) {
  console.log('  ✅ All products have valid stock levels');
} else {
  console.log('  ❌ Some products have invalid stock levels');
  allTestsPassed = false;
}

console.log();

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
if (allTestsPassed) {
  console.log('✅ All tests passed! Kenyan products integration is ready.\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the errors above.\n');
  process.exit(1);
}
