import React from 'react';

export default function ProductListErrorUI({ error, onRetry, t = (k, d) => k }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-red-600 mb-2">{t('errorLoadingProducts', 'Error Loading Products')}</h3>
      <p className="text-gray-600 mb-4">{error?.message || t('unknownError', 'An unknown error occurred.')}</p>
      <button
        onClick={onRetry || (() => {})}
        className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition"
      >
        {t('tryAgain', 'Try Again')}
      </button>
    </div>
  );
}
