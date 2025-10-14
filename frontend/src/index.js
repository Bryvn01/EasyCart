import { HelmetProvider } from 'react-helmet-async';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
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

// DISABLED: Service worker causes caching issues during development
// Uncomment for production PWA functionality
// serviceWorkerRegistration.register({
//   onSuccess: () => {
//     console.log('Service worker registered successfully. App is ready for offline use.');
//   },
//   onUpdate: (registration) => {
//     console.log('New version available! Please refresh the page.');
//   }
// });

// Unregister any existing service workers to clear cache
serviceWorkerRegistration.unregister();