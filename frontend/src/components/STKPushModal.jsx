import React, { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../services/api';
import './STKPushModal.css';

const STKPushModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [status, setStatus] = useState('idle'); // idle, initiating, waiting, success, failed, timeout
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes timeout
  const MAX_RETRIES = 3;

  const resetState = useCallback(() => {
    setStatus('idle');
    setError('');
    setRetryCount(0);
    setTimeLeft(120);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  useEffect(() => {
    if (status === 'waiting' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'waiting' && timeLeft === 0) {
      setStatus('timeout');
      setError('Payment request timed out. Please try again.');
    }
  }, [status, timeLeft]);

  const initiateSTKPush = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!/^(254|0)[17]\d{8}$/.test(phoneNumber.replace(/\s/g, ''))) {
      setError('Please enter a valid Kenyan phone number');
      return;
    }

    setStatus('initiating');
    setError('');

    // Exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      const response = await ordersAPI.initiatePayment({
        order_id: order.id,
        payment_method: 'mpesa',
        phone_number: phoneNumber.trim()
      });

      if (response.data.success) {
        setStatus('waiting');
        setTimeLeft(120);
        // Track telemetry
        if (window.gtag) {
          window.gtag('event', 'stk_push_initiated', {
            order_id: order.id,
            retry_count: retryCount
          });
        }
        // Poll for payment status
        pollPaymentStatus();
      } else {
        throw new Error(response.data.message || 'Failed to initiate payment');
      }
    } catch (err) {
      setStatus('failed');
      setError(err.response?.data?.message || err.message || 'Failed to initiate payment');
      // Track telemetry
      if (window.gtag) {
        window.gtag('event', 'stk_push_failed', {
          order_id: order.id,
          retry_count: retryCount,
          error: err.message
        });
      }
    }
  };

  const pollPaymentStatus = async () => {
    const maxPolls = 24; // 2 minutes with 5-second intervals
    let polls = 0;

    const checkStatus = async () => {
      try {
        const response = await ordersAPI.getPaymentStatus(order.id);
        const paymentStatus = response.data.payment_status;

        if (paymentStatus === 'completed') {
          setStatus('success');
          // Track telemetry
          if (window.gtag) {
            window.gtag('event', 'stk_push_success', {
              order_id: order.id,
              retry_count: retryCount
            });
          }
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
          return;
        } else if (paymentStatus === 'failed') {
          setStatus('failed');
          setError('Payment was declined or cancelled');
          return;
        }

        polls++;
        if (polls < maxPolls && status === 'waiting') {
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    };

    checkStatus();
  };

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(retryCount + 1);
      initiateSTKPush();
      // Track telemetry
      if (window.gtag) {
        window.gtag('event', 'stk_push_retry', {
          order_id: order.id,
          retry_count: retryCount + 1
        });
      }
    } else {
      setError(`Maximum retry attempts (${MAX_RETRIES}) reached. Please try again later.`);
    }
  };

  const handleCancel = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="stk-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="stk-modal-title">
      <div className="stk-modal">
        <div className="stk-modal-header">
          <h2 id="stk-modal-title">M-Pesa Payment</h2>
          <button 
            className="stk-modal-close" 
            onClick={handleCancel}
            aria-label="Close payment modal"
            disabled={status === 'initiating'}
          >
            ×
          </button>
        </div>

        <div className="stk-modal-body">
          {/* M-Pesa Badge */}
          <div className="mpesa-badge">
            <img src="/images/mpesa-logo.svg" alt="M-Pesa" onError={(e) => e.target.style.display = 'none'} />
            <span className="mpesa-text">M-PESA</span>
          </div>

          {/* Order Amount */}
          <div className="order-amount">
            <span className="amount-label">Amount to Pay</span>
            <span className="amount-value">KSh {parseFloat(order?.total_amount || 0).toLocaleString()}</span>
          </div>

          {/* Status Messages */}
          {status === 'idle' && (
            <div className="stk-instructions">
              <p>Enter your M-Pesa phone number to receive a payment prompt</p>
              <div className="phone-input-group">
                <input
                  type="tel"
                  className="phone-input"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678 or 254712345678"
                  aria-label="M-Pesa phone number"
                  autoFocus
                />
              </div>
            </div>
          )}

          {status === 'initiating' && (
            <div className="stk-status stk-loading">
              <div className="spinner" aria-hidden="true"></div>
              <p>Initiating payment request...</p>
            </div>
          )}

          {status === 'waiting' && (
            <div className="stk-status stk-waiting">
              <div className="pulse-icon" aria-hidden="true">📱</div>
              <p className="status-title">Check your phone</p>
              <p className="status-desc">
                Enter your M-Pesa PIN on the prompt sent to <strong>{phoneNumber}</strong>
              </p>
              <div className="timer">
                <span>Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(timeLeft / 120) * 100}%` }}></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="stk-status stk-success">
              <div className="success-icon" aria-hidden="true">✓</div>
              <p className="status-title">Payment Successful!</p>
              <p className="status-desc">Your order has been confirmed</p>
            </div>
          )}

          {(status === 'failed' || status === 'timeout') && (
            <div className="stk-status stk-error">
              <div className="error-icon" aria-hidden="true">✕</div>
              <p className="status-title">Payment {status === 'timeout' ? 'Timed Out' : 'Failed'}</p>
              <p className="status-desc">{error}</p>
              {retryCount < MAX_RETRIES && (
                <p className="retry-info">Retry attempt {retryCount + 1} of {MAX_RETRIES}</p>
              )}
            </div>
          )}

          {error && status === 'idle' && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {/* Trust Signals */}
          <div className="trust-signals">
            <div className="trust-item">
              <span aria-hidden="true">🔒</span>
              <span>Secure Payment</span>
            </div>
            <div className="trust-item">
              <span aria-hidden="true">✓</span>
              <span>Safaricom Verified</span>
            </div>
          </div>
        </div>

        <div className="stk-modal-footer">
          {status === 'idle' && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleCancel}
                aria-label="Cancel payment"
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={initiateSTKPush}
                aria-label="Initiate M-Pesa payment"
              >
                Pay Now
              </button>
            </>
          )}

          {status === 'waiting' && (
            <button 
              className="btn btn-secondary" 
              onClick={handleCancel}
              aria-label="Cancel payment request"
            >
              Cancel
            </button>
          )}

          {(status === 'failed' || status === 'timeout') && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleCancel}
                aria-label="Close and cancel"
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleRetry}
                disabled={retryCount >= MAX_RETRIES}
                aria-label={`Retry payment (${retryCount + 1}/${MAX_RETRIES})`}
              >
                Retry {retryCount > 0 && `(${retryCount}/${MAX_RETRIES})`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default STKPushModal;
