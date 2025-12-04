import React, { useState, useRef } from 'react';
import { useFadeOutOnSuccess } from '../hooks/useFadeOutOnSuccess';
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
  const [loginBtnRef, loginBtnHidden, triggerLoginFadeOut] = useFadeOutOnSuccess();
  const successMsgRef = useRef(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

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
      triggerLoginFadeOut(() => {
        setLoginSuccess(true);
        setTimeout(() => {
          if (successMsgRef.current) successMsgRef.current.focus();
          // Give user a moment to see the message, then navigate
          setTimeout(() => navigate('/'), 800);
        }, 10);
      });
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
            ref={loginBtnRef}
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'opacity 0.4s',
              opacity: loginBtnHidden ? 0 : 1,
              display: loginBtnHidden ? 'none' : undefined
            }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          {loginSuccess && (
            <div
              ref={successMsgRef}
              tabIndex={-1}
              aria-live="polite"
              style={{
                marginTop: '1rem',
                background: 'var(--success, #22c55e)',
                color: 'white',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              Login successful! Redirecting...
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="text-center" style={{ marginTop: 'var(--space-6)' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: 'var(--space-3)' }}>
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
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
            Or{' '}
            <Link
              to="/login/otp"
              style={{
                color: 'var(--primary-600)',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Login with OTP (SMS/WhatsApp/Email)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
