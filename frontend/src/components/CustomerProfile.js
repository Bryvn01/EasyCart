import React, { useEffect, useState } from 'react';
import { customersAPI } from '../services/api';
import toast from 'react-hot-toast';

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // Assume user ID is stored in localStorage after login
        const userId = JSON.parse(localStorage.getItem('user'))?.id;
        if (!userId) throw new Error('User not found');
        const res = await customersAPI.retrieve(userId);
        setProfile(res.data);
        setForm({ phone: res.data.phone || '', address: res.data.address || '' });
      } catch (err) {
        setError('Failed to load profile.');
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const validatePhone = (phone) => {
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return 'Please enter a valid phone number';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    // Validate phone if provided
    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      setError(phoneError);
      setSaving(false);
      toast.error(phoneError);
      return;
    }
    
    try {
      const userId = profile.id;
      await customersAPI.partialUpdate(userId, form);
      setSuccess('Profile updated successfully!');
      setProfile({ ...profile, ...form });
      toast.success('Profile updated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError('');
    
    // Client-side validation
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match');
      setChangingPassword(false);
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      setChangingPassword(false);
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      // Call the change password API
      const response = await fetch('/api/auth/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        },
        body: JSON.stringify(passwordForm)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }
      
      toast.success('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordChange(false);
    } catch (err) {
      setPasswordError(err.message);
      toast.error(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  if (error && !profile) return <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>{error}</div>;
  if (!profile) return null;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24 }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Profile Information</h2>
      
      {/* Profile Form */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Email:</label>
            <input 
              type="email" 
              value={profile.email} 
              disabled 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '1px solid #d1d5db',
                borderRadius: 4,
                backgroundColor: '#f3f4f6',
                cursor: 'not-allowed'
              }} 
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Username:</label>
            <input 
              type="text" 
              value={profile.username} 
              disabled 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '1px solid #d1d5db',
                borderRadius: 4,
                backgroundColor: '#f3f4f6',
                cursor: 'not-allowed'
              }} 
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Phone:</label>
            <input 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              placeholder="+254712345678"
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '1px solid #d1d5db',
                borderRadius: 4
              }} 
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
              Enter phone number in international format
            </p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Address:</label>
            <textarea 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              placeholder="Enter your address"
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '1px solid #d1d5db',
                borderRadius: 4,
                minHeight: 80
              }} 
            />
          </div>
          <button 
            type="submit" 
            disabled={saving} 
            style={{ 
              padding: '10px 24px',
              backgroundColor: saving ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {success && <div style={{ color: '#10b981', marginTop: 12 }}>{success}</div>}
          {error && <div style={{ color: '#ef4444', marginTop: 12 }}>{error}</div>}
        </form>
      </div>

      {/* Password Change Section */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Password</h3>
          <button 
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            style={{ 
              padding: '6px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {showPasswordChange ? 'Cancel' : 'Change Password'}
          </button>
        </div>
        
        {showPasswordChange && (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Current Password:</label>
              <input 
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db',
                  borderRadius: 4
                }} 
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>New Password:</label>
              <input 
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db',
                  borderRadius: 4
                }} 
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Confirm New Password:</label>
              <input 
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db',
                  borderRadius: 4
                }} 
              />
            </div>
            <button 
              type="submit" 
              disabled={changingPassword} 
              style={{ 
                padding: '10px 24px',
                backgroundColor: changingPassword ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: changingPassword ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
            {passwordError && <div style={{ color: '#ef4444', marginTop: 12 }}>{passwordError}</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
