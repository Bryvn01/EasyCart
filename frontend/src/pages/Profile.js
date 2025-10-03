import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
// import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await authAPI.updateProfile(profile);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordMessage('');

    // Validate passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMessage('New passwords do not match');
      setChangingPassword(false);
      return;
    }

    // Validate password length
    if (passwordData.new_password.length < 8) {
      setPasswordMessage('Password must be at least 8 characters long');
      setChangingPassword(false);
      return;
    }

    try {
      await authAPI.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setPasswordMessage('Password changed successfully!');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordMessage('');
      }, 2000);
    } catch (error) {
      setPasswordMessage(error.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        {/* Profile Information Card */}
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ padding: 'var(--space-6)' }}>
            <h2 className="text-xl font-bold mb-4">Profile Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={profile.username}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={profile.email}
                  onChange={handleChange}
                  required
                  disabled
                />
                <small style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  Email cannot be changed
                  {profile.email_verified !== undefined && (
                    <span style={{ 
                      marginLeft: '0.5rem',
                      color: profile.email_verified ? '#059669' : '#dc2626',
                      fontWeight: '500'
                    }}>
                      {profile.email_verified ? '✓ Verified' : '✗ Not verified'}
                    </span>
                  )}
                </small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="254712345678"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  rows="4"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Your delivery address"
                />
              </div>
              
              {message && (
                <div style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-4)',
                  backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2',
                  color: message.includes('success') ? '#065f46' : '#991b1b'
                }}>
                  {message}
                </div>
              )}
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ width: '100%' }}
              >
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Password Change Card */}
        <div className="card">
          <div style={{ padding: 'var(--space-6)' }}>
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    name="old_password"
                    className="form-control"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    className="form-control"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    className="form-control"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    placeholder="Confirm new password"
                  />
                </div>
                
                {passwordMessage && (
                  <div style={{ 
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-4)',
                    backgroundColor: passwordMessage.includes('success') ? '#d1fae5' : '#fee2e2',
                    color: passwordMessage.includes('success') ? '#065f46' : '#991b1b'
                  }}>
                    {passwordMessage}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        old_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                      setPasswordMessage('');
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={changingPassword}
                    style={{ flex: 1 }}
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;