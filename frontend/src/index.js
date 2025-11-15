import { HelmetProvider } from 'react-helmet-async';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n/index';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// PRODUCTION: Enable service worker for PWA functionality
// 2025 Best Practice: Progressive enhancement with offline support
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({
    onSuccess: () => {
      console.log('✅ Service worker registered. App is ready for offline use.');
    },
    onUpdate: (registration) => {
      console.log('🔄 New version available! App will update on next reload.');
      // Show update notification (handled in serviceWorkerRegistration.js)
    }
  });
} else {
  // DEVELOPMENT: Unregister to prevent caching issues
  serviceWorkerRegistration.unregister();
  console.log('🔧 Development mode: Service worker disabled');
}
