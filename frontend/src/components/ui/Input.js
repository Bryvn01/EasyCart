import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  label,
  error,
  className = '',
  type = 'text',
  id,
  required = false,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const inputStyles = `
    w-full px-3 py-2 border rounded-lg text-sm transition-colors
    focus:outline-none focus:ring-2 focus:border-transparent
    dark:bg-gray-800 dark:text-white
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'}
    disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-900
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`${inputStyles} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        required={required}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string,
  required: PropTypes.bool,
};

export default Input;
