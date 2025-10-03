import React, { useState, useEffect } from 'react';

/**
 * Network Status Indicator Component
 * Shows a banner when the user goes offline or comes back online
 */
const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      
      // Auto-hide "back online" message after 3 seconds
      setTimeout(() => {
        setShowStatus(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus) {
    return null;
  }

  return (
    <div 
      className={`network-status ${isOnline ? 'online' : 'offline'}`}
      style={{
        ...styles.container,
        backgroundColor: isOnline ? '#10b981' : '#ef4444',
      }}
      role="alert"
      aria-live="polite"
    >
      <div style={styles.content}>
        <span style={styles.icon}>
          {isOnline ? '✓' : '⚠️'}
        </span>
        <span style={styles.text}>
          {isOnline 
            ? 'You are back online' 
            : 'You are offline. Some features may be limited.'}
        </span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    color: 'white',
    textAlign: 'center',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 500,
    zIndex: 10000,
    transform: 'translateY(0)',
    transition: 'transform 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  icon: {
    fontSize: '16px',
  },
  text: {
    fontSize: '14px',
  },
};

export default NetworkStatus;
