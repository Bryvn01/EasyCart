import React, { useState } from 'react';
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
  
  const { register } = useAuth();
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
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Registration failed');
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
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