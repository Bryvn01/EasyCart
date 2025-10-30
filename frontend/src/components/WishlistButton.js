
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';
import toast from 'react-hot-toast';


const WishlistButton = ({ productId, size = 'sm', variant = 'outline', className = '' }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query to check if product is in wishlist
  const { data: wishlistStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['wishlist-status', productId],
    queryFn: async () => {
      if (!isAuthenticated) return false;
      const res = await wishlistAPI.checkWishlistStatus(productId);
      return res.data.is_in_wishlist;
    },
    enabled: !!productId && isAuthenticated,
    staleTime: 60 * 1000,
  });

  // Add to wishlist mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      return await wishlistAPI.addToWishlist(productId);
    },
    onSuccess: () => {
      toast.success('Added to wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist-status', productId] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.message || 'Failed to add to wishlist');
    },
  });

  // Remove from wishlist mutation
  const removeMutation = useMutation({
    mutationFn: async () => {
      // Find the wishlist item id
      const wishlistRes = await wishlistAPI.getWishlist();
      const item = (wishlistRes.data.items || []).find(i => i.product === productId);
      if (!item) throw new Error('Item not found in wishlist');
      await wishlistAPI.removeFromWishlist(item.id);
    },
    onSuccess: () => {
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist-status', productId] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.message || 'Failed to remove from wishlist');
    },
  });

  const loading = statusLoading || addMutation.isLoading || removeMutation.isLoading;

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage your wishlist');
      return;
    }
    if (wishlistStatus) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  return (
    <Button
      onClick={handleWishlistToggle}
      loading={loading}
      disabled={loading}
      size={size}
      variant={variant}
      className={`wishlist-btn ${className}`}
      title={wishlistStatus ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {wishlistStatus ? (
        <span className="flex items-center">
          <span className="mr-1">❤️</span>
          Remove
        </span>
      ) : (
        <span className="flex items-center">
          <span className="mr-1">🤍</span>
          Wishlist
        </span>
      )}
    </Button>
  );
};

export default WishlistButton;
