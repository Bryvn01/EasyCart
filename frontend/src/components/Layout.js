import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';
import './MobileHeader.css';

/**
 * Layout - Professional application layout with accessibility
 * Features:
 * - Instagram-inspired mobile header
 * - Skip to content link for keyboard users
 * - Proper semantic HTML structure
 * - Safe area support for mobile devices
 * - Keyboard and mouse navigation detection
 */
const Layout = ({ children, showBottomNav = true }) => {
  useEffect(() => {
    // Detect keyboard vs mouse navigation for accessibility
    const handleFirstTab = (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
        document.body.classList.remove('mouse-nav');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.add('mouse-nav');
      document.body.classList.remove('keyboard-nav');
    };

    window.addEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <div className="app-layout">
      {/* Skip to Content Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Instagram-inspired Mobile Header (mobile only) */}
      <MobileHeader />

      {/* Main Content Area */}
      <main
        id="main-content"
        className="main-content safe-top"
        role="main"
        style={{
          paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))', // Mobile header height
          paddingBottom: showBottomNav ? 'calc(64px + var(--safe-area-inset-bottom, 0px))' : '0',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav aria-label="Primary navigation" role="navigation" />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  showBottomNav: PropTypes.bool,
};

export default Layout;
