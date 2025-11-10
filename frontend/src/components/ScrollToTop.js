import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Automatically scrolls to top of page on route changes
 * Best practice for e-commerce sites (Amazon, Shopify, Jumia)
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'instant' for immediate scroll, 'smooth' for animation
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
