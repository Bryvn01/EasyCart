import React from 'react';

const Card = ({ children, className = '', hover = false, ...props }) => {
  const baseStyles = 'bg-white rounded-xl border border-gray-200 shadow-sm';
  const hoverStyles = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : '';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;