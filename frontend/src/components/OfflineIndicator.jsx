import React, { useState, useEffect } from 'react';
import './OfflineIndicator.css';

/**
 * OfflineIndicator - Network status banner
 *
 * 2025 Best Practices:
 * - Real-time online/offline detection
 * - Non-intrusive slide-in banner
 * - Auto-hide when back online
 * - Shows "Back online" confirmation
 * - Connection quality indicator (if supported)
 * - Accessible with ARIA live regions
 *
 * Features:
 * - navigator.onLine monitoring
 * - Connection API for speed detection
 * - Graceful degradation
 * - Analytics events for offline patterns
 */
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [connectionType, setConnectionType] = useState('');
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    // Network status change handlers
    const handleOnline = () => {
      setIsOnline(true);

      // Show "back online" message briefly
      if (wasOffline) {
        setShowBackOnline(true);
        setTimeout(() => {
          setShowBackOnline(false);
          setWasOffline(false);
        }, 3000);
      }

      // Analytics event
      if (window.gtag) {
        window.gtag('event', 'network_restored', {
          was_offline_duration: wasOffline
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowBackOnline(false);

      // Analytics event
      if (window.gtag) {
        window.gtag('event', 'network_lost');
      }
    };

    // Connection type detection (if supported)
    const updateConnectionInfo = () => {
      const connection = navigator.connection ||
                        navigator.mozConnection ||
                        navigator.webkitConnection;

      if (connection) {
        setConnectionType(connection.effectiveType || '');

        // Warn on slow connections
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          console.warn('Slow connection detected. Consider data-saving mode.');
        }
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Connection change listener (if supported)
    const connection = navigator.connection ||
                      navigator.mozConnection ||
                      navigator.webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }

    // Periodic connectivity check (backup)
    const connectivityCheck = setInterval(() => {
      const currentStatus = navigator.onLine;
      if (currentStatus !== isOnline) {
        if (currentStatus) {
          handleOnline();
        } else {
          handleOffline();
        }
      }
    }, 10000); // Check every 10 seconds

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
      clearInterval(connectivityCheck);
    };
  }, [isOnline, wasOffline]);

  // Don't show anything if online and hasn't been offline
  if (isOnline && !showBackOnline) return null;

  return (
    <div
      className={`offline-indicator ${!isOnline ? 'is-offline' : 'is-online'}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="offline-content">
        {!isOnline ? (
          <>
            {/* Offline state */}
            <svg className="offline-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
            <div className="offline-text">
              <strong>You're offline</strong>
              <p>Some features may be limited. Check your internet connection.</p>
            </div>
          </>
        ) : (
          <>
            {/* Back online state */}
            <svg className="online-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="offline-text">
              <strong>Back online</strong>
              <p>Your connection has been restored.</p>
            </div>
          </>
        )}

        {/* Connection quality indicator */}
        {connectionType && !isOnline && (
          <span className="connection-type">
            {connectionType === '4g' ? '4G' :
             connectionType === '3g' ? '3G' :
             connectionType === '2g' ? '2G' :
             connectionType}
          </span>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
