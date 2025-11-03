import React, { useEffect, useState } from 'react';

const SuccessAnimation = ({ message = "Added to cart!", onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-20 right-4 z-50 animate-slide-in-right"
      style={{
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-sm">
        {/* Animated Checkmark */}
        <div className="flex-shrink-0">
          <svg 
            className="w-6 h-6 animate-scale-in" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            style={{
              animation: 'scaleIn 0.3s ease-out'
            }}
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          <p className="text-sm opacity-90">View cart to checkout</p>
        </div>

        {/* Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-b-lg"
          style={{
            width: '100%',
            animation: 'shrink 3s linear'
          }}
        />
      </div>
    </div>
  );
};

// Add animations to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }

  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}

export default SuccessAnimation;
