/**
 * Orders & Cart API Service
 * Shopping cart, checkout, and order management
 */

import apiClient from './client';
import type {
  Cart,

  Order,
  OrderListResponse,
  CheckoutRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  PaymentInitiateRequest,
  PaymentStatusResponse,
} from '@/types/api';

// ==================== CART ====================

/**
 * Get user's shopping cart
 */
export const getCart = async (): Promise<Cart> => {
  const response = await apiClient.get<Cart>('/orders/cart/');
  return response.data;
};

/**
 * Add product to cart
 */
export const addToCart = async (data: AddToCartRequest): Promise<Cart> => {
  const response = await apiClient.post<Cart>('/orders/cart/add/', data);
  return response.data;
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (itemId: number): Promise<void> => {
  await apiClient.delete(`/orders/cart/remove/${itemId}/`);
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
  itemId: number,
  data: UpdateCartItemRequest
): Promise<Cart> => {
  const response = await apiClient.patch<Cart>(
    `/orders/cart/update/${itemId}/`,
    data
  );
  return response.data;
};

/**
 * Move cart item to wishlist
 */
export const moveCartItemToWishlist = async (
  itemId: number
): Promise<{message: string}> => {
  const response = await apiClient.post<{message: string}>(
    `/orders/cart/move-to-wishlist/${itemId}/`
  );
  return response.data;
};

// ==================== CHECKOUT ====================

/**
 * Checkout cart and create order
 */
export const checkout = async (data: CheckoutRequest): Promise<Order> => {
  const response = await apiClient.post<Order>('/orders/checkout/', data);
  return response.data;
};

// ==================== PAYMENT ====================

/**
 * Initiate payment for an order
 */
export const initiatePayment = async (
  data: PaymentInitiateRequest
): Promise<{message: string; checkout_request_id?: string; payment_id: number}> => {
  const response = await apiClient.post<{
    message: string;
    checkout_request_id?: string;
    payment_id: number;
  }>('/orders/payment/initiate/', data);
  return response.data;
};

/**
 * Get payment status for an order
 */
export const getPaymentStatus = async (orderId: number): Promise<PaymentStatusResponse> => {
  const response = await apiClient.get<PaymentStatusResponse>(
    `/orders/payment/status/${orderId}/`
  );
  return response.data;
};

// ==================== ORDERS ====================

/**
 * Get user's order history
 */
export const getOrders = async (page = 1, pageSize = 20): Promise<OrderListResponse> => {
  const response = await apiClient.get<OrderListResponse>('/orders/', {
    params: {page, page_size: pageSize},
  });
  return response.data;
};

/**
 * Get single order details
 */
export const getOrder = async (id: number): Promise<Order> => {
  const response = await apiClient.get<Order>(`/orders/${id}/`);
  return response.data;
};

/**
 * Update order status (admin)
 */
export const updateOrderStatus = async (
  orderId: number,
  status: string
): Promise<Order> => {
  const response = await apiClient.patch<Order>(`/orders/${orderId}/`, {status});
  return response.data;
};

export const ordersAPI = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  moveCartItemToWishlist,
  checkout,
  initiatePayment,
  getPaymentStatus,
  getOrders,
  getOrder,
  updateOrderStatus,
};

export default ordersAPI;
