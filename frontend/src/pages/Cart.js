import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PaymentModal from '../components/PaymentModal';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import OptimizedImage from '../components/OptimizedImage';

const Cart = () => {
  // Handler to update item quantity
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateCartItem(itemId, newQuantity);
      await fetchCart();
      // Announce to screen readers
      announceToScreenReader(`Quantity updated to ${newQuantity}`);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  // Handler to remove item from cart
  const handleRemoveFromCart = async (itemId) => {
    try {
      await removeFromCart(itemId);
      await fetchCart();
      toast.success('Item removed from cart');
      // Announce to screen readers
      announceToScreenReader('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  // Handler to move item to wishlist
  const handleMoveToWishlist = async (itemId) => {
    try {
      await moveToWishlist(itemId);
      await fetchCart();
      toast.success('Item moved to wishlist');
      // Announce to screen readers
      announceToScreenReader('Item moved to wishlist');
    } catch (error) {
      toast.error('Failed to move item to wishlist');
    }
  };
  const { cart, loading, fetchCart, updateCartItem, removeFromCart, moveToWishlist } = useCart();
  const [localLoading, setLocalLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');

  const navigate = useNavigate();

  // Function to announce to screen readers
  const announceToScreenReader = (message) => {
    setScreenReaderAnnouncement(message);
    // Clear after announcement
    setTimeout(() => setScreenReaderAnnouncement(''), 1000);
  };

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

  // Debug: Log cart data
  useEffect(() => {
    if (cart) {
      console.log('Cart data:', cart);
      console.log('Cart items:', cart.items);
      if (cart.items && cart.items.length > 0) {
        console.log('First cart item:', cart.items[0]);
        console.log('First product:', cart.items[0].product);
      }
    }
  });

  // Validate checkout form
  const validateCheckoutForm = () => {
    const errors = [];
    if (shippingAddress.length > 500) {
      errors.push('Shipping address is too long (max 500 characters)');
    }

    // Phone number validation
    if (!phoneNumber.trim()) {
      errors.push('Phone number is required');
    } else {
      const cleanPhone = phoneNumber.trim().replace(/[\s-()]/g, '');
      if (!/^\+?[1-9]\d{8,14}$/.test(cleanPhone)) {
        errors.push('Please enter a valid phone number (e.g., 254712345678)');
      }
    }

    // Cart validation
    if (!cart || cart.items.length === 0) {
      errors.push('Your cart is empty');
    }

    // Stock validation
    const outOfStock = cart?.items?.filter(item => item.product?.stock === 0);
    if (outOfStock && outOfStock.length > 0) {
      errors.push('Some items in your cart are out of stock');
    }

    return errors;
  };

  const checkout = async () => {
    // Validate form
    const validationErrors = validateCheckoutForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setCheckoutLoading(true);

    try {
      const cleanPhone = phoneNumber.trim().replace(/[\s-()]/g, '');

      const response = await ordersAPI.checkout({
        shipping_address: shippingAddress.trim(),
        phone_number: cleanPhone,
        payment_method: paymentMethod
      });

      // Success feedback
      toast.success('Order created successfully!', {
        duration: 3000,
        icon: '✓'
      });

      setCurrentOrder(response.data);
      setShowPaymentModal(true);

    } catch (error) {
      console.error('Error during checkout:', error);

      // Enhanced error handling
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || 'Invalid checkout data';
        toast.error(errorMsg, { duration: 4000 });
      } else if (error.response?.status === 401) {
        toast.error('Please log in to continue', { duration: 4000 });
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later', { duration: 4000 });
      } else if (!error.response) {
        toast.error('Network error. Please check your connection', { duration: 4000 });
      } else {
        toast.error('Checkout failed. Please try again', { duration: 4000 });
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Clear form data
    setCurrentOrder(null);
    setShippingAddress('');
    setPhoneNumber('');

    // Success notification with details
    toast.success('Payment initiated successfully! Check your email for order confirmation.', {
      duration: 5000,
      icon: '✓',
      style: {
        border: '1px solid #10b981',
        padding: '16px',
        color: '#065f46',
      }
    });

    // Navigate to orders page
    setTimeout(() => {
      navigate('/orders');
    }, 1500);
  };

  if (localLoading || loading) {
    return (
      <div className="container py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto var(--space-4)',
            border: '4px solid var(--gray-200)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--gray-700)' }}>
            Loading your cart...
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: 'var(--space-2)' }}>
            Please wait while we fetch your items
          </p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card" style={{ padding: 'var(--space-12)' }}>
            {/* Empty Cart Icon */}
            <div style={{
              width: '96px',
              height: '96px',
              margin: '0 auto var(--space-6)',
              background: 'var(--gray-100)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-3">Your Shopping Cart is Empty</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-8)', fontSize: '0.9375rem' }}>
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/products')}
                className="btn btn-primary"
                style={{ padding: 'var(--space-3) var(--space-8)' }}
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/wishlist')}
                className="btn"
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'white',
                  border: '1px solid var(--gray-300)',
                  color: 'var(--gray-700)'
                }}
              >
                View Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Screen Reader Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {screenReaderAnnouncement}
      </div>

      {/* Breadcrumb */}
      <nav className="breadcrumb-nav" style={{
        fontSize: '0.875rem',
        color: 'var(--gray-600)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Home
        </button>
        <span>›</span>
        <button
          onClick={() => navigate('/products')}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Products
        </button>
        <span>›</span>
        <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>Shopping Cart</span>
      </nav>

      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9375rem' }}>
          {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items-section">
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Cart Items ({cart.items.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {cart.items.map(item => (
                  <div key={item.id} className="cart-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    {/* Product Image */}
                    <div className="product-image-container" style={{
                      width: '100px',
                      height: '100px',
                      background: 'var(--gray-100)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {(item.product?.image || item.product?.image_url) ? (
                        <OptimizedImage
                          src={item.product.image || item.product.image_url}
                          alt={item.product?.name || 'Product'}
                          width={200}
                          height={200}
                          priority={true}
                          sizes="100px"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)'
                          }}
                        />
                      ) : (
                        <div
                          className="fallback-icon"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--gray-400)',
                            fontSize: '2rem',
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          {/* SVG Image Icon */}
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div style={{ flex: 1 }}>
                      <h3 className="font-semibold mb-1 product-title">{item.product?.name || 'Product'}</h3>
                      <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        KSh {formatPrice(item.product?.price || 0)} each
                      </p>

                      {/* Stock Warning */}
                      {item.product?.stock > 0 && item.product?.stock < 10 && (
                        <p style={{
                          color: '#f59e0b',
                          fontSize: '0.75rem',
                          marginBottom: '0.5rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                          Only {item.product.stock} left in stock
                        </p>
                      )}

                      {item.product?.stock === 0 && (
                        <p style={{
                          color: '#dc2626',
                          fontSize: '0.75rem',
                          marginBottom: '0.5rem',
                          fontWeight: '600'
                        }}>
                          Out of Stock
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="quantity-controls" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
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
                          disabled={item.quantity >= (item.product?.stock || 0)}
                          aria-label="Increase quantity"
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '1px solid var(--gray-300)',
                            background: item.quantity >= (item.product?.stock || 0) ? 'var(--gray-100)' : 'white',
                            borderRadius: 'var(--radius-sm)',
                            cursor: item.quantity >= (item.product?.stock || 0) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            color: item.quantity >= (item.product?.stock || 0) ? 'var(--gray-400)' : 'var(--gray-700)'
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div className="font-bold product-price" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>
                        KSh {formatPrice((item.product?.price || 0) * item.quantity)}
                      </div>

                      {/* Action Links - Industry Standard */}
                      <div className="cart-actions" style={{
                        display: 'flex',
                        gap: 'var(--space-4)',
                        fontSize: '0.875rem',
                        justifyContent: 'flex-end',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          aria-label={`Remove ${item.product?.name || 'item'} from cart`}
                          style={{
                            background: 'none',
                            color: '#dc2626',
                            border: 'none',
                            padding: '0',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#991b1b'}
                          onMouseLeave={(e) => e.target.style.color = '#dc2626'}
                        >
                          Delete
                        </button>
                        <span style={{ color: 'var(--gray-300)' }}>|</span>
                        <button
                          onClick={() => handleMoveToWishlist(item.id)}
                          aria-label={`Move ${item.product?.name || 'item'} to wishlist`}
                          style={{
                            background: 'none',
                            color: 'var(--primary)',
                            border: 'none',
                            padding: '0',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          Save for Later
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
        <div className="order-summary-section">
          <div className="card" style={{ position: 'sticky', top: 'var(--space-4)' }}>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                {/* Subtotal */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)',
                  fontSize: '0.9375rem'
                }}>
                  <span style={{ color: 'var(--gray-600)' }}>
                    Subtotal ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}):
                  </span>
                  <span className="font-semibold">KSh {formatPrice(cart.total_price)}</span>
                </div>

                {/* Delivery */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)',
                  fontSize: '0.9375rem'
                }}>
                  <span style={{ color: 'var(--gray-600)' }}>Delivery:</span>
                  <span style={{
                    fontWeight: '600',
                    color: parseFloat(cart.total_price) >= 2000 ? '#10b981' : 'inherit'
                  }}>
                    {parseFloat(cart.total_price) >= 2000 ? 'FREE' : 'KSh ' + formatPrice(100)}
                  </span>
                </div>

                {/* Divider */}
                <hr style={{
                  margin: 'var(--space-4) 0',
                  border: 'none',
                  borderTop: '2px solid var(--gray-200)'
                }} />

                {/* Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-4)'
                }}>
                  <span className="font-bold text-lg">Order Total:</span>
                  <span className="font-bold text-xl" style={{ color: 'var(--primary)' }}>
                    KSh {formatPrice(parseFloat(cart.total_price) + (parseFloat(cart.total_price) >= 2000 ? 0 : 100))}
                  </span>
                </div>

                {/* Free Delivery Progress */}
                {parseFloat(cart.total_price) >= 2000 ? (
                  <div style={{
                    padding: 'var(--space-3)',
                    background: '#d1fae5',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #10b981',
                    fontSize: '0.875rem',
                    color: '#065f46',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    You qualify for FREE delivery!
                  </div>
                ) : (
                  <div style={{
                    padding: 'var(--space-3)',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--gray-700)'
                  }}>
                    <div style={{ marginBottom: 'var(--space-2)', fontWeight: '500' }}>
                      Add KSh {formatPrice(2000 - parseFloat(cart.total_price))} for FREE delivery
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'var(--gray-200)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min((parseFloat(cart.total_price) / 2000) * 100, 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary) 0%, #10b981 100%)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
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
                  Shipping Address *
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete delivery address (street, building, city)..."
                  required
                  maxLength={500}
                  style={{
                    marginBottom: 'var(--space-2)',
                    border: shippingAddress.trim() && shippingAddress.trim().length < 10
                      ? '1px solid #dc2626'
                      : undefined
                  }}
                />
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--gray-500)',
                  marginBottom: 'var(--space-4)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>At least 10 chars (e.g., "Juja, Kiambu")</span>
                  <span>{shippingAddress.length}/500</span>
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
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="form-control"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254712345678"
                  required
                  style={{
                    marginBottom: 'var(--space-2)',
                    border: phoneNumber.trim() && !/^\+?[1-9]\d{8,14}$/.test(phoneNumber.trim().replace(/[\s-()]/g, ''))
                      ? '1px solid #dc2626'
                      : undefined
                  }}
                />
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--gray-500)',
                  marginBottom: 'var(--space-4)'
                }}>
                  Format: Country code + number (e.g., 254712345678)
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
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash on Delivery</option>
                </select>
              </div>

              <button
                onClick={checkout}
                className="btn btn-primary"
                disabled={checkoutLoading || cart.items.some(item => item.product?.stock === 0)}
                aria-label={checkoutLoading ? 'Processing checkout' : 'Proceed to checkout'}
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  background: cart.items.some(item => item.product?.stock === 0)
                    ? 'var(--gray-400)'
                    : paymentMethod === 'mpesa'
                      ? 'linear-gradient(135deg, #00A651 0%, #00D86E 100%)'
                      : paymentMethod === 'paypal'
                        ? 'linear-gradient(135deg, #0070BA 0%, #1F8DE3 100%)'
                        : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  cursor: (checkoutLoading || cart.items.some(item => item.product?.stock === 0)) ? 'not-allowed' : 'pointer',
                  opacity: (checkoutLoading || cart.items.some(item => item.product?.stock === 0)) ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!checkoutLoading && !cart.items.some(item => item.product?.stock === 0)) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!checkoutLoading && !cart.items.some(item => item.product?.stock === 0)) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {checkoutLoading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
                      animation: 'spin 1s linear infinite'
                    }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Processing...
                  </>
                ) : cart.items.some(item => item.product?.stock === 0) ? (
                  'Remove Out of Stock Items to Continue'
                ) : (
                  <>
                    Checkout with {
                      paymentMethod === 'mpesa' ? 'M-Pesa' :
                      paymentMethod === 'airtel' ? 'Airtel Money' :
                      paymentMethod === 'paypal' ? 'PayPal' :
                      paymentMethod === 'card' ? 'Card' :
                      paymentMethod
                    }
                  </>
                )}
              </button>

              {/* Trust Indicators */}
              <div className="trust-indicators" style={{
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--gray-200)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: '0.8125rem',
                  color: 'var(--gray-600)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Secure checkout powered by {
                    paymentMethod === 'mpesa' ? 'Safaricom' :
                    paymentMethod === 'paypal' ? 'PayPal' :
                    paymentMethod === 'card' ? 'Flutterwave' :
                    'trusted payment partners'
                  }</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: '0.8125rem',
                  color: 'var(--gray-600)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>100% money-back guarantee</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: '0.8125rem',
                  color: 'var(--gray-600)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>SSL encrypted payment processing</span>
                </div>
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

      <style jsx="true">{`
        /* Responsive Cart Layout */
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: var(--space-6);
          align-items: start;
        }

        /* Mobile: Stack layout vertically */
        @media (max-width: 1024px) {
          .cart-layout {
            grid-template-columns: 1fr 350px;
            gap: var(--space-4);
          }
        }

        @media (max-width: 768px) {
          .cart-layout {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }

          .order-summary-section {
            order: -1; /* Move summary to top on mobile */
          }

          .order-summary-section .card {
            position: static !important; /* Remove sticky on mobile */
          }

          /* Adjust product item layout on mobile */
          .cart-item {
            flex-direction: column;
            align-items: flex-start !important;
          }

          .cart-item > div:first-child {
            width: 100% !important;
          }
        }

        /* Product Image Responsive */
        .product-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 640px) {
          .product-image-container {
            width: 80px !important;
            height: 80px !important;
          }

          /* Product info text smaller on mobile */
          .product-title {
            font-size: 0.9375rem !important;
          }

          .product-price {
            font-size: 1.125rem !important;
          }
        }

        /* Quantity Controls - Touch Friendly on Mobile */
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        @media (max-width: 640px) {
          .quantity-controls button {
            min-width: 44px !important;
            min-height: 44px !important;
            font-size: 1.125rem !important;
          }

          .quantity-controls input {
            min-height: 44px !important;
          }
        }

        /* Buttons - Touch Friendly */
        @media (max-width: 640px) {
          .btn-primary,
          .btn {
            min-height: 48px !important;
            font-size: 1rem !important;
          }

          /* Action buttons (Delete | Save for Later) */
          .cart-actions button {
            min-height: 44px !important;
            min-width: 44px !important;
            padding: var(--space-2) var(--space-3) !important;
          }
        }

        /* Breadcrumb - Hide on small mobile */
        @media (max-width: 480px) {
          .breadcrumb-nav {
            font-size: 0.75rem;
          }

          .breadcrumb-nav span:not(:last-child) {
            display: none;
          }
        }

        /* Form controls on mobile */
        @media (max-width: 640px) {
          .form-control {
            font-size: 1rem !important; /* Prevent zoom on iOS */
            min-height: 48px !important;
          }

          select.form-control {
            min-height: 48px !important;
          }
        }

        /* Trust indicators - stack on very small screens */
        @media (max-width: 480px) {
          .trust-indicators {
            font-size: 0.75rem !important;
          }
        }

        /* Spinner Animation */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Smooth transitions */
        .cart-layout,
        .cart-items-section,
        .order-summary-section {
          transition: all 0.3s ease;
        }

        /* Screen reader only class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </div>
  );
};

export default Cart;
