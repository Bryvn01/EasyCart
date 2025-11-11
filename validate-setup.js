#!/usr/bin/env node

/**
 * EasyCart Setup Validator
 *
 * This script validates that your EasyCart setup is correct for products to display.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 EasyCart Setup Validator\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let hasErrors = false;
let hasWarnings = false;

// Check backend .env
console.log('1️⃣  Checking Backend Configuration...');
const backendEnvPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(backendEnvPath)) {
  console.log('   ✅ backend/.env exists');

  const envContent = fs.readFileSync(backendEnvPath, 'utf8');

  // Check MONGO_URI
  if (envContent.includes('MONGO_URI=')) {
    const mongoUriMatch = envContent.match(/MONGO_URI=(.+)/);
    if (mongoUriMatch) {
      const mongoUri = mongoUriMatch[1].trim();
      if (mongoUri.includes('easycart')) {
        console.log('   ✅ MONGO_URI configured with "easycart" database');
      } else {
        console.log('   ❌ MONGO_URI does not include "easycart" database');
        console.log('      Current:', mongoUri);
        console.log('      Required: Database name must be "easycart"');
        hasErrors = true;
      }
    }
  } else {
    console.log('   ❌ MONGO_URI not found in backend/.env');
    hasErrors = true;
  }
} else {
  console.log('   ⚠️  backend/.env not found');
  console.log('      Copy backend/.env.example to backend/.env and configure it');
  hasWarnings = true;
}
console.log();

// Check frontend .env
console.log('2️⃣  Checking Frontend Configuration...');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
if (fs.existsSync(frontendEnvPath)) {
  console.log('   ✅ frontend/.env exists');

  const envContent = fs.readFileSync(frontendEnvPath, 'utf8');

  // Check REACT_APP_API_URL
  if (envContent.includes('REACT_APP_API_URL=')) {
    const apiUrlMatch = envContent.match(/REACT_APP_API_URL=(.+)/);
    if (apiUrlMatch) {
      const apiUrl = apiUrlMatch[1].trim();
      if (apiUrl.includes(':5000')) {
        console.log('   ✅ REACT_APP_API_URL points to port 5000 (Node.js backend)');
      } else if (apiUrl.includes(':8000')) {
        console.log('   ❌ REACT_APP_API_URL points to port 8000 (Django, deprecated)');
        console.log('      Current:', apiUrl);
        console.log('      Required: http://localhost:5000/api (for local dev)');
        hasErrors = true;
      } else {
        console.log('   ⚠️  REACT_APP_API_URL uses non-standard port');
        console.log('      Current:', apiUrl);
        hasWarnings = true;
      }
    }
  } else {
    console.log('   ❌ REACT_APP_API_URL not found in frontend/.env');
    hasErrors = true;
  }
} else {
  console.log('   ⚠️  frontend/.env not found');
  console.log('      Copy frontend/.env.example to frontend/.env');
  hasWarnings = true;
}
console.log();

// Check if dependencies are installed
console.log('3️⃣  Checking Dependencies...');
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');

if (fs.existsSync(backendNodeModules)) {
  console.log('   ✅ Backend dependencies installed');
} else {
  console.log('   ⚠️  Backend dependencies not installed');
  console.log('      Run: cd backend && npm install');
  hasWarnings = true;
}

if (fs.existsSync(frontendNodeModules)) {
  console.log('   ✅ Frontend dependencies installed');
} else {
  console.log('   ⚠️  Frontend dependencies not installed');
  console.log('      Run: cd frontend && npm install');
  hasWarnings = true;
}
console.log();

// Check seeding script
console.log('4️⃣  Checking Seeding Script...');
const seedScriptPath = path.join(__dirname, 'backend', 'scripts', 'seedProducts.js');
if (fs.existsSync(seedScriptPath)) {
  console.log('   ✅ Seeding script exists');

  // Check if script has idempotent support
  const scriptContent = fs.readFileSync(seedScriptPath, 'utf8');
  if (scriptContent.includes('--idempotent')) {
    console.log('   ✅ Idempotent mode supported');
  } else {
    console.log('   ⚠️  Idempotent mode not supported (using older version)');
    hasWarnings = true;
  }
} else {
  console.log('   ❌ Seeding script not found');
  hasErrors = true;
}
console.log();

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
if (hasErrors) {
  console.log('❌ VALIDATION FAILED');
  console.log('   Please fix the errors above before continuing.\n');
  console.log('📖 Documentation:');
  console.log('   - SEEDING_GUIDE.md');
  console.log('   - PRODUCTS_DISPLAY_FIX.md\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  VALIDATION COMPLETED WITH WARNINGS');
  console.log('   Your setup should work, but consider addressing the warnings above.\n');
  console.log('📖 Documentation:');
  console.log('   - SEEDING_GUIDE.md');
  console.log('   - PRODUCTS_DISPLAY_FIX.md\n');
  process.exit(0);
} else {
  console.log('✅ VALIDATION PASSED');
  console.log('   Your EasyCart setup looks good!\n');
  console.log('🚀 Next Steps:');
  console.log('   1. Seed the database: cd backend && npm run seed:idempotent');
  console.log('   2. Start backend: cd backend && npm start');
  console.log('   3. Start frontend: cd frontend && npm start');
  console.log('   4. Navigate to: http://localhost:3000/products\n');
  process.exit(0);
}
