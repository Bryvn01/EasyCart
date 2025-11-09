# QA Verification Guide - Sticky Mini-Cart

## Overview
This guide provides step-by-step instructions for Quality Assurance testing of the enhanced sticky mini-cart component. Follow all test scenarios to ensure the implementation meets enterprise-level standards.

---

## Pre-Testing Setup

### Environment Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Bryvn01/EasyCart.git
   cd EasyCart/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open in browser**: Navigate to `http://localhost:3000`

### Test Devices Required
- Desktop browser (Chrome, Firefox, Safari, Edge)
- Mobile device (iOS and Android) or browser DevTools mobile emulation
- Screen reader software (NVDA, VoiceOver, or JAWS)

### Test Accounts
Create test user accounts with:
- Empty cart
- Cart with 1 item
- Cart with multiple items (5+)
- Cart with maximum items (99+)

---

## Test Scenarios

### 1. Basic Functionality Tests

#### 1.1 Cart Visibility
**Objective**: Verify sticky mini-cart appears correctly on mobile view.

**Steps**:
1. Open website on mobile device or resize browser to mobile width (<768px)
2. Log in to user account
3. Ensure cart is empty (cart count = 0)
4. **Expected**: Sticky mini-cart should NOT be visible
5. Add an item to cart
6. **Expected**: Sticky mini-cart should appear with slide-up animation
7. Navigate to different pages
8. **Expected**: Sticky mini-cart remains visible on all pages

**Pass Criteria**:
- [ ] Mini-cart hidden when cart is empty
- [ ] Mini-cart appears when item added
- [ ] Smooth slide-up animation (0.3s)
- [ ] Persists across page navigation
- [ ] Hidden on desktop view (>768px width)

#### 1.2 Cart Count Display
**Objective**: Verify cart count updates correctly.

**Steps**:
1. Add 1 item to cart
2. **Expected**: Badge shows "1", text shows "1 item"
3. Add 2 more of the same product
4. **Expected**: Badge shows "3", text shows "3 items"
5. Add items until count exceeds 99
6. **Expected**: Badge shows "99+", text shows actual count (e.g., "105 items")

**Pass Criteria**:
- [ ] Singular "item" when count = 1
- [ ] Plural "items" when count > 1
- [ ] Badge shows "99+" for counts > 99
- [ ] Text shows exact count even when > 99

#### 1.3 Total Price Display
**Objective**: Verify total price calculates and displays correctly.

**Steps**:
1. Add item with price 500 KSh, quantity 2
2. **Expected**: Total shows "KSh 1,000"
3. Add item with price 750 KSh, quantity 1
4. **Expected**: Total shows "KSh 1,750"
5. Remove first item
6. **Expected**: Total shows "KSh 750"

**Pass Criteria**:
- [ ] Price formatted with thousands separator
- [ ] Currency symbol (KSh) displayed
- [ ] Updates when items added/removed
- [ ] Accurate calculation

#### 1.4 Navigation
**Objective**: Verify clicking cart navigates to cart page.

**Steps**:
1. Click/tap on sticky mini-cart button
2. **Expected**: Navigate to `/cart` page
3. Cart page displays full cart contents

**Pass Criteria**:
- [ ] Navigates to cart page on click
- [ ] Button has pointer cursor
- [ ] No navigation on disabled state

---

### 2. Loading State Tests

#### 2.1 Initial Load
**Objective**: Verify loading state during cart fetch.

**Steps**:
1. Clear browser cache
2. Log in to account
3. Observe sticky mini-cart during initial load
4. **Expected**: 
   - Loading spinner visible briefly (if fetch takes > 100ms)
   - `aria-busy="true"` attribute set
   - Button slightly faded (opacity 0.9)

**Pass Criteria**:
- [ ] Loading indicator appears during fetch
- [ ] No flickering or layout shift
- [ ] Indicator disappears when loaded

#### 2.2 Cart Operations
**Objective**: Verify loading during add/update/remove operations.

**Steps**:
1. Throttle network to "Slow 3G" in DevTools
2. Add item to cart
3. **Expected**: Loading spinner appears
4. Wait for completion
5. **Expected**: Spinner disappears, count updates

**Pass Criteria**:
- [ ] Loading indicator during operations
- [ ] Button remains interactive (not disabled)
- [ ] Optimistic update shows new count immediately
- [ ] Final state matches server response

---

### 3. Error Handling Tests

#### 3.1 Network Error
**Objective**: Verify error display when network request fails.

**Steps**:
1. Open browser DevTools Network tab
2. Set to "Offline" mode
3. Try adding item to cart
4. **Expected**: 
   - Error notification appears above cart button
   - Error shows message: "Failed to add item to cart"
   - Error has red background with warning icon
   - Dismiss button (✕) visible

**Pass Criteria**:
- [ ] Error notification displayed
- [ ] Error message is user-friendly
- [ ] Dismiss button works
- [ ] Cart state rolled back (count unchanged)

#### 3.2 API Error
**Objective**: Verify handling of API error responses.

**Steps**:
1. Try adding out-of-stock item (if available)
2. **Expected**: Error shows "Product is out of stock" or similar
3. Click dismiss button (✕)
4. **Expected**: Error disappears
5. Try operation again
6. **Expected**: New error can be displayed

**Pass Criteria**:
- [ ] API error message displayed
- [ ] Error can be dismissed
- [ ] New errors can appear after dismissal
- [ ] No console errors

#### 3.3 Retry Logic
**Objective**: Verify automatic retry on transient errors.

**Steps**:
1. Monitor Network tab in DevTools
2. Simulate intermittent network (offline → online)
3. Refresh page to trigger cart fetch
4. **Expected**: 
   - Component retries failed request
   - Succeeds after 2-3 attempts
   - Final state correct

**Pass Criteria**:
- [ ] Automatic retry on failure
- [ ] Exponential backoff visible (increasing delays)
- [ ] Success after retry
- [ ] Error shown after max retries (3)

---

### 4. Optimistic Update Tests

#### 4.1 Add to Cart
**Objective**: Verify immediate UI update before server confirmation.

**Steps**:
1. Throttle network to "Slow 3G"
2. Current cart count: 2
3. Add item with quantity 3
4. **Expected**: Count immediately shows 5 (2 + 3)
5. Wait for server response
6. **Expected**: Count remains 5 (or updates to server value)

**Pass Criteria**:
- [ ] Count updates instantly
- [ ] No delay waiting for server
- [ ] Final count matches server
- [ ] Rollback on error

#### 4.2 Remove from Cart
**Objective**: Verify optimistic removal.

**Steps**:
1. Cart has 3 items (item A: qty 2, item B: qty 1)
2. Remove item A
3. **Expected**: Count immediately shows 1
4. Wait for server response
5. **Expected**: Count remains 1

**Pass Criteria**:
- [ ] Count updates instantly
- [ ] Removed item disappears from count
- [ ] Rollback if removal fails

#### 4.3 Update Quantity
**Objective**: Verify optimistic quantity update.

**Steps**:
1. Cart has item with quantity 2
2. Update quantity to 5
3. **Expected**: Count increases by 3 immediately
4. Wait for server response
5. **Expected**: Count reflects server response

**Pass Criteria**:
- [ ] Count updates instantly
- [ ] Calculation correct
- [ ] Rollback on error

---

### 5. Concurrency Tests

#### 5.1 Rapid Clicking
**Objective**: Verify request deduplication prevents duplicate adds.

**Steps**:
1. Open Network tab
2. Rapidly click "Add to Cart" button 5 times on a product
3. **Expected**: Only 1 API request sent
4. Cart count increases by 1 (not 5)

**Pass Criteria**:
- [ ] Only one API request sent
- [ ] No duplicate cart items
- [ ] Count accurate
- [ ] No console errors

#### 5.2 Multiple Operations
**Objective**: Verify handling of multiple simultaneous operations.

**Steps**:
1. Add item A to cart (don't wait)
2. Immediately add item B to cart
3. **Expected**: Both operations queue properly
4. Both items appear in cart
5. Count reflects both additions

**Pass Criteria**:
- [ ] Both operations succeed
- [ ] No race conditions
- [ ] Final state consistent
- [ ] No lost updates

---

### 6. Accessibility Tests

#### 6.1 Keyboard Navigation
**Objective**: Verify all functionality accessible via keyboard.

**Steps**:
1. Use Tab key to focus on sticky mini-cart button
2. **Expected**: Clear focus outline visible (3px green border)
3. Press Enter key
4. **Expected**: Navigate to cart page
5. Go back, Tab to cart button
6. Press Space key
7. **Expected**: Navigate to cart page

**Pass Criteria**:
- [ ] Tab key focuses button
- [ ] Focus indicator clearly visible
- [ ] Enter key activates
- [ ] Space key activates
- [ ] Escape key dismisses error (if present)

#### 6.2 Screen Reader
**Objective**: Verify screen reader announcements.

**Tools**: NVDA (Windows), VoiceOver (Mac/iOS), or JAWS

**Steps**:
1. Enable screen reader
2. Navigate to sticky mini-cart
3. **Expected Announcement**: "View shopping cart with 3 items, total 1,500 Kenya Shillings"
4. Add item to cart
5. **Expected Announcement**: "1 item added to cart. Total: 4 items"
6. Navigate to error notification (if present)
7. **Expected**: Error message read immediately (assertive)

**Pass Criteria**:
- [ ] Button label descriptive
- [ ] Cart updates announced
- [ ] Error messages announced
- [ ] Loading state announced ("busy")
- [ ] All content accessible

#### 6.3 Color Contrast
**Objective**: Verify sufficient color contrast for visibility.

**Tools**: Browser DevTools or online contrast checker

**Steps**:
1. Inspect cart button text
2. Measure contrast ratio
3. **Expected**: Minimum 4.5:1 for normal text
4. Inspect error message
5. **Expected**: Minimum 4.5:1 contrast

**Pass Criteria**:
- [ ] Button text: ≥4.5:1 contrast
- [ ] Error text: ≥4.5:1 contrast
- [ ] Focus outline: ≥3:1 contrast
- [ ] All states meet WCAG AA

---

### 7. Mobile-Specific Tests

#### 7.1 Touch Targets
**Objective**: Verify touch targets are large enough.

**Steps**:
1. Test on mobile device
2. Tap cart button with finger
3. **Expected**: Easy to tap, no mistaps
4. Measure button size
5. **Expected**: Minimum 44x44px (iOS) or 48x48dp (Android)

**Pass Criteria**:
- [ ] Button ≥44x44px
- [ ] Error dismiss button ≥44x44px
- [ ] Adequate spacing around elements
- [ ] No overlapping touch areas

#### 7.2 Responsive Layout
**Objective**: Verify layout adapts to different screen sizes.

**Test Widths**: 320px, 375px, 414px, 768px, 1024px

**Steps**:
1. Resize browser to each width
2. **Expected @ 320-767px**: Cart visible, full width
3. **Expected @ 768px+**: Cart hidden (desktop mode)
4. Verify no horizontal scroll
5. Verify all content visible

**Pass Criteria**:
- [ ] Works at 320px width
- [ ] No horizontal scrolling
- [ ] Content not cut off
- [ ] Hidden on desktop

#### 7.3 Zoom
**Objective**: Verify functionality at 200% zoom.

**Steps**:
1. Zoom browser to 200%
2. Verify cart button visible and functional
3. Verify all text readable
4. Verify no layout breaks

**Pass Criteria**:
- [ ] Functional at 200% zoom
- [ ] No horizontal scrolling
- [ ] Text reflows properly
- [ ] No content loss

---

### 8. Animation Tests

#### 8.1 Slide-In Animation
**Objective**: Verify smooth appearance animation.

**Steps**:
1. Clear cart
2. Add item
3. Observe slide-in animation
4. **Expected**: 
   - Slides up from bottom
   - Duration: 0.3 seconds
   - Smooth easing (ease-out)
   - Fades in (opacity 0 → 1)

**Pass Criteria**:
- [ ] Smooth animation
- [ ] No jank or stuttering
- [ ] Appropriate duration
- [ ] Accessible (not too fast)

#### 8.2 Reduced Motion
**Objective**: Verify respects user's motion preferences.

**Steps**:
1. Enable "Reduce Motion" in OS settings (macOS: System Preferences > Accessibility > Display)
2. Add item to cart
3. **Expected**: Cart appears instantly without animation

**Pass Criteria**:
- [ ] No animation when reduced motion enabled
- [ ] Still functional
- [ ] Instant appearance

---

### 9. Cross-Browser Tests

Test all scenarios in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

**Expected**: Consistent behavior across all browsers.

---

### 10. Performance Tests

#### 10.1 Load Time
**Objective**: Verify component doesn't slow down page load.

**Steps**:
1. Open Performance tab in DevTools
2. Record page load
3. Check component initialization time
4. **Expected**: < 100ms initialization time

**Pass Criteria**:
- [ ] Fast initialization
- [ ] No blocking of main thread
- [ ] Smooth rendering

#### 10.2 Memory Leaks
**Objective**: Verify no memory leaks on navigation.

**Steps**:
1. Open Memory tab in DevTools
2. Take heap snapshot
3. Navigate between pages 10 times
4. Take another heap snapshot
5. **Expected**: Memory usage stable (no continuous growth)

**Pass Criteria**:
- [ ] No memory leaks
- [ ] Event listeners cleaned up
- [ ] Timers cleared on unmount

---

## Bug Reporting Template

If you find an issue, report it using this template:

```markdown
### Bug Report

**Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Environment**:
- Browser: [Chrome 120]
- OS: [Windows 11]
- Device: [Desktop / iPhone 14]
- Screen Size: [375x667]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots**:
[Attach screenshots if applicable]

**Console Errors**:
[Paste any console errors]

**Additional Notes**:
[Any other relevant information]
```

---

## Test Completion Checklist

### Functional Tests
- [ ] Basic functionality (4 tests)
- [ ] Loading states (2 tests)
- [ ] Error handling (3 tests)
- [ ] Optimistic updates (3 tests)
- [ ] Concurrency (2 tests)

### Accessibility Tests
- [ ] Keyboard navigation (1 test)
- [ ] Screen reader (1 test)
- [ ] Color contrast (1 test)

### Mobile Tests
- [ ] Touch targets (1 test)
- [ ] Responsive layout (1 test)
- [ ] Zoom (1 test)

### Animation Tests
- [ ] Slide-in animation (1 test)
- [ ] Reduced motion (1 test)

### Cross-Browser Tests
- [ ] All browsers tested

### Performance Tests
- [ ] Load time (1 test)
- [ ] Memory leaks (1 test)

### Sign-Off
- [ ] All critical bugs fixed
- [ ] All high priority bugs fixed or documented
- [ ] Medium/low priority bugs documented
- [ ] Test results documented
- [ ] QA approval obtained

---

## Contact

For questions about testing or to report issues:
- **Developer**: EasyCart Development Team
- **Email**: dev@easycart.com
- **Issue Tracker**: https://github.com/Bryvn01/EasyCart/issues

---

**Document Version**: 1.0.0  
**Last Updated**: November 2025
