import React, { useState, useEffect, useRef, useCallback } from 'react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Throttled scroll handler for better performance
  useEffect(() => {
    const toggleVisibility = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce visibility toggle
      scrollTimeoutRef.current = setTimeout(() => {
        // Industry standard: Show after 800-1000px scroll
        setIsVisible(window.pageYOffset > 800);
      }, 100);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          scrollToTop();
        }
      }}
      className="back-to-top-button fixed w-12 h-12 md:w-14 md:h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center active:scale-95 md:hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-200"
      style={{
        // Mobile: Left side to avoid chat (right)
        // Desktop: Right side with standard positioning
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
      aria-label="Back to top. Press Enter or Space to scroll to page top."
      title="Scroll to top (Press Enter)"
      tabIndex={0}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      <span className="sr-only">Scroll to top of page</span>
    </button>
  );
};

export default BackToTop;
