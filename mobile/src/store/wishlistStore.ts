/**
 * Wishlist Store
 *
 * Zustand store for managing wishlist state with:
 * - Add/remove items
 * - Move to cart
 * - Optimistic updates
 * - Offline support
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as productsApi from '@/api/products';
import type { Wishlist, WishlistItem } from '@/types/api';

interface WishlistState {
  // State
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (itemId: number) => Promise<void>;
  moveToCart: (itemId: number) => Promise<void>;
  checkWishlistStatus: (productId: number) => Promise<boolean>;
  clearWishlist: () => void;

  // Computed
  getItemCount: () => number;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      // Initial state
      wishlist: null,
      isLoading: false,
      error: null,

      /**
       * Fetch wishlist from API
       */
      fetchWishlist: async () => {
        try {
          set({ isLoading: true, error: null });

          const wishlist = await productsApi.getWishlist();

          set({ wishlist, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Failed to load wishlist';
          set({ error: errorMessage, isLoading: false });

          // If not authenticated, clear wishlist
          if (error.response?.status === 401) {
            set({ wishlist: null });
          }
        }
      },

      /**
       * Add product to wishlist with optimistic update
       */
      addToWishlist: async (productId: number) => {
        try {
          // Optimistic update
          const currentWishlist = get().wishlist;
          const tempItem: WishlistItem = {
            id: Date.now(),
            product_id: productId,
            added_at: new Date().toISOString(),
          };

          set({
            wishlist: currentWishlist
              ? { ...currentWishlist, items: [...currentWishlist.items, tempItem] }
              : { id: Date.now(), items: [tempItem] },
          });

          // API call
          await productsApi.addToWishlist(productId);

          // Refresh to get complete data
          await get().fetchWishlist();
        } catch (error: any) {
          // Revert optimistic update on error
          await get().fetchWishlist();

          const errorMessage = error.response?.data?.detail || 'Failed to add to wishlist';
          set({ error: errorMessage });
          throw error;
        }
      },

      /**
       * Remove item from wishlist
       */
      removeFromWishlist: async (itemId: number) => {
        try {
          // Optimistic update
          const currentWishlist = get().wishlist;
          if (currentWishlist) {
            const updatedItems = currentWishlist.items.filter((item) => item.id !== itemId);
            set({ wishlist: { ...currentWishlist, items: updatedItems } });
          }

          // API call
          await productsApi.removeFromWishlist(itemId);

          set({ error: null });
        } catch (error: any) {
          // Revert optimistic update
          await get().fetchWishlist();

          const errorMessage = error.response?.data?.detail || 'Failed to remove from wishlist';
          set({ error: errorMessage });
          throw error;
        }
      },

      /**
       * Move wishlist item to cart
       */
      moveToCart: async (itemId: number) => {
        try {
          await productsApi.moveWishlistItemToCart(itemId);

          // Refresh wishlist after move
          await get().fetchWishlist();
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Failed to move to cart';
          set({ error: errorMessage });
          throw error;
        }
      },

      /**
       * Check if product is in wishlist (API call)
       */
      checkWishlistStatus: async (productId: number) => {
        try {
          const response = await productsApi.checkWishlistStatus(productId);
          return response.is_in_wishlist;
        } catch (error) {
          console.error('Failed to check wishlist status:', error);
          return false;
        }
      },

      /**
       * Clear wishlist
       */
      clearWishlist: () => {
        set({ wishlist: null, error: null });
      },

      /**
       * Get total item count
       */
      getItemCount: () => {
        const { wishlist } = get();
        return wishlist?.items.length || 0;
      },

      /**
       * Check if product is in wishlist (local check)
       */
      isInWishlist: (productId: number) => {
        const { wishlist } = get();
        return wishlist?.items.some((item) => item.product_id === productId) || false;
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist wishlist data
      partialize: (state) => ({
        wishlist: state.wishlist,
      }),
    }
  )
);
