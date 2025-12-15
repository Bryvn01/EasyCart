/**
 * Authentication API Service
 * All authentication-related API calls
 *
 * ENDPOINTS:
 * - Login (email/password)
 * - Register
 * - OTP authentication (SMS/WhatsApp/Email)
 * - Token refresh
 * - Profile management
 * - 2FA (Two-factor authentication)
 */

import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  OTPRequest,
  OTPVerifyRequest,
  OTPResponse,
  User,
  TokenRefreshRequest,
  TokenRefreshResponse,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
} from '@/types/api';

/**
 * Login with email and password
 * Returns JWT tokens and user data
 * May return 2FA requirement
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login/', data);
  return response.data;
};

/**
 * Register new user account
 * Returns JWT tokens and user data upon successful registration
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register/', data);
  return response.data;
};

/**
 * Request OTP for passwordless login
 * @param identifier - Email or phone number
 * @param method - Delivery method: 'sms' | 'whatsapp' | 'email'
 */
export const requestOTP = async (data: OTPRequest): Promise<OTPResponse> => {
  const response = await apiClient.post<OTPResponse>('/auth/otp/request/', data);
  return response.data;
};

/**
 * Verify OTP code
 * Returns JWT tokens and user data on success
 */
export const verifyOTP = async (data: OTPVerifyRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/otp/verify/', data);
  return response.data;
};

/**
 * Resend OTP code
 */
export const resendOTP = async (data: OTPRequest): Promise<OTPResponse> => {
  const response = await apiClient.post<OTPResponse>('/auth/otp/resend/', data);
  return response.data;
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (
  data: TokenRefreshRequest
): Promise<TokenRefreshResponse> => {
  const response = await apiClient.post<TokenRefreshResponse>(
    '/auth/token/refresh/',
    data
  );
  return response.data;
};

/**
 * Get current user profile
 * Requires authentication
 */
export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/profile/');
  return response.data;
};

/**
 * Update user profile
 * Supports partial updates (PATCH)
 */
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await apiClient.patch<User>('/auth/profile/', data);
  return response.data;
};

/**
 * Setup 2FA (Two-Factor Authentication)
 * Returns QR code and secret for authenticator app
 * Admin only
 */
export const setup2FA = async (): Promise<TwoFactorSetupResponse> => {
  const response = await apiClient.post<TwoFactorSetupResponse>('/auth/2fa/setup/');
  return response.data;
};

/**
 * Enable 2FA after setup
 * Requires verification code from authenticator app
 */
export const enable2FA = async (
  data: TwoFactorVerifyRequest
): Promise<{message: string}> => {
  const response = await apiClient.post<{message: string}>('/auth/2fa/enable/', data);
  return response.data;
};

/**
 * Disable 2FA
 * Requires current 2FA code for verification
 */
export const disable2FA = async (
  data: TwoFactorVerifyRequest
): Promise<{message: string}> => {
  const response = await apiClient.post<{message: string}>('/auth/2fa/disable/', data);
  return response.data;
};

/**
 * Verify 2FA code during login
 * Returns JWT tokens on success
 */
export const verify2FA = async (
  data: TwoFactorVerifyRequest
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/2fa/verify/', data);
  return response.data;
};

/**
 * Get 2FA status for current user
 */
export const get2FAStatus = async (): Promise<{enabled: boolean}> => {
  const response = await apiClient.get<{enabled: boolean}>('/auth/2fa/status/');
  return response.data;
};

/**
 * Request password reset
 */
export const forgotPassword = async (data: {
  email: string;
}): Promise<{message: string}> => {
  const response = await apiClient.post<{message: string}>(
    '/auth/forgot-password/',
    data
  );
  return response.data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (data: {
  token: string;
  password: string;
}): Promise<{message: string}> => {
  const response = await apiClient.post<{message: string}>('/auth/reset-password/', data);
  return response.data;
};

export const authAPI = {
  login,
  register,
  requestOTP,
  verifyOTP,
  resendOTP,
  refreshToken,
  getProfile,
  updateProfile,
  setup2FA,
  enable2FA,
  disable2FA,
  verify2FA,
  get2FAStatus,
  forgotPassword,
  resetPassword,
};

export default authAPI;
