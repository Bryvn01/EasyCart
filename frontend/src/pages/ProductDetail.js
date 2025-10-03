import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, ordersAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewsAPI.getProductReviews(id);
        setReviews(response.data.results || response.data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
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

  const handleReviewSubmit = async (reviewData) => {
    if (!isAuthenticated) {
      alert('Please login to submit a review');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsAPI.createReview(reviewData);
      alert('Review submitted successfully! 🎉');
      setShowReviewForm(false);
      
      // Refresh reviews
      const response = await reviewsAPI.getProductReviews(id);
      setReviews(response.data.results || response.data || []);
      
      // Refresh product to update rating
      const productResponse = await productsAPI.getProduct(id);
      setProduct(productResponse.data);
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.data) {
        const errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.detail || error.response.data.error || 'Failed to submit review';
        alert(errorMsg);
      } else {
        alert('Failed to submit review. You may have already reviewed this product.');
      }
    } finally {
      setSubmittingReview(false);
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
          
          {/* Rating Display */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.rating} size="md" showValue />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
          
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

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
          {/* Reviews Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Customer Reviews
            </h2>
            
            {/* Rating Summary */}
            {product.rating > 0 && (
              <div className="flex items-center gap-6 mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    {product.rating.toFixed(1)}
                  </div>
                  <StarRating rating={product.rating} size="md" />
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Based on {product.review_count} {product.review_count === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
              </div>
            )}

            {/* Write Review Button */}
            {isAuthenticated && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="btn btn-primary"
                style={{ marginBottom: 'var(--space-6)' }}
              >
                Write a Review
              </button>
            )}
            
            {!isAuthenticated && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Sign in
                </button>
                {' '}to write a review
              </p>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                productId={product.id}
                onSubmit={handleReviewSubmit}
                loading={submittingReview}
              />
              <button
                onClick={() => setShowReviewForm(false)}
                className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Reviews List */}
          <ReviewList reviews={reviews} loading={reviewsLoading} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;