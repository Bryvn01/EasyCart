/**
 * Secure Storage Utility
 * Handles token storage using react-native-keychain for sensitive data
 * and MMKV/AsyncStorage for general data
 *
 * SECURITY BEST PRACTICES:
 * - JWT tokens stored in Keychain (hardware-backed encryption)
 * - User data stored in encrypted MMKV
 * - Automatic cleanup on logout
 * - Biometric protection for sensitive operations
 */

import * as Keychain from 'react-native-keychain';
import {MMKV} from 'react-native-mmkv';

// Initialize MMKV storage (faster than AsyncStorage)
const storage = new MMKV({
  id: 'easycart-storage',
  encryptionKey: 'easycart-encryption-key-change-in-production',
});

// ==================== TOKEN MANAGEMENT ====================

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Store JWT access token securely in Keychain
 */
export const setToken = async (token: string, refreshToken?: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword(TOKEN_KEY, token, {
      service: TOKEN_KEY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });

    if (refreshToken) {
      await setRefreshToken(refreshToken);
    }
  } catch (error) {
    console.error('Failed to store access token:', error);
    throw error;
  }
};

/**
 * Retrieve JWT access token from Keychain
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({service: TOKEN_KEY});
    return credentials ? credentials.password : null;
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
};

/**
 * Store JWT refresh token securely in Keychain
 */
export const setRefreshToken = async (token: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, token, {
      service: REFRESH_TOKEN_KEY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
  } catch (error) {
    console.error('Failed to store refresh token:', error);
    throw error;
  }
};

/**
 * Retrieve JWT refresh token from Keychain
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({service: REFRESH_TOKEN_KEY});
    return credentials ? credentials.password : null;
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
};

/**
 * Remove all tokens (logout)
 */
export const removeToken = async (): Promise<void> => {
  try {
    await Promise.all([
      Keychain.resetGenericPassword({service: TOKEN_KEY}),
      Keychain.resetGenericPassword({service: REFRESH_TOKEN_KEY}),
    ]);
  } catch (error) {
    console.error('Failed to remove tokens:', error);
  }
};

// ==================== USER DATA ====================

const USER_KEY = 'user_data';

/**
 * Store user data in encrypted storage
 */
export const setUser = (user: object): void => {
  try {
    storage.set(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
};

/**
 * Retrieve user data from storage
 */
export const getUser = (): object | null => {
  try {
    const userData = storage.getString(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    return null;
  }
};

/**
 * Remove user data
 */
export const removeUser = (): void => {
  try {
    storage.delete(USER_KEY);
  } catch (error) {
    console.error('Failed to remove user data:', error);
  }
};

// ==================== CART DATA (OFFLINE) ====================

const CART_KEY = 'offline_cart';

/**
 * Store offline cart data
 */
export const setOfflineCart = (cart: object): void => {
  try {
    storage.set(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to store offline cart:', error);
  }
};

/**
 * Retrieve offline cart data
 */
export const getOfflineCart = (): object | null => {
  try {
    const cartData = storage.getString(CART_KEY);
    return cartData ? JSON.parse(cartData) : null;
  } catch (error) {
    console.error('Failed to retrieve offline cart:', error);
    return null;
  }
};

/**
 * Remove offline cart data
 */
export const removeOfflineCart = (): void => {
  try {
    storage.delete(CART_KEY);
  } catch (error) {
    console.error('Failed to remove offline cart:', error);
  }
};

// ==================== SETTINGS ====================

const SETTINGS_KEY = 'app_settings';

/**
 * Store app settings
 */
export const setSettings = (settings: object): void => {
  try {
    storage.set(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to store settings:', error);
  }
};

/**
 * Retrieve app settings
 */
export const getSettings = (): object | null => {
  try {
    const settingsData = storage.getString(SETTINGS_KEY);
    return settingsData ? JSON.parse(settingsData) : null;
  } catch (error) {
    console.error('Failed to retrieve settings:', error);
    return null;
  }
};

// ==================== BIOMETRIC CREDENTIALS ====================

const BIOMETRIC_KEY = 'biometric_enabled';

/**
 * Enable biometric authentication
 * Stores user credentials securely for biometric unlock
 */
export const enableBiometric = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    await Keychain.setGenericPassword(email, password, {
      service: BIOMETRIC_KEY,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
    storage.set(BIOMETRIC_KEY, 'true');
  } catch (error) {
    console.error('Failed to enable biometric:', error);
    throw error;
  }
};

/**
 * Get biometric credentials
 * Triggers biometric authentication
 */
export const getBiometricCredentials = async (): Promise<{
  email: string;
  password: string;
} | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: BIOMETRIC_KEY,
      authenticationPrompt: {
        title: 'Authenticate',
        subtitle: 'Use your biometric to sign in',
      },
    });

    if (credentials) {
      return {
        email: credentials.username,
        password: credentials.password,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve biometric credentials:', error);
    return null;
  }
};

/**
 * Check if biometric is enabled
 */
export const isBiometricEnabled = (): boolean => {
  try {
    return storage.getString(BIOMETRIC_KEY) === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Disable biometric authentication
 */
export const disableBiometric = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({service: BIOMETRIC_KEY});
    storage.delete(BIOMETRIC_KEY);
  } catch (error) {
    console.error('Failed to disable biometric:', error);
  }
};

// ==================== CACHE MANAGEMENT ====================

/**
 * Set generic cached data with expiry
 */
export const setCachedData = (
  key: string,
  data: unknown,
  expiryHours = 24
): void => {
  try {
    const cacheItem = {
      data,
      expiry: Date.now() + expiryHours * 60 * 60 * 1000,
    };
    storage.set(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error(`Failed to cache data for key ${key}:`, error);
  }
};

/**
 * Get cached data if not expired
 */
export const getCachedData = <T>(key: string): T | null => {
  try {
    const cacheString = storage.getString(key);
    if (!cacheString) return null;

    const cacheItem = JSON.parse(cacheString);
    if (Date.now() > cacheItem.expiry) {
      storage.delete(key);
      return null;
    }

    return cacheItem.data as T;
  } catch (error) {
    console.error(`Failed to retrieve cached data for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove a single cached key
 */
export const removeCachedData = (key: string): void => {
  try {
    storage.delete(key);
  } catch (error) {
    console.error(`Failed to remove cached data for key ${key}:`, error);
  }
};

/**
 * Clear all cached data
 */
export const clearCache = (): void => {
  try {
    storage.clearAll();
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

/**
 * Clear all app data (logout)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await removeToken();
    removeUser();
    removeOfflineCart();
    clearCache();
  } catch (error) {
    console.error('Failed to clear all data:', error);
  }
};

export default {
  setToken,
  getToken,
  setRefreshToken,
  getRefreshToken,
  removeToken,
  setUser,
  getUser,
  removeUser,
  setOfflineCart,
  getOfflineCart,
  removeOfflineCart,
  setSettings,
  getSettings,
  enableBiometric,
  getBiometricCredentials,
  isBiometricEnabled,
  disableBiometric,
  setCachedData,
  getCachedData,
  removeCachedData,
  clearCache,
  clearAllData,
};
