import React, { useState, useEffect } from 'react';
import { customersAPI } from '../services/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ phone: '', address: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customersAPI.list();
      setCustomers(res.data);
    } catch (err) {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filtered = customers.filter(c =>
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (customer) => {
    setSelected(customer);
    setEditForm({ phone: customer.phone || '', address: customer.address || '', role: customer.role || '' });
    setSuccess('');
    setError('');
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await customersAPI.partialUpdate(selected.id, editForm);
      setSuccess('Customer updated!');
      fetchCustomers();
      setSelected(null);
    } catch (err) {
      setError('Failed to update customer.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await customersAPI.delete(selected.id);
      setSuccess('Customer deactivated.');
      fetchCustomers();
      setSelected(null);
    } catch (err) {
      setError('Failed to deactivate customer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">Manage customer accounts and details</p>
        </div>
        <input
          type="text"
          placeholder="Search by email or username"
          value={search}
          onChange={handleSearch}
          className="border px-3 py-2 rounded"
          style={{ minWidth: 220 }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{c.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{c.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{c.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      c.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {c.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => handleSelect(c)}
                    >Edit</button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => { setSelected(c); handleDeactivate(); }}
                    >Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
            <div className="mb-3">
              <label className="block mb-1">Phone</label>
              <input name="phone" value={editForm.phone} onChange={handleEditChange} className="border px-2 py-1 rounded w-full" />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Address</label>
              <textarea name="address" value={editForm.address} onChange={handleEditChange} className="border px-2 py-1 rounded w-full" />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Role</label>
              <select name="role" value={editForm.role} onChange={handleEditChange} className="border px-2 py-1 rounded w-full">
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="manager">Manager</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            {success && <div className="text-green-600 mb-2">{success}</div>}
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;