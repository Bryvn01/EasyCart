import React, { useEffect, useState } from 'react';
import { customersAPI } from '../services/api';

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const userId = profile.id;
      await customersAPI.partialUpdate(userId, form);
      setSuccess('Profile updated successfully!');
      setProfile({ ...profile, ...form });
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!profile) return null;

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Profile Information</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email:</label>
          <input type="email" value={profile.email} disabled style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Username:</label>
          <input type="text" value={profile.username} disabled style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Phone:</label>
          <input name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Address:</label>
          <textarea name="address" value={form.address} onChange={handleChange} style={{ width: '100%' }} />
        </div>
        <button type="submit" disabled={saving} style={{ padding: '8px 24px' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {success && <div style={{ color: 'green', marginTop: 12 }}>{success}</div>}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
};

export default CustomerProfile;
