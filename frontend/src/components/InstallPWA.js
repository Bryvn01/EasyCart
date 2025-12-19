import React, { useState, useEffect } from 'react';
import { isInstalled } from '../serviceWorkerRegistration';

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInstalled()) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);

      // Show prompt after a delay (better UX)
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    await installPrompt.userChoice;

    setInstallPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that user dismissed it (don't show again for 7 days)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if user dismissed it recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }
  }, []);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (showPrompt) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showPrompt]);

  if (!showPrompt || !installPrompt) return null;

  return (
    <div
      className="install-pwa-prompt"
      style={{
        position: 'fixed',
        top: '80px',
        right: '16px',
        left: '16px',
        zIndex: 60,
        animation: 'slideDown 0.4s ease-out',
        maxWidth: '420px',
        margin: '0 auto'
      }}
      role="dialog"
      aria-label="Install app prompt"
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          padding: '16px',
          border: '1px solid #e5e7eb'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {/* App Icon */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: '0 0 6px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827'
              }}
            >
              Install EasyCart
            </h3>
            <p
              style={{
                margin: '0 0 12px 0',
                fontSize: '13px',
                color: '#6b7280',
                lineHeight: '1.4'
              }}
            >
              Quick access, faster checkout, and personalized shopping experience.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleInstallClick}
                style={{
                  flex: 1,
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => (e.target.style.background = '#1d4ed8')}
                onMouseOut={(e) => (e.target.style.background = '#2563eb')}
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                style={{
                  background: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                Not Now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => (e.target.style.color = '#6b7280')}
            onMouseOut={(e) => (e.target.style.color = '#9ca3af')}
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .install-pwa-prompt {
            bottom: 10px;
            left: 10px;
            right: 10px;
            transform: none;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default InstallPWA;
