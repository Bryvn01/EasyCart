import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const OTPLogin = () => {
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState('email');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [expiresIn, setExpiresIn] = useState(600);
  const navigate = useNavigate();

  // Countdown timer for resend and expiration
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Expiration timer
  useEffect(() => {
    let interval;
    if (step === 'verify' && expiresIn > 0) {
      interval = setInterval(() => {
        setExpiresIn((prev) => {
          if (prev <= 1) {
            setError('OTP expired. Please request a new one.');
            setStep('request');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, expiresIn]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.requestOTP(identifier, method);
      setMessage(response.data.message);
      setStep('verify');
      setCanResend(false);
      setCountdown(response.data.can_resend_after || 60);
      setExpiresIn(response.data.expires_in || 600);
      setAttemptsRemaining(5);
    } catch (err) {
      const errorData = err.response?.data;

      // Handle rate limiting
      if (err.response?.status === 429) {
        const retryAfter = errorData?.retry_after || 60;
        setError(`${errorData?.error || 'Too many requests'}`);
        setCountdown(retryAfter);
        setCanResend(false);
      } else {
        setError(errorData?.error || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP(identifier, otpCode);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on profile completion
      if (response.data.is_profile_complete) {
        navigate('/');
      } else {
        navigate('/complete-profile');
      }
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData?.error || 'Invalid OTP code');

      // Update attempts remaining
      if (errorData?.attempts_remaining !== undefined) {
        setAttemptsRemaining(errorData.attempts_remaining);
      }

      // Clear OTP input on error
      setOtpCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.requestOTP(identifier, method);
      setMessage('OTP resent successfully');
      setCanResend(false);
      setCountdown(response.data.can_resend_after || 60);
      setExpiresIn(response.data.expires_in || 600);
      setAttemptsRemaining(5);
      setOtpCode('');
    } catch (err) {
      const errorData = err.response?.data;

      if (err.response?.status === 429) {
        const retryAfter = errorData?.retry_after || 60;
        setError(`${errorData?.error || 'Please wait before requesting another OTP'}`);
        setCountdown(retryAfter);
      } else {
        setError(errorData?.error || 'Failed to resend OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'request' ? 'Login with OTP' : 'Verify OTP'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'request'
              ? 'Enter your phone number or email to receive a verification code'
              : 'Enter the 6-digit code sent to you'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {step === 'request' ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="identifier" className="sr-only">Phone or Email</label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Phone number or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="method" className="sr-only">Delivery Method</label>
                <select
                  id="method"
                  name="method"
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            {/* Expiration Timer */}
            <div className="text-center text-sm">
              <span className="text-gray-600">Code expires in: </span>
              <span className={`font-semibold ${expiresIn < 60 ? 'text-red-600' : 'text-indigo-600'}`}>
                {formatTime(expiresIn)}
              </span>
            </div>

            <div>
              <label htmlFor="otp" className="sr-only">OTP Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength="6"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 text-center text-2xl tracking-widest focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-3xl"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>

            {/* Attempts Remaining */}
            {attemptsRemaining < 5 && attemptsRemaining > 0 && (
              <div className="text-center text-sm text-orange-600">
                ⚠️ {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || !canResend}
                className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {!canResend && countdown > 0
                  ? `Resend in ${countdown}s`
                  : 'Resend OTP'
                }
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setOtpCode('');
                  setError('');
                  setMessage('');
                  setCountdown(0);
                  setCanResend(true);
                }}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Change number
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Back to regular login
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
