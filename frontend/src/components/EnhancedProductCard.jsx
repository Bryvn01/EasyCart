import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './EnhancedProductCard.css';

/**
 * EnhancedProductCard component
 * 
 * Uses react-hot-toast for notifications (migrated from custom Toast component)
 * to provide consistent, global notification experience across the app.
 */
const EnhancedProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const addingRef = useRef(false);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent duplicate taps with ref check
    if (addingRef.current || isAdding) {
      console.log('Already adding to cart, ignoring duplicate tap');
      return;
    }

    addingRef.current = true;
    setIsAdding(true);

    // Track telemetry
    if (window.gtag) {
      window.gtag('event', 'add_to_cart_click', {
        product_id: product.id,
        product_name: product.name,
        price: product.price
      });
    }

    try {
      const result = await addToCart(product.id, 1);
      
      // Show accurate cart data in notification
      if (result && result.cartData) {
        const totalItems = result.cartData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        const totalPrice = result.cartData.total_price || 0;
        
        toast.success(
          `${product.name} added to cart!\n🛒 Cart: ${totalItems} items • KSh ${parseFloat(totalPrice).toFixed(2)}`,
          { 
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#10b981',
              color: '#fff',
              fontWeight: '500',
            }
          }
        );
      } else {
        toast.success(`${product.name} added to cart!`);
      }

      // Track success
      if (window.gtag) {
        window.gtag('event', 'add_to_cart_success', {
          product_id: product.id
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add to cart';
      
      toast.error(errorMsg, {
        duration: 4000,
        position: 'top-center'
      });

      // Track failure
      if (window.gtag) {
        window.gtag('event', 'add_to_cart_failed', {
          product_id: product.id,
          error: errorMsg
        });
      }
    } finally {
      setIsAdding(false);
      addingRef.current = false;
    }
  }, [product, addToCart, isAdding]);

  const imageUrl = product.image || product.image_url || '/images/placeholder-product.jpg';

  return (
    <div className="enhanced-product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        {/* Image Container with aspect ratio */}
        <div className="product-image-container">
          {!imageLoaded && (
            <div className="image-placeholder" aria-hidden="true">
              <div className="placeholder-shimmer"></div>
            </div>
          )}
          <img
            src={imageUrl}
            srcSet={`${imageUrl}?w=300 300w, ${imageUrl}?w=600 600w`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={product.name}
            className="product-image"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = '/images/placeholder-product.jpg';
              setImageLoaded(true);
            }}
          />

          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="stock-badge out-of-stock">Out of Stock</div>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <div className="stock-badge low-stock">Only {product.stock} left</div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>

          <div className="product-price">
            <span className="current-price">KSh {parseFloat(product.price).toLocaleString()}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="original-price">KSh {parseFloat(product.original_price).toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - min 44x44px touch target */}
      <button
        className={`add-to-cart-btn ${isAdding ? 'loading' : ''} ${product.stock === 0 ? 'disabled' : ''}`}
        onClick={handleAddToCart}
        disabled={isAdding || product.stock === 0}
        aria-label={`Add ${product.name} to cart`}
        aria-live="polite"
        aria-busy={isAdding}
      >
        {isAdding ? (
          <>
            <span className="spinner" aria-hidden="true"></span>
            <span>Adding...</span>
          </>
        ) : product.stock === 0 ? (
          'Out of Stock'
        ) : (
          <>
            <span aria-hidden="true">🛒</span>
            <span>Add to Cart</span>
          </>
        )}
      </button>
    </div>
  );
};

export default EnhancedProductCard;
