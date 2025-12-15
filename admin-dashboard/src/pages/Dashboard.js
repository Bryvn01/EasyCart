import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch data from multiple endpoints
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        adminAPI.getProducts({ page: 1, limit: 1 }),
        adminAPI.getOrders({ page: 1, limit: 5 }),
        adminAPI.getCustomers ? adminAPI.getCustomers() : Promise.resolve({ data: [] })
      ]);

      const productsData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.results || []);
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.results || []);
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.results || usersRes.data?.customers || []);

      const totalProducts = productsRes.data?.count || productsData.length;
      const totalOrders = ordersRes.data?.count || ordersData.length;
      const totalUsers = usersRes.data?.count || usersData.length;

      // Calculate revenue from orders
      const totalRevenue = ordersData.reduce((sum, order) => {
        const amount = parseFloat(order.total_amount || 0);
        return sum + amount;
      }, 0);

      // Transform recent orders with proper customer display
      const recentOrders = ordersData.slice(0, 5).map(order => {
        // Use user_details (nested serializer) first, then fallback to user ID lookup
        const userDetails = order.user_details;
        let customerName = 'Guest Customer';

        if (userDetails) {
          customerName = userDetails.username || userDetails.email || `User #${userDetails.id}`;
        } else if (order.user) {
          // Fallback for legacy data
          customerName = typeof order.user === 'object'
            ? (order.user.username || order.user.email || `User #${order.user.id}`)
            : `User #${order.user}`;
        }

        return {
          id: order.id,
          customer: customerName,
          total: parseFloat(order.total_amount || 0).toFixed(2),
          status: (order.status || 'pending').toLowerCase().trim()
        };
      });

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Unable to load dashboard data');
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
    { name: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-green-500' },
    { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-purple-500' },
    { name: 'Revenue', value: `KES ${(stats.totalRevenue || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'bg-yellow-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Welcome to the EasyCart admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} rounded-md p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Orders</h3>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      KES {order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' || order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
