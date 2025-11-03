# 🚀 Quick Test Guide - EasyCart

## Run Tests Now

```bash
cd frontend
npx jest --clearCache
npm test
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests |
| `npm test -- --verbose` | Detailed output |
| `npm test -- ProductList.test.js` | Run single file |
| `npm test -- --watch` | Watch mode |
| `npx jest --clearCache` | Clear cache |

## Troubleshooting

### 1. Module not found errors
```bash
cd frontend
npm install
npx jest --clearCache
npm test
```

### 2. See which test fails
```bash
npm test -- --verbose --no-coverage --maxWorkers=1
```

### 3. Run diagnostic
```bash
cd ..
node fix-tests.js
```

### 4. Check specific test
```bash
npm test -- <TestFileName>.test.js --verbose
```

## Files Created

- ✅ `jest.config.js` - Jest configuration
- ✅ `__mocks__/fileMock.js` - Static file mocks
- ✅ `fix-tests.js` - Diagnostic tool
- ✅ `TESTING_FIXES.md` - Full troubleshooting guide
- ✅ `run-tests-debug.bat` - Windows debug script

## Need Help?

1. Run: `node fix-tests.js`
2. Check: `TESTING_FIXES.md`
3. Share the specific error message

## Test Structure

```
frontend/src/
├── __tests__/
│   ├── ProductList.test.js
│   ├── CartContext.test.js
│   └── useProducts.test.js
├── setupTests.js
└── jest.setup.js
```

---

**Quick Start:** `cd frontend && npm test`
