import React from 'react';

const statusConfig = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
};

const toLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

const StatusBadge = ({ status = 'pending' }) => {
  const normalized = String(status).toLowerCase().trim();
  const style = statusConfig[normalized] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {toLabel(normalized || 'pending')}
    </span>
  );
};

export default StatusBadge;
