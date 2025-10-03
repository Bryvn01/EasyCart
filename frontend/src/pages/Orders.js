import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  const getOrderProgress = (status) => {
    const stages = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = stages.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0;
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
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

              {/* Order Progress Bar */}
              {order.status !== 'cancelled' && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: order.status === 'pending' ? 'bold' : 'normal', color: order.status === 'pending' ? getStatusColor('pending') : 'var(--gray-600)' }}>Pending</span>
                    <span style={{ fontWeight: order.status === 'processing' ? 'bold' : 'normal', color: order.status === 'processing' ? getStatusColor('processing') : 'var(--gray-600)' }}>Processing</span>
                    <span style={{ fontWeight: order.status === 'shipped' ? 'bold' : 'normal', color: order.status === 'shipped' ? getStatusColor('shipped') : 'var(--gray-600)' }}>Shipped</span>
                    <span style={{ fontWeight: order.status === 'delivered' ? 'bold' : 'normal', color: order.status === 'delivered' ? getStatusColor('delivered') : 'var(--gray-600)' }}>Delivered</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${getOrderProgress(order.status)}%`, 
                      height: '100%', 
                      backgroundColor: getStatusColor(order.status),
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}
              
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
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <h4 className="font-semibold mb-3">Order Items:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {order.items.slice(0, 3).map(item => (
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
                    {order.items.length > 3 && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', textAlign: 'center' }}>
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => viewOrderDetails(order)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                View Full Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)'
          }}
          onClick={closeDetailModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: 'var(--space-6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 className="text-2xl font-bold">Order #{selectedOrder.id}</h2>
              <button
                onClick={closeDetailModal}
                style={{
                  fontSize: '1.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--gray-600)'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Order Date</p>
              <p className="font-semibold">{new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Order Status</p>
                <div style={{
                  display: 'inline-block',
                  background: getStatusColor(selectedOrder.status),
                  color: 'white',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginTop: 'var(--space-1)'
                }}>
                  {selectedOrder.status.toUpperCase()}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Payment Status</p>
                <div style={{
                  display: 'inline-block',
                  background: getPaymentStatusColor(selectedOrder.payment_status),
                  color: 'white',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginTop: 'var(--space-1)'
                }}>
                  {selectedOrder.payment_status?.toUpperCase() || 'PENDING'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Total Amount</p>
              <p className="font-bold text-2xl">KES {selectedOrder.total_amount}</p>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Payment Method</p>
              <p className="font-semibold">{selectedOrder.payment_method?.toUpperCase()}</p>
            </div>

            {selectedOrder.payment_reference && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Payment Reference</p>
                <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: 'var(--gray-50)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
                  {selectedOrder.payment_reference}
                </p>
              </div>
            )}

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Shipping Address</p>
              <p style={{ backgroundColor: 'var(--gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)' }}>
                {selectedOrder.shipping_address}
              </p>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Phone Number</p>
              <p className="font-semibold">{selectedOrder.phone_number}</p>
            </div>

            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-2)' }}>Order Items</p>
              <div style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {selectedOrder.items?.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3)',
                      borderBottom: '1px solid var(--gray-200)'
                    }}
                  >
                    <div>
                      <p className="font-semibold">{item.product?.name || 'Product'}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Quantity: {item.quantity} × KES {item.price}
                      </p>
                    </div>
                    <p className="font-bold">KES {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={closeDetailModal}
              style={{
                width: '100%',
                marginTop: 'var(--space-6)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--gray-200)',
                color: 'var(--gray-800)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;