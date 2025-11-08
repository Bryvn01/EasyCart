import React, { useState, useEffect, useMemo } from 'react';
import { ordersAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getOrders();

      console.log('Orders API Response:', response.data);

      // Handle both array and paginated object responses
      let ordersData = response.data;
      if (ordersData && typeof ordersData === 'object' && !Array.isArray(ordersData)) {
        // If it's a paginated response, extract the results array
        ordersData = ordersData.results || ordersData.data || [];
        console.log('Extracted orders from paginated response:', ordersData);
      }

      const finalOrders = Array.isArray(ordersData) ? ordersData : [];
      console.log('Final orders array:', finalOrders);
      setOrders(finalOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: '#f59e0b',
        bg: '#fef3c7',
        label: 'Pending',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        )
      },
      processing: {
        color: '#3b82f6',
        bg: '#dbeafe',
        label: 'Processing',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 2s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        )
      },
      shipped: {
        color: '#8b5cf6',
        bg: '#ede9fe',
        label: 'Shipped',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        )
      },
      delivered: {
        color: '#10b981',
        bg: '#d1fae5',
        label: 'Delivered',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )
      },
      cancelled: {
        color: '#ef4444',
        bg: '#fee2e2',
        label: 'Cancelled',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        )
      }
    };
    return configs[status] || {
      color: '#6b7280',
      bg: '#f3f4f6',
      label: status,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )
    };
  };

  const getPaymentStatusConfig = (status) => {
    const configs = {
      pending: { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
      processing: { color: '#3b82f6', bg: '#dbeafe', label: 'Processing' },
      completed: { color: '#10b981', bg: '#d1fae5', label: 'Completed' },
      failed: { color: '#ef4444', bg: '#fee2e2', label: 'Failed' },
      cancelled: { color: '#6b7280', bg: '#f3f4f6', label: 'Cancelled' }
    };
    return configs[status] || { color: '#6b7280', bg: '#f3f4f6', label: status || 'Pending' };
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      mpesa: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      ),
      airtel: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      ),
      tkash: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      ),
      card: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      stripe: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      paypal: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      bank: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="21" x2="21" y2="21"/>
          <line x1="9" y1="8" x2="10" y2="8"/>
          <line x1="15" y1="8" x2="16" y2="8"/>
          <path d="M9 21v-13h6v13"/>
          <path d="M5 21v-7"/>
          <path d="M19 21v-7"/>
          <line x1="3" y1="14" x2="21" y2="14"/>
        </svg>
      ),
      cash: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      )
    };
    return icons[method?.toLowerCase()] || icons.card;
  };

  const filteredOrders = useMemo(() => {
    // Ensure orders is always an array
    const ordersArray = Array.isArray(orders) ? orders : [];

    return ordersArray.filter(order => {
      const matchesSearch =
        order.id.toString().includes(searchTerm) ||
        order.shipping_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesPayment = filterPayment === 'all' || order.payment_status === filterPayment;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, filterStatus, filterPayment]);

  const orderStats = useMemo(() => {
    // Ensure orders is always an array
    const ordersArray = Array.isArray(orders) ? orders : [];

    return {
      total: ordersArray.length,
      pending: ordersArray.filter(o => o.status === 'pending').length,
      processing: ordersArray.filter(o => o.status === 'processing').length,
      completed: ordersArray.filter(o => o.status === 'delivered').length,
      totalSpent: ordersArray.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
    };
  }, [orders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container py-16">
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              style={{
                margin: '0 auto 1.5rem',
                animation: 'spin 1s linear infinite'
              }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <h3 className="text-xl font-semibold mb-2">Loading Your Orders</h3>
            <p style={{ color: 'var(--gray-600)' }}>Please wait while we fetch your order history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16">
        <div className="max-w-6xl mx-auto">
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', borderColor: '#ef4444' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ margin: '0 auto 1.5rem' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#ef4444' }}>Error Loading Orders</h3>
            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-6)' }}>{error}</p>
            <button onClick={fetchOrders} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-6xl mx-auto">
          <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5" style={{ margin: '0 auto 1.5rem' }}>
              <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <h2 className="text-2xl font-bold mb-3">No Orders Yet</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-6)', maxWidth: '500px', margin: '0 auto 2rem' }}>
              You haven't placed any orders yet. Start shopping to discover our amazing products!
            </p>
            <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block' }}>
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav style={{
          fontSize: '0.875rem',
          marginBottom: 'var(--space-6)',
          color: 'var(--gray-600)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          <Link to="/" style={{ color: 'var(--gray-600)', textDecoration: 'none' }}>Home</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>My Orders</span>
        </nav>

        {/* Header Section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 className="text-3xl font-bold mb-2">Order History</h1>
          <p style={{ color: 'var(--gray-600)' }}>Track and manage all your orders</p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-1)' }}>Total Orders</p>
            <p className="text-2xl font-bold">{orderStats.total}</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-1)' }}>Pending</p>
            <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{orderStats.pending}</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-1)' }}>Processing</p>
            <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{orderStats.processing}</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-1)' }}>Total Spent</p>
            <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{formatCurrency(orderStats.totalSpent)}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
                Search Orders
              </label>
              <input
                type="text"
                placeholder="Order ID, address, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
                Order Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
                Payment Status
              </label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          {(searchTerm || filterStatus !== 'all' || filterPayment !== 'all') && (
            <div style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              Showing {filteredOrders.length} of {orders.length} orders
              {(searchTerm || filterStatus !== 'all' || filterPayment !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterPayment('all');
                  }}
                  style={{
                    marginLeft: 'var(--space-3)',
                    color: 'var(--primary)',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto 1.5rem' }}>
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
            <p style={{ color: 'var(--gray-600)' }}>Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filteredOrders.map(order => {
              const statusConfig = getStatusConfig(order.status);
              const paymentConfig = getPaymentStatusConfig(order.payment_status);
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
                  {/* Order Header */}
                  <div style={{
                    padding: 'var(--space-4)',
                    background: 'var(--gray-50)',
                    borderBottom: '1px solid var(--gray-200)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)'
                  }}>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Order #{order.id}</h3>
                      <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <span style={{
                        background: statusConfig.bg,
                        color: statusConfig.color,
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <span>{statusConfig.icon}</span>
                        {statusConfig.label}
                      </span>
                      <span style={{
                        background: paymentConfig.bg,
                        color: paymentConfig.color,
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {paymentConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div style={{ padding: 'var(--space-5)' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 'var(--space-5)',
                      marginBottom: 'var(--space-5)'
                    }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount</p>
                        <p className="font-bold text-xl" style={{ color: 'var(--primary)' }}>
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Method</p>
                        <p className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{getPaymentMethodIcon(order.payment_method)}</span>
                          <span>{order.payment_method?.toUpperCase() || 'N/A'}</span>
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</p>
                        <p className="font-semibold">{order.items?.length || 0} item(s)</p>
                      </div>
                      {order.payment_reference && (
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference</p>
                          <p className="font-semibold" style={{ fontSize: '0.875rem', wordBreak: 'break-all' }}>
                            {order.payment_reference}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div style={{
                        padding: 'var(--space-3)',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-4)'
                      }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipping Address</p>
                        <p style={{ fontSize: '0.875rem' }}>{order.shipping_address}</p>
                      </div>
                    )}

                    {/* Expandable Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          style={{
                            width: '100%',
                            padding: 'var(--space-3)',
                            background: 'var(--gray-100)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-200)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                        >
                          <span>Order Items ({order.items.length})</span>
                          <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
                        </button>

                        {isExpanded && (
                          <div style={{
                            marginTop: 'var(--space-3)',
                            border: '1px solid var(--gray-200)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden'
                          }}>
                            {order.items.map((item, index) => (
                              <div
                                key={item.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: 'var(--space-3)',
                                  borderBottom: index < order.items.length - 1 ? '1px solid var(--gray-200)' : 'none',
                                  gap: 'var(--space-3)'
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <p className="font-semibold" style={{ marginBottom: 'var(--space-1)' }}>
                                    {item.product_name || item.product?.name || 'Product'}
                                  </p>
                                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                    Qty: {item.quantity} × {formatCurrency(item.price)}
                                  </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <p className="font-bold" style={{ color: 'var(--primary)' }}>
                                    {formatCurrency(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx="true">{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .container {
            padding-left: var(--space-4);
            padding-right: var(--space-4);
          }
        }

        @media (max-width: 640px) {
          /* Stack order header items on mobile */
          .order-header {
            flex-direction: column;
            align-items: flex-start !important;
          }

          /* Make buttons and inputs touch-friendly */
          input, select, button {
            min-height: 44px !important;
            font-size: 1rem !important;
          }

          /* Adjust font sizes for mobile */
          .text-3xl {
            font-size: 1.75rem !important;
          }

          .text-2xl {
            font-size: 1.5rem !important;
          }

          .text-xl {
            font-size: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Orders;
