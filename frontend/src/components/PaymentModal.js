import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentModal = (props) => {
  const { isOpen, onClose, order, onPaymentSuccess } = props;
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');

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
      if (response.data.success) {
        const { payment_method } = variables;
        if ((payment_method === 'card' || payment_method === 'stripe' || payment_method === 'paypal') && response.data.payment_url) {
          window.open(response.data.payment_url, '_blank');
        } else if (payment_method === 'cash') {
          toast.success('Order confirmed! Pay cash on delivery.');
        } else {
          toast.success('Payment initiated! Please check your phone for payment prompt.');
        }
        if (onPaymentSuccess) onPaymentSuccess();
        onClose();
      } else {
        toast.error(response.data.message || 'Payment failed');
      }
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || 'Payment failed. Please try again.';
      toast.error(errorMsg);
    }
  });

  const handlePayment = (e) => {
    e.preventDefault();
    resetPaymentError();

    if ((paymentMethod === 'mpesa' || paymentMethod === 'airtel') && !phoneNumber.trim()) {
      toast.error('Phone number is required for mobile money payments');
      return;
    }

    if (phoneNumber && !/^\+?[1-9]\d{8,14}$/.test(phoneNumber.trim())) {
      toast.error('Please enter a valid phone number');
      return;
    }

    initiatePayment({
      order_id: order.id,
      payment_method: paymentMethod,
      phone_number: phoneNumber.trim()
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
          <h2 style={{ margin: 0 }}>{props.title || 'Complete Payment'}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <p><strong>{props.orderTotalLabel || 'Order Total'}: KES {order?.total_amount}</strong></p>
        </div>

        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>
              {props.paymentMethodLabel || 'Payment Method'}
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem'
              }}
            >
              <option value="mpesa">M-Pesa</option>
              <option value="airtel">Airtel Money</option>
              <option value="card">Credit/Debit Card (Flutterwave)</option>
              <option value="stripe">Credit/Debit Card (Stripe)</option>
              <option value="paypal">PayPal</option>
              <option value="bank">Bank Transfer</option>
              <option value="cash">Cash on Delivery</option>
            </select>
          </div>

          {(paymentMethod === 'mpesa' || paymentMethod === 'airtel') && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>
                {props.phoneNumberLabel || 'Phone Number'}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254712345678"
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem'
                }}
              />
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
              style={{
                flex: 1,
                padding: 'var(--space-3)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              {props.cancelLabel || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {loading ? (props.processingLabel || 'Processing...') : (props.payNowLabel || 'Pay Now')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;