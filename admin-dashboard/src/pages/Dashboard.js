import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, DollarSign, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import Sparkline from '../components/Sparkline';
import Skeleton from '../components/Skeleton';

const formatPercentChange = (current, previous) => {
  if (previous <= 0) {
    return current > 0 ? '+100.0%' : '0.0%';
  }

  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    revenueTrendData: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        adminAPI.getProducts({ page: 1, limit: 5 }),
        adminAPI.getOrders({ page: 1, limit: 30 }),
        adminAPI.getCustomers ? adminAPI.getCustomers() : Promise.resolve({ data: [] })
      ]);

      const productsData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.results || []);
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.results || []);
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.results || usersRes.data?.customers || []);

      const totalProducts = productsRes.data?.count || productsData.length;
      const totalOrders = ordersRes.data?.count || ordersData.length;
      const totalUsers = usersRes.data?.count || usersData.length;

      const totalRevenue = ordersData.reduce((sum, order) => {
        const amount = parseFloat(order.total_amount || 0);
        return sum + amount;
      }, 0);

      const recentOrders = ordersData.slice(0, 5).map((order) => {
        const userDetails = order.user_details;
        let customerName = 'Guest Customer';

        if (userDetails) {
          customerName = userDetails.username || userDetails.email || `User #${userDetails.id}`;
        } else if (order.user) {
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

      const revenueTrendData = ordersData
        .slice(0, 12)
        .map((order) => parseFloat(order.total_amount || 0))
        .reverse();

      const topProducts = productsData.slice(0, 5).map((product) => ({
        id: product.id,
        name: product.name || `Product #${product.id}`,
        sold: Number(product.total_sold ?? product.sold_count ?? 0)
      }));

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders,
        revenueTrendData,
        topProducts
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Unable to load dashboard data');
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        recentOrders: [],
        revenueTrendData: [],
        topProducts: []
      });
    } finally {
      setLoading(false);
    }
  };

  const revenueTrend = useMemo(() => {
    const midpoint = Math.floor(stats.revenueTrendData.length / 2);
    const previousRevenue = stats.revenueTrendData.slice(0, midpoint).reduce((sum, value) => sum + value, 0);
    const currentRevenue = stats.revenueTrendData.slice(midpoint).reduce((sum, value) => sum + value, 0);
    return midpoint > 0 ? formatPercentChange(currentRevenue, previousRevenue) : null;
  }, [stats.revenueTrendData]);

  const statCards = [
    { title: 'Revenue', value: `KES ${(stats.totalRevenue || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: revenueTrend, icon: DollarSign },
    { title: 'Orders', value: stats.totalOrders, trend: null, icon: ShoppingCart },
    { title: 'Products', value: stats.totalProducts, trend: null, icon: Package },
    { title: 'Users', value: stats.totalUsers, trend: null, icon: Users }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Welcome to the EasyCart admin dashboard</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/orders"
            className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Order
          </Link>
          <Link
            to="/admin/products"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            trend={card.trend}
            icon={card.icon}
            loading={loading}
          />
        ))}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Recent orders</span>
        </div>
        {loading ? (
          <Skeleton className="h-14 w-full" />
        ) : (
          <Sparkline data={stats.revenueTrendData} />
        )}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {loading
                  ? Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-6 w-20" /></td>
                    </tr>
                  ))
                  : stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">#{order.id}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{order.customer}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">KES {order.total}</td>
                      <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!loading && stats.recentOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No recent orders found.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Top Products</h2>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : stats.topProducts.length > 0 ? (
              stats.topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 dark:border-gray-700">
                  <span className="truncate pr-3 text-sm text-gray-700 dark:text-gray-200">{product.name}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{product.sold} sold</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Product performance data is not available yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
