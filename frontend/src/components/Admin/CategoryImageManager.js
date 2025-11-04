import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CategoryImageManager = ({ category, onUpdate }) => {
  const [imageUrl, setImageUrl] = useState(category?.image_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(category?.image_url || '');

  // Professional category image suggestions
  const suggestedImages = {
    'Groceries': [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400&h=400&fit=crop&crop=center'
    ],
    'Electronics': [
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&h=400&fit=crop&crop=center'
    ],
    'Fashion': [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop&crop=center'
    ],
    'Home & Kitchen': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center'
    ],
    'Beauty': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop&crop=center'
    ],
    'Sports': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop&crop=center'
    ],
    'Books': [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop&crop=center'
    ],
    'Health': [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center'
    ]
  };

  const handleImageUrlChange = (url) => {
    setImageUrl(url);
    setPreviewUrl(url);
  };

  const handleSave = async () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/categories/${category.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          image_url: imageUrl
        })
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        onUpdate(updatedCategory);
        toast.success('Category image updated successfully!');
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageError = () => {
    setPreviewUrl('');
  };

  const categoryImages = suggestedImages[category?.name] || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Category Image - {category?.name}
      </h3>

      {/* Current Image Preview */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Image
        </label>
        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={category?.name}
              className="w-full h-full object-cover rounded-lg"
              onError={handleImageError}
            />
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-xs text-gray-500">No image</p>
            </div>
          )}
        </div>
      </div>

      {/* Image URL Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Suggested Images */}
      {categoryImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Suggested Professional Images
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categoryImages.map((suggestedUrl, index) => (
              <button
                key={index}
                onClick={() => handleImageUrlChange(suggestedUrl)}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 transition-colors"
              >
                <img
                  src={suggestedUrl}
                  alt={`Suggested ${category?.name} image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                    Use This
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use square images (1:1 aspect ratio) for best results</li>
          <li>• Minimum size: 400x400 pixels</li>
          <li>• Use high-quality, professional images</li>
          <li>• Ensure images are relevant to the category</li>
          <li>• Use HTTPS URLs for security</li>
        </ul>
      </div>
    </div>
  );
};

export default CategoryImageManager;