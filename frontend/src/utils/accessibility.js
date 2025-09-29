// Accessibility utilities for keyboard navigation and screen readers

/**
 * Manages focus trap for modals and dropdowns
 */
export class FocusTrap {
  constructor(element) {
    this.element = element;
    this.focusableElements = this.getFocusableElements();
    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    this.previousFocus = document.activeElement;
  }

  getFocusableElements() {
    if (!this.element) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(this.element.querySelectorAll(focusableSelectors))
      .filter(el => !el.hidden && el.offsetParent !== null);
  }

  activate() {
    if (!this.element) return;
    
    this.element.addEventListener('keydown', this.handleKeyDown);
    
    // Focus first element
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }
  }

  deactivate() {
    if (!this.element) return;
    
    this.element.removeEventListener('keydown', this.handleKeyDown);
    
    // Return focus to previous element
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }
  }

  handleKeyDown = (event) => {
    if (event.key !== 'Tab') return;

    // Refresh focusable elements in case DOM changed
    this.focusableElements = this.getFocusableElements();
    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        this.lastFocusableElement?.focus();
        event.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        this.firstFocusableElement?.focus();
        event.preventDefault();
      }
    }
  };
}

/**
 * Announces messages to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;
  
  document.body.appendChild(announcer);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};

/**
 * Creates a unique ID for form elements and labels
 */
export const generateId = (prefix = 'element') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Keyboard event utilities
 */
export const KeyboardUtils = {
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    TAB: 'Tab'
  },

  isActionKey: (event) => {
    return event.key === KeyboardUtils.KEYS.ENTER || event.key === KeyboardUtils.KEYS.SPACE;
  },

  isArrowKey: (event) => {
    return [
      KeyboardUtils.KEYS.ARROW_UP,
      KeyboardUtils.KEYS.ARROW_DOWN,
      KeyboardUtils.KEYS.ARROW_LEFT,
      KeyboardUtils.KEYS.ARROW_RIGHT
    ].includes(event.key);
  },

  handleActionKeyPress: (event, callback) => {
    if (KeyboardUtils.isActionKey(event)) {
      event.preventDefault();
      callback(event);
    }
  }
};

/**
 * Manages roving tabindex for component groups (like menu items)
 */
export class RovingTabIndex {
  constructor(container, itemSelector = '[role="menuitem"]') {
    this.container = container;
    this.itemSelector = itemSelector;
    this.currentIndex = 0;
    this.items = [];
    
    this.init();
  }

  init() {
    if (!this.container) return;
    
    this.updateItems();
    this.container.addEventListener('keydown', this.handleKeyDown);
    
    // Set initial tabindex
    this.setActiveItem(0);
  }

  updateItems() {
    this.items = Array.from(this.container.querySelectorAll(this.itemSelector));
  }

  setActiveItem(index) {
    this.items.forEach((item, i) => {
      item.tabIndex = i === index ? 0 : -1;
    });
    this.currentIndex = index;
  }

  focusItem(index) {
    if (this.items[index]) {
      this.setActiveItem(index);
      this.items[index].focus();
    }
  }

  handleKeyDown = (event) => {
    this.updateItems();
    
    switch (event.key) {
      case KeyboardUtils.KEYS.ARROW_DOWN:
      case KeyboardUtils.KEYS.ARROW_RIGHT:
        event.preventDefault();
        this.focusItem((this.currentIndex + 1) % this.items.length);
        break;
        
      case KeyboardUtils.KEYS.ARROW_UP:
      case KeyboardUtils.KEYS.ARROW_LEFT:
        event.preventDefault();
        this.focusItem((this.currentIndex - 1 + this.items.length) % this.items.length);
        break;
        
      case KeyboardUtils.KEYS.HOME:
        event.preventDefault();
        this.focusItem(0);
        break;
        
      case KeyboardUtils.KEYS.END:
        event.preventDefault();
        this.focusItem(this.items.length - 1);
        break;
        
      default:
        // Do nothing for other keys
        break;
    }
  };

  destroy() {
    if (this.container) {
      this.container.removeEventListener('keydown', this.handleKeyDown);
    }
  }
}

/**
 * Skip link component for keyboard navigation
 */
export const createSkipLink = (targetId, text = 'Skip to main content') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50';
  
  // Add to beginning of body
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  return skipLink;
};

/**
 * Color contrast utilities
 */
export const ColorUtils = {
  // Calculate relative luminance
  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio between two colors
  getContrastRatio(color1, color2) {
    const lum1 = this.getLuminance(...color1);
    const lum2 = this.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if color combination meets WCAG AA standard (4.5:1)
  meetsWCAGAA(color1, color2) {
    return this.getContrastRatio(color1, color2) >= 4.5;
  },

  // Check if color combination meets WCAG AAA standard (7:1)
  meetsWCAGAAA(color1, color2) {
    return this.getContrastRatio(color1, color2) >= 7;
  }
};

/**
 * Motion preferences utilities
 */
export const MotionUtils = {
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  respectMotionPreference(normalAnimation, reducedAnimation = null) {
    return this.prefersReducedMotion() ? (reducedAnimation || { duration: 0 }) : normalAnimation;
  }
};

/**
 * High contrast mode detection
 */
export const ContrastUtils = {
  prefersHighContrast() {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  addHighContrastClass() {
    if (this.prefersHighContrast()) {
      document.documentElement.classList.add('high-contrast');
    }
  }
};

// Initialize accessibility features when DOM is ready
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Add high contrast class if needed
    ContrastUtils.addHighContrastClass();
    
    // Create skip link if main content exists
    const mainContent = document.getElementById('main') || document.querySelector('main');
    if (mainContent) {
      if (!mainContent.id) {
        mainContent.id = 'main-content';
      }
      createSkipLink(mainContent.id);
    }
  });
}