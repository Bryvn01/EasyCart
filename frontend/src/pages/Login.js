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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600">
            Sign in to your Easycart account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Forgot Password Link */}
          {showForgotPassword && (
            <div className="text-right mb-4">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 no-underline"
              >
                Forgot Password?
              </Link>
            </div>
          )}

          <button
            ref={loginBtnRef}
            type="submit"
            className={`w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${loginBtnHidden ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {loginSuccess && (
            <div
              ref={successMsgRef}
              tabIndex={-1}
              aria-live="polite"
              className="mt-4 bg-green-500 text-white p-3 rounded-md font-semibold text-center outline-none"
            >
              Login successful! Redirecting...
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 mb-3">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 font-medium hover:text-primary-700 no-underline"
            >
              Sign up here
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login/otp"
              className="text-primary-600 font-medium hover:text-primary-700 no-underline"
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
