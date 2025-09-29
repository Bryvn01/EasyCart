import React from 'react';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  actionText = "Try Again",
  className = ""
}) => {
  const defaultIcon = (
    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-8 5-8-5" />
    </svg>
  );

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title || "No data available"}
      </h3>
      
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

// Specific empty state components
export const EmptyCart = ({ onShop }) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5m4.5 5a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    }
    title="Your cart is empty"
    description="Looks like you haven't added any items to your cart yet. Start shopping to fill it up!"
    action={onShop}
    actionText="Start Shopping"
  />
);

export const EmptyWishlist = ({ onBrowse }) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    }
    title="Your wishlist is empty"
    description="Save items you love for later by clicking the heart icon when browsing products."
    action={onBrowse}
    actionText="Browse Products"
  />
);

export const EmptyOrders = ({ onShop }) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    }
    title="No orders yet"
    description="When you make your first purchase, your order history will appear here."
    action={onShop}
    actionText="Start Shopping"
  />
);

export const EmptySearchResults = ({ searchQuery, onClear }) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="No results found"
    description={`We couldn't find any products matching "${searchQuery}". Try adjusting your search or browse our categories.`}
    action={onClear}
    actionText="Clear Search"
  />
);

export const NetworkError = ({ onRetry }) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title="Connection problem"
    description="Please check your internet connection and try again."
    action={onRetry}
    actionText="Retry"
  />
);

export default EmptyState;