import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentModal = (props) => {
  const { isOpen, onClose, order, onPaymentSuccess } = props;
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState('');

  // React Query mutation for payment
  const {
    mutate: initiatePayment,
    isLoading: loading,
    error: paymentError,
    reset: resetPaymentError
  } = useMutation({
    mutationFn: async (paymentData) => {
      return await ordersAPI.initiatePayment(paymentData);
    },
    onSuccess: (response, variables) => {
      setIsProcessing(false);

      if (response.data.success) {
        const { payment_method } = variables;

        if ((payment_method === 'card' || payment_method === 'paypal') && response.data.payment_url) {
          toast.success('Redirecting to payment gateway...', {
            duration: 2000,
            icon: '🔄'
          });

          setTimeout(() => {
            window.open(response.data.payment_url, '_blank');
          }, 500);

        } else if (payment_method === 'cash') {
          toast.success('Order confirmed! Pay cash upon delivery.', {
            duration: 4000,
            icon: '✓'
          });

        } else if (payment_method === 'mpesa' || payment_method === 'airtel') {
          toast.success('Payment request sent! Please check your phone.', {
            duration: 5000,
            icon: '📱',
            style: {
              border: '1px solid #10b981',
              padding: '16px',
            }
          });
        } else {
          toast.success('Payment initiated successfully!', {
            duration: 3000,
            icon: '✓'
          });
        }

        if (onPaymentSuccess) {
          setTimeout(() => onPaymentSuccess(), 1000);
        }
        onClose();

      } else {
        toast.error(response.data.message || 'Payment failed. Please try again.', {
          duration: 4000
        });
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      const errorMsg = error.response?.data?.message || 'Payment failed. Please try again.';
      toast.error(errorMsg, { duration: 4000 });
    }
  });

  const validateForm = () => {
    setValidationError('');

    if ((paymentMethod === 'mpesa' || paymentMethod === 'airtel') && !phoneNumber.trim()) {
      setValidationError('Phone number is required for mobile money payments');
      return false;
    }

    if (phoneNumber.trim()) {
      const cleanPhone = phoneNumber.trim().replace(/[\s-()]/g, '');
      if (!/^\+?[1-9]\d{8,14}$/.test(cleanPhone)) {
        setValidationError('Please enter a valid phone number (e.g., 254712345678)');
        return false;
      }
    }

    return true;
  };

  const handlePayment = (e) => {
    e.preventDefault();
    resetPaymentError();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    const cleanPhone = phoneNumber.trim().replace(/[\s-()]/g, '');

    initiatePayment({
      order_id: order.id,
      payment_method: paymentMethod,
      phone_number: cleanPhone
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
            {props.title || 'Complete Payment'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading || isProcessing}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: (loading || isProcessing) ? 'not-allowed' : 'pointer',
              color: 'var(--gray-500)',
              padding: 'var(--space-2)',
              lineHeight: '1'
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Order Summary */}
        <div style={{
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: 'var(--gray-50)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--gray-200)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-2)'
          }}>
            <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Order ID:</span>
            <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>#{order?.id}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--gray-200)'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: '500' }}>
              {props.orderTotalLabel || 'Total Amount'}:
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
              KSh {order?.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>
              {props.paymentMethodLabel || 'Payment Method'} *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setValidationError('');
              }}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="mpesa">M-Pesa (Instant mobile payment)</option>
              <option value="airtel">Airtel Money (Mobile wallet)</option>
              <option value="card">Credit/Debit Card (Flutterwave)</option>
              <option value="paypal">PayPal (Online payment)</option>
              <option value="bank">Bank Transfer (Manual)</option>
              <option value="cash">Cash on Delivery</option>
            </select>

            {/* Payment method help text */}
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--gray-500)',
              marginTop: 'var(--space-2)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-2)'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <span>
                {paymentMethod === 'mpesa' && 'You will receive an STK push notification on your phone'}
                {paymentMethod === 'airtel' && 'You will receive a payment prompt on your phone'}
                {paymentMethod === 'card' && 'You will be redirected to a secure payment page'}
                {paymentMethod === 'paypal' && 'You will be redirected to PayPal to complete payment'}
                {paymentMethod === 'bank' && 'Bank details will be provided after order confirmation'}
                {paymentMethod === 'cash' && 'Pay with cash when your order is delivered'}
              </span>
            </div>
          </div>

          {(paymentMethod === 'mpesa' || paymentMethod === 'airtel') && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>
                {props.phoneNumberLabel || 'Phone Number'} *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setValidationError('');
                }}
                placeholder="254712345678"
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: validationError ? '1px solid #dc2626' : '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem'
                }}
              />
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--gray-500)',
                marginTop: 'var(--space-1)'
              }}>
                Format: Country code + number (e.g., 254712345678)
              </div>
            </div>
          )}

          {validationError && (
            <div style={{
              color: '#dc2626',
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3)',
              backgroundColor: '#fee2e2',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fca5a5',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {validationError}
            </div>
          )}

          {paymentError && (
            <div style={{
              color: 'var(--error)',
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-2)',
              backgroundColor: '#fee',
              borderRadius: 'var(--radius-sm)'
            }}>
              {paymentError.response?.data?.message || paymentError.message || 'Payment failed'}
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading || isProcessing}
              style={{
                flex: 1,
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'white',
                cursor: (loading || isProcessing) ? 'not-allowed' : 'pointer',
                opacity: (loading || isProcessing) ? 0.5 : 1
              }}
            >
              {props.cancelLabel || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading || isProcessing}
              className="btn btn-primary"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                cursor: (loading || isProcessing) ? 'not-allowed' : 'pointer',
                opacity: (loading || isProcessing) ? 0.7 : 1
              }}
            >
              {(loading || isProcessing) ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
                    animation: 'spin 1s linear infinite'
                  }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  {props.processingLabel || 'Processing...'}
                </>
              ) : (
                props.payNowLabel || 'Pay Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
