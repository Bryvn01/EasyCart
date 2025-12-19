/**
 * API Types & Interfaces
 * TypeScript type definitions for all API requests and responses
 */

// ==================== USER & AUTH ====================

export interface User {
  id: number;
  email: string;
  username: string;
  phone?: string;
  phone_number?: string;
  address?: string;
  role: 'superadmin' | 'manager' | 'editor' | 'viewer';
  is_admin: boolean;
  two_factor_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
  requires_2fa?: boolean;
  message?: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface OTPRequest {
  identifier: string; // email or phone
  method: 'sms' | 'whatsapp' | 'email';
}

export interface OTPVerifyRequest {
  identifier: string;
  otp_code: string;
}

export interface OTPResponse {
  message: string;
  identifier: string;
  method: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qr_code: string;
  message: string;
}

export interface TwoFactorVerifyRequest {
  email: string;
  code: string;
}

// ==================== PRODUCTS ====================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
  image_url?: string;
  is_active: boolean;
  products_count?: number;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: string; // Decimal as string
  compare_price?: string;
  category: Category;
  image: string;
  image_url?: string;
  stock: number;
  sku: string;
  brand?: string;
  weight?: string;
  dimensions?: string;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  average_rating: number;
  review_count: number;
  is_on_sale: boolean;
  discount_percentage: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductQueryParams {
  category?: string;
  search?: string;
  ordering?: string; // '-created_at' | 'price' | '-price' | 'name' | '-view_count'
  page?: number;
  page_size?: number;
  price_min?: number;
  price_max?: number;
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

// ==================== WISHLIST ====================

export interface WishlistItem {
  id: number;
  product_id: number;
  added_at: string;
}

export interface Wishlist {
  id: number;
  items: WishlistItem[];
  user?: number;
  item_count?: number;
  created_at?: string;
}

// ==================== REVIEWS ====================

export interface Review {
  id: number;
  product: number;
  user: number;
  user_name: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  user_found_helpful?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

export interface CreateReviewRequest {
  product: number;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase?: boolean;
}

// ==================== CART ====================

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  variant_id?: number;
  price: string;
  subtotal: string;
}

export interface Cart {
  items: CartItem[];
  total: string;
  id?: number;
  user?: number;
  total_items?: number;
  total_amount?: string;
  created_at?: string;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
  variant_id?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ==================== ORDERS ====================

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'mpesa'
  | 'airtel'
  | 'tkash'
  | 'card'
  | 'stripe'
  | 'paypal'
  | 'bank'
  | 'cash';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: string;
  subtotal: string;
}

export interface Order {
  id: number;
  user: number;
  items: OrderItem[];
  total_amount: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_reference?: string;
  transaction_id?: string;
  shipping_address: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export interface CheckoutRequest {
  shipping_address: string;
  phone_number: string;
  payment_method: PaymentMethod;
}

export interface PaymentInitiateRequest {
  order_id: number;
  phone_number: string;
  payment_method: PaymentMethod;
}

export interface PaymentStatusResponse {
  order_id: number;
  payment_status: PaymentStatus;
  transaction_id?: string;
  message: string;
}

// ==================== PAGINATION ====================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ==================== ERROR ====================

export interface APIError {
  message: string;
  error?: string;
  detail?: string;
  status?: number;
}

// ==================== UTILITY TYPES ====================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;
