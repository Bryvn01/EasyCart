import React, { useState, useRef } from 'react';
import axios from 'axios';

const CategoryImageUpload = ({ category, onImageUpdate, apiUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(category?.image_url || '');
  const [previewUrl, setPreviewUrl] = useState(category?.image_url || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Industry standard image validation
  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const minDimension = 100;
    const maxDimension = 2048;

    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, WebP, or SVG)');
    }

    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < minDimension || img.height < minDimension) {
          reject(new Error('Image dimensions must be at least 100x100 pixels'));
        } else if (img.width > maxDimension || img.height > maxDimension) {
          reject(new Error('Image dimensions must not exceed 2048x2048 pixels'));
        } else {
          resolve(true);
        }
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    try {
      setError('');
      setUploading(true);

      await validateImage(file);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('category_id', category.id);

      const response = await axios.post(
        `${apiUrl}/admin/categories/${category.id}/upload-image/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const newImageUrl = response.data.image_url;
      setPreviewUrl(newImageUrl);
      onImageUpdate(category.id, newImageUrl);

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle URL input
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    try {
      setError('');
      setUploading(true);

      // Validate URL format
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|svg)(\?.*)?$/i;
      if (!urlPattern.test(imageUrl)) {
        throw new Error('Please enter a valid image URL (jpg, png, webp, or svg)');
      }

      // Test if image loads
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = () => reject(new Error('Unable to load image from URL'));
        img.src = imageUrl;
      });

      const response = await axios.patch(
        `${apiUrl}/admin/categories/${category.id}/`,
        { image_url: imageUrl },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setPreviewUrl(imageUrl);
      onImageUpdate(category.id, imageUrl);

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update image URL');
    } finally {
      setUploading(false);
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Remove image
  const handleRemoveImage = async () => {
    try {
      setUploading(true);
      await axios.patch(
        `${apiUrl}/admin/categories/${category.id}/`,
        { image_url: '' },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setPreviewUrl('');
      setImageUrl('');
      onImageUpdate(category.id, '');
    } catch (err) {
      setError('Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Category Image: {category.name}
        </h3>
        {previewUrl && (
          <button
            onClick={handleRemoveImage}
            disabled={uploading}
            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
          >
            Remove Image
          </button>
        )}
      </div>

      {/* Image Preview */}
      <div className="mb-6">
        {previewUrl ? (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt={category.name}
              className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
              onError={() => setPreviewUrl('')}
            />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        ) : (
          <div className="w-32 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* Upload Methods */}
      <div className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image File
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-2">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to 5MB (min 100x100px)
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or Enter Image URL
          </label>
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              disabled={uploading}
            />
            <button
              type="submit"
              disabled={!imageUrl.trim() || uploading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {uploading ? 'Saving...' : 'Save URL'}
            </button>
          </form>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="mt-4 flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-sm text-gray-600">Processing...</span>
        </div>
      )}

      {/* Best Practices Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Image Best Practices</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use square images (1:1 ratio) for best results</li>
          <li>• Minimum size: 100x100px, recommended: 400x400px</li>
          <li>• Use WebP format for better performance</li>
          <li>• Ensure good contrast for accessibility</li>
          <li>• Use descriptive alt text (category name)</li>
        </ul>
      </div>
    </div>
  );
};

export default CategoryImageUpload;