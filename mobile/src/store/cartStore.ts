/**
 * Cart Store
 *
 * Zustand store for managing shopping cart state with:
 * - Optimistic updates
 * - Offline support
 * - API synchronization
 * - Guest cart support
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ordersApi from '@/api/orders';
import * as storage from '@/utils/storage';
import type { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '@/types/api';

interface CartState {
  // State
  cart: Cart | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  offlineQueue: Array<{
    type: 'add' | 'update' | 'remove' | 'move-to-wishlist';
    data: any;
    timestamp: number;
  }>;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number, variantId?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  moveToWishlist: (itemId: number) => Promise<void>;
  clearCart: () => void;
  syncOfflineQueue: () => Promise<void>;

  // Computed
  getCartTotal: () => number;
  getItemCount: () => number;
  isInCart: (productId: number) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      isSyncing: false,
      error: null,
      offlineQueue: [],

      /**
       * Fetch cart from API
       */
      fetchCart: async () => {
        try {
          set({ isLoading: true, error: null });

          const cart = await ordersApi.getCart();

          set({ cart, isLoading: false });

          // Sync offline queue if exists
          if (get().offlineQueue.length > 0) {
            await get().syncOfflineQueue();
          }
        } catch (error: any) {
          // If not authenticated, load from local storage
          const cachedCart = await storage.getCachedData<Cart>('offline_cart');

          set({
            cart: cachedCart || null,
            isLoading: false,
            error: error.response?.status === 401 ? null : error.message,
          });
        }
      },

      /**
       * Add item to cart with optimistic update
       */
      addToCart: async (productId: number, quantity: number, variantId?: number) => {
        const request: AddToCartRequest = {
          product_id: productId,
          quantity,
          variant_id: variantId,
        };

        try {
          // Optimistic update
          const currentCart = get().cart;
          const tempItemId = Date.now();

          const tempItem: CartItem = {
            id: tempItemId,
            product_id: productId,
            quantity,
            variant_id: variantId,
            price: '0', // Will be updated from API
            subtotal: '0',
          };

          set({
            cart: currentCart
              ? { ...currentCart, items: [...currentCart.items, tempItem] }
              : { items: [tempItem], total: '0' },
          });

          // API call
          const updatedCart = await ordersApi.addToCart(request);

          set({ cart: updatedCart, error: null });
        } catch (error: any) {
          // Revert optimistic update on error
          await get().fetchCart();

          // Add to offline queue if network error
          if (String(error.message || '').toLowerCase().includes('network')) {
            set((state) => ({
              offlineQueue: [
                ...state.offlineQueue,
                { type: 'add', data: request, timestamp: Date.now() },
              ],
            }));

            // Save to local storage for guest users
            await storage.setCachedData('offline_cart', get().cart, 7 * 24 * 60 * 60);
          } else {
            set({ error: error.response?.data?.detail || 'Failed to add to cart' });
            throw error;
          }
        }
      },

      /**
       * Update cart item quantity
       */
      updateQuantity: async (itemId: number, quantity: number) => {
        if (quantity < 1) {
          return get().removeItem(itemId);
        }

        const request: UpdateCartItemRequest = { quantity };

        try {
          // Optimistic update
          const currentCart = get().cart;
          if (currentCart) {
            const updatedItems = currentCart.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            );
            set({ cart: { ...currentCart, items: updatedItems } });
          }

          // API call
          const updatedCart = await ordersApi.updateCartItem(itemId, request);

          set({ cart: updatedCart, error: null });
        } catch (error: any) {
          // Revert optimistic update
          await get().fetchCart();

          // Add to offline queue
          if (String(error.message || '').toLowerCase().includes('network')) {
            set((state) => ({
              offlineQueue: [
                ...state.offlineQueue,
                { type: 'update', data: { itemId, ...request }, timestamp: Date.now() },
              ],
            }));
          } else {
            set({ error: error.response?.data?.detail || 'Failed to update cart' });
            throw error;
          }
        }
      },

      /**
       * Remove item from cart
       */
      removeItem: async (itemId: number) => {
        try {
          // Optimistic update
          const currentCart = get().cart;
          if (currentCart) {
            const updatedItems = currentCart.items.filter((item) => item.id !== itemId);
            set({ cart: { ...currentCart, items: updatedItems } });
          }

          // API call
          await ordersApi.removeFromCart(itemId);

          await get().fetchCart();
        } catch (error: any) {
          // Revert optimistic update
          await get().fetchCart();

          // Add to offline queue
          if (String(error.message || '').toLowerCase().includes('network')) {
            set((state) => ({
              offlineQueue: [
                ...state.offlineQueue,
                { type: 'remove', data: { itemId }, timestamp: Date.now() },
              ],
            }));
          } else {
            set({ error: error.response?.data?.detail || 'Failed to remove item' });
            throw error;
          }
        }
      },

      /**
       * Move cart item to wishlist
       */
      moveToWishlist: async (itemId: number) => {
        try {
          await ordersApi.moveCartItemToWishlist(itemId);
          await get().fetchCart();
        } catch (error: any) {
          set({ error: error.response?.data?.detail || 'Failed to move to wishlist' });
          throw error;
        }
      },

      /**
       * Clear entire cart
       */
      clearCart: () => {
        set({ cart: null, error: null, offlineQueue: [] });
        storage.removeCachedData('offline_cart');
      },

      /**
       * Sync offline queue with server
       */
      syncOfflineQueue: async () => {
        const { offlineQueue } = get();

        if (offlineQueue.length === 0) return;

        set({ isSyncing: true });

        try {
          // Process queue in order
          for (const queueItem of offlineQueue) {
            switch (queueItem.type) {
              case 'add':
                await ordersApi.addToCart(queueItem.data);
                break;
              case 'update':
                await ordersApi.updateCartItem(queueItem.data.itemId, {
                  quantity: queueItem.data.quantity,
                });
                break;
              case 'remove':
                await ordersApi.removeFromCart(queueItem.data.itemId);
                break;
              case 'move-to-wishlist':
                await ordersApi.moveCartItemToWishlist(queueItem.data.itemId);
                break;
            }
          }

          // Clear queue and refresh cart
          set({ offlineQueue: [], isSyncing: false });
          await get().fetchCart();
        } catch (error) {
          console.error('Failed to sync offline queue:', error);
          set({ isSyncing: false });
        }
      },

      /**
       * Get cart total
       */
      getCartTotal: () => {
        const { cart } = get();
        return cart ? parseFloat(cart.total) : 0;
      },

      /**
       * Get total item count
       */
      getItemCount: () => {
        const { cart } = get();
        return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
      },

      /**
       * Check if product is in cart
       */
      isInCart: (productId: number) => {
        const { cart } = get();
        return cart?.items.some((item) => item.product_id === productId) || false;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist cart and offline queue
      partialize: (state) => ({
        cart: state.cart,
        offlineQueue: state.offlineQueue,
      }),
    }
  )
);
