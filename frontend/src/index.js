import { HelmetProvider } from 'react-helmet-async';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/mobile-pwa.css';
import './i18n/index';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Register service worker for PWA support
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('Content is cached for offline use.');
  },
  onUpdate: (registration) => {
    console.log('New content is available; please refresh.');
    // Optionally show a notification to the user
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
});

// Setup network status detection
serviceWorkerRegistration.setupNetworkDetection();