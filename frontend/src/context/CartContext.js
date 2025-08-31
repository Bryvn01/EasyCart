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

  const updateCartCount = (newCount) => {
    setCartCount(newCount);
  };

  useEffect(() => {
    fetchCartCount();
  }, [isAuthenticated, fetchCartCount]);

  return (
    <CartContext.Provider value={{
      cartCount,
      fetchCartCount,
      updateCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};