import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import PaymentModal from '../components/PaymentModal';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await ordersAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await ordersAPI.removeFromCart(itemId);
      fetchCart();
      fetchCartCount();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const checkout = async () => {
    if (!shippingAddress.trim()) {
      alert('Please enter shipping address');
      return;
    }
    if (!phoneNumber.trim()) {
      alert('Please enter phone number');
      return;
    }
    if (!/^\+?[1-9]\d{8,14}$/.test(phoneNumber.trim())) {
      alert('Please enter a valid phone number');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await ordersAPI.checkout({
        shipping_address: shippingAddress.trim(),
        phone_number: phoneNumber.trim(),
        payment_method: paymentMethod
      });
      
      setCurrentOrder(response.data);
      setShowPaymentModal(true);
      fetchCartCount();
    } catch (error) {
      console.error('Error during checkout:', error);
      const errorMsg = error.response?.data?.error || 'Checkout failed. Please try again.';
      alert(errorMsg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    alert('Payment initiated successfully! 🎉');
    setCurrentOrder(null);
    setShippingAddress('');
    setPhoneNumber('');
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading cart...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-6)' }}>🛒</div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-8)' }}>
          Looks like you haven't added any items to your cart yet
        </p>
        <button
          onClick={() => navigate('/products')}
          className="btn btn-primary"
          style={{ padding: 'var(--space-4) var(--space-8)' }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-3 gap-8">
        {/* Cart Items */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Cart Items ({cart.items.length})
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {cart.items.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    {/* Product Image */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'var(--gray-100)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.product.image ? (
                        <img
                          src={`http://localhost:8000${item.product.image}`}
                          alt={item.product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{
                        display: item.product.image ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gray-500)',
                        fontSize: '1.5rem'
                      }}>
                        📦
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div style={{ flex: 1 }}>
                      <h3 className="font-semibold mb-1">{item.product.name}</h3>
                      <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                        KES {item.product.price} × {item.quantity}
                      </p>
                    </div>
                    
                    {/* Price & Remove */}
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-bold mb-2">
                        KES {(item.product.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: 'var(--error)',
                          color: 'white',
                          border: 'none',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>KES {cart.total_price}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Delivery:</span>
                  <span>KES 100</span>
                </div>
                <hr style={{ margin: 'var(--space-4) 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>KES {(parseFloat(cart.total_price) + 100).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="form-group">
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--gray-700)'
                }}>
                  Shipping Address
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your delivery address..."
                  required
                  style={{ marginBottom: 'var(--space-4)' }}
                />
              </div>
              
              <div className="form-group">
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--gray-700)'
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254712345678"
                  required
                  style={{ marginBottom: 'var(--space-4)' }}
                />
              </div>
              
              <div className="form-group">
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--gray-700)'
                }}>
                  Payment Method
                </label>
                <select
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginBottom: 'var(--space-4)' }}
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="airtel">Airtel Money</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash on Delivery</option>
                </select>
              </div>
              
              <button
                onClick={checkout}
                className="btn btn-primary"
                style={{ 
                  width: '100%',
                  padding: 'var(--space-4)',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        order={currentOrder}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Cart;