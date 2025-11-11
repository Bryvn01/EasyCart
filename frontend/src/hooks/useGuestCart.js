import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../services/api';

/**
 * useGuestCart - Manage guest cart with localStorage + server sync
 *
 * Industry Best Practice (Amazon/Shopify model):
 * - Unauthenticated users can add to cart (stored in localStorage)
 * - On login, guest cart migrates to server cart
 * - Seamless UX: no loss of cart items when user logs in
 * - Persistent across sessions until user clears localStorage
 *
 * Features:
 * - Add/remove/update items without authentication
 * - Automatic migration on login
 * - Conflict resolution (merge with existing server cart)
 * - Cart count badge updates
 * - localStorage with TTL (30 days)
 *
 * Usage:
 * const {
 *   guestCart,
 *   addToGuestCart,
 *   removeFromGuestCart,
 *   updateGuestCart,
 *   migrateGuestCartToServer,
 *   clearGuestCart
 * } = useGuestCart(isAuthenticated);
 */

const GUEST_CART_KEY = 'easycart_guest_cart';
const CART_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

const useGuestCart = (isAuthenticated) => {
  const [guestCart, setGuestCart] = useState([]);

  // Load guest cart from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (stored) {
        try {
          const { items, timestamp } = JSON.parse(stored);

          // Check if cart has expired
          if (Date.now() - timestamp < CART_TTL) {
            setGuestCart(items || []);
          } else {
            // Expired - clear it
            localStorage.removeItem(GUEST_CART_KEY);
          }
        } catch (error) {
          console.error('Error loading guest cart:', error);
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }
    }
  }, [isAuthenticated]);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated && guestCart.length > 0) {
      const cartData = {
        items: guestCart,
        timestamp: Date.now()
      };
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
    } else if (!isAuthenticated && guestCart.length === 0) {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  }, [guestCart, isAuthenticated]);

  /**
   * Add item to guest cart
   * @param {Object} product - Product object with id, name, price, image
   * @param {Number} quantity - Quantity to add (default: 1)
   */
  const addToGuestCart = useCallback((product, quantity = 1) => {
    setGuestCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product_id === product.id);

      if (existingIndex >= 0) {
        // Update existing item quantity
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + quantity
        };
        return updatedCart;
      } else {
        // Add new item
        return [
          ...prevCart,
          {
            id: `guest_${Date.now()}_${product.id}`, // Temporary ID
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            product_image: product.image,
            quantity: quantity,
            stock: product.stock
          }
        ];
      }
    });

    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        user_type: 'guest',
        product_id: product.id,
        product_name: product.name,
        value: product.price * quantity,
        currency: 'USD'
      });
    }
  }, []);

  /**
   * Remove item from guest cart
   * @param {String} itemId - Guest cart item ID
   */
  const removeFromGuestCart = useCallback((itemId) => {
    setGuestCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  /**
   * Update item quantity in guest cart
   * @param {String} itemId - Guest cart item ID
   * @param {Number} quantity - New quantity
   */
  const updateGuestCart = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromGuestCart(itemId);
      return;
    }

    setGuestCart(prevCart => {
      return prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: quantity }
          : item
      );
    });
  }, [removeFromGuestCart]);

  /**
   * Migrate guest cart to server cart after login
   * @returns {Promise<Object>} Result with success flag and merged cart
   */
  const migrateGuestCartToServer = useCallback(async () => {
    if (!isAuthenticated || guestCart.length === 0) {
      return { success: true, itemsMigrated: 0 };
    }

    try {
      // Get current server cart
      const serverCartResponse = await ordersAPI.getCart();
      const serverCart = serverCartResponse.data || [];

      // Merge strategy: Add guest items to server cart
      let itemsMigrated = 0;

      for (const guestItem of guestCart) {
        const existsInServer = serverCart.find(
          item => item.product_id === guestItem.product_id
        );

        if (existsInServer) {
          // Update quantity (add guest quantity to existing)
          await ordersAPI.updateCartItem(existsInServer.id, {
            quantity: existsInServer.quantity + guestItem.quantity
          });
          itemsMigrated++;
        } else {
          // Add new item to server cart
          await ordersAPI.addToCart({
            product_id: guestItem.product_id,
            quantity: guestItem.quantity
          });
          itemsMigrated++;
        }
      }

      // Clear guest cart after successful migration
      clearGuestCart();

      // Analytics event
      if (window.gtag) {
        window.gtag('event', 'cart_migration', {
          items_migrated: itemsMigrated,
          success: true
        });
      }

      return { success: true, itemsMigrated };
    } catch (error) {
      console.error('Error migrating guest cart:', error);

      // Analytics event
      if (window.gtag) {
        window.gtag('event', 'cart_migration', {
          success: false,
          error: error.message
        });
      }

      return { success: false, error: error.message };
    }
  }, [isAuthenticated, guestCart]);

  /**
   * Clear guest cart
   */
  const clearGuestCart = useCallback(() => {
    setGuestCart([]);
    localStorage.removeItem(GUEST_CART_KEY);
  }, []);

  /**
   * Get guest cart count (for badge)
   */
  const getGuestCartCount = useCallback(() => {
    return guestCart.reduce((total, item) => total + item.quantity, 0);
  }, [guestCart]);

  return {
    guestCart,
    guestCartCount: getGuestCartCount(),
    addToGuestCart,
    removeFromGuestCart,
    updateGuestCart,
    migrateGuestCartToServer,
    clearGuestCart
  };
};

export default useGuestCart;
