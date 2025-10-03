import React, { useState, useEffect } from 'react';
import { addNetworkListener } from '../serviceWorkerRegistration';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Set initial status
    const initialStatus = addNetworkListener((online) => {
      setIsOnline(online);
      setShowStatus(true);
      
      // Hide the notification after 3 seconds
      setTimeout(() => {
        setShowStatus(false);
      }, 3000);
    });

    setIsOnline(initialStatus);
  }, []);

  if (!showStatus) return null;

  return (
    <div
      className="network-status"
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9999,
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '90%'
      }}
      role="alert"
      aria-live="polite"
    >
      <div
        style={{
          background: isOnline ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }}
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
          {isOnline ? (
            <>
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </>
          ) : (
            <>
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </>
          )}
        </svg>
        <span>
          {isOnline
            ? 'Back online! Your data is being synced.'
            : 'You are offline. Some features may be limited.'}
        </span>
      </div>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .network-status {
            top: 60px;
            right: 10px;
            left: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default NetworkStatus;
