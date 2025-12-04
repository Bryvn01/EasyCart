import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      authAPI.getProfile()
        .then(response => {
          const userData = response.data.user || response.data;
          if (userData.role === 'admin' || userData.is_admin || userData.is_superuser) {
            setUser(userData);
          } else {
            console.warn('[Auth] User lacks admin privileges');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_refresh_token');
          }
        })
        .catch((error) => {
          console.error('[Auth] Profile fetch failed:', error.message);
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    console.log('[AuthContext] Login attempt', { email: credentials.email });

    try {
      const response = await authAPI.login(credentials);
      const { user, access, refresh } = response.data;

      console.log('[AuthContext] Login response received', {
        hasUser: !!user,
        hasAccess: !!access,
        role: user?.role,
        is_admin: user?.is_admin,
        is_superuser: user?.is_superuser
      });

      if (user.role !== 'admin' && !user.is_admin && !user.is_superuser) {
        throw new Error('Access denied. Admin privileges required.');
      }

      localStorage.setItem('admin_token', access);
      if (refresh) {
        localStorage.setItem('admin_refresh_token', refresh);
      }
      setUser(user);
      console.log('[AuthContext] Login successful, user set');
      return response;
    } catch (error) {
      console.error('[AuthContext] Login error', {
        email: credentials.email,
        error: error.message,
        hasResponse: !!error.response,
        status: error.response?.status
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.is_admin || user?.is_superuser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
