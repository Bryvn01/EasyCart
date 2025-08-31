import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authAPI.forgotPassword({ email });
      setEmailSent(true);
      setMessage('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 'Failed to send reset email');
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
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🔑</div>
          <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
          <p style={{ color: 'var(--gray-600)' }}>
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        
        {/* Success Message */}
        {message && (
          <div style={{
            background: 'var(--success)',
            color: 'white',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
            fontSize: '0.875rem'
          }}>
            {message}
          </div>
        )}
        
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
        
        {!emailSent ? (
          <>
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
                  placeholder="Enter your email address"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
                setMessage('');
              }}
              className="btn btn-secondary"
              style={{ 
                width: '100%',
                padding: 'var(--space-3)',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Send Another Email
            </button>
          </div>
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

export default ForgotPassword;