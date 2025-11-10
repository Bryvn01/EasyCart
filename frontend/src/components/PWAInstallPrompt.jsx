import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

/**
 * PWAInstallPrompt - Smart install prompt for Progressive Web App
 *
 * 2025 Best Practices:
 * - Shows after meaningful engagement (30s browsing or 3 page views)
 * - Respects user's dismiss preference (localStorage)
 * - Platform-specific instructions (iOS vs Android)
 * - Non-intrusive bottom sheet design
 * - Accessible with ARIA labels
 *
 * Features:
 * - Auto-detection of install capability
 * - iOS-specific manual instructions
 * - Android beforeinstallprompt API
 * - Dismiss with 7-day cooldown
 * - Analytics-ready events
 */
const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Don't show if already installed
    if (standalone) return;

    // Check if user dismissed recently (7-day cooldown)
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    // Track engagement
    let pageViews = parseInt(sessionStorage.getItem('pwa-page-views') || '0');
    pageViews++;
    sessionStorage.setItem('pwa-page-views', pageViews.toString());

    // Capture beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show prompt after engagement threshold
    const engagementTimer = setTimeout(() => {
      if (pageViews >= 3 || sessionStorage.getItem('pwa-engaged')) {
        setShowPrompt(true);
      }
    }, 30000); // 30 seconds

    // Track if user adds to cart or browses products (high engagement)
    const handleEngagement = () => {
      sessionStorage.setItem('pwa-engaged', 'true');
    };

    document.addEventListener('add-to-cart', handleEngagement);
    document.addEventListener('checkout-initiated', handleEngagement);

    return () => {
      clearTimeout(engagementTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      document.removeEventListener('add-to-cart', handleEngagement);
      document.removeEventListener('checkout-initiated', handleEngagement);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android/Chrome - use native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      // Analytics event
      if (window.gtag) {
        window.gtag('event', 'pwa_install_prompt', {
          outcome: outcome,
          platform: 'android'
        });
      }

      if (outcome === 'accepted') {
        setShowPrompt(false);
      }

      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS - show manual instructions
      // Keep prompt open to show instructions
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);

    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'pwa_install_dismissed', {
        platform: isIOS ? 'ios' : 'android'
      });
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="pwa-install-prompt" role="dialog" aria-labelledby="pwa-prompt-title">
      <div className="pwa-prompt-content">
        {/* App Icon */}
        <div className="pwa-prompt-icon">
          <img src="/icons/icon-192x192.png" alt="EasyCart icon" />
        </div>

        {/* Content */}
        <div className="pwa-prompt-text">
          <h3 id="pwa-prompt-title">Install EasyCart</h3>
          <p>
            {isIOS
              ? 'Add to home screen for faster access and offline shopping'
              : 'Install our app for faster access, offline browsing, and exclusive features'
            }
          </p>

          {/* iOS-specific instructions */}
          {isIOS && (
            <div className="pwa-ios-instructions">
              <ol>
                <li>
                  Tap the <strong>Share</strong> button{' '}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                  </svg>
                </li>
                <li>
                  Select <strong>"Add to Home Screen"</strong>
                </li>
                <li>
                  Tap <strong>"Add"</strong> to confirm
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pwa-prompt-actions">
          {!isIOS && (
            <button
              className="pwa-install-btn"
              onClick={handleInstall}
              aria-label="Install EasyCart app"
            >
              Install App
            </button>
          )}
          <button
            className="pwa-dismiss-btn"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
          >
            {isIOS ? 'Got it' : 'Maybe later'}
          </button>
        </div>

        {/* Close button */}
        <button
          className="pwa-close-btn"
          onClick={handleDismiss}
          aria-label="Close install prompt"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
