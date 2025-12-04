import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ordersAPI } from '../services/api';
import { useAuth } from './AuthContext';

/**
 * CartContext - Enterprise-grade cart state management
 *
 * Features:
 * - Single source of truth for cart data
 * - Optimistic UI updates
 * - Request debouncing and deduplication
 * - Comprehensive error handling with retry logic
 * - Loading and error states
 * - Race condition prevention
 * - Memory leak prevention
 */

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

/**
 * Calculate total items in cart from cart data
 * @param {Object} cartData - Cart data from API
 * @returns {number} Total number of items
 */
const calculateTotalItems = (cartData) => {
  if (!cartData?.items || !Array.isArray(cartData.items)) return 0;
  return cartData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
};

export const CartProvider = ({ children }) => {
  // State management
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Refs for managing concurrent operations and cleanup
  const pendingRequestsRef = useRef(new Set());
  const abortControllersRef = useRef(new Map());
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    // Capture the current ref value for cleanup
    const abortControllers = abortControllersRef.current;
    return () => {
      isMountedRef.current = false;
      // Cancel all pending requests
      abortControllers.forEach(controller => controller.abort());
      abortControllers.clear();
    };
  }, []);

  /**
   * Fetch cart data from server with error handling and retry logic
   * @param {Object} options - Fetch options
   * @param {boolean} options.silent - If true, don't show loading state
   * @param {number} options.retries - Number of retries on failure
   * @returns {Promise<Object|null>} Cart data or null on error
   */
  const fetchCart = useCallback(async ({ silent = false, retries = 2 } = {}) => {
    if (!isAuthenticated) {
      if (isMountedRef.current) {
        setCart(null);
        setCartCount(0);
        setError(null);
      }
      return null;
    }

    // Prevent duplicate simultaneous fetches
    const requestKey = 'fetchCart';
    if (pendingRequestsRef.current.has(requestKey)) {
      return null;
    }

    pendingRequestsRef.current.add(requestKey);
    if (!silent && isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await ordersAPI.getCart();

        if (isMountedRef.current) {
          const cartData = response.data;
          setCart(cartData);
          const totalItems = calculateTotalItems(cartData);
          setCartCount(totalItems);
          setError(null);
          setLoading(false);
        }

        pendingRequestsRef.current.delete(requestKey);
        return response.data;
      } catch (err) {
        attempt++;

        // If this was the last attempt, handle the error
        if (attempt > retries) {
          console.error('Error fetching cart:', err);

          if (isMountedRef.current) {
            setError({
              message: err.response?.data?.message || 'Failed to load cart',
              code: err.response?.status || 'FETCH_ERROR'
            });
            setLoading(false);
          }

          pendingRequestsRef.current.delete(requestKey);
          return null;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    pendingRequestsRef.current.delete(requestKey);
    return null;
  }, [isAuthenticated]);

  /**
   * Legacy method for backwards compatibility
   * @deprecated Use fetchCart instead
   */
  const fetchCartCount = useCallback(async () => {
    await fetchCart({ silent: true });
  }, [fetchCart]);

  /**
   * Add item to cart with optimistic update and error rollback
   * @param {number|string} productId - Product ID to add
   * @param {number} quantity - Quantity to add
   * @returns {Promise<void>}
   */
  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    // Prevent duplicate simultaneous requests for the same product
    const requestKey = `addToCart-${productId}`;
    if (pendingRequestsRef.current.has(requestKey)) {
      return; // Silently ignore duplicate request
    }

    pendingRequestsRef.current.add(requestKey);

    // Optimistic update: immediately update cart count
    const previousCart = cart;
    const previousCount = cartCount;

    if (isMountedRef.current) {
      setCartCount(prevCount => prevCount + quantity);
      setError(null);
    }

    try {
      await ordersAPI.addToCart({ product_id: productId, quantity });

      // Fetch updated cart data in background
      await fetchCart({ silent: true });
    } catch (err) {
      console.error('Error adding to cart:', err);

      // Rollback optimistic update on error
      if (isMountedRef.current) {
        setCart(previousCart);
        setCartCount(previousCount);
        setError({
          message: err.response?.data?.message || 'Failed to add item to cart',
          code: err.response?.status || 'ADD_ERROR'
        });
      }

      throw err;
    } finally {
      pendingRequestsRef.current.delete(requestKey);
    }
  }, [isAuthenticated, cart, cartCount, fetchCart]);

  /**
   * Update cart item quantity with optimistic update
   * @param {number|string} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<void>}
   */
  const updateCartItem = useCallback(async (itemId, quantity) => {
    if (!isAuthenticated) {
      throw new Error('Please login to update cart');
    }

    // Prevent duplicate requests
    const requestKey = `updateCartItem-${itemId}`;
    if (pendingRequestsRef.current.has(requestKey)) {
      return;
    }

    pendingRequestsRef.current.add(requestKey);

    // Optimistic update
    const previousCart = cart;
    const previousCount = cartCount;

    if (cart?.items && isMountedRef.current) {
      const updatedItems = cart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const updatedCart = { ...cart, items: updatedItems };
      setCart(updatedCart);
      setCartCount(calculateTotalItems(updatedCart));
      setError(null);
    }

    try {
      await ordersAPI.updateCartItem(itemId, quantity);
      await fetchCart({ silent: true });
    } catch (err) {
      console.error('Error updating cart item:', err);

      // Rollback
      if (isMountedRef.current) {
        setCart(previousCart);
        setCartCount(previousCount);
        setError({
          message: err.response?.data?.message || 'Failed to update item',
          code: err.response?.status || 'UPDATE_ERROR'
        });
      }

      throw err;
    } finally {
      pendingRequestsRef.current.delete(requestKey);
    }
  }, [isAuthenticated, cart, cartCount, fetchCart]);

  /**
   * Remove item from cart with optimistic update
   * @param {number|string} itemId - Cart item ID to remove
   * @returns {Promise<void>}
   */
  const removeFromCart = useCallback(async (itemId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to remove items from cart');
    }

    // Prevent duplicate requests
    const requestKey = `removeFromCart-${itemId}`;
    if (pendingRequestsRef.current.has(requestKey)) {
      return;
    }

    pendingRequestsRef.current.add(requestKey);

    // Optimistic update
    const previousCart = cart;
    const previousCount = cartCount;

    if (cart?.items && isMountedRef.current) {
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      const updatedCart = { ...cart, items: updatedItems };
      setCart(updatedCart);
      setCartCount(calculateTotalItems(updatedCart));
      setError(null);
    }

    try {
      await ordersAPI.removeFromCart(itemId);
      await fetchCart({ silent: true });
    } catch (err) {
      console.error('Error removing from cart:', err);

      // Rollback
      if (isMountedRef.current) {
        setCart(previousCart);
        setCartCount(previousCount);
        setError({
          message: err.response?.data?.message || 'Failed to remove item',
          code: err.response?.status || 'REMOVE_ERROR'
        });
      }

      throw err;
    } finally {
      pendingRequestsRef.current.delete(requestKey);
    }
  }, [isAuthenticated, cart, cartCount, fetchCart]);

  /**
   * Move item to wishlist with optimistic update
   * @param {number|string} itemId - Cart item ID to move
   * @returns {Promise<void>}
   */
  const moveToWishlist = useCallback(async (itemId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to move items to wishlist');
    }

    // Prevent duplicate requests
    const requestKey = `moveToWishlist-${itemId}`;
    if (pendingRequestsRef.current.has(requestKey)) {
      return;
    }

    pendingRequestsRef.current.add(requestKey);

    // Optimistic update (remove from cart)
    const previousCart = cart;
    const previousCount = cartCount;

    if (cart?.items && isMountedRef.current) {
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      const updatedCart = { ...cart, items: updatedItems };
      setCart(updatedCart);
      setCartCount(calculateTotalItems(updatedCart));
      setError(null);
    }

    try {
      await ordersAPI.moveToWishlist(itemId);
      await fetchCart({ silent: true });
    } catch (err) {
      console.error('Error moving to wishlist:', err);

      // Rollback
      if (isMountedRef.current) {
        setCart(previousCart);
        setCartCount(previousCount);
        setError({
          message: err.response?.data?.message || 'Failed to move item to wishlist',
          code: err.response?.status || 'MOVE_ERROR'
        });
      }

      throw err;
    } finally {
      pendingRequestsRef.current.delete(requestKey);
    }
  }, [isAuthenticated, cart, cartCount, fetchCart]);

  /**
   * Manually update cart count (for edge cases)
   * @deprecated Prefer using cart actions that automatically update count
   */
  const updateCartCount = useCallback((newCount) => {
    if (isMountedRef.current) {
      setCartCount(newCount);
    }
  }, []);

  /**
   * Clear any existing errors
   */
  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setError(null);
    }
  }, []);

  // Initialize cart on mount or auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart({ silent: false });
    } else {
      // Clear cart when not authenticated
      if (isMountedRef.current) {
        setCart(null);
        setCartCount(0);
        setError(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{
      // State
      cartCount,
      cart,
      loading,
      error,

      // Actions
      fetchCart,
      fetchCartCount, // Deprecated but kept for backwards compatibility
      addToCart,
      updateCartItem,
      removeFromCart,
      moveToWishlist,
      updateCartCount, // Deprecated but kept for backwards compatibility
      clearError,
    }}>
      {children}
    </CartContext.Provider>
  );
};
