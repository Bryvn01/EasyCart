import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  ...props 
}) => {
  const inputStyles = `
    w-full px-3 py-2 border rounded-lg text-sm transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${error ? 'focus:ring-red-500' : ''}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`${inputStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;