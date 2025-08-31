import React, { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';
import toast from 'react-hot-toast';

const WishlistButton = ({ productId, size = 'sm', variant = 'outline', className = '' }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const wishlistItem = wishlist.find(item => item.product === productId);
  const isProductInWishlist = isInWishlist(productId);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage your wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isProductInWishlist && wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(productId);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
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
      title={isProductInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isProductInWishlist ? (
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
