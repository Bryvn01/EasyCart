/**
 * Navigation Types
 *
 * Type definitions for React Navigation with full type safety
 * across all navigators and screens.
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import type { Product, Order, Category } from '@/types/api';

/**
 * Auth Stack Navigator
 * Handles all authentication-related screens
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  OTPRequest: { phone?: string; email?: string };
  OTPVerify: {
    phone?: string;
    email?: string;
    verificationType: 'login' | 'register' | 'password-reset';
  };
  BiometricSetup: undefined;
  TwoFactorSetup: undefined;
  TwoFactorVerify: { tempToken: string };
};

/**
 * Main Tab Navigator
 * Bottom tab navigation for authenticated users
 */
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CategoriesTab: NavigatorScreenParams<CategoriesStackParamList>;
  CartTab: NavigatorScreenParams<CartStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

/**
 * Home Stack Navigator
 * Nested within HomeTab
 */
export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { productId: number; product?: Product };
  Search: { query?: string; categoryId?: number };
  ProductList: {
    categoryId?: number;
    tag?: string;
    featured?: boolean;
    onSale?: boolean;
  };
};

/**
 * Categories Stack Navigator
 * Nested within CategoriesTab
 */
export type CategoriesStackParamList = {
  Categories: undefined;
  CategoryDetail: { categoryId: number; category?: Category };
  SubCategory: { parentId: number; categoryName: string };
};

/**
 * Cart Stack Navigator
 * Nested within CartTab
 */
export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  PaymentMethod: undefined;
  PaymentStatus: { orderId: number };
  OrderConfirmation: { orderId: number };
};

/**
 * Profile Stack Navigator
 * Nested within ProfileTab
 */
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Orders: undefined;
  OrderDetail: { orderId: number; order?: Order };
  Wishlist: undefined;
  Addresses: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: number };
  Settings: undefined;
  Notifications: undefined;
  Security: undefined;
  TwoFactorSettings: undefined;
  ChangePassword: undefined;
  Help: undefined;
  About: undefined;
};

/**
 * Root Stack Navigator
 * Top-level navigator that conditionally renders Auth or Main stack
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  // Modal screens accessible from anywhere
  ProductDetail: { productId: number; product?: Product };
  ImageViewer: { images: string[]; initialIndex?: number };
  WebView: { url: string; title?: string };
  QRScanner: { onScan: (data: string) => void };
};

/**
 * Screen Props Types
 * Use these in your screen components for type-safe navigation
 */

// Auth Stack Screen Props
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;
export type OTPRequestScreenProps = NativeStackScreenProps<AuthStackParamList, 'OTPRequest'>;
export type OTPVerifyScreenProps = NativeStackScreenProps<AuthStackParamList, 'OTPVerify'>;
export type BiometricSetupScreenProps = NativeStackScreenProps<AuthStackParamList, 'BiometricSetup'>;
export type TwoFactorSetupScreenProps = NativeStackScreenProps<AuthStackParamList, 'TwoFactorSetup'>;
export type TwoFactorVerifyScreenProps = NativeStackScreenProps<AuthStackParamList, 'TwoFactorVerify'>;

// Home Stack Screen Props
export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type ProductDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'ProductDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type SearchScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Search'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type ProductListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'ProductList'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

// Categories Stack Screen Props
export type CategoriesScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CategoriesStackParamList, 'Categories'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'CategoriesTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type CategoryDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CategoriesStackParamList, 'CategoryDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'CategoriesTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

// Cart Stack Screen Props
export type CartScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CartStackParamList, 'Cart'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'CartTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type CheckoutScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CartStackParamList, 'Checkout'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'CartTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type PaymentStatusScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CartStackParamList, 'PaymentStatus'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'CartTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

// Profile Stack Screen Props
export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Profile'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'ProfileTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type OrdersScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Orders'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'ProfileTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type OrderDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'OrderDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'ProfileTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type WishlistScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Wishlist'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'ProfileTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type SettingsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Settings'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'ProfileTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

// Root Stack Screen Props (Modals)
export type ProductDetailModalScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;
export type ImageViewerScreenProps = NativeStackScreenProps<RootStackParamList, 'ImageViewer'>;
export type WebViewScreenProps = NativeStackScreenProps<RootStackParamList, 'WebView'>;
export type QRScannerScreenProps = NativeStackScreenProps<RootStackParamList, 'QRScanner'>;

/**
 * Navigation Prop Types
 * Use these when you need just the navigation prop (not route)
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
