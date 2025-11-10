import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPriceLocale } from '../utils/formatPrice';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getProduct(id);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);



  const addToCart = async () => {
    if (!isAuthenticated) {
      handleApiError({ message: 'Please sign in to continue' });
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    try {
      await ordersAPI.addToCart({ product_id: product.id, quantity });
      fetchCartCount();
      handleApiSuccess('Added to cart successfully');

      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      handleApiError(error, 'Unable to add product. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <svg className="animate-spin w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-600 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-red-100">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/products')}
          className="btn btn-primary min-h-[44px] inline-flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 'var(--space-8)' }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gray-600)' }}>
          <button onClick={() => navigate('/products')} className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors" style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-600)',
            cursor: 'pointer',
            padding: '0',
            fontSize: 'inherit'
          }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Products
          </button>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>{product.category_name}</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900">{product.name}</span>
        </div>
      </nav>

      <div className="grid grid-cols-2 gap-12">
        {/* Product Image */}
        <div>
          <div style={{
            width: '100%',
            height: '500px',
            background: 'var(--gray-100)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {(product.image || product.image_url) ? (
              <img
                src={product.image || product.image_url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  console.error('Image failed to load:', product.image || product.image_url);
                  e.target.style.display = 'none';
                  const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="image-placeholder"
              style={{
                display: (product.image || product.image_url) ? 'none' : 'flex',
                position: 'absolute',
                inset: 0,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                color: 'var(--gray-400)'
              }}
            >
              <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-400">No image available</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--primary-600)',
            fontWeight: '500',
            marginBottom: 'var(--space-2)'
          }}>
            {product.category_name}
          </div>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <span style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--gray-900)'
            }}>
              KSh {formatPriceLocale(product.price)}
            </span>

            {product.stock > 10 ? (
              <span className="inline-flex items-center gap-1.5" style={{
                background: 'var(--success)',
                color: 'white',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                In Stock ({product.stock} available)
              </span>
            ) : product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5" style={{
                background: '#f59e0b',
                color: 'white',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Only {product.stock} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5" style={{
                background: 'var(--error)',
                color: 'white',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Out of Stock
              </span>
            )}
          </div>

          <div style={{
            background: 'var(--gray-50)',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-8)'
          }}>
            <h3 className="font-semibold mb-3">Product Description</h3>
            <p style={{
              color: 'var(--gray-700)',
              lineHeight: '1.6'
            }}>
              {product.description}
            </p>
          </div>

          {product.stock > 0 && (
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: 'var(--space-3)',
                color: 'var(--gray-700)'
              }}>
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  style={{
                    width: '100px',
                    padding: 'var(--space-3)',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}
                />
                <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                  Max: {product.stock}
                </span>
              </div>
            </div>
          )}

          <div className="button-container">
            <button
              onClick={addToCart}
              className="btn btn-primary min-h-[44px] inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              disabled={product.stock === 0 || isAddingToCart}
              style={{
                padding: 'var(--space-4) var(--space-8)',
                fontSize: '1rem',
                fontWeight: '600',
                flex: 1,
                opacity: (product.stock === 0 || isAddingToCart) ? 0.5 : 1,
                cursor: (product.stock === 0 || isAddingToCart) ? 'not-allowed' : 'pointer'
              }}
            >
              {isAddingToCart ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : product.stock === 0 ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Out of Stock
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/products')}
              className="btn btn-secondary min-h-[44px] inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              style={{
                padding: 'var(--space-4) var(--space-6)',
                fontSize: '1rem'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Continue Shopping
            </button>
          </div>

          <style jsx="true">{`
            .button-container {
              display: flex;
              gap: 1rem;
            }

            @media (max-width: 640px) {
              .button-container {
                flex-direction: column;
              }

              .button-container button {
                width: 100% !important;
                flex: none !important;
              }
            }

            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            .animate-spin {
              animation: spin 1s linear infinite;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
