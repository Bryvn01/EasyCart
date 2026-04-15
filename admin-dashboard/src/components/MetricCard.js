import React from 'react';
import Skeleton from './Skeleton';

const MetricCard = ({ title, value, trend, icon: Icon, loading = false }) => {
  const isPositive = typeof trend === 'string' && trend.startsWith('+');
  const isNegative = typeof trend === 'string' && trend.startsWith('-');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {Icon ? <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" /> : null}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-8 w-28" />
      ) : (
        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      )}

      {trend ? (
        <p
          className={`mt-2 text-sm ${
            isPositive
              ? 'text-green-600 dark:text-green-400'
              : isNegative
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {trend} from recent period
        </p>
      ) : null}
    </div>
  );
};

export default MetricCard;
