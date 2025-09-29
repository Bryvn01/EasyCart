import { useEffect, useRef, useState, useCallback } from 'react';
import { FocusTrap, announceToScreenReader, KeyboardUtils, generateId } from '../utils/accessibility';

/**
 * Hook for managing focus trap in modals and dropdowns
 */
export const useFocusTrap = (isActive = false) => {
  const containerRef = useRef(null);
  const focusTrapRef = useRef(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      focusTrapRef.current = new FocusTrap(containerRef.current);
      focusTrapRef.current.activate();
    } else if (focusTrapRef.current) {
      focusTrapRef.current.deactivate();
      focusTrapRef.current = null;
    }

    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
        focusTrapRef.current = null;
      }
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook for managing keyboard navigation
 */
export const useKeyboardNavigation = (callbacks = {}) => {
  const handleKeyDown = useCallback((event) => {
    const { onEscape, onEnter, onSpace, onArrowUp, onArrowDown, onArrowLeft, onArrowRight } = callbacks;

    switch (event.key) {
      case KeyboardUtils.KEYS.ESCAPE:
        onEscape?.(event);
        break;
      case KeyboardUtils.KEYS.ENTER:
        onEnter?.(event);
        break;
      case KeyboardUtils.KEYS.SPACE:
        onSpace?.(event);
        break;
      case KeyboardUtils.KEYS.ARROW_UP:
        onArrowUp?.(event);
        break;
      case KeyboardUtils.KEYS.ARROW_DOWN:
        onArrowDown?.(event);
        break;
      case KeyboardUtils.KEYS.ARROW_LEFT:
        onArrowLeft?.(event);
        break;
      case KeyboardUtils.KEYS.ARROW_RIGHT:
        onArrowRight?.(event);
        break;
      default:
        break;
    }
  }, [callbacks]);

  return handleKeyDown;
};

/**
 * Hook for managing ARIA announcements
 */
export const useAnnouncer = () => {
  const announce = useCallback((message, priority = 'polite') => {
    announceToScreenReader(message, priority);
  }, []);

  const announceError = useCallback((message) => {
    announce(message, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message) => {
    announce(message, 'polite');
  }, [announce]);

  return { announce, announceError, announceSuccess };
};

/**
 * Hook for managing unique IDs for form elements
 */
export const useId = (prefix = 'element') => {
  const [id] = useState(() => generateId(prefix));
  return id;
};

/**
 * Hook for managing disclosure patterns (collapsible content)
 */
export const useDisclosure = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const triggerId = useId('disclosure-trigger');
  const contentId = useId('disclosure-content');

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const getTriggerProps = useCallback(() => ({
    id: triggerId,
    'aria-expanded': isOpen,
    'aria-controls': contentId,
    onClick: toggle,
    onKeyDown: (event) => {
      if (KeyboardUtils.isActionKey(event)) {
        event.preventDefault();
        toggle();
      }
    }
  }), [triggerId, contentId, isOpen, toggle]);

  const getContentProps = useCallback(() => ({
    id: contentId,
    'aria-labelledby': triggerId,
    hidden: !isOpen
  }), [contentId, triggerId, isOpen]);

  return {
    isOpen,
    toggle,
    open,
    close,
    getTriggerProps,
    getContentProps
  };
};

/**
 * Hook for managing accessible forms
 */
export const useAccessibleForm = () => {
  const getFieldProps = useCallback((name, options = {}) => {
    const fieldId = `field-${name}-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `error-${name}-${Math.random().toString(36).substr(2, 9)}`;
    const helpId = `help-${name}-${Math.random().toString(36).substr(2, 9)}`;

    const { required = false, invalid = false, helpText, errorText } = options;

    const fieldProps = {
      id: fieldId,
      name,
      required,
      'aria-invalid': invalid,
      'aria-describedby': [
        helpText ? helpId : null,
        errorText ? errorId : null
      ].filter(Boolean).join(' ') || undefined
    };

    const labelProps = {
      htmlFor: fieldId
    };

    const errorProps = errorText ? {
      id: errorId,
      role: 'alert',
      'aria-live': 'polite'
    } : {};

    const helpProps = helpText ? {
      id: helpId
    } : {};

    return {
      fieldProps,
      labelProps,
      errorProps,
      helpProps
    };
  }, []);

  return { getFieldProps };
};

/**
 * Hook for managing live regions
 */
export const useLiveRegion = (initialMessage = '') => {
  const [message, setMessage] = useState(initialMessage);
  const [politeness, setPoliteness] = useState('polite');

  const announce = useCallback((newMessage, priority = 'polite') => {
    setMessage(newMessage);
    setPoliteness(priority);
  }, []);

  const clear = useCallback(() => {
    setMessage('');
  }, []);

  const liveRegionProps = {
    'aria-live': politeness,
    'aria-atomic': true,
    className: 'sr-only'
  };

  return {
    message,
    announce,
    clear,
    liveRegionProps
  };
};

/**
 * Hook for detecting user preferences
 */
export const useAccessibilityPreferences = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  useEffect(() => {
    // Check initial preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    setPrefersReducedMotion(motionQuery.matches);
    setPrefersHighContrast(contrastQuery.matches);
    setPrefersDarkMode(darkModeQuery.matches);

    // Listen for changes
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    const handleContrastChange = (e) => setPrefersHighContrast(e.matches);
    const handleDarkModeChange = (e) => setPrefersDarkMode(e.matches);

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);
    darkModeQuery.addEventListener('change', handleDarkModeChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode
  };
};

/**
 * Hook for managing roving tabindex
 */
export const useRovingTabIndex = (itemsCount) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getItemProps = useCallback((index) => ({
    tabIndex: index === currentIndex ? 0 : -1,
    onFocus: () => setCurrentIndex(index),
    onKeyDown: (event) => {
      let newIndex = currentIndex;

      switch (event.key) {
        case KeyboardUtils.KEYS.ARROW_DOWN:
        case KeyboardUtils.KEYS.ARROW_RIGHT:
          event.preventDefault();
          newIndex = (currentIndex + 1) % itemsCount;
          break;
        case KeyboardUtils.KEYS.ARROW_UP:
        case KeyboardUtils.KEYS.ARROW_LEFT:
          event.preventDefault();
          newIndex = (currentIndex - 1 + itemsCount) % itemsCount;
          break;
        case KeyboardUtils.KEYS.HOME:
          event.preventDefault();
          newIndex = 0;
          break;
        case KeyboardUtils.KEYS.END:
          event.preventDefault();
          newIndex = itemsCount - 1;
          break;
        default:
          return;
      }

      setCurrentIndex(newIndex);
      // Focus will be handled by the component receiving these props
    }
  }), [currentIndex, itemsCount]);

  return {
    currentIndex,
    setCurrentIndex,
    getItemProps
  };
};