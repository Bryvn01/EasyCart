import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = React.useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await wishlistAPI.getWishlist();
      setWishlist(response.data.items || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to wishlist');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await wishlistAPI.addToWishlist(productId);
      await fetchWishlist(); // Refresh the wishlist
      return response.data;
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err.response?.data?.error || 'Failed to add to wishlist');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      await wishlistAPI.removeFromWishlist(itemId);
      await fetchWishlist(); // Refresh the wishlist
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err.response?.data?.error || 'Failed to remove from wishlist');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async (productId) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const response = await wishlistAPI.checkWishlistStatus(productId);
      return response.data.is_in_wishlist;
    } catch (err) {
      console.error('Error checking wishlist status:', err);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product === productId);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated, fetchWishlist]);

  const value = {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    checkWishlistStatus,
    isInWishlist,
    refreshWishlist: fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
