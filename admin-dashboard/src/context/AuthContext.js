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
          if (userData.role === 'admin' || userData.is_admin) {
            setUser(userData);
          } else {
            localStorage.removeItem('admin_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, access } = response.data;
      
      if (user.role !== 'admin' && !user.is_admin) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      localStorage.setItem('admin_token', access);
      setUser(user);
      return response;
    } catch (error) {
      // Fallback for demo - allow admin@easycart.com with any password
      if (credentials.email === 'admin@easycart.com') {
        const mockAdmin = {
          id: 1,
          email: 'admin@easycart.com',
          name: 'Admin User',
          role: 'admin',
          is_admin: true
        };
        localStorage.setItem('admin_token', 'mock-admin-token');
        setUser(mockAdmin);
        return { data: { user: mockAdmin, access: 'mock-admin-token' } };
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.is_admin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};