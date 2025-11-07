import React, { useState, useRef } from 'react';
import { useFadeOutOnSuccess } from '../hooks/useFadeOutOnSuccess';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: 'gray'
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const [registerBtnRef, registerBtnHidden, triggerRegisterFadeOut] = useFadeOutOnSuccess();
  const successMsgRef = useRef(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    // Feedback messages
    if (password.length < 8) feedback.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) feedback.push('one uppercase letter');
    if (!/[a-z]/.test(password)) feedback.push('one lowercase letter');
    if (!/\d/.test(password)) feedback.push('one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) feedback.push('one special character');
    
    let strength = { score: 0, feedback: '', color: 'gray' };
    
    if (score <= 2) {
      strength = { score, feedback: 'Weak', color: '#ef4444' };
    } else if (score <= 4) {
      strength = { score, feedback: 'Medium', color: '#f59e0b' };
    } else {
      strength = { score, feedback: 'Strong', color: '#10b981' };
    }
    
    if (feedback.length > 0) {
      strength.feedback += ` (Need: ${feedback.join(', ')})`;
    }
    
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Check password strength when password changes
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    // Enhanced password validation
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      setLoading(false);
      return;
    }
    
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      setLoading(false);
      return;
    }
    
    if (!/\d/.test(formData.password)) {
      setError('Password must contain at least one digit');
      setLoading(false);
      return;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError('Password must contain at least one special character');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      triggerRegisterFadeOut(() => {
        setRegisterSuccess(true);
        setTimeout(() => {
          if (successMsgRef.current) successMsgRef.current.focus();
          setTimeout(() => navigate('/'), 800);
        }, 10);
      });
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          err.message ||
                          'Registration failed. Please try again.';
      setError(errorMessage);
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
        maxWidth: '500px',
        padding: 'var(--space-8)'
      }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🚀</div>
          <h1 className="text-2xl font-bold mb-2">Join Easycart</h1>
          <p style={{ color: 'var(--gray-600)' }}>
            Create your account and start shopping
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
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: 'var(--space-2)',
                color: 'var(--gray-700)'
              }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Choose username"
                className="form-control"
                value={formData.username}
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
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="0712345678"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
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
                placeholder="Create password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {/* Password Strength Indicator */}
              {formData.password && (
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <div style={{
                    height: '4px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      backgroundColor: passwordStrength.color,
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                  <p style={{
                    fontSize: '0.75rem',
                    marginTop: 'var(--space-1)',
                    color: passwordStrength.color
                  }}>
                    {passwordStrength.feedback}
                  </p>
                </div>
              )}
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
                name="password_confirm"
                placeholder="Confirm password"
                className="form-control"
                value={formData.password_confirm}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: 'var(--space-2)',
              color: 'var(--gray-700)'
            }}>
              Address (Optional)
            </label>
            <textarea
              name="address"
              placeholder="Enter your address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <button
            ref={registerBtnRef}
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'opacity 0.4s',
              opacity: registerBtnHidden ? 0 : 1,
              display: registerBtnHidden ? 'none' : undefined
            }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          {registerSuccess && (
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
              Registration successful! Redirecting...
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="text-center" style={{ marginTop: 'var(--space-6)' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
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

export default Register;
