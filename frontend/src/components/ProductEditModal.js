import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { useQuery, useMutation } from '@tanstack/react-query';

const ProductEditModal = ({ product, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories with React Query
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await productsAPI.getCategories();
      return response.data;
    },
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category?.id || product.category || '',
        stock: product.stock || '',
        image_url: product.image_url || '',
        is_active: product.is_active !== undefined ? product.is_active : true
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  // React Query mutation for updating product
  const updateProductMutation = useMutation({
    mutationFn: async (updateData) => {
      return productsAPI.updateProduct(product.id, updateData).then(res => res.data);
    },
    onSuccess: (updatedProduct) => {
      onUpdate(updatedProduct);
      onClose();
      alert('Product updated successfully! ✅');
    },
    onError: (err) => {
      setError('Failed to update product');
      console.error('Error updating product:', err);
    },
    onSettled: () => setLoading(false),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      setLoading(false);
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      setLoading(false);
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Valid stock quantity is required');
      setLoading(false);
      return;
    }

    const updateData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image_url: formData.image_url?.trim() || ''
    };
    updateProductMutation.mutate(updateData);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-4)'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit Product</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--gray-500)'
              }}
            >
              ×
            </button>
          </div>

          {error && (
            <div style={{
              background: 'var(--error)',
              color: 'white',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-4)',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: 'var(--space-2)',
                color: 'var(--gray-700)'
              }}>
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: 'var(--space-2)',
                color: 'var(--gray-700)'
              }}>
                Description
              </label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--gray-700)'
                }}>
                  Price (KES) *
                </label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--gray-700)'
                }}>
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  className="form-control"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Image Upload or URL Field with Preview and Validation */}
            <div className="form-group mt-4">
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: 'var(--space-2)',
                color: 'var(--gray-700)'
              }}>
                Product Image
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  name="image_file"
                  className="form-control"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      if (!file.type.startsWith('image/')) {
                        setError('Selected file is not an image.');
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        setError('Image file size must be less than 5MB.');
                        return;
                      }
                    }
                    setError('');
                    setFormData(prev => ({
                      ...prev,
                      image_file: file,
                      image_url: '' // Clear URL if file is chosen
                    }));
                  }}
                  aria-label="Upload product image file"
                  style={{ flex: 1 }}
                />
                <span style={{ color: 'var(--gray-500)', fontSize: '0.9em' }}>or</span>
                <input
                  type="url"
                  name="image_url"
                  className="form-control"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={e => {
                    setError('');
                    setFormData(prev => ({
                      ...prev,
                      image_url: e.target.value,
                      image_file: undefined // Clear file if URL is entered
                    }));
                  }}
                  aria-label="Paste image URL"
                  style={{ flex: 2 }}
                />
              </div>
              <small className="text-gray-500">Upload an image file (max 5MB) or paste a direct image link (e.g., from Unsplash, Cloudinary, Imgur, etc.). Only one will be used.</small>
              {/* Preview Section */}
              {(formData.image_file || formData.image_url) && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.9em', color: 'var(--gray-700)' }}>Preview:</span>
                  <img
                    src={formData.image_file ? URL.createObjectURL(formData.image_file) : formData.image_url}
                    alt="Product preview"
                    style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8, border: '1px solid #eee', background: '#fafafa' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  {formData.image_file && (
                    <span style={{ fontSize: '0.85em', color: 'var(--gray-500)' }}>{formData.image_file.name}</span>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: 'var(--space-2)',
                color: 'var(--gray-700)'
              }}>
                Category
              </label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categoriesLoading && <option>Loading...</option>}
                {categoriesError && <option>Error loading categories</option>}
                {!categoriesLoading && !categoriesError && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--gray-700)'
              }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                Product is active
              </label>
            </div>

            <div className="flex gap-4" style={{ marginTop: 'var(--space-6)' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
