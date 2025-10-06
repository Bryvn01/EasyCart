# EasyCart Smoke Tests

This directory contains Playwright end-to-end smoke tests that verify critical functionality of the EasyCart application.

## What's Tested

The smoke tests verify:

1. **No 404 Errors**: Homepage doesn't show "requested resource was not found" text
2. **Single Footer**: Only one `<footer>` element exists on the page
3. **Static Assets**: All payment brand logos (`/assets/brands/*`) return 200
4. **API Routing**: All API calls are namespaced under `/api/v1/`
5. **Newsletter**: Newsletter subscription form works correctly
6. **PWA Install**: Install prompt only shows when `beforeinstallprompt` event fires
7. **Error Handling**: Error boundaries prevent raw error messages
8. **Centralized API**: All API calls use the centralized API instance

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run with UI mode
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

### Run Specific Test

```bash
npx playwright test smoke.spec.js
```

## CI/CD Integration

These tests run automatically on:
- Pull requests to `main`
- Pushes to `main`

The tests must pass before code can be merged to `main`.

See `.github/workflows/smoke-tests.yml` for the CI configuration.

## Test Structure

```
tests/
└── e2e/
    └── smoke.spec.js    # Smoke tests
```

## Configuration

Test configuration is in `playwright.config.js` at the root of the repository.

Key settings:
- Base URL: `http://localhost:3000` (configurable via `BASE_URL` env var)
- Browsers: Chromium, Firefox, WebKit
- Retries: 2 (in CI), 0 (locally)
- Screenshots: On failure
- Trace: On first retry

## Adding New Tests

To add new smoke tests:

1. Open `tests/e2e/smoke.spec.js`
2. Add a new `test()` block within the `test.describe()` block
3. Follow existing patterns for assertions
4. Run locally to verify
5. Commit and push

Example:

```javascript
test('My new smoke test', async ({ page }) => {
  await page.goto('/');
  // Your test logic here
  await expect(page.locator('selector')).toBeVisible();
});
```

## Troubleshooting

### Tests fail locally but pass in CI

- Make sure you're running the latest version of Playwright: `npx playwright install`
- Verify your frontend is running on port 3000
- Check that all dependencies are installed

### Tests timeout

- Increase timeout in `playwright.config.js`
- Check that the frontend server starts successfully
- Verify network isn't blocking requests

### Screenshots/videos not captured

- Make sure `screenshot` and `video` options are enabled in `playwright.config.js`
- Check `test-results/` directory for artifacts
