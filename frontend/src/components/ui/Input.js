import React from 'react';
import { useId } from '../../hooks/useAccessibility';

const Input = ({ 
  label, 
  error, 
  helpText,
  required = false,
  className = '', 
  type = 'text',
  ...props 
}) => {
  const inputId = useId('input');
  const errorId = useId('error');
  const helpId = useId('help');

  const inputStyles = `
    w-full px-3 py-2 border rounded-lg text-sm transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
    ${error ? 'focus:ring-red-500' : ''}
    dark:bg-gray-800 dark:text-white
  `;

  const describedBy = [
    helpText ? helpId : null,
    error ? errorId : null
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        className={`${inputStyles} ${className}`}
        {...props}
      />
      
      {helpText && (
        <p 
          id={helpId}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {helpText}
        </p>
      )}
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400" 
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;