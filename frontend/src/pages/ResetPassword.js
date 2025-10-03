import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!uid || !token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [uid, token]);

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

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword({
        uid,
        token,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          padding: 'var(--space-8)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
          <h1 className="text-2xl font-bold mb-4">Password Reset Successfully!</h1>
          <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-6)' }}>
            Your password has been reset. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
          <p style={{ color: 'var(--gray-600)' }}>
            Enter your new password below
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
        {!error.includes('Invalid reset link') && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: 'var(--space-2)',
                color: 'var(--gray-700)'
              }}>
                New Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter new password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
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
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
            
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
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        {/* Footer */}
        <div className="text-center" style={{ marginTop: 'var(--space-6)' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
            Remember your password?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--primary-600)', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
