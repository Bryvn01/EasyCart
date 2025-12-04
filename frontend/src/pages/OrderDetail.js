import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrder(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6 text-sm text-gray-600 flex items-center gap-2">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>›</span>
          <Link to="/orders" className="hover:text-primary-600">Orders</Link>
          <span>›</span>
          <span className="font-medium">Order #{id}</span>
        </nav>

        <div className="card p-6">
          <h1 className="text-3xl font-bold mb-6">Order #{order.id}</h1>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Order Status</h3>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                {order.status}
              </span>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Total Amount</h3>
              <p className="text-2xl font-bold text-primary-600">
                KSh {order.total_amount?.toLocaleString()}
              </p>
            </div>
          </div>

          {order.shipping_address && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p className="text-gray-600">{order.shipping_address}</p>
            </div>
          )}

          {order.items && order.items.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">KSh {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <button onClick={() => navigate('/orders')} className="btn btn-secondary">
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
