import React, { useEffect, useState } from 'react';
import { customersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CustomerProfile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [emailChanged, setEmailChanged] = useState(false);
  const [phoneChanged, setPhoneChanged] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        if (!authUser?.id) throw new Error('User not authenticated');
        const res = await customersAPI.retrieve(authUser.id);
        setProfile(res.data);
        setForm({
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || ''
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchProfile();
    } else {
      setLoading(false);
      setError('Please log in to view your profile.');
    }
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Track if email or phone changed
    if (name === 'email' && value !== profile.email) {
      setEmailChanged(true);
    } else if (name === 'email' && value === profile.email) {
      setEmailChanged(false);
    }

    if (name === 'phone' && value !== profile.phone) {
      setPhoneChanged(true);
    } else if (name === 'phone' && value === profile.phone) {
      setPhoneChanged(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const userId = profile.id;

      // Prepare update data
      const updateData = { ...form };

      // Validate email format if changed
      if (emailChanged) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
          setError('Please enter a valid email address');
          setSaving(false);
          return;
        }
      }

      // Validate phone format if changed
      if (phoneChanged) {
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
        if (form.phone && !phoneRegex.test(form.phone)) {
          setError('Please enter a valid phone number');
          setSaving(false);
          return;
        }
      }

      await customersAPI.partialUpdate(userId, updateData);

      // Show appropriate success message
      if (emailChanged || phoneChanged) {
        const changedFields = [];
        if (emailChanged) changedFields.push('email');
        if (phoneChanged) changedFields.push('phone number');
        setSuccess(`Profile updated! Your ${changedFields.join(' and ')} will be verified on next login.`);
        setEmailChanged(false);
        setPhoneChanged(false);
      } else {
        setSuccess('Profile updated successfully!');
      }

      setProfile({ ...profile, ...form });

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.email?.[0] ||
                       err.response?.data?.phone?.[0] ||
                       err.response?.data?.message ||
                       'Failed to update profile.';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg className="animate-spin w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-red-100">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary min-h-[44px] inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-3xl mx-auto">
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--gray-200)',
          overflow: 'hidden'
        }}>
          {/* Success/Error Messages */}
          {success && (
            <div style={{
              background: '#d1fae5',
              borderBottom: '1px solid #a7f3d0',
              padding: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)'
            }}>
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span style={{ color: '#065f46', fontWeight: '500' }}>{success}</span>
            </div>
          )}

          {error && profile && (
            <div style={{
              background: '#fee2e2',
              borderBottom: '1px solid #fecaca',
              padding: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)'
            }}>
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span style={{ color: '#991b1b', fontWeight: '500' }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: 'var(--space-8)' }}>
            {/* Account Information Section */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--gray-900)',
                marginBottom: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--gray-700)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Address
                    </div>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: emailChanged ? '2px solid var(--warning)' : '2px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      minHeight: '44px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = emailChanged ? 'var(--warning)' : 'var(--gray-300)'}
                  />
                  {emailChanged && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#d97706',
                      marginTop: 'var(--space-1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Email change requires re-verification on next login
                    </p>
                  )}
                  {!emailChanged && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--gray-500)',
                      marginTop: 'var(--space-1)'
                    }}>
                      Used for order updates and account recovery
                    </p>
                  )}
                </div>

                {/* Username Field */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--gray-700)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Username
                    </div>
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    disabled
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      background: 'var(--gray-50)',
                      color: 'var(--gray-600)',
                      cursor: 'not-allowed'
                    }}
                  />
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--gray-500)',
                    marginTop: 'var(--space-1)'
                  }}>
                    Username cannot be changed
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--gray-900)',
                marginBottom: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Information
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--gray-700)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Phone Number
                    </div>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g., +254 712 345 678"
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: phoneChanged ? '2px solid var(--warning)' : '2px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      minHeight: '44px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = phoneChanged ? 'var(--warning)' : 'var(--gray-300)'}
                  />
                  {phoneChanged && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#d97706',
                      marginTop: 'var(--space-1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Phone change requires OTP verification on next login
                    </p>
                  )}
                  {!phoneChanged && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--gray-500)',
                      marginTop: 'var(--space-1)'
                    }}>
                      Used for order notifications and OTP login
                    </p>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label htmlFor="address" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--gray-700)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delivery Address
                    </div>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter your full delivery address"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: '2px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--gray-200)'
            }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary min-h-[44px] focus:ring-2 focus:ring-primary"
                style={{
                  flex: '1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    email: profile.email || '',
                    phone: profile.phone || '',
                    address: profile.address || ''
                  });
                  setEmailChanged(false);
                  setPhoneChanged(false);
                }}
                className="btn btn-secondary min-h-[44px] focus:ring-2 focus:ring-gray-400"
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
