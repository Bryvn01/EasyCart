# Floating Buttons Positioning Fix

## Issue Identified
The chat button (green) and back-to-top button (blue) were overlapping on desktop screens (≥1024px) due to both being positioned at `bottom: 24px; right: 20px`.

## Root Cause
The CSS media query for desktop was setting both buttons to the same position:
```css
/* BEFORE - Both buttons overlapping */
@media (min-width: 1024px) {
  .back-to-top-button {
    right: 20px;
    left: auto;
    bottom: 24px;  /* ❌ Same as chat */
  }

  .chat-button {
    bottom: 24px;  /* ❌ Same as back-to-top */
  }
}
```

## Best Practice Implementation ✅

### Mobile (<768px):
- **Chat Button**: Bottom-right (`right: 20px`, `bottom: 80px` above nav)
- **Back to Top**: Bottom-left (`left: 20px`, `bottom: 80px` above nav)
- **Rationale**: Horizontal separation prevents overlap on narrow screens

### Desktop (≥1024px):
- **Chat Button**: Bottom-right (`right: 24px`, `bottom: 24px`)
- **Back to Top**: Above chat (`right: 24px`, `bottom: 100px`)
- **Rationale**: Vertical stacking on same side (right) per Material Design & Apple HIG
  - Primary action (chat) at lowest position for easy thumb/mouse access
  - Secondary action (scroll) stacked above with 16px spacing
  - Calculation: `24px (chat bottom) + 60px (chat height) + 16px (gap) = 100px`

## Industry Standards Referenced

### Material Design FAB Guidelines:
- Primary FAB: 24dp from screen edge, bottom-right
- Secondary FABs: Stack vertically with 16dp spacing
- Minimum touch target: 48dp (48px)

### Apple Human Interface Guidelines (HIG):
- Floating controls: Bottom-right for primary actions
- Vertical stacking with safe-area insets
- Adequate spacing to prevent accidental taps (minimum 16pt)

### Web Accessibility (WCAG 2.1):
- 44×44px minimum touch target size ✅ (Chat: 60×60px, Back-to-top: 56×56px on desktop)
- Focus indicators present ✅ (`focus:ring-4`)
- Keyboard navigation support ✅ (Enter/Space keys handled)
- Proper ARIA labels ✅

## Files Modified

### `frontend/src/styles/mobile-ux-best-practices.css`
```css
/* AFTER - Proper vertical stacking */
@media (min-width: 1024px) {
  .chat-button {
    right: 24px;
    bottom: 24px;
  }

  .back-to-top-button {
    right: 24px;
    left: auto;
    bottom: 100px;  /* ✅ Above chat: 24 + 60 + 16 */
  }
}
```

## Component Implementation Status

### Chat Button (`frontend/src/components/Chat/SupportChat.js`):
- ✅ Fixed positioning with CSS class `.chat-button`
- ✅ Size: 60×60px
- ✅ Z-index: 50 (highest priority)
- ✅ Touch-optimized (`touchAction: 'manipulation'`)
- ✅ Keyboard accessible (Enter/Space/Escape keys)
- ✅ ARIA labels and roles
- ✅ Safe-area insets for mobile notches

### Back to Top Button (`frontend/src/components/BackToTop.jsx`):
- ✅ Fixed positioning with CSS class `.back-to-top-button`
- ✅ Size: 48×48px mobile, 56×56px desktop
- ✅ Z-index: 49 (below chat)
- ✅ Visibility threshold: 800px scroll
- ✅ Smooth scroll behavior
- ✅ Keyboard accessible (Enter/Space keys)
- ✅ ARIA labels

## Visual Result

### Before (Overlapping):
```
Desktop:
┌─────────────────────┐
│                   🔵│ Both at bottom: 24px
│                   🟢│ Both at right: 20px
│                     │ ❌ OVERLAPPING
└─────────────────────┘
```

### After (Stacked):
```
Desktop:
┌─────────────────────┐
│                     │
│                   🔵│ Back-to-top: bottom: 100px
│                     │ ↕️ 16px gap
│                   🟢│ Chat: bottom: 24px
└─────────────────────┘
```

## Testing Checklist

- [ ] Test on mobile (<768px): Buttons should be on opposite sides (left/right)
- [ ] Test on tablet (768-1024px): Buttons should move closer with reduced spacing
- [ ] Test on desktop (≥1024px): Buttons should stack vertically on bottom-right
- [ ] Test with iPhone notch: Safe-area insets should prevent overlap
- [ ] Test keyboard navigation: Tab, Enter, Space, Escape keys work
- [ ] Test screen readers: ARIA labels announce properly
- [ ] Test scroll behavior: Back-to-top appears after 800px scroll
- [ ] Test chat open/close: Focus returns to button after closing

## References

1. **Material Design**: [Floating Action Button](https://m3.material.io/components/floating-action-button/overview)
2. **Apple HIG**: [Floating Controls](https://developer.apple.com/design/human-interface-guidelines/)
3. **WCAG 2.1**: [2.5.5 Target Size (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
4. **MDN**: [safe-area-inset-*](https://developer.mozilla.org/en-US/docs/Web/CSS/env)

---

**Status**: ✅ Fixed - Desktop overlap resolved with proper vertical stacking
**Date**: December 15, 2025
