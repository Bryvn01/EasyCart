import React, { useState, useEffect } from 'react';
import { isPWA } from '../serviceWorkerRegistration';

/**
 * PWA Install Prompt Component
 * Shows a banner prompting users to install the PWA
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isPWA()) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show the install prompt after a delay (better UX)
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if dismissed in this session
  if (sessionStorage.getItem('pwa-prompt-dismissed') === 'true') {
    return null;
  }

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="install-prompt" style={styles.container}>
      <div style={styles.content}>
        <div style={styles.icon}>📱</div>
        <div style={styles.text}>
          <h3 style={styles.title}>Install EasyCart</h3>
          <p style={styles.description}>
            Add to your home screen for quick access and offline support
          </p>
        </div>
        <div style={styles.actions}>
          <button onClick={handleInstallClick} style={styles.installButton}>
            Install
          </button>
          <button onClick={handleDismiss} style={styles.dismissButton}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '80px',
    left: '16px',
    right: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    padding: '16px',
    zIndex: 1000,
    animation: 'slideUp 0.3s ease',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  icon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#111827',
  },
  description: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: 1.4,
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  installButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: 'none',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '36px',
    height: '36px',
  },
};

export default PWAInstallPrompt;
