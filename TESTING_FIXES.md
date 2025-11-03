# EasyCart Testing Issues - Quick Fix Guide

## 🚀 Quick Diagnosis

Run the diagnostic script:
```bash
node fix-tests.js
```

## 🔧 Common Issues & Fixes

### Issue 1: "Cannot find module" errors

**Symptoms:**
- `Cannot find module '../components/ProductList'`
- `Cannot find module '../services/api'`

**Fix:**
```bash
cd frontend
npm install
npx jest --clearCache
```

### Issue 2: "ReferenceError: React is not defined"

**Symptoms:**
- Tests fail with `React is not defined`

**Fix:** Ensure `babel.config.js` has automatic runtime:
```javascript
module.exports = {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript'
  ]
};
```

### Issue 3: "jest is not defined" in setupTests.js

**Symptoms:**
- `ReferenceError: jest is not defined`

**Fix:** This is normal - setupTests.js runs in Jest context. Ignore this error in IDE.

### Issue 4: Transform errors with ES modules

**Symptoms:**
- `SyntaxError: Cannot use import statement outside a module`
- Issues with axios, lodash, etc.

**Fix:** Update `package.json` jest config:
```json
"jest": {
  "transform": {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!(axios|lodash)/)"
  ],
  "testEnvironment": "jsdom",
  "setupFiles": ["<rootDir>/src/jest.setup.js"],
  "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"]
}
```

### Issue 5: Missing test dependencies

**Fix:**
```bash
cd frontend
npm install --save-dev \
  jest@30.2.0 \
  babel-jest@30.2.0 \
  @testing-library/react@16.3.0 \
  @testing-library/jest-dom@6.8.0 \
  jest-environment-jsdom@30.2.0
```

### Issue 6: Async test timeouts

**Symptoms:**
- Tests timeout waiting for async operations

**Fix:** Increase timeout in test:
```javascript
test('async test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Issue 7: Component file not found

**Symptoms:**
- Test imports component that doesn't exist

**Fix:** Check if component exists:
```bash
# List all components
ls frontend/src/components/

# If missing, create or update test to use existing component
```

## 🎯 Step-by-Step Fix Process

### Step 1: Clear everything
```bash
cd frontend
npx jest --clearCache
rm -rf node_modules package-lock.json
```

### Step 2: Reinstall dependencies
```bash
npm install
```

### Step 3: Run diagnostic
```bash
cd ..
node fix-tests.js
```

### Step 4: Run tests with verbose output
```bash
cd frontend
npm test -- --verbose --no-coverage
```

### Step 5: Run single test to isolate issue
```bash
npm test -- ProductList.test.js --verbose
```

## 📝 Test File Template

If you need to create a new test, use this template:

```javascript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import YourComponent from '../components/YourComponent';

// Mock dependencies
jest.mock('../services/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('YourComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<YourComponent />, { wrapper: createWrapper() });
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🐛 Debugging Tips

### See which tests are running:
```bash
npm test -- --listTests
```

### Run tests in watch mode:
```bash
npm test -- --watch
```

### Run with coverage:
```bash
npm test -- --coverage
```

### See detailed error stack:
```bash
npm test -- --verbose --no-coverage 2>&1 | tee test-output.txt
```

## 🔍 Specific Error Messages

### "Cannot find module 'react'"
```bash
cd frontend
npm install react react-dom
```

### "Cannot find module '@testing-library/react'"
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### "Cannot find module '@tanstack/react-query'"
```bash
cd frontend
npm install @tanstack/react-query
```

### "SyntaxError: Unexpected token 'export'"
- Check `babel.config.js` exists
- Check `transformIgnorePatterns` in jest config
- Run `npx jest --clearCache`

## ✅ Verify Setup

Run these commands to verify your setup:

```bash
# Check Node version (should be 16+)
node --version

# Check npm version
npm --version

# Check if Jest is installed
cd frontend
npx jest --version

# List test files
npx jest --listTests

# Run tests with minimal output
npm test -- --silent
```

## 📞 Still Having Issues?

1. **Copy specific error message** - Share the first error that appears
2. **Check which test file fails** - Run tests one by one
3. **Verify file paths** - Ensure imports match actual file locations
4. **Check component exists** - Verify the component file is present

### Get detailed output:
```bash
cd frontend
npm test -- --verbose --no-coverage > test-results.txt 2>&1
```

Then share the contents of `test-results.txt` or the first 50 lines.

## 🎓 Understanding Test Structure

```
frontend/
├── src/
│   ├── __tests__/           # Test files
│   │   ├── ProductList.test.js
│   │   └── CartContext.test.js
│   ├── components/          # Components being tested
│   │   └── ProductList.js
│   ├── context/             # Context providers
│   │   └── CartContext.js
│   ├── services/            # API services
│   │   └── api.js
│   ├── setupTests.js        # Jest setup (runs after env)
│   └── jest.setup.js        # Jest setup (runs before env)
├── babel.config.js          # Babel configuration
└── package.json             # Jest configuration
```

## 🚦 Test Status Indicators

- ✅ **PASS** - Test passed successfully
- ❌ **FAIL** - Test failed (check error message)
- ⏭️ **SKIP** - Test was skipped (test.skip)
- ⏱️ **TIMEOUT** - Test took too long (increase timeout)
- 🔄 **RETRY** - Test is being retried

---

**Last Updated:** 2024
**Maintainer:** EasyCart Team
