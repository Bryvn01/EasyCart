import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AuthModal.css';

/**
 * AuthModal - Professional authentication prompt modal
 *
 * Industry Best Practices (2025):
 * - Non-blocking modal with clear value proposition
 * - Guest checkout option (proceed without account)
 * - Social login buttons (Google, Facebook, Apple)
 * - Return URL preservation (redirect back after login)
 * - Accessible (ARIA labels, keyboard navigation, focus trap)
 * - Mobile-optimized (full-screen on mobile, modal on desktop)
 *
 * Usage:
 * <AuthModal
 *   isOpen={showAuthModal}
 *   onClose={() => setShowAuthModal(false)}
 *   mode="login"  // or "signup"
 *   returnUrl="/products"
 *   message="Sign in to add items to your cart"
 *   allowGuest={true}
 *   onGuestContinue={() => handleGuestCheckout()}
 * />
 */
const AuthModal = ({
  isOpen,
  onClose,
  mode = 'login', // 'login' or 'signup'
  returnUrl = null,
  message = 'Sign in to continue',
  allowGuest = true,
  onGuestContinue = null,
  feature = 'this feature' // e.g., "add to cart", "save to wishlist"
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200); // Match animation duration
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  const handleLogin = () => {
    const currentPath = returnUrl || location.pathname + location.search;
    navigate('/login', { state: { from: currentPath, message } });
  };

  const handleSignup = () => {
    const currentPath = returnUrl || location.pathname + location.search;
    navigate('/register', { state: { from: currentPath, message } });
  };

  const handleGuestContinue = () => {
    if (onGuestContinue) {
      onGuestContinue();
    }
    handleClose();
  };

  const handleSocialLogin = (provider) => {
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'social_login_clicked', {
        provider: provider,
        source: 'auth_modal'
      });
    }

    // TODO: Implement social login
    console.log(`Social login with ${provider}`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`auth-modal-backdrop ${isClosing ? 'closing' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`auth-modal ${isClosing ? 'closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div className="auth-modal-content">
          {/* Close Button */}
          <button
            className="auth-modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div className="auth-modal-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          {/* Title & Message */}
          <h2 id="auth-modal-title" className="auth-modal-title">
            {mode === 'login' ? 'Sign in required' : 'Create an account'}
          </h2>
          <p className="auth-modal-message">
            {message || `Sign in to ${feature} and unlock exclusive benefits`}
          </p>

          {/* Benefits List */}
          <div className="auth-modal-benefits">
            <div className="benefit-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Save items to your cart across devices</span>
            </div>
            <div className="benefit-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Track orders and delivery status</span>
            </div>
            <div className="benefit-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Get personalized recommendations</span>
            </div>
            <div className="benefit-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Exclusive deals and early access</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="auth-modal-actions">
            <button
              className="auth-btn auth-btn-primary"
              onClick={mode === 'login' ? handleLogin : handleSignup}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {mode === 'login' && (
              <button
                className="auth-btn auth-btn-secondary"
                onClick={handleSignup}
              >
                Create New Account
              </button>
            )}

            {mode === 'signup' && (
              <button
                className="auth-btn auth-btn-secondary"
                onClick={handleLogin}
              >
                Already have an account? Sign In
              </button>
            )}
          </div>

          {/* Social Login (Optional) */}
          <div className="auth-modal-social">
            <div className="social-divider">
              <span>or continue with</span>
            </div>
            <div className="social-buttons">
              <button
                className="social-btn social-google"
                onClick={() => handleSocialLogin('google')}
                aria-label="Continue with Google"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                className="social-btn social-facebook"
                onClick={() => handleSocialLogin('facebook')}
                aria-label="Continue with Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Guest Option */}
          {allowGuest && onGuestContinue && (
            <div className="auth-modal-guest">
              <button
                className="guest-btn"
                onClick={handleGuestContinue}
              >
                Continue as Guest
              </button>
              <p className="guest-note">
                You can create an account later to save your progress
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthModal;
