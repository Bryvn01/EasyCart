/**
 * Custom Hooks
 *
 * Reusable hooks for common functionality across the app.
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

/**
 * useAuth Hook
 *
 * Provides easy access to authentication state and actions.
 * Automatically initializes auth state on mount.
 */
export function useAuth() {
  const {
    user,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logout,
    updateProfile,
    enableBiometric,
    disableBiometric,
    loginWithBiometric,
    biometricEnabled,
    clearError,
  } = useAuthStore();

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    biometricEnabled,
    login,
    register,
    logout,
    updateProfile,
    enableBiometric,
    disableBiometric,
    loginWithBiometric,
    clearError,
  };
}

/**
 * useCart Hook
 *
 * Provides cart state and actions with automatic syncing.
 * Fetches cart on mount if authenticated.
 */
export function useCart() {
  const { user } = useAuthStore();
  const {
    cart,
    isLoading,
    isSyncing,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    moveToWishlist,
    clearCart,
    getCartTotal,
    getItemCount,
    isInCart,
  } = useCartStore();

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (user && !cart) {
      fetchCart();
    }
  }, [user, cart, fetchCart]);

  const cartTotal = getCartTotal();
  const itemCount = getItemCount();

  return {
    cart,
    isLoading,
    isSyncing,
    error,
    cartTotal,
    itemCount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    moveToWishlist,
    clearCart,
    isInCart,
  };
}

/**
 * useWishlist Hook
 *
 * Provides wishlist state and actions.
 * Fetches wishlist on mount if authenticated.
 */
export function useWishlist() {
  const { user } = useAuthStore();
  const {
    wishlist,
    isLoading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    checkWishlistStatus,
    clearWishlist,
    getItemCount,
    isInWishlist,
  } = useWishlistStore();

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (user && !wishlist) {
      fetchWishlist();
    }
  }, [user, wishlist, fetchWishlist]);

  const itemCount = getItemCount();

  return {
    wishlist,
    isLoading,
    error,
    itemCount,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    checkWishlistStatus,
    clearWishlist,
    isInWishlist,
  };
}

/**
 * useDebounce Hook
 *
 * Debounces a value for the specified delay.
 * Useful for search inputs and API calls.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useNetworkStatus Hook
 *
 * Monitors network connectivity status.
 * Returns whether the device is online.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return isOnline;
}

// Add missing import
import { useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
