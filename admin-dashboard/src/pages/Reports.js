import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [metrics, setMetrics] = useState([
    { name: 'Revenue Growth', value: '+12.5%', trend: 'up', icon: TrendingUp },
    { name: 'Order Volume', value: '+8.2%', trend: 'up', icon: ShoppingCart },
    { name: 'Customer Acquisition', value: '-2.1%', trend: 'down', icon: TrendingDown },
    { name: 'Average Order Value', value: 'KES 245', trend: 'neutral', icon: DollarSign },
  ]);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const ordersRes = await adminAPI.getOrders({ page: 1, limit: 100 });
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.results || []);

      // Group orders by date for chart
      const salesByDate = {};
      ordersData.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!salesByDate[date]) {
          salesByDate[date] = { date, revenue: 0, orders: 0 };
        }
        salesByDate[date].revenue += parseFloat(order.total_amount || 0);
        salesByDate[date].orders += 1;
      });

      const chartData = Object.values(salesByDate).slice(-7); // Last 7 days
      setSalesData(chartData);

      // Calculate metrics
      const totalRevenue = ordersData.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const avgOrderValue = ordersData.length > 0 ? totalRevenue / ordersData.length : 0;

      setMetrics([
        { name: 'Total Revenue', value: `KES ${totalRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, trend: 'up', icon: DollarSign },
        { name: 'Total Orders', value: ordersData.length, trend: 'up', icon: ShoppingCart },
        { name: 'Avg Order Value', value: `KES ${avgOrderValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, trend: 'neutral', icon: TrendingUp },
        { name: 'Orders Today', value: ordersData.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length, trend: 'up', icon: ShoppingCart },
      ]);
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Sales Chart */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Overview (Last 7 Days)</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (KES)" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#10b981" name="Orders" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">No sales data available</p>
          </div>
        )}
      </div>

      {/* Orders Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Day</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">No orders data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
