import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Loading } from '../components/ui';
// import WishlistButton from '../components/WishlistButton';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlist, loading, error, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, 1);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await removeFromWishlist(itemId);
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">
          Please log in to view your wishlist
        </p>
        <Link to="/login" className="btn btn-primary">
          Login Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <Loading size="lg" />
        <p className="mt-4 text-gray-600">Loading your wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-gray-600">
          {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">
            Start adding products you love to your wishlist
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <Link to={`/products/${item.product}`}>
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.product_image || '/api/placeholder/300/300'}
                    alt={item.product_name}
                    className="h-48 w-full object-cover object-center hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="flex items-center justify-center text-4xl text-gray-400">
                    📦
                  </div>
                </div>
              </Link>
              
              <div className="p-4">
                <Link to={`/products/${item.product}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                    {item.product_name}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-primary-600">
                    KES {item.product_price}
                  </span>
                  {item.product_stock > 0 ? (
                    <span className="text-sm text-green-600">In Stock</span>
                  ) : (
                    <span className="text-sm text-red-600">Out of Stock</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart({ id: item.product })}
                    disabled={item.product_stock === 0}
                    size="sm"
                    className="flex-1"
                  >
                    {item.product_stock === 0 ? 'Sold Out' : 'Add to Cart'}
                  </Button>
                  <Button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    variant="danger"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
