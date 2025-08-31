import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  
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
      alert('Please login to add items to cart');
      return;
    }

    try {
      await ordersAPI.addToCart({ product_id: product.id, quantity });
      fetchCartCount();
      alert('Product added to cart! 🛒');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>❌</div>
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <button
          onClick={() => navigate('/products')}
          className="btn btn-primary"
        >
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
          <button onClick={() => navigate('/products')} style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--primary-600)', 
            cursor: 'pointer',
            textDecoration: 'underline'
          }}>
            Products
          </button>
          <span>›</span>
          <span>{product.category_name}</span>
          <span>›</span>
          <span>{product.name}</span>
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
            overflow: 'hidden'
          }}>
            {product.image ? (
              <img
                src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${product.image}`}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div style={{
              display: product.image ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gray-500)',
              fontSize: '4rem'
            }}>
              📦
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
              KES {product.price}
            </span>
            
            {product.stock > 0 ? (
              <span style={{
                background: 'var(--success)',
                color: 'white',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span style={{
                background: 'var(--error)',
                color: 'white',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
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
          
          <div className="flex gap-4">
            <button
              onClick={addToCart}
              className="btn btn-primary"
              disabled={product.stock === 0}
              style={{
                padding: 'var(--space-4) var(--space-8)',
                fontSize: '1rem',
                fontWeight: '600',
                flex: 1,
                opacity: product.stock === 0 ? 0.5 : 1
              }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            <button
              onClick={() => navigate('/products')}
              className="btn btn-secondary"
              style={{
                padding: 'var(--space-4) var(--space-6)',
                fontSize: '1rem'
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;