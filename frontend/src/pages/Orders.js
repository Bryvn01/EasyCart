import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      completed: '#10b981',
      failed: '#ef4444',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-16 text-center">
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>📦</div>
        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
        <p style={{ color: 'var(--gray-600)' }}>Start shopping to see your orders here</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {orders.map(order => (
          <div key={order.id} className="card">
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h3 className="font-bold text-lg">Order #{order.id}</h3>
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    background: getStatusColor(order.status),
                    color: 'white',
                    padding: 'var(--space-1) var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    marginBottom: 'var(--space-2)'
                  }}>
                    {order.status.toUpperCase()}
                  </div>
                  <div style={{
                    background: getPaymentStatusColor(order.payment_status),
                    color: 'white',
                    padding: 'var(--space-1) var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Payment: {order.payment_status?.toUpperCase() || 'PENDING'}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Total Amount</p>
                  <p className="font-bold">KES {order.total_amount}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Payment Method</p>
                  <p className="font-semibold">{order.payment_method?.toUpperCase() || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Items</p>
                  <p className="font-semibold">{order.items?.length || 0} items</p>
                </div>
              </div>
              
              {order.items && order.items.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Order Items:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {order.items.map(item => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-2)',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <span>{item.product?.name || 'Product'}</span>
                        <span>Qty: {item.quantity} × KES {item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;