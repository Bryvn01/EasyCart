#!/usr/bin/env node

/**
 * Test Diagnostic and Fix Script for EasyCart
 * Identifies common test issues and provides fixes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 EasyCart Test Diagnostic Tool\n');

const issues = [];
const fixes = [];

// Check 1: Jest configuration
console.log('1️⃣  Checking Jest configuration...');
const jestConfigFile = path.join(__dirname, 'frontend', 'jest.config.js');
const frontendPackageJson = path.join(__dirname, 'frontend', 'package.json');

if (fs.existsSync(jestConfigFile)) {
  console.log('   ✅ Jest configuration found (jest.config.js)');
} else if (fs.existsSync(frontendPackageJson)) {
  const pkg = JSON.parse(fs.readFileSync(frontendPackageJson, 'utf8'));

  if (pkg.jest) {
    console.log('   ✅ Jest configuration found (package.json)');
  } else {
    issues.push('❌ Missing Jest configuration');
    fixes.push('Create jest.config.js or add jest config to package.json');
  }
} else {
  issues.push('❌ Cannot find frontend/package.json');
}

if (fs.existsSync(frontendPackageJson)) {
  const pkg = JSON.parse(fs.readFileSync(frontendPackageJson, 'utf8'));

  // Check for required dependencies
  const requiredDeps = [
    'jest',
    'babel-jest',
    '@testing-library/react',
    '@testing-library/jest-dom',
    'jest-environment-jsdom'
  ];

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  requiredDeps.forEach(dep => {
    if (!allDeps[dep]) {
      issues.push(`❌ Missing dependency: ${dep}`);
      fixes.push(`npm install --save-dev ${dep}`);
    }
  });
}

// Check 2: Setup files
console.log('\n2️⃣  Checking test setup files...');
const setupFiles = [
  'frontend/src/setupTests.js',
  'frontend/src/jest.setup.js',
  'frontend/babel.config.js'
];

setupFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    issues.push(`❌ Missing: ${file}`);
    fixes.push(`Create ${file}`);
  }
});

// Check 3: Common test file issues
console.log('\n3️⃣  Checking test files...');
const testDir = path.join(__dirname, 'frontend', 'src', '__tests__');
if (fs.existsSync(testDir)) {
  const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'));
  console.log(`   Found ${testFiles.length} test files`);

  testFiles.forEach(file => {
    const content = fs.readFileSync(path.join(testDir, file), 'utf8');

    // Check for common issues
    if (content.includes('import') && !content.includes('React')) {
      if (content.includes('render') || content.includes('screen')) {
        console.log(`   ⚠️  ${file}: May need React import`);
      }
    }
  });
} else {
  issues.push('❌ Test directory not found: frontend/src/__tests__');
}

// Check 4: Module resolution issues
console.log('\n4️⃣  Checking for module resolution issues...');
const nodeModules = path.join(__dirname, 'frontend', 'node_modules');
if (!fs.existsSync(nodeModules)) {
  issues.push('❌ node_modules not found in frontend');
  fixes.push('Run: cd frontend && npm install');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 DIAGNOSTIC SUMMARY');
console.log('='.repeat(60));

if (issues.length === 0) {
  console.log('\n✅ No issues detected!');
  console.log('\nIf tests are still failing, common causes are:');
  console.log('  1. Import path issues (check relative paths)');
  console.log('  2. Missing component files');
  console.log('  3. Async timing issues (use waitFor)');
  console.log('  4. Mock configuration problems');
} else {
  console.log(`\n❌ Found ${issues.length} issue(s):\n`);
  issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));

  console.log('\n🔧 SUGGESTED FIXES:\n');
  fixes.forEach((fix, i) => console.log(`${i + 1}. ${fix}`));
}

console.log('\n' + '='.repeat(60));
console.log('💡 QUICK FIX COMMANDS');
console.log('='.repeat(60));
console.log('\n# Run tests with verbose output:');
console.log('cd frontend && npm test -- --verbose --no-coverage\n');
console.log('# Run a single test file:');
console.log('cd frontend && npm test -- ProductList.test.js\n');
console.log('# Clear Jest cache:');
console.log('cd frontend && npx jest --clearCache\n');
console.log('# Reinstall dependencies:');
console.log('cd frontend && rm -rf node_modules package-lock.json && npm install\n');

console.log('='.repeat(60));
console.log('\n✨ Run this script anytime to diagnose test issues!\n');
