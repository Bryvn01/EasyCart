# Quick Testing Guide - PWA Install Prompt Fix

## Before Testing
Clear your browser storage to test fresh state:

```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Test Scenarios

### ✅ Test 1: Prompt Appears
1. Open the app in a browser
2. Wait 3 seconds
3. **Expected**: Install prompt banner appears at bottom of screen

### ✅ Test 2: Dismiss Button Works
1. When prompt appears, click the "✕" button
2. **Expected**: Prompt disappears immediately
3. Reload page within 7 days
4. **Expected**: Prompt does NOT reappear

### ✅ Test 3: Install Button Works (Chrome/Edge/Android)
1. Clear storage and reload
2. Wait for prompt to appear
3. Click "Install" button
4. **Expected**:
   - Button shows "Installing..."
   - Native browser install dialog appears
5. Click "Install" in native dialog
6. **Expected**:
   - Green success toast appears
   - Prompt disappears
   - Never shows again

### ✅ Test 4: iOS Instructions Modal
1. Open in Safari on iPhone/iPad (or simulate iOS user agent)
2. Wait for prompt
3. Click "How?" button
4. **Expected**: Modal with installation instructions appears
5. Click backdrop or "✕" button
6. **Expected**: Modal closes and prompt dismisses

### ✅ Test 5: Already Installed
1. Install app as PWA
2. Launch installed app
3. **Expected**: Prompt does NOT appear

## Quick Reset Commands

```javascript
// Reset all PWA install state
localStorage.removeItem('pwa-install-dismissed');
localStorage.removeItem('pwa-install-dismissed-permanent');
sessionStorage.removeItem('pwa-page-views');
sessionStorage.removeItem('pwa-added-to-cart');
sessionStorage.removeItem('pwa-browsing-time');
location.reload();
```

## Debug Logging

The component logs helpful debug info. Open browser console to see:
- `PWA: Component mounted`
- `PWA: Standalone mode: false`
- `PWA: Is iOS: false`
- `PWA: Checking engagement`
- `PWA: Showing prompt`
- `PWA: Install button clicked`
- `PWA: User choice: accepted/dismissed`

## Expected Console Messages

### On Page Load (Not Installed)
```
PWA: Component mounted
PWA: Standalone mode: false
PWA: Is iOS: false
PWA: Setting timer to check engagement
PWA: Timer fired, checking engagement
PWA: Checking engagement - pageViews: 1
PWA: Engagement criteria met, showing prompt
```

### On Install Click
```
PWA: Install button clicked
PWA: deferredPrompt: [object BeforeInstallPromptEvent]
PWA: Prompt result: undefined
PWA: User choice: accepted
```

### On Dismiss Click
```
PWA: Dismiss clicked, permanent: false
```

## Common Issues & Solutions

### Issue: Prompt doesn't appear
**Solution**:
- Check console for errors
- Verify not in standalone mode
- Clear localStorage/sessionStorage
- Wait at least 3 seconds

### Issue: Prompt reappears after dismiss
**Solution**:
- Check localStorage has `pwa-install-dismissed` key
- Verify date is within 7 days
- Clear cache and hard reload (Ctrl+Shift+R)

### Issue: Install button does nothing
**Solution**:
- Chrome/Edge/Android only support native prompt
- Check console for `deferredPrompt` value
- Verify HTTPS or localhost (required for PWA)
- Check manifest.json is valid

### Issue: iOS modal won't close
**Solution**:
- Fixed in this update
- Click backdrop or "✕" button
- Check console for errors

## Browser Requirements

### Supports Install Button
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 90+
- ✅ Samsung Internet
- ✅ Opera 76+

### Shows Manual Instructions
- ✅ Safari iOS (all versions)
- ✅ Safari macOS
- ✅ Other browsers without native prompt

## Performance Checklist

- [ ] Prompt appears within 3 seconds
- [ ] Dismissing is instant (no delay)
- [ ] No memory leaks (check DevTools)
- [ ] No console errors
- [ ] Toast notifications work
- [ ] Analytics events fire
- [ ] Responsive on mobile
- [ ] Accessible via keyboard

## Production Deployment

Before deploying:
1. Remove all debug console.logs (optional)
2. Test on real devices (iOS, Android)
3. Verify analytics tracking works
4. Check manifest.json is served
5. Confirm HTTPS is enabled
6. Test in incognito/private mode

## Support Contacts

- **Issue**: Not dismissing → Check `handleDismiss()` function
- **Issue**: Not showing → Check engagement logic
- **Issue**: iOS problems → Check modal handlers
- **Issue**: Install fails → Check PWA requirements

---

**Quick Start**: `localStorage.clear(); sessionStorage.clear(); location.reload();`
