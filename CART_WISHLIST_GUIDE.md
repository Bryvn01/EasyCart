# Shopping Cart and Wishlist Persistence Guide

## Overview

EasyCart now has enhanced persistent shopping cart and wishlist functionality with full management capabilities. Both cart and wishlist are stored in the database and synchronized across sessions and devices for authenticated users.

## Features Implemented

### 1. Persistent Shopping Cart
- ✅ **Database persistence**: Cart items are stored per user in the database
- ✅ **Cross-session/device sync**: Cart persists across logins and devices
- ✅ **Quantity management**: Users can increment/decrement item quantities
- ✅ **Stock validation**: Prevents adding more items than available in stock
- ✅ **Move to wishlist**: Users can save items for later by moving them to wishlist

### 2. Persistent Wishlist
- ✅ **Database persistence**: Wishlist items are stored per user in the database
- ✅ **Cross-session/device sync**: Wishlist persists across logins and devices
- ✅ **Move to cart**: Quick conversion from wishlist item to cart item
- ✅ **Duplicate prevention**: Cannot add the same product twice to wishlist

### 3. Bi-directional Movement
- ✅ **Cart → Wishlist**: Save items for later without losing them
- ✅ **Wishlist → Cart**: Quick purchase of saved items

## API Endpoints

### Cart Management

#### Get Cart
```http
GET /api/orders/cart/
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /api/orders/cart/add/
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 123,
  "quantity": 2
}
```

#### Update Cart Item Quantity
```http
PATCH /api/orders/cart/update/{item_id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5
}
```

**Validation:**
- Quantity must be between 1 and 100
- Quantity cannot exceed available stock

#### Remove from Cart
```http
DELETE /api/orders/cart/remove/{item_id}/
Authorization: Bearer <token>
```

#### Move Cart Item to Wishlist
```http
POST /api/orders/cart/move-to-wishlist/{item_id}/
Authorization: Bearer <token>
```

### Wishlist Management

#### Get Wishlist
```http
GET /api/products/wishlist/
Authorization: Bearer <token>
```

#### Add to Wishlist
```http
POST /api/products/wishlist/add/
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 123
}
```

#### Remove from Wishlist
```http
DELETE /api/products/wishlist/remove/{item_id}/
Authorization: Bearer <token>
```

#### Move Wishlist Item to Cart
```http
POST /api/products/wishlist/move-to-cart/{item_id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 1  // Optional, defaults to 1
}
```

**Behavior:**
- Moves item from wishlist to cart
- If item already exists in cart, adds to existing quantity
- Validates stock availability
- Removes item from wishlist after successful move

#### Check if Product in Wishlist
```http
GET /api/products/wishlist/check/{product_id}/
Authorization: Bearer <token>
```

## Frontend Usage

### Cart Context

The enhanced `CartContext` provides full cart management:

```javascript
import { useCart } from '../context/CartContext';

function MyComponent() {
  const {
    cart,              // Full cart object with items
    cartCount,         // Total number of items
    loading,           // Loading state
    fetchCart,         // Refresh cart data
    addToCart,         // Add product to cart
    updateCartItem,    // Update item quantity
    removeFromCart,    // Remove item from cart
    moveToWishlist,    // Move item to wishlist
  } = useCart();

  // Add product to cart
  const handleAddToCart = async () => {
    try {
      await addToCart(productId, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  // Update quantity
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateCartItem(itemId, newQuantity);
      toast.success('Cart updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update');
    }
  };

  // Move to wishlist
  const handleMoveToWishlist = async (itemId) => {
    try {
      await moveToWishlist(itemId);
      toast.success('Moved to wishlist');
    } catch (error) {
      toast.error('Failed to move to wishlist');
    }
  };

  return (
    <div>
      <p>Cart Count: {cartCount}</p>
      {/* Your cart UI */}
    </div>
  );
}
```

### Wishlist Context

The enhanced `WishlistContext` includes move to cart:

```javascript
import { useWishlist } from '../context/WishlistContext';

function MyComponent() {
  const {
    wishlist,           // Array of wishlist items
    loading,            // Loading state
    error,              // Error message
    addToWishlist,      // Add product to wishlist
    removeFromWishlist, // Remove item from wishlist
    moveToCart,         // Move item to cart
    isInWishlist,       // Check if product is in wishlist
    checkWishlistStatus,// Check wishlist status (API call)
    refreshWishlist,    // Refresh wishlist data
  } = useWishlist();

  // Move item to cart
  const handleMoveToCart = async (itemId, itemName) => {
    try {
      await moveToCart(itemId, 1);
      toast.success(`${itemName} moved to cart!`);
    } catch (error) {
      toast.error('Failed to move to cart');
    }
  };

  return (
    <div>
      <p>Wishlist Items: {wishlist.length}</p>
      {/* Your wishlist UI */}
    </div>
  );
}
```

## UI Features

### Cart Page (`/cart`)

**New Features:**
- ➕➖ Quantity controls (increment/decrement buttons)
- 💛 "Move to Wishlist" button for each item
- ✅ Stock validation feedback
- 🔄 Real-time cart updates

**User Flow:**
1. View all cart items with quantities
2. Adjust quantities using +/- buttons
3. Move items to wishlist for later
4. Remove items from cart
5. Proceed to checkout

### Wishlist Page (`/wishlist`)

**New Features:**
- 🛒 "Move to Cart" button (replaces "Add to Cart")
- ✅ Stock status display
- 🗑️ Remove from wishlist
- 🔄 Real-time wishlist updates

**User Flow:**
1. View all saved wishlist items
2. Click "Move to Cart" to purchase items
3. Item is removed from wishlist and added to cart
4. Remove items no longer wanted

## Database Models

### Cart Model
```python
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    
    class Meta:
        unique_together = ('cart', 'product')
```

### Wishlist Model
```python
class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wishlist')
    created_at = models.DateTimeField(auto_now_add=True)

class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('wishlist', 'product')
        ordering = ['-added_at']
```

## Security Features

All endpoints implement:
- ✅ JWT Authentication required
- ✅ User isolation (users can only access their own cart/wishlist)
- ✅ Path traversal prevention on IDs
- ✅ Input validation and sanitization
- ✅ Stock availability checking
- ✅ Quantity limits (1-100)

## Testing

### Backend Tests
Location: `backend/apps/orders/test_cart_wishlist.py`

Tests cover:
- Cart creation
- Wishlist creation
- Adding items to cart
- Adding items to wishlist
- Updating cart quantities
- Moving from wishlist to cart
- Moving from cart to wishlist

Run tests:
```bash
cd backend
python manage.py test apps.orders.test_cart_wishlist
```

### Frontend Tests
Location: `frontend/src/__tests__/CartContext.test.js`

Tests cover:
- Cart count display
- Authentication-based behavior
- Adding to cart
- Updating cart items
- Removing from cart
- Moving to wishlist

Run tests:
```bash
cd frontend
npm test CartContext
```

## Benefits

### For Users
1. **Persistence**: Never lose cart or wishlist items
2. **Convenience**: Access cart/wishlist from any device
3. **Flexibility**: Easy movement between cart and wishlist
4. **Control**: Fine-grained quantity management

### For Business
1. **Reduced cart abandonment**: Items saved for later return
2. **Increased conversions**: Wishlist to cart conversion
3. **Better insights**: Track what users want to buy
4. **Cross-device consistency**: Seamless experience

## Migration Notes

### Existing Users
- No migration needed - models already existed
- Existing cart and wishlist data preserved
- New features automatically available

### New Features Added
- Cart quantity update endpoint
- Move between cart/wishlist endpoints
- Enhanced frontend contexts
- Quantity controls in UI
- Move buttons in UI

## Future Enhancements (Optional)

These features are not required for persistence but could be added:

1. **Local Storage for Guest Users**
   - Store cart/wishlist in browser for non-authenticated users
   - Merge with server on login

2. **Wishlist Sharing**
   - Share wishlist with friends/family
   - Generate shareable links

3. **Cart Expiration**
   - Auto-remove items after X days
   - Send reminder emails

4. **Bulk Operations**
   - Move all wishlist items to cart
   - Clear entire cart/wishlist

5. **Saved Carts**
   - Multiple named carts
   - Template carts for recurring purchases

## Troubleshooting

### Cart not updating
- Check authentication status
- Verify JWT token is valid
- Check browser console for errors
- Ensure backend is running

### Items not moving between cart/wishlist
- Check stock availability
- Verify item exists in source collection
- Check API response for error messages

### Quantity not updating
- Must be between 1-100
- Cannot exceed available stock
- Check for validation errors in response

## Support

For issues or questions:
1. Check API response for specific error messages
2. Review browser console logs
3. Check backend logs
4. Verify authentication status
5. Ensure product is active and in stock
