import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check token expiration every minute
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = payload.exp * 1000;
          if (Date.now() >= expirationTime) {
            logout();
            navigate('/admin/login', { replace: true });
          }
        } catch (error) {
          console.error('Invalid token format');
          logout();
          navigate('/admin/login', { replace: true });
        }
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [logout, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
