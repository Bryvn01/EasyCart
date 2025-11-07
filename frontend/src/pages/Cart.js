import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PaymentModal from '../components/PaymentModal';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, loading, fetchCart, updateCartItem, removeFromCart, moveToWishlist } = useCart();
  const [localLoading, setLocalLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      try {
        await fetchCart();
      } finally {
        setLocalLoading(false);
      }
    };
    loadCart();
  }, [fetchCart]);

  const handleRemoveFromCart = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem(itemId, newQuantity);
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error.response?.data?.error || 'Failed to update quantity');
    }
  };

  const handleMoveToWishlist = async (itemId) => {
    try {
      await moveToWishlist(itemId);
      toast.success('Item moved to wishlist');
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to move to wishlist');
    }
  };

  const checkout = async () => {
    if (!shippingAddress.trim()) {
      toast.error('Please enter shipping address');
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    if (!/^\+?[1-9]\d{8,14}$/.test(phoneNumber.trim())) {
      toast.error('Please enter a valid phone number');
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
    } catch (error) {
      console.error('Error during checkout:', error);
      const errorMsg = error.response?.data?.error || 'Checkout failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment initiated successfully! 🎉');
    setCurrentOrder(null);
    setShippingAddress('');
    setPhoneNumber('');
    navigate('/orders');
  };

  if (localLoading || loading) {
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
                      <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        KSh {item.product.price} each
                      </p>

                      {/* Quantity Controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '1px solid var(--gray-300)',
                            background: item.quantity <= 1 ? 'var(--gray-100)' : 'white',
                            borderRadius: 'var(--radius-sm)',
                            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            color: item.quantity <= 1 ? 'var(--gray-400)' : 'var(--gray-700)'
                          }}
                        >
                          −
                        </button>
                        <span style={{
                          minWidth: '30px',
                          textAlign: 'center',
                          fontWeight: '500'
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '1px solid var(--gray-300)',
                            background: item.quantity >= item.product.stock ? 'var(--gray-100)' : 'white',
                            borderRadius: 'var(--radius-sm)',
                            cursor: item.quantity >= item.product.stock ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            color: item.quantity >= item.product.stock ? 'var(--gray-400)' : 'var(--gray-700)'
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-bold mb-2" style={{ fontSize: '1.125rem' }}>
                        KSh {(item.product.price * item.quantity).toFixed(2)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleMoveToWishlist(item.id)}
                          style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--space-1) var(--space-3)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          💛 Wishlist
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          style={{
                            background: 'var(--error)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--space-1) var(--space-3)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
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
                  <span>KSh {parseFloat(cart.subtotal || cart.total_price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax (16% VAT):</span>
                  <span>KSh {parseFloat(cart.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span className={cart.shipping === 0 ? "text-green-600 font-semibold" : ""}>
                    {cart.shipping === 0 || parseFloat(cart.subtotal || cart.total_price || 0) >= 2000 ? 'FREE' : 'KSh 100.00'}
                  </span>
                </div>
                <hr style={{ margin: 'var(--space-4) 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>KSh {parseFloat(cart.total_price || 0).toFixed(2)}</span>
                </div>
                {(cart.shipping === 0 || parseFloat(cart.subtotal || cart.total_price || 0) >= 2000) && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <span>🎉</span> You qualify for FREE shipping!
                  </p>
                )}
                {parseFloat(cart.subtotal || cart.total_price || 0) < 2000 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Add KSh {(2000 - parseFloat(cart.subtotal || cart.total_price || 0)).toFixed(2)} more for FREE shipping
                  </p>
                )}
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
                  <option value="card">Credit/Debit Card (Flutterwave)</option>
                  <option value="stripe">Credit/Debit Card (Stripe)</option>
                  <option value="paypal">PayPal</option>
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
                  fontWeight: '600',
                  background: paymentMethod === 'mpesa' ? 'linear-gradient(135deg, #00A651 0%, #00D86E 100%)' :
                             paymentMethod === 'stripe' ? 'linear-gradient(135deg, #635BFF 0%, #7A73FF 100%)' :
                             paymentMethod === 'paypal' ? 'linear-gradient(135deg, #0070BA 0%, #1F8DE3 100%)' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? '⏳ Processing...' : (
                  <>
                    {paymentMethod === 'mpesa' && '💳'}
                    {paymentMethod === 'stripe' && '💳'}
                    {paymentMethod === 'paypal' && '💰'}
                    Checkout with {
                      paymentMethod === 'mpesa' ? 'M-Pesa' :
                      paymentMethod === 'airtel' ? 'Airtel Money' :
                      paymentMethod === 'stripe' ? 'Stripe' :
                      paymentMethod === 'paypal' ? 'PayPal' :
                      paymentMethod === 'card' ? 'Card' :
                      paymentMethod
                    }
                  </>
                )}
              </button>

              {/* Trust Indicators */}
              <div className="mt-4 text-xs text-gray-600 text-center">
                <p className="flex items-center justify-center gap-2 mb-1">
                  <span>🔒</span> Secure Checkout
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span>✓</span> 100% Money Back Guarantee
                </p>
              </div>
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
