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
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_refresh_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, access, refresh, requires_2fa } = response.data;

      if (requires_2fa) {
        return response;
      }

      if (!user || (user.role !== 'admin' && !user.is_admin && !user.is_superuser)) {
        throw new Error('Access denied. Admin privileges required.');
      }

      localStorage.setItem('admin_token', access);
      if (refresh) {
        localStorage.setItem('admin_refresh_token', refresh);
      }
      setUser(user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const loginWith2FA = async (email, token) => {
    try {
      const response = await authAPI.loginWith2FA(email, token);
      const { user, access, refresh } = response.data;

      if (!user || (user.role !== 'admin' && !user.is_admin && !user.is_superuser)) {
        throw new Error('Access denied. Admin privileges required.');
      }

      localStorage.setItem('admin_token', access);
      if (refresh) {
        localStorage.setItem('admin_refresh_token', refresh);
      }
      setUser(user);
      return response;
    } catch (error) {
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
    loginWith2FA,
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
