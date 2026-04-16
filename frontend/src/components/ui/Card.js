import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, className = '', hover = false, ...props }) => {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm';
  const hoverStyles = hover ? 'hover:shadow-md transition-shadow duration-150' : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  hover: PropTypes.bool,
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

CardContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
