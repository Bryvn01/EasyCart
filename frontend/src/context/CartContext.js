import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const fetchCartCount = React.useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    try {
      const response = await ordersAPI.getCart();
      const totalItems = response.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(totalItems);
    } catch (error) {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const fetchCart = React.useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      const response = await ordersAPI.getCart();
      setCart(response.data);
      const totalItems = response.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    try {
      await ordersAPI.addToCart({ product_id: productId, quantity });
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!isAuthenticated) {
      throw new Error('Please login to update cart');
    }

    try {
      await ordersAPI.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to remove items from cart');
    }

    try {
      await ordersAPI.removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const moveToWishlist = async (itemId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to move items to wishlist');
    }

    try {
      await ordersAPI.moveToWishlist(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      throw error;
    }
  };

  const updateCartCount = (newCount) => {
    setCartCount(newCount);
  };

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