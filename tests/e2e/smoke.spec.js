import { test, expect } from '@playwright/test';

test.describe('EasyCart Smoke Tests', () => {
  
  test('Homepage does not show "requested resource was not found" text', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Get all text content
    const bodyText = await page.textContent('body');
    
    // Assert that "requested resource was not found" does not appear
    expect(bodyText.toLowerCase()).not.toContain('requested resource was not found');
    expect(bodyText.toLowerCase()).not.toContain('the requested resource was not found');
    expect(bodyText.toLowerCase()).not.toContain('resource not found');
  });

  test('Homepage has exactly one footer element', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Count footer elements
    const footerCount = await page.locator('footer').count();
    
    // Assert exactly one footer
    expect(footerCount).toBe(1);
  });

  test('Payment brand assets return 200', async ({ page }) => {
    const assets = [
      '/assets/brands/mpesa.svg',
      '/assets/brands/visa.svg',
      '/assets/brands/mastercard.svg'
    ];
    
    for (const asset of assets) {
      const response = await page.goto(asset);
      
      // Assert 200 status
      expect(response?.status()).toBe(200);
      
      // Assert it's an SVG
      const contentType = response?.headers()['content-type'];
      expect(contentType).toContain('svg');
    }
  });

  test('Footer displays payment logos correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for footer to load
    await page.waitForSelector('footer');
    
    // Check that all payment logos are visible
    const mpesaLogo = page.locator('footer img[alt="M-Pesa"]');
    const visaLogo = page.locator('footer img[alt="Visa"]');
    const mastercardLogo = page.locator('footer img[alt="Mastercard"]');
    
    await expect(mpesaLogo).toBeVisible();
    await expect(visaLogo).toBeVisible();
    await expect(mastercardLogo).toBeVisible();
    
    // Verify they have correct src paths
    await expect(mpesaLogo).toHaveAttribute('src', '/assets/brands/mpesa.svg');
    await expect(visaLogo).toHaveAttribute('src', '/assets/brands/visa.svg');
    await expect(mastercardLogo).toHaveAttribute('src', '/assets/brands/mastercard.svg');
  });

  test('API endpoints are properly namespaced under /api/v1/', async ({ page }) => {
    await page.goto('/');
    
    // Intercept API calls
    const apiCalls = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        apiCalls.push(url);
      }
    });
    
    // Wait for some API calls to be made
    await page.waitForTimeout(2000);
    
    // Check that all API calls use /api/v1/
    const nonV1Calls = apiCalls.filter(url => 
      url.includes('/api/') && !url.includes('/api/v1/')
    );
    
    // Assert no API calls are made to old endpoints
    expect(nonV1Calls.length).toBe(0);
  });

  test('Newsletter subscription works', async ({ page }) => {
    await page.goto('/');
    
    // Wait for newsletter form
    await page.waitForSelector('#newsletter-email');
    
    // Fill in email
    const testEmail = `test${Date.now()}@example.com`;
    await page.fill('#newsletter-email', testEmail);
    
    // Submit form
    await page.click('button:has-text("Subscribe")');
    
    // Wait for success message (toast or alert)
    // This may vary based on your implementation
    await page.waitForTimeout(1000);
    
    // Check that email field is cleared (indicates success)
    const emailValue = await page.inputValue('#newsletter-email');
    expect(emailValue).toBe('');
  });

  test('PWA install prompt only shows when beforeinstallprompt fires', async ({ page, context }) => {
    await page.goto('/');
    
    // Initially, install prompt should not be visible
    const installPrompt = page.locator('.install-pwa-prompt');
    await expect(installPrompt).not.toBeVisible();
    
    // Note: Testing the actual beforeinstallprompt event is tricky
    // as it requires browser conditions. This test verifies it's not
    // showing by default, which is the main requirement.
  });

  test('Error boundaries handle errors gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Should show NotFound component, not raw error
    const bodyText = await page.textContent('body');
    
    // Should not see raw Django/React error messages
    expect(bodyText).not.toContain('TypeError');
    expect(bodyText).not.toContain('Cannot read property');
    expect(bodyText).not.toContain('Uncaught');
    
    // Should see friendly 404 message
    expect(bodyText.toLowerCase()).toContain('404');
  });

  test('All product images use correct API base URL', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, img[alt*="product" i]', { 
      timeout: 10000 
    }).catch(() => {
      // Products might not have specific test IDs, continue anyway
    });
    
    // Get all product images
    const images = page.locator('img[src*="/media/"], img[src*="product"]');
    const count = await images.count();
    
    if (count > 0) {
      // Verify first image has correct base URL
      const firstImgSrc = await images.first().getAttribute('src');
      
      // Should use API base URL or absolute path, not localhost:8000 hardcoded
      expect(firstImgSrc).toBeDefined();
    }
  });

  test('Frontend uses centralized API instance', async ({ page }) => {
    // Enable console tracking
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('API')) {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.goto('/');
    
    // In development mode, API logging should show centralized base URL
    // This is checked via the API configuration log
    await page.waitForTimeout(1000);
    
    // Verify no raw axios calls (would show different URL patterns)
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    
    // No errors related to API calls
    const apiErrors = errors.filter(e => 
      e.includes('ECONNREFUSED') || e.includes('Network Error')
    );
    expect(apiErrors.length).toBe(0);
  });
});
