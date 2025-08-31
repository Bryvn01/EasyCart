import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.non_field_errors?.[0] || 'Login failed';
      setError(errorMsg);
      setShowForgotPassword(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--gray-50) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px',
        padding: 'var(--space-8)'
      }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🔐</div>
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p style={{ color: 'var(--gray-600)' }}>
            Sign in to your Easycart account
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div style={{
            background: 'var(--error)',
            color: 'white',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: 'var(--space-2)',
              color: 'var(--gray-700)'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: 'var(--space-2)',
              color: 'var(--gray-700)'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Forgot Password Link */}
          {showForgotPassword && (
            <div style={{ textAlign: 'right', marginBottom: 'var(--space-4)' }}>
              <Link 
                to="/forgot-password" 
                style={{ 
                  color: 'var(--primary-600)', 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Forgot Password?
              </Link>
            </div>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%',
              padding: 'var(--space-3)',
              fontSize: '1rem',
              fontWeight: '600'
            }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {/* Footer */}
        <div className="text-center" style={{ marginTop: 'var(--space-6)' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: 'var(--primary-600)', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;