import React from 'react';

const Loading = ({ size = 'md', className = '', text, fullscreen = false, overlay = false }) => {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center space-y-3">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400 ${sizes[size]}`}></div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 z-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <LoadingSpinner />
    </div>
  );
};

// Loading skeleton component
export const LoadingSkeleton = ({ height = 'h-4', width = 'w-full', className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${height} ${width} ${className}`}></div>
);

// Loading dots component
export const LoadingDots = ({ size = 'md', className = '' }) => {
  const dotSizes = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSizes[size]} bg-blue-600 rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        ></div>
      ))}
    </div>
  );
};

// Loading progress bar
export const LoadingProgress = ({ progress = 0, className = '' }) => (
  <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    ></div>
  </div>
);

export default Loading;