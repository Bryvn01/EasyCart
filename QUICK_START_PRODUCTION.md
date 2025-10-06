# EasyCart Quick Start Guide - Post-Production Fixes

## What Changed?

We've made EasyCart production-ready with these key improvements:

1. ✅ **API Versioning**: All APIs now under `/api/v1/`
2. ✅ **Professional Footer**: Payment logos instead of text
3. ✅ **Newsletter System**: Working email subscription
4. ✅ **Automated Testing**: Playwright smoke tests
5. ✅ **CI/CD Pipeline**: Tests run on every PR

## For Developers

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Bryvn01/EasyCart.git
cd EasyCart

# Backend setup
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py makemigrations newsletter  # New app
python manage.py migrate newsletter
python manage.py createsuperuser
python manage.py runserver

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

### Running Tests

```bash
# Install Playwright (one-time)
npm install
npx playwright install

# Run smoke tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

### Environment Variables

**Backend `.env`:**
```bash
DEBUG=True
SECRET_KEY=your-secret-key
MONGO_URI=your-mongodb-uri
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Frontend `.env`:**
```bash
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## For Deployers

### Pre-Deployment Checklist

- [ ] Run smoke tests locally: `npm run test:e2e`
- [ ] Update `REACT_APP_API_URL` to production URL with `/api/v1`
- [ ] Run Django migrations: `python manage.py migrate newsletter`
- [ ] Verify payment logos load: `/assets/brands/*.svg`
- [ ] Test newsletter subscription

### Deployment Steps

1. **Backend:**
   ```bash
   cd backend
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Verify:**
   - Check `/api/v1/health/` endpoint
   - Test newsletter: POST `/api/v1/newsletter/subscribe/`
   - Verify payment logos visible in footer
   - Run smoke tests against production

### Environment Variables (Production)

**Backend:**
```bash
DEBUG=False
SECRET_KEY=strong-random-secret
ALLOWED_HOSTS=yourdomain.com,.onrender.com
REACT_APP_API_URL=https://your-backend.com/api/v1
MONGO_URI=mongodb+srv://...
```

**Frontend:**
```bash
REACT_APP_API_URL=https://your-backend.com/api/v1
```

## New Features

### Newsletter API

**Endpoint:** `POST /api/v1/newsletter/subscribe/`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "Successfully subscribed to newsletter!"
}
```

**Response (Already Subscribed):**
```json
{
  "message": "You are already subscribed to our newsletter!"
}
```

### Admin Panel

View newsletter subscriptions:
1. Go to `/admin/`
2. Navigate to "Newsletter Subscriptions"
3. Export emails for marketing campaigns

## Testing

### What's Tested

The smoke tests verify:
- ✅ No 404 error messages
- ✅ Single footer element
- ✅ Payment logos load (200 status)
- ✅ API uses `/api/v1/` namespace
- ✅ Newsletter works
- ✅ PWA install prompt controlled
- ✅ Error boundaries active

### Adding New Tests

Edit `tests/e2e/smoke.spec.js`:

```javascript
test('My new feature works', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.my-feature')).toBeVisible();
});
```

## Troubleshooting

### API 404 Errors

**Problem:** Getting 404 on API calls

**Solution:**
- Check `REACT_APP_API_URL` includes `/api/v1`
- Backend should have routes under `/api/v1/`
- Clear browser cache and restart dev server

### Payment Logos Not Showing

**Problem:** Footer shows broken images

**Solution:**
- Verify files exist: `ls frontend/public/assets/brands/`
- Check paths in Footer.js: `/assets/brands/*.svg`
- Restart frontend dev server

### Newsletter Not Working

**Problem:** Subscription fails

**Solution:**
- Run migrations: `python manage.py migrate newsletter`
- Check app in `INSTALLED_APPS`
- Verify URL: `path('api/v1/newsletter/', include('apps.newsletter.urls'))`
- Check backend logs

### Tests Failing

**Problem:** Playwright tests timeout or fail

**Solution:**
- Ensure frontend runs on port 3000
- Install Playwright browsers: `npx playwright install`
- Check test logs: `npm run test:e2e:report`
- Run in debug mode: `npm run test:e2e:debug`

## CI/CD

### GitHub Actions

Tests run automatically on:
- Pull requests to `main`
- Pushes to `main`

**Workflow:** `.github/workflows/smoke-tests.yml`

### Checking Test Results

1. Go to PR page
2. Click "Checks" tab
3. View "Smoke Tests" workflow
4. Download artifacts for failures

### Making Tests Required

1. Go to repository Settings
2. Branches → Branch protection rules
3. Add rule for `main`
4. Check "Require status checks to pass"
5. Select "smoke-tests"

## File Structure

```
EasyCart/
├── backend/
│   ├── apps/
│   │   ├── newsletter/          # NEW: Newsletter app
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── ...
│   └── ecommerce/
│       ├── urls.py              # UPDATED: /api/v1/ routes
│       └── settings.py          # UPDATED: Added newsletter
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       └── brands/          # NEW: Payment logos
│   │           ├── mpesa.svg
│   │           ├── visa.svg
│   │           └── mastercard.svg
│   └── src/
│       ├── components/
│       │   └── Footer.js        # UPDATED: Image logos
│       ├── pages/
│       │   └── LandingPage.jsx  # UPDATED: Real newsletter API
│       └── services/
│           └── api.js           # UPDATED: /api/v1/, newsletterAPI
├── tests/
│   ├── e2e/
│   │   └── smoke.spec.js        # NEW: Smoke tests
│   └── README.md                # NEW: Test docs
├── .github/
│   └── workflows/
│       └── smoke-tests.yml      # NEW: CI workflow
├── playwright.config.js         # NEW: Test config
├── package.json                 # NEW: Root package.json
└── PRODUCTION_FIXES_SUMMARY.md  # NEW: Detailed docs
```

## Support

### Documentation
- See `PRODUCTION_FIXES_SUMMARY.md` for detailed changes
- See `tests/README.md` for test documentation

### Issues
- Create GitHub issue with `bug` or `question` label
- Include error logs and reproduction steps

### Contributing
1. Fork repository
2. Create feature branch
3. Make changes
4. Run smoke tests
5. Create pull request
6. Wait for CI to pass

---

**Last Updated:** 2024
**Status:** ✅ Production Ready
