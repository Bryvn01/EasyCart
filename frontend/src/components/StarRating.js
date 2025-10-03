import React from 'react';
import PropTypes from 'prop-types';

const StarRating = ({ rating, maxStars = 5, size = 'md', showValue = false, interactive = false, onChange }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleClick = (starValue) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          const filled = starValue <= Math.floor(rating);
          const partial = starValue === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              disabled={!interactive}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
              style={{ background: 'none', border: 'none', padding: '2px' }}
            >
              <svg
                className={`${sizeClasses[size]} ${
                  filled ? 'text-yellow-400 fill-current' : 
                  partial ? 'text-yellow-400' : 
                  'text-gray-300'
                }`}
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                {partial ? (
                  <defs>
                    <linearGradient id={`partial-${index}`}>
                      <stop offset={`${(rating % 1) * 100}%`} stopColor="currentColor" />
                      <stop offset={`${(rating % 1) * 100}%`} stopColor="#D1D5DB" />
                    </linearGradient>
                  </defs>
                ) : null}
                <path
                  fill={partial ? `url(#partial-${index})` : 'currentColor'}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  maxStars: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showValue: PropTypes.bool,
  interactive: PropTypes.bool,
  onChange: PropTypes.func
};

export default StarRating;
