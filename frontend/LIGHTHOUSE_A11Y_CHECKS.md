# Lighthouse & Accessibility (a11y) Checks for EasyCart Frontend

## How to Run Lighthouse Locally

1. **Start the frontend server:**
   ```sh
   npm run next:dev --prefix frontend
   ```
   or for production build:
   ```sh
   npm run next:build --prefix frontend
   npm run next:start --prefix frontend
   ```
   The app should be available at http://localhost:3000

2. **Open Chrome and run Lighthouse:**
   - Open Chrome and go to http://localhost:3000
   - Open DevTools (F12), go to the "Lighthouse" tab
   - Select categories: Performance, Accessibility, Best Practices, SEO, PWA
   - Click "Analyze page load"
   - Save the report as HTML for documentation

3. **Accessibility (a11y) checks:**
   - In DevTools, go to the "Accessibility" panel for quick checks
   - Use browser extensions like "axe DevTools" or "WAVE" for deeper a11y analysis

4. **Automated a11y testing (optional):**
   - Run `npx cypress open` (if Cypress is set up) and use the `cypress-axe` plugin for automated a11y tests

## Documenting Results
- Save the Lighthouse HTML report to `frontend/lighthouse-report.html`
- Summarize key scores and issues in this file
- List any a11y issues found and how they were fixed

## Troubleshooting
- If Lighthouse shows a `CHROME_INTERSTITIAL_ERROR`, ensure the frontend server is running and accessible at http://localhost:3000
- Check firewall or port conflicts if the server is not reachable

---

_Last updated: 2025-10-21_
