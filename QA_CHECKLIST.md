# QA Checklist - Mobile Demo Fixes

## Test Environment Setup

### Device/Emulator Requirements
- [ ] Physical Android device (low-end: 2GB RAM, Snapdragon 450 or equivalent)
- [ ] Physical iOS device (iPhone 8 or newer)
- [ ] Chrome DevTools mobile emulation (Moto G4, iPhone SE)

### Network Throttling
- [ ] Chrome DevTools: Set to "Slow 3G" (400ms RTT, 400kb/s down, 400kb/s up)
- [ ] CPU throttling: 4x slowdown

### Browser Setup
- [ ] Clear cache and cookies
- [ ] Disable browser extensions
- [ ] Enable screen reader (optional for a11y testing)

---

## 1. Homepage & Image Loading

### Test Steps
1. [ ] Open homepage with DevTools Network tab open
2. [ ] Observe image loading behavior
3. [ ] Scroll down to trigger lazy loading

### Acceptance Criteria
- [ ] No layout shift when images load (CLS < 0.1)
- [ ] Placeholder/shimmer visible before image loads
- [ ] Images load progressively as user scrolls
- [ ] Hero image loads within 2 seconds
- [ ] All images have proper aspect ratios (no stretching)

### Notes:
```
CLS Score: _______
LCP Time: _______
Issues: _______
```

---

## 2. Category Navigation

### Test Steps
1. [ ] Tap on category chips/buttons
2. [ ] Verify spacing between chips
3. [ ] Test selection state
4. [ ] Navigate using keyboard (Tab key)

### Acceptance Criteria
- [ ] Category chips are ≥44×44px (measure in DevTools)
- [ ] Adequate spacing between chips (≥16px)
- [ ] Clear visual feedback on tap/click
- [ ] Selected state is visually distinct
- [ ] Focus ring visible when using keyboard
- [ ] ARIA labels present (check with screen reader)

### Measurements:
```
Chip height: _______
Chip width: _______
Spacing: _______
```

---

## 3. Add to Cart Functionality

### Test Steps
1. [ ] Find a product card
2. [ ] Rapidly tap "Add to Cart" button 5 times quickly
3. [ ] Observe button state and cart count
4. [ ] Check cart to verify quantity

### Acceptance Criteria
- [ ] Button shows "Adding..." loading state
- [ ] Button is disabled during operation
- [ ] Only ONE item added despite multiple taps
- [ ] Success toast appears after completion
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Cart count updates correctly
- [ ] Button returns to normal state after operation

### Test Cases:
- [ ] **TC1**: Fast taps (5 taps in 1 second) → Only 1 item added
- [ ] **TC2**: Out of stock product → Button disabled, no toast
- [ ] **TC3**: Network error → Error toast appears
- [ ] **TC4**: Success → Green toast with checkmark

### Results:
```
Items in cart after 5 taps: _______
Toast message: _______
Issues: _______
```

---

## 4. Sticky Mini-Cart

### Test Steps
1. [ ] Add item to cart
2. [ ] Scroll down on product list page
3. [ ] Observe sticky cart behavior
4. [ ] Tap sticky cart to navigate

### Acceptance Criteria
- [ ] Sticky cart appears at bottom of screen
- [ ] Shows correct item count
- [ ] Shows correct total price
- [ ] Minimum 56px height (measure in DevTools)
- [ ] Smooth slide-up animation on appearance
- [ ] Tapping navigates to cart page
- [ ] Hidden on desktop (≥768px width)
- [ ] Doesn't overlap with bottom navigation

### Measurements:
```
Height: _______
Bottom position: _______
Visible on desktop: _______
```

---

## 5. Checkout & STK Push Flow

### Test Steps - Success Flow
1. [ ] Add items to cart
2. [ ] Navigate to cart
3. [ ] Fill shipping address and phone number
4. [ ] Select M-Pesa payment method
5. [ ] Click "Checkout with M-Pesa"
6. [ ] Observe STK modal appearance
7. [ ] Enter phone number: `254708374149`
8. [ ] Click "Pay Now"
9. [ ] Observe modal states
10. [ ] Enter PIN `1234` on phone prompt
11. [ ] Wait for confirmation

### Acceptance Criteria - Success
- [ ] Modal slides up from bottom (mobile)
- [ ] M-Pesa badge visible
- [ ] Amount displayed correctly
- [ ] Phone input has focus
- [ ] "Initiating..." state shows spinner
- [ ] "Check your phone" message appears
- [ ] Timer counts down from 2:00
- [ ] Progress bar animates
- [ ] Success checkmark appears
- [ ] Redirects to orders page after 2 seconds

### Test Steps - Failure Flow
1. [ ] Repeat steps 1-8 above
2. [ ] Cancel the M-Pesa prompt on phone
3. [ ] Observe failure state

### Acceptance Criteria - Failure
- [ ] Error icon (red X) appears
- [ ] Clear error message displayed
- [ ] "Retry" button enabled
- [ ] "Cancel" button enabled
- [ ] Retry count shown (1/3, 2/3, 3/3)

### Test Steps - Retry Flow
1. [ ] From failure state, click "Retry"
2. [ ] Observe exponential backoff delay
3. [ ] Complete payment or fail again
4. [ ] Retry up to 3 times

### Acceptance Criteria - Retry
- [ ] Delay increases: ~1s, ~2s, ~4s
- [ ] Retry count increments
- [ ] After 3 retries, button disabled
- [ ] Message: "Maximum retry attempts reached"

### Test Steps - Timeout Flow
1. [ ] Initiate payment
2. [ ] Don't respond to phone prompt
3. [ ] Wait 2 minutes

### Acceptance Criteria - Timeout
- [ ] Timer reaches 0:00
- [ ] "Payment Timed Out" message
- [ ] Retry option available

### Test Steps - Cancel Flow
1. [ ] Initiate payment
2. [ ] Click "Cancel" button during any state

### Acceptance Criteria - Cancel
- [ ] Modal closes immediately
- [ ] Returns to cart page
- [ ] Order status unchanged

### Results:
```
Success flow: PASS / FAIL
Failure flow: PASS / FAIL
Retry flow: PASS / FAIL
Timeout flow: PASS / FAIL
Cancel flow: PASS / FAIL
Issues: _______
```

---

## 6. Accessibility Testing

### Test Steps - Keyboard Navigation
1. [ ] Use Tab key to navigate through page
2. [ ] Use Enter/Space to activate buttons
3. [ ] Use Escape to close modals

### Acceptance Criteria
- [ ] All interactive elements reachable via Tab
- [ ] Focus order is logical (top to bottom, left to right)
- [ ] Focus rings visible (3px solid outline)
- [ ] No keyboard traps
- [ ] Modals trap focus within them
- [ ] Escape closes modals

### Test Steps - Screen Reader
1. [ ] Enable screen reader (NVDA/JAWS/VoiceOver)
2. [ ] Navigate through product cards
3. [ ] Interact with add-to-cart buttons
4. [ ] Navigate through STK modal

### Acceptance Criteria
- [ ] Product names announced
- [ ] Prices announced
- [ ] Button labels clear ("Add [Product Name] to cart")
- [ ] Loading states announced ("Adding...")
- [ ] Modal title announced
- [ ] Form labels associated with inputs
- [ ] Error messages announced

### Test Steps - Contrast
1. [ ] Use browser extension (WAVE, axe DevTools)
2. [ ] Check contrast ratios

### Acceptance Criteria
- [ ] Hero text contrast ≥4.5:1 (WCAG AA)
- [ ] Primary CTA contrast ≥4.5:1
- [ ] All text meets WCAG AA standards

### Results:
```
Keyboard navigation: PASS / FAIL
Screen reader: PASS / FAIL
Contrast ratios: PASS / FAIL
Issues: _______
```

---

## 7. Performance Testing

### Test Steps
1. [ ] Open Chrome DevTools
2. [ ] Go to Lighthouse tab
3. [ ] Select "Mobile" device
4. [ ] Enable "Simulated throttling" (Slow 4G)
5. [ ] Run audit

### Acceptance Criteria
- [ ] Performance score ≥90
- [ ] LCP ≤4s
- [ ] FID ≤100ms
- [ ] CLS ≤0.1
- [ ] No console errors
- [ ] No 404 errors in Network tab

### Lighthouse Scores:
```
Performance: _______
Accessibility: _______
Best Practices: _______
SEO: _______

LCP: _______
FID: _______
CLS: _______
```

### Test Steps - 3G Network
1. [ ] Set network to "Slow 3G" in DevTools
2. [ ] Reload page
3. [ ] Measure load times

### Acceptance Criteria
- [ ] Page interactive within 10 seconds
- [ ] Images load progressively
- [ ] No blocking resources
- [ ] Skeleton/placeholder visible immediately

---

## 8. Trust Signals

### Test Steps
1. [ ] Navigate to cart page
2. [ ] Observe trust indicators
3. [ ] Open STK modal
4. [ ] Observe payment trust signals

### Acceptance Criteria
- [ ] "🔒 Secure Checkout" visible in cart
- [ ] "100% Money Back Guarantee" visible
- [ ] M-Pesa badge in STK modal
- [ ] "Safaricom Verified" badge visible
- [ ] Trust signals don't obstruct content

---

## 9. Telemetry Verification

### Test Steps
1. [ ] Open browser console
2. [ ] Add item to cart
3. [ ] Initiate STK push
4. [ ] Complete or fail payment
5. [ ] Retry payment

### Acceptance Criteria
- [ ] `add_to_cart_click` event logged
- [ ] `add_to_cart_success` event logged
- [ ] `stk_push_initiated` event logged
- [ ] `stk_push_success` or `stk_push_failed` logged
- [ ] `stk_push_retry` logged on retry
- [ ] Events include relevant data (product_id, order_id, etc.)

### Console Output:
```
Events logged: _______
Issues: _______
```

---

## 10. Edge Cases

### Test Cases
- [ ] **TC1**: Add to cart with 0 stock → Button disabled
- [ ] **TC2**: Add to cart while offline → Error toast
- [ ] **TC3**: STK push with invalid phone → Error message
- [ ] **TC4**: STK push with empty phone → Validation error
- [ ] **TC5**: Multiple tabs open → Cart syncs correctly
- [ ] **TC6**: Browser back button during payment → Safe navigation
- [ ] **TC7**: Refresh during payment → State preserved
- [ ] **TC8**: Very long product name → Text truncates properly
- [ ] **TC9**: Very large cart (50+ items) → Performance acceptable
- [ ] **TC10**: Rapid navigation → No race conditions

### Results:
```
Passed: _____ / 10
Failed: _____
Issues: _______
```

---

## Sign-Off

### Tester Information
- Name: _______________________
- Date: _______________________
- Device: _______________________
- OS Version: _______________________
- Browser: _______________________

### Summary
- [ ] All critical tests passed
- [ ] Performance metrics met
- [ ] Accessibility requirements met
- [ ] No blocking issues found

### Blocking Issues
```
1. _______________________
2. _______________________
3. _______________________
```

### Non-Blocking Issues
```
1. _______________________
2. _______________________
3. _______________________
```

### Recommendation
- [ ] **APPROVE** - Ready to merge
- [ ] **APPROVE WITH NOTES** - Minor issues, can be fixed post-merge
- [ ] **REJECT** - Blocking issues must be fixed

### Reviewer Signature
_______________________

---

## Automated Test Results

### Unit Tests
```bash
npm test
```
- [ ] All tests passing
- [ ] Coverage ≥80%

### Integration Tests
```bash
npm run test:integration
```
- [ ] All tests passing
- [ ] No flaky tests

### Lighthouse CI
```bash
npm run lighthouse:ci
```
- [ ] Performance ≥90
- [ ] Accessibility ≥95
- [ ] Best Practices ≥90

---

## Notes
```
Additional observations:
_______________________
_______________________
_______________________
```
