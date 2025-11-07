import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ordersAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Track pending operations to prevent race conditions
  const pendingOperations = useRef(new Set());

  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    try {
      const response = await ordersAPI.getCart();
      const totalItems = response.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(totalItems);
      return response.data;
    } catch (error) {
      setCartCount(0);
      throw error;
    }
  }, [isAuthenticated]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return null;
    }

    setLoading(true);
    try {
      const response = await ordersAPI.getCart();
      setCart(response.data);
      const totalItems = response.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(totalItems);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    // Generate operation key to detect duplicates
    const operationKey = `add-${productId}-${Date.now()}`;
    
    // Check if similar operation is already pending
    const isDuplicate = Array.from(pendingOperations.current).some(
      key => key.startsWith(`add-${productId}`)
    );
    
    if (isDuplicate) {
      console.log('Duplicate add operation detected, skipping');
      return;
    }

    pendingOperations.current.add(operationKey);

    // Optimistic update - immediately update local state
    const previousCart = cart;
    if (cart) {
      const existingItem = cart.items?.find(item => item.product.id === productId);
      if (existingItem) {
        // Update existing item quantity optimistically
        setCart({
          ...cart,
          items: cart.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        });
        setCartCount(cartCount + quantity);
      } else {
        // Item count will be updated after fetch
        setCartCount(cartCount + quantity);
      }
    } else {
      setCartCount(cartCount + quantity);
    }

    try {
      const response = await ordersAPI.addToCart({ product_id: productId, quantity });
      
      // Fetch fresh cart data from backend (source of truth)
      const freshCart = await fetchCart();
      
      pendingOperations.current.delete(operationKey);
      
      // Return cart data for notification purposes
      return {
        success: true,
        cartData: freshCart,
        message: response.data.message
      };
    } catch (error) {
      // Rollback optimistic update on error
      setCart(previousCart);
      setCartCount(previousCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
      
      pendingOperations.current.delete(operationKey);
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, [isAuthenticated, cart, cartCount, fetchCart]);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    if (!isAuthenticated) {
      throw new Error('Please login to update cart');
    }

    const operationKey = `update-${itemId}`;
    
    // Prevent duplicate operations on same item
    const isDuplicate = Array.from(pendingOperations.current).some(
      key => key.startsWith(`update-${itemId}`)
    );
    
    if (isDuplicate) {
      console.log('Duplicate update operation detected, skipping');
      return;
    }

    pendingOperations.current.add(operationKey);

    // Optimistic update
    const previousCart = cart;
    if (cart) {
      setCart({
        ...cart,
        items: cart.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      });
      const newTotal = cart.items.reduce((sum, item) => 
        sum + (item.id === itemId ? quantity : item.quantity), 0
      );
      setCartCount(newTotal);
    }

    try {
      await ordersAPI.updateCartItem(itemId, quantity);
      await fetchCart();
      pendingOperations.current.delete(operationKey);
    } catch (error) {
      // Rollback on error
      setCart(previousCart);
      setCartCount(previousCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
      pendingOperations.current.delete(operationKey);
      console.error('Error updating cart item:', error);
      throw error;
    }
  }, [isAuthenticated, cart, fetchCart]);

  const removeFromCart = useCallback(async (itemId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to remove items from cart');
    }

    const operationKey = `remove-${itemId}`;
    
    // Prevent duplicate operations on same item
    const isDuplicate = Array.from(pendingOperations.current).some(
      key => key.startsWith(`remove-${itemId}`)
    );
    
    if (isDuplicate) {
      console.log('Duplicate remove operation detected, skipping');
      return;
    }

    pendingOperations.current.add(operationKey);

    // Optimistic update
    const previousCart = cart;
    if (cart) {
      const removedItem = cart.items.find(item => item.id === itemId);
      setCart({
        ...cart,
        items: cart.items.filter(item => item.id !== itemId)
      });
      if (removedItem) {
        setCartCount(cartCount - removedItem.quantity);
      }
    }

    try {
      await ordersAPI.removeFromCart(itemId);
      await fetchCart();
      pendingOperations.current.delete(operationKey);
    } catch (error) {
      // Rollback on error
      setCart(previousCart);
      setCartCount(previousCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
      pendingOperations.current.delete(operationKey);
      console.error('Error removing from cart:', error);
      throw error;
    }
  }, [isAuthenticated, cart, cartCount, fetchCart]);

  const moveToWishlist = useCallback(async (itemId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to move items to wishlist');
    }

    const operationKey = `wishlist-${itemId}-${Date.now()}`;
    
    // Prevent duplicate operations on same item
    const isDuplicate = Array.from(pendingOperations.current).some(
      key => key.startsWith(`wishlist-${itemId}`)
    );
    
    if (isDuplicate) {
      console.log('Duplicate wishlist operation detected, skipping');
      return;
    }

    pendingOperations.current.add(operationKey);

    try {
      await ordersAPI.moveToWishlist(itemId);
      await fetchCart();
      pendingOperations.current.delete(operationKey);
    } catch (error) {
      pendingOperations.current.delete(operationKey);
      console.error('Error moving to wishlist:', error);
      throw error;
    }
  }, [isAuthenticated, fetchCart]);

  const updateCartCount = useCallback((newCount) => {
    setCartCount(newCount);
  }, []);

  // Clear pending operations on auth change
  useEffect(() => {
    if (!isAuthenticated) {
      pendingOperations.current.clear();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCartCount();
  }, [isAuthenticated, fetchCartCount]);

  return (
    <CartContext.Provider value={{
      cartCount,
      cart,
      loading,
      fetchCartCount,
      fetchCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      moveToWishlist,
      updateCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
