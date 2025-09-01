import React from 'react';

const CartBadge = ({ count, className = "" }) => {
  if (count === 0) return null;

  return (
    <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default CartBadge;