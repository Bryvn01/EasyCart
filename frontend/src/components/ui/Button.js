import React from 'react';
import { useAccessibilityPreferences } from '../../hooks/useAccessibility';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '',
  as: Component = 'button',
  ariaLabel,
  ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  ...props 
}) => {
  const { prefersReducedMotion } = useAccessibilityPreferences();
  
  const baseStyles = `
    inline-flex items-center justify-center font-medium transition-all 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    min-h-[44px] min-w-[44px]
    ${prefersReducedMotion ? 'transition-none' : 'duration-200'}
  `;
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800'
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs rounded min-h-[36px]',
    sm: 'px-3 py-1.5 text-sm rounded-md min-h-[40px]',
    md: 'px-4 py-2 text-sm rounded-lg min-h-[44px]',
    lg: 'px-6 py-3 text-base rounded-lg min-h-[48px]'
  };

  const isDisabled = disabled || loading;
  
  return (
    <Component
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {loading && (
        <span className="sr-only">Loading</span>
      )}
      {children}
    </Component>
  );
};

export default Button;