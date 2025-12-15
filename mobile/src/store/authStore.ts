/**
 * Authentication Store
 *
 * Zustand store for managing authentication state
 * with persistence and automatic token refresh.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '@/api/auth';
import * as storage from '@/utils/storage';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Biometric
  biometricEnabled: boolean;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh: string) => Promise<void>;
  clearError: () => void;

  // Biometric
  enableBiometric: (credentials: { email: string; password: string }) => Promise<void>;
  disableBiometric: () => Promise<void>;
  loginWithBiometric: () => Promise<void>;

  // Initialization
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      biometricEnabled: false,

      /**
       * Initialize auth state from secure storage
       */
      initialize: async () => {
        try {
          set({ isLoading: true });

          // Check if tokens exist in secure storage
          const tokens = await storage.getToken();

          if (tokens) {
            const { access, refresh } = tokens;

            // Fetch user profile with the stored token
            try {
              const user = await authApi.getProfile();
              set({
                user,
                accessToken: access,
                refreshToken: refresh,
                isInitialized: true,
                isLoading: false,
              });
            } catch (error) {
              // Token might be expired, try to refresh
              try {
                const refreshResponse = await authApi.refreshToken({ refresh });
                await storage.setToken(refreshResponse.access, refreshResponse.refresh);

                const user = await authApi.getProfile();
                set({
                  user,
                  accessToken: refreshResponse.access,
                  refreshToken: refreshResponse.refresh,
                  isInitialized: true,
                  isLoading: false,
                });
              } catch (refreshError) {
                // Refresh failed, clear everything
                await storage.clearAllData();
                set({
                  user: null,
                  accessToken: null,
                  refreshToken: null,
                  isInitialized: true,
                  isLoading: false,
                });
              }
            }
          } else {
            set({ isInitialized: true, isLoading: false });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({
            isInitialized: true,
            isLoading: false,
            error: 'Failed to initialize authentication',
          });
        }
      },

      /**
       * Login with email and password
       */
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authApi.login(credentials);

          // Store tokens securely
          await storage.setToken(response.access, response.refresh);

          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail ||
                             error.response?.data?.message ||
                             'Login failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Register new user
       */
      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authApi.register(data);

          // Store tokens securely
          await storage.setToken(response.access, response.refresh);

          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail ||
                             error.response?.data?.message ||
                             'Registration failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Logout user and clear all data
       */
      logout: async () => {
        try {
          set({ isLoading: true });

          // Clear all stored data
          await storage.clearAllData();

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            biometricEnabled: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Force clear state even if storage clear fails
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            biometricEnabled: false,
            isLoading: false,
            error: null,
          });
        }
      },

      /**
       * Refresh authentication tokens
       */
      refreshAuth: async () => {
        try {
          const { refreshToken } = get();

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await authApi.refreshToken({ refresh: refreshToken });

          // Update tokens in secure storage
          await storage.setToken(response.access, response.refresh);

          set({
            accessToken: response.access,
            refreshToken: response.refresh,
          });
        } catch (error) {
          // Refresh failed, logout user
          await get().logout();
          throw error;
        }
      },

      /**
       * Update user profile
       */
      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });

          const updatedUser = await authApi.updateProfile(data);

          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail ||
                             error.response?.data?.message ||
                             'Profile update failed.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Set user (useful after OTP verification or profile updates)
       */
      setUser: (user: User | null) => {
        set({ user });
      },

      /**
       * Set tokens (useful after OTP verification)
       */
      setTokens: async (access: string, refresh: string) => {
        await storage.setToken(access, refresh);
        set({ accessToken: access, refreshToken: refresh });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Enable biometric authentication
       */
      enableBiometric: async (credentials: { email: string; password: string }) => {
        try {
          set({ isLoading: true, error: null });

          const success = await storage.enableBiometric(
            credentials.email,
            credentials.password
          );

          if (success) {
            set({ biometricEnabled: true, isLoading: false });
          } else {
            throw new Error('Failed to enable biometric authentication');
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Biometric setup failed.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Disable biometric authentication
       */
      disableBiometric: async () => {
        try {
          set({ isLoading: true });

          await storage.disableBiometric();

          set({ biometricEnabled: false, isLoading: false });
        } catch (error) {
          console.error('Failed to disable biometric:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Login using biometric authentication
       */
      loginWithBiometric: async () => {
        try {
          set({ isLoading: true, error: null });

          const credentials = await storage.getBiometricCredentials();

          if (!credentials) {
            throw new Error('No biometric credentials found');
          }

          // Login with stored credentials
          await get().login(credentials);
        } catch (error: any) {
          const errorMessage = error.message || 'Biometric login failed.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not tokens (tokens are in Keychain)
      partialize: (state) => ({
        user: state.user,
        biometricEnabled: state.biometricEnabled,
      }),
    }
  )
);
