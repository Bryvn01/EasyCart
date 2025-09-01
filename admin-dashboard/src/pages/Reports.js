import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';

const Reports = () => {
  const metrics = [
    { name: 'Revenue Growth', value: '+12.5%', trend: 'up', icon: TrendingUp },
    { name: 'Order Volume', value: '+8.2%', trend: 'up', icon: ShoppingCart },
    { name: 'Customer Acquisition', value: '-2.1%', trend: 'down', icon: TrendingDown },
    { name: 'Average Order Value', value: 'KES 245', trend: 'neutral', icon: DollarSign },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-sm text-gray-700">View business performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 ${
                      metric.trend === 'up' ? 'text-green-600' :
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{metric.name}</dt>
                      <dd className={`text-lg font-medium ${
                        metric.trend === 'up' ? 'text-green-900' :
                        metric.trend === 'down' ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {metric.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chart visualization would go here</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;