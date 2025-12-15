/**
 * Products API Service
 * Product catalog, categories, wishlist, and reviews
 */

import apiClient from './client';
import type {
  Product,
  ProductListResponse,
  Category,
  Wishlist,
  WishlistItem,
  Review,
  ReviewListResponse,
  CreateReviewRequest,
  ProductQueryParams,
} from '@/types/api';

/**
 * Get paginated product list with filters
 */
export const getProducts = async (
  params?: ProductQueryParams
): Promise<ProductListResponse> => {
  const response = await apiClient.get<ProductListResponse>('/products/', {params});
  return response.data;
};

/**
 * Get single product by ID
 */
export const getProduct = async (id: string | number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}/`);
  return response.data;
};

/**
 * Get all product categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/products/categories/');
  return response.data;
};

/**
 * Search products by query
 */
export const searchProducts = async (query: string): Promise<ProductListResponse> => {
  const response = await apiClient.get<ProductListResponse>('/products/', {
    params: {search: query},
  });
  return response.data;
};

// ==================== WISHLIST ====================

/**
 * Get user's wishlist
 */
export const getWishlist = async (): Promise<Wishlist> => {
  const response = await apiClient.get<Wishlist>('/products/wishlist/');
  return response.data;
};

/**
 * Add product to wishlist
 */
export const addToWishlist = async (productId: number): Promise<WishlistItem> => {
  const response = await apiClient.post<WishlistItem>('/products/wishlist/add/', {
    product_id: productId,
  });
  return response.data;
};

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = async (itemId: number): Promise<void> => {
  await apiClient.delete(`/products/wishlist/remove/${itemId}/`);
};

/**
 * Move wishlist item to cart
 */
export const moveWishlistItemToCart = async (
  itemId: number,
  quantity = 1
): Promise<{message: string}> => {
  const response = await apiClient.post<{message: string}>(
    `/products/wishlist/move-to-cart/${itemId}/`,
    {quantity}
  );
  return response.data;
};

/**
 * Check if product is in wishlist
 */
export const checkWishlistStatus = async (
  productId: number
): Promise<{is_in_wishlist: boolean}> => {
  const response = await apiClient.get<{is_in_wishlist: boolean}>(
    `/products/wishlist/check/${productId}/`
  );
  return response.data;
};

// ==================== REVIEWS ====================

/**
 * Get reviews for a product
 */
export const getProductReviews = async (
  productId: number,
  page = 1
): Promise<ReviewListResponse> => {
  const response = await apiClient.get<ReviewListResponse>(
    `/products/reviews/${productId}/`,
    {params: {page}}
  );
  return response.data;
};

/**
 * Create a product review
 */
export const createReview = async (data: CreateReviewRequest): Promise<Review> => {
  const response = await apiClient.post<Review>('/products/reviews/create/', data);
  return response.data;
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (
  reviewId: number,
  isHelpful = true
): Promise<{message: string}> => {
  const response = await apiClient.post<{message: string}>('/products/reviews/helpful/', {
    review_id: reviewId,
    is_helpful: isHelpful,
  });
  return response.data;
};

export const productsAPI = {
  getProducts,
  getProduct,
  getCategories,
  searchProducts,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistItemToCart,
  checkWishlistStatus,
  getProductReviews,
  createReview,
  markReviewHelpful,
};

export default productsAPI;
