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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
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
        
        <div className="card">
          <div style={{ padding: 'var(--space-6)' }}>
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
                />
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
      </div>
    </div>
  );
};

export default Profile;