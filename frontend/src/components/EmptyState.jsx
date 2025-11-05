import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  type = 'products',
  title,
  message,
  actionText,
  actionLink,
  onAction
}) => {
  const emptyStates = {
    products: {
      icon: '🔍',
      title: 'No Products Found',
      message: 'We couldn\'t find any products matching your search. Try different keywords or browse our categories.',
      actionText: 'Browse All Products',
      actionLink: '/products'
    },
    cart: {
      icon: '🛒',
      title: 'Your Cart is Empty',
      message: 'Looks like you haven\'t added anything to your cart yet. Start shopping and discover amazing deals!',
      actionText: 'Start Shopping',
      actionLink: '/products'
    },
    orders: {
      icon: '📦',
      title: 'No Orders Yet',
      message: 'You haven\'t placed any orders yet. Browse our products and place your first order today!',
      actionText: 'Shop Now',
      actionLink: '/products'
    },
    wishlist: {
      icon: '❤️',
      title: 'Your Wishlist is Empty',
      message: 'Save your favorite items here for easy access later. Start adding products you love!',
      actionText: 'Discover Products',
      actionLink: '/products'
    },
    search: {
      icon: '🔎',
      title: 'No Results Found',
      message: 'We couldn\'t find what you\'re looking for. Try adjusting your search or explore our categories.',
      actionText: 'Clear Search',
      actionLink: '/products'
    },
    error: {
      icon: '⚠️',
      title: 'Oops! Something Went Wrong',
      message: 'We\'re having trouble loading this page. Please try again or contact support if the problem persists.',
      actionText: 'Try Again',
      actionLink: null
    }
  };

  const state = emptyStates[type] || emptyStates.products;
  const finalTitle = title || state.title;
  const finalMessage = message || state.message;
  const finalActionText = actionText || state.actionText;
  const finalActionLink = actionLink || state.actionLink;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      {/* Animated Icon */}
      <div
        className="text-8xl mb-6 animate-bounce-slow"
        style={{
          animation: 'bounce 2s infinite'
        }}
      >
        {state.icon}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        {finalTitle}
      </h2>

      {/* Message */}
      <p className="text-gray-600 mb-8 leading-relaxed">
        {finalMessage}
      </p>

      {/* Action Button */}
      {finalActionLink ? (
        <Link
          to={finalActionLink}
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          {finalActionText}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      ) : onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          {finalActionText}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      ) : null}

      {/* Additional Help */}
      <div className="mt-8 pt-8 border-t border-gray-200 w-full">
        <p className="text-sm text-gray-500 mb-3">Need help?</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/contact"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Contact Support
          </Link>
          <span className="text-gray-300">•</span>
          <Link
            to="/faq"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View FAQ
          </Link>
          <span className="text-gray-300">•</span>
          <a
            href="https://wa.me/254700123456"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  );
};

// Add bounce animation
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}

export default EmptyState;
