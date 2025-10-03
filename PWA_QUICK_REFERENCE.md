# EasyCart Mobile & PWA Quick Reference

## Quick Start

### Test PWA Locally
```bash
cd frontend
npm run build
npx serve -s build
# Open http://localhost:3000 in Chrome
```

### Validate PWA Implementation
```bash
./validate-pwa.sh
```

### Check PWA Score
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"

## Key Features

### 🚀 PWA Capabilities
- ✅ Installable on mobile and desktop
- ✅ Offline support with service worker
- ✅ Background sync
- ✅ Push notifications (Android/Desktop)
- ✅ App-like experience

### 📱 Mobile Optimizations
- ✅ Touch-friendly buttons (44x44px minimum)
- ✅ Responsive design for all screen sizes
- ✅ Safe area insets for notched devices
- ✅ No zoom on input focus (iOS)
- ✅ Optimized for slow networks

### ⚡ Performance
- ✅ Cached static assets
- ✅ Lazy loading images
- ✅ Background cache updates
- ✅ Reduced motion support

## File Structure

```
frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service worker
│   ├── icon-192x192.png       # PWA icon (small)
│   ├── icon-512x512.png       # PWA icon (large)
│   └── index.html             # Updated with PWA meta tags
├── src/
│   ├── serviceWorkerRegistration.js  # SW registration
│   ├── components/
│   │   ├── PWAInstallPrompt.js      # Install banner
│   │   └── NetworkStatus.js          # Offline indicator
│   ├── styles/
│   │   └── mobile-pwa.css           # Mobile styles
│   └── index.js                      # Registers SW
```

## Common Tasks

### Update Service Worker Cache
Edit `service-worker.js`:
```javascript
const CACHE_VERSION = 'easycart-v2'; // Increment version
```

### Change App Theme Color
Edit `manifest.json` and `index.html`:
```json
"theme_color": "#2563eb"
```

### Adjust Cache Size Limits
Edit `service-worker.js`:
```javascript
const MAX_DYNAMIC_CACHE_SIZE = 50;  // Adjust
const MAX_IMAGE_CACHE_SIZE = 60;    // Adjust
```

### Test Offline Mode
1. Load app in browser
2. Open DevTools → Application
3. Check "Offline" checkbox
4. Reload page
5. Verify it still works

### Clear Service Worker Cache
```javascript
// In browser console
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(r => r.unregister());
  });
```

## Testing Checklist

### Installation
- [ ] Install prompt appears after 5 seconds
- [ ] Can install on Android Chrome
- [ ] Can add to home screen on iOS Safari
- [ ] App icon shows correctly

### Offline
- [ ] Previously visited pages work offline
- [ ] Network status indicator shows "offline"
- [ ] Images from cache display
- [ ] Graceful fallback for uncached content

### Mobile
- [ ] No horizontal scrolling
- [ ] Touch targets are large enough
- [ ] No zoom on input focus (iOS)
- [ ] Works on iPhone X notch
- [ ] Landscape mode works

### Performance
- [ ] Lighthouse PWA score > 90
- [ ] Fast initial load
- [ ] Smooth animations
- [ ] No layout shift

## Troubleshooting

### Service Worker Not Registering
- Check console for errors
- Ensure HTTPS (or localhost)
- Clear browser cache
- Check service-worker.js has no syntax errors

### Install Prompt Not Showing
- Wait 5 seconds after page load
- Check if already installed
- Verify manifest.json is valid
- iOS: Use Safari, tap Share → Add to Home Screen

### Offline Mode Not Working
- Visit pages while online first
- Check service worker is active (DevTools)
- Verify caching is working (Application tab)
- Check browser storage not full

### Icons Not Displaying
- Verify PNG format (not JPG)
- Check file paths in manifest.json
- Ensure icons are publicly accessible
- Clear cache and reinstall

## Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Install | ✅ | ✅* | ✅ | ✅ |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Push | ✅ | ❌ | ✅ | ✅ |
| Sync | ✅ | ❌ | ❌ | ✅ |

*Safari requires "Add to Home Screen" manually

## Resources

- [Full Guide](./MOBILE_PWA_GUIDE.md)
- [Validation Script](./validate-pwa.sh)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Cookbook](https://serviceworke.rs/)

## Support

Issues? Check:
1. Browser console for errors
2. DevTools → Application → Service Workers
3. DevTools → Application → Manifest
4. Lighthouse report for guidance

---

**Quick Check**: Run `./validate-pwa.sh` to verify all PWA features are correctly implemented.
