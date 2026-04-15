import React from 'react';

const CENTER_POINT = 50;

const Sparkline = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="h-14 w-full rounded bg-gray-100 dark:bg-gray-700" />;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data
    .map((value, index) => {
      const x = data.length === 1 ? CENTER_POINT : (index / (data.length - 1)) * 100;
      const y = range === 0 ? CENTER_POINT : ((value - min) / range) * 100;
      return `${x},${100 - y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-14 w-full text-blue-500">
      <polyline fill="none" stroke="currentColor" strokeWidth="3" points={points} />
    </svg>
  );
};

export default Sparkline;
