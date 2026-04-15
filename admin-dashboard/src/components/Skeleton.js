import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`} />
);

export default Skeleton;
