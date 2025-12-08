import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Shield, CheckCircle } from 'lucide-react';

const TwoFactorSetup = () => {
  const [status, setStatus] = useState({ enabled: false, is_admin: false });
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('status'); // status, setup, verify

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await authAPI.get2FAStatus();
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await authAPI.setup2FA();
      setQrCode(response.data.qr_code);
      setSecret(response.data.secret);
      setStep('setup');
      toast.success('Scan QR code with your authenticator app');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.enable2FA(token);
      toast.success('2FA enabled successfully!');
      setStep('status');
      setToken('');
      fetchStatus();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid token');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to disable 2FA?')) return;

    setLoading(true);
    try {
      await authAPI.disable2FA(token);
      toast.success('2FA disabled successfully');
      setToken('');
      fetchStatus();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid token');
    } finally {
      setLoading(false);
    }
  };

  if (!status.is_admin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">Two-factor authentication is only available for admin users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add an extra layer of security to your account
        </p>
      </div>

      {step === 'status' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Shield className={`h-8 w-8 ${status.enabled ? 'text-green-600' : 'text-gray-400'} mr-3`} />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  2FA Status: {status.enabled ? 'Enabled' : 'Disabled'}
                </h3>
                <p className="text-sm text-gray-500">
                  {status.enabled ? 'Your account is protected with 2FA' : 'Protect your account with 2FA'}
                </p>
              </div>
            </div>
            {status.enabled && (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
          </div>

          {!status.enabled ? (
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Enable 2FA'}
            </button>
          ) : (
            <form onSubmit={handleDisable}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 2FA code to disable
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                maxLength="6"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </form>
          )}
        </div>
      )}

      {step === 'setup' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scan QR Code</h3>

          <div className="text-center mb-6">
            {qrCode && (
              <img src={qrCode} alt="QR Code" className="mx-auto border border-gray-300 rounded-lg p-4" />
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Or enter this code manually:</p>
            <code className="block text-center text-lg font-mono bg-white px-4 py-2 rounded border border-gray-300">
              {secret}
            </code>
          </div>

          <form onSubmit={handleEnable}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter verification code from your app
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="000000"
              maxLength="6"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              required
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('status')}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </form>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended Apps:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Google Authenticator</li>
              <li>• Microsoft Authenticator</li>
              <li>• Authy</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
