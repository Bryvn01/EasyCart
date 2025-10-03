import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!uid || !token) {
        setStatus('error');
        setMessage('Invalid verification link. Please request a new verification email.');
        return;
      }

      try {
        await authAPI.verifyEmail({ uid, token });
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.error || 
          'Failed to verify email. The link may have expired. Please request a new verification email.'
        );
      }
    };

    verifyEmail();
  }, [uid, token, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📧';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Email Verification';
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
        padding: 'var(--space-8)',
        textAlign: 'center'
      }}>
        {/* Icon */}
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>
          {getIcon()}
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold mb-4">{getTitle()}</h1>
        
        {/* Message */}
        <p style={{ 
          color: 'var(--gray-600)', 
          marginBottom: 'var(--space-6)',
          fontSize: '1rem'
        }}>
          {message}
        </p>
        
        {/* Actions */}
        {status === 'success' && (
          <div style={{ 
            padding: 'var(--space-4)',
            background: 'var(--success-light)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success-dark)',
            marginBottom: 'var(--space-6)'
          }}>
            Redirecting to login...
          </div>
        )}
        
        {status === 'error' && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                display: 'inline-block',
                padding: 'var(--space-3) var(--space-6)',
                textDecoration: 'none'
              }}
            >
              Go to Login
            </Link>
          </div>
        )}
        
        {status === 'verifying' && (
          <div style={{ 
            padding: 'var(--space-4)',
            marginTop: 'var(--space-4)'
          }}>
            <div className="spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--gray-200)',
              borderTop: '4px solid var(--primary-600)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
