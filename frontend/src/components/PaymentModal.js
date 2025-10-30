import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { paymentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentModal = (props) => {
  const { isOpen, onClose, order, onPaymentSuccess } = props;
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [pollingStatus, setPollingStatus] = useState('');
  const pollingTimer = useRef(null);

  // React Query mutation for payment
  // M-Pesa mutation
  const {
    mutate: initiateMPesa,
    isLoading: mpesaLoading,
  // error: mpesaError, // removed unused variable
    reset: resetMpesaError
  } = useMutation({
    mutationFn: paymentsAPI.initiateMPesa,
    onSuccess: (response) => {
      setPaymentId(response.data.payment_id);
      setIsPolling(true);
      setPollingStatus('waiting');
      toast.success('STK Push sent! Check your phone.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to initiate M-Pesa payment');
    }
  });

  const handlePayment = (e) => {
    e.preventDefault();
    resetMpesaError();

    if (paymentMethod === 'mpesa') {
      if (!phoneNumber.trim()) {
        toast.error('Phone number is required for M-Pesa payments');
        return;
      }
      if (!/^254\d{9}$/.test(phoneNumber.trim())) {
        toast.error('Phone number must start with 254 and be 12 digits');
        return;
      }
      initiateMPesa({
        order_id: order.id,
        phone_number: phoneNumber.trim()
      });
    } else {
      toast.error('Only M-Pesa is supported in this demo');
    }
  };

  // Poll payment status every 10s, up to 5min (30 attempts)
  useEffect(() => {
    if (isPolling && paymentId) {
      if (pollCount >= 30) {
        setIsPolling(false);
        setPollingStatus('timeout');
        toast.error('⏰ Payment timeout. Please try again.');
        return;
      }
      pollingTimer.current = setTimeout(async () => {
        try {
          const res = await paymentsAPI.getPaymentStatus(paymentId);
          const status = res.data.status;
          if (status === 'succeeded') {
            setIsPolling(false);
            setPollingStatus('success');
            toast.success('🎉 Payment successful!');
            if (onPaymentSuccess) onPaymentSuccess();
            onClose();
          } else if (status === 'failed' || status === 'cancelled') {
            setIsPolling(false);
            setPollingStatus('failed');
            toast.error('❌ Payment failed or cancelled');
          } else {
            setPollCount((c) => c + 1);
          }
        } catch (err) {
          setIsPolling(false);
          setPollingStatus('error');
          toast.error('Error checking payment status');
        }
      }, 10000);
      return () => clearTimeout(pollingTimer.current);
    }
    // eslint-disable-next-line
  }, [isPolling, paymentId, pollCount]);

  // Reset polling state on modal close
  useEffect(() => {
    if (!isOpen) {
      setPaymentId(null);
      setIsPolling(false);
      setPollCount(0);
      setPollingStatus('');
      setPhoneNumber('');
    }
  }, [isOpen]);

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

          {paymentMethod === 'mpesa' && (
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


          {/* Polling and status messages */}
          {mpesaLoading && (
            <div style={{ color: '#007e33', marginBottom: 16 }}>
              ⏳ Sending...<br />
              <small>Initiating STK Push to your phone.</small>
            </div>
          )}
          {isPolling && (
            <div style={{ color: '#007e33', marginBottom: 16 }}>
              📱 Waiting for payment...<br />
              <small>Check your phone and complete the M-Pesa prompt.</small><br />
              <progress value={pollCount} max={30} style={{ width: '100%' }} />
              <div style={{ fontSize: 12, marginTop: 4 }}>Elapsed: {pollCount * 10}s / 300s</div>
            </div>
          )}
          {pollingStatus === 'success' && (
            <div style={{ color: '#007e33', marginBottom: 16 }}>
              🎉 Payment successful!
            </div>
          )}
          {pollingStatus === 'failed' && (
            <div style={{ color: '#d32f2f', marginBottom: 16 }}>
              ❌ Payment failed or cancelled.
            </div>
          )}
          {pollingStatus === 'timeout' && (
            <div style={{ color: '#d32f2f', marginBottom: 16 }}>
              ⏰ Payment timeout. Please try again.
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
              disabled={mpesaLoading || isPolling}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {mpesaLoading ? '⏳ Sending...' : isPolling ? '📱 Waiting...' : (props.payNowLabel || 'Pay Now')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;