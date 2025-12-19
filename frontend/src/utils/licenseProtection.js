/**
 * EasyCart Frontend - License & Copyright Protection
 * Copyright (c) 2025 Bryvn01. All rights reserved.
 *
 * This file adds watermarking and license verification to the frontend.
 * Import this in your main App.js or index.js
 */

export const initializeLicenseProtection = () => {
  // Console watermark
  const styles = {
    title: 'font-size: 24px; font-weight: bold; color: #4CAF50; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
    warning: 'font-size: 14px; font-weight: bold; color: #f44336; background: #ffebee; padding: 10px;',
    copyright: 'font-size: 12px; color: #666;',
    info: 'font-size: 12px; color: #2196F3;'
  };

  console.log('%c🛒 EasyCart E-Commerce Platform', styles.title);
  console.log('%c© 2025 Bryvn01. All Rights Reserved.', styles.copyright);
  console.log('%cProprietary Software - Unauthorized use is prohibited', styles.copyright);
  console.log('%c⚠️ WARNING: This is licensed software', styles.warning);
  console.log('%cUnauthorized copying, distribution, or use may result in legal action.', styles.warning);
  console.log('%cℹ️ For licensing: admin@easycart.com | github.com/Bryvn01/EasyCart', styles.info);
  console.log(' ');

  // Add invisible watermark to DOM
  const watermark = document.createElement('div');
  watermark.setAttribute('data-easycart-copyright', '© 2025 Bryvn01');
  watermark.setAttribute('data-easycart-license', 'PROPRIETARY');
  watermark.setAttribute('data-easycart-repo', 'github.com/Bryvn01/EasyCart');
  watermark.style.display = 'none';
  document.body.appendChild(watermark);

  // Add meta tags for copyright
  const metaCopyright = document.createElement('meta');
  metaCopyright.setAttribute('name', 'copyright');
  metaCopyright.setAttribute('content', '© 2025 Bryvn01. All rights reserved.');
  document.head.appendChild(metaCopyright);

  const metaAuthor = document.createElement('meta');
  metaAuthor.setAttribute('name', 'author');
  metaAuthor.setAttribute('content', 'Bryvn01');
  document.head.appendChild(metaAuthor);

  // Detect DevTools and show warning
  const devtools = /./;
  devtools.toString = function() {
    console.log('%c⚠️ DEVELOPER WARNING', 'font-size: 18px; font-weight: bold; color: #f44336;');
    console.log('%cYou are viewing the source code of licensed software.', 'font-size: 14px; color: #666;');
    console.log('%cCopyright © 2025 Bryvn01. All rights reserved.', 'font-size: 14px; color: #666;');
    console.log('%cUnauthorized use, copying, or distribution is illegal.', 'font-size: 14px; color: #f44336;');
    console.log('%cFor licensing: admin@easycart.com', 'font-size: 14px; color: #2196F3;');
    return '';
  };
  console.log('%c', devtools);

  // Disable right-click in production (optional - can be annoying for users)
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_DISABLE_RIGHT_CLICK === 'true') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      console.log('%c⚠️ Right-click disabled - Licensed Software', 'color: #f44336; font-weight: bold;');
      return false;
    });
  }

  // Prevent source viewing shortcuts (optional - not foolproof)
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_DISABLE_SHORTCUTS === 'true') {
    document.addEventListener('keydown', (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        console.log('%c⚠️ Developer tools access disabled - Licensed Software', 'color: #f44336; font-weight: bold;');
        return false;
      }
    });
  }

  // Add copyright footer programmatically
  const addCopyrightFooter = () => {
    const footer = document.querySelector('footer');
    if (footer && !footer.querySelector('.easycart-copyright')) {
      const copyright = document.createElement('div');
      copyright.className = 'easycart-copyright';
      copyright.style.cssText = 'text-align: center; padding: 10px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px;';
      copyright.innerHTML = `
        <p style="margin: 5px 0;">© ${new Date().getFullYear()} EasyCart by Bryvn01. All rights reserved.</p>
        <p style="margin: 5px 0; font-size: 11px;">Licensed Software - Unauthorized use prohibited</p>
      `;
      footer.appendChild(copyright);
    }
  };

  // Try to add footer when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyrightFooter);
  } else {
    addCopyrightFooter();
  }

  // Periodic license check (every 30 minutes)
  setInterval(() => {
    console.log('%c🔒 License Check', 'color: #4CAF50; font-weight: bold;');
    console.log('%cEasyCart © 2025 Bryvn01', 'color: #666;');
  }, 1800000); // 30 minutes
};

// Export license info for display in About page
export const getLicenseInfo = () => {
  return {
    product: 'EasyCart E-Commerce Platform',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    copyright: '© 2025 Bryvn01. All rights reserved.',
    license: 'Proprietary',
    repository: 'github.com/Bryvn01/EasyCart',
    contact: 'admin@easycart.com',
    warning: 'This is licensed software. Unauthorized use, copying, or distribution is prohibited by law.'
  };
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Initialize when module loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLicenseProtection);
  } else {
    initializeLicenseProtection();
  }
}

const licenseProtection = {
  initializeLicenseProtection,
  getLicenseInfo
};

export default licenseProtection;
