import React, { useEffect } from 'react';

const ImageLightbox = ({ imageUrl, productName, onClose }) => {
  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all z-10"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image Container */}
      <div
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-contain rounded-lg"
          style={{
            maxHeight: '90vh',
            touchAction: 'pinch-zoom'
          }}
        />

        {/* Product Name */}
        {productName && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 rounded-b-lg">
            <p className="text-center font-medium">{productName}</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm opacity-70">
        Pinch to zoom • Tap outside to close
      </div>
    </div>
  );
};

export default ImageLightbox;
