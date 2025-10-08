import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Trash2, Download, Search, Grid, List, CheckSquare, Square } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * ImageGalleryManager Component
 * Manages uploaded images with view, search, select, and delete functionality
 */
const ImageGalleryManager = ({ onSelectImage, selectable = false, maxSelection = 1 }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [filteredImages, setFilteredImages] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch images from the API
    // For now, we'll use a placeholder
    // fetchImages();
  }, []);

  useEffect(() => {
    // Filter images based on search term
    if (searchTerm) {
      setFilteredImages(
        images.filter(img =>
          img.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredImages(images);
    }
  }, [searchTerm, images]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      // Placeholder - implement actual API call
      // const response = await adminAPI.getImages();
      // setImages(response.data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = (imageUrl) => {
    if (!selectable) return;

    const newSelected = new Set(selectedImages);
    
    if (newSelected.has(imageUrl)) {
      newSelected.delete(imageUrl);
    } else {
      if (maxSelection === 1) {
        newSelected.clear();
      } else if (newSelected.size >= maxSelection) {
        toast.error(`Maximum ${maxSelection} images can be selected`);
        return;
      }
      newSelected.add(imageUrl);
    }
    
    setSelectedImages(newSelected);
    
    if (onSelectImage) {
      onSelectImage(Array.from(newSelected));
    }
  };

  const handleDeleteImage = async (imageUrl, publicId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      if (publicId) {
        await adminAPI.deleteImage(publicId);
      }
      setImages(prev => prev.filter(img => img.url !== imageUrl));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) {
      toast.error('No images selected');
      return;
    }

    if (!window.confirm(`Delete ${selectedImages.size} selected image(s)?`)) {
      return;
    }

    try {
      // Delete selected images
      const deletePromises = Array.from(selectedImages).map(url => {
        const image = images.find(img => img.url === url);
        if (image?.publicId) {
          return adminAPI.deleteImage(image.publicId);
        }
      });

      await Promise.allSettled(deletePromises);
      setImages(prev => prev.filter(img => !selectedImages.has(img.url)));
      setSelectedImages(new Set());
      toast.success(`${selectedImages.size} image(s) deleted successfully`);
    } catch (error) {
      console.error('Failed to delete images:', error);
      toast.error('Failed to delete some images');
    }
  };

  const handleDownloadImage = (imageUrl, imageName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName || 'image.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading images...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Image Gallery</h3>
          <p className="text-sm text-gray-500">
            {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
            {selectedImages.size > 0 && ` (${selectedImages.size} selected)`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Bulk Actions */}
          {selectable && selectedImages.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedImages.size})
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Image Grid/List */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Upload some images to get started'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((image, index) => (
            <div
              key={image.url || index}
              className={`
                relative group border-2 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer transition-all
                ${selectedImages.has(image.url) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}
              `}
              onClick={() => handleSelectImage(image.url)}
            >
              {/* Selection Indicator */}
              {selectable && (
                <div className="absolute top-2 left-2 z-10">
                  {selectedImages.has(image.url) ? (
                    <CheckSquare className="h-5 w-5 text-blue-600 bg-white rounded" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              )}

              {/* Image */}
              <div className="aspect-square">
                <img
                  src={image.url}
                  alt={image.name || 'Image'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=Error';
                  }}
                />
              </div>

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyImageUrl(image.url);
                  }}
                  className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                  title="Copy URL"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage(image.url, image.name);
                  }}
                  className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(image.url, image.publicId);
                  }}
                  className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredImages.map((image, index) => (
            <div
              key={image.url || index}
              className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition-all
                ${selectedImages.has(image.url) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white'}
              `}
              onClick={() => handleSelectImage(image.url)}
            >
              {/* Selection Checkbox */}
              {selectable && (
                <div className="mr-3">
                  {selectedImages.has(image.url) ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              )}

              {/* Thumbnail */}
              <div className="flex-shrink-0 w-16 h-16 mr-4">
                <img
                  src={image.url}
                  alt={image.name || 'Image'}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/64?text=Error';
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {image.name || 'Untitled'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {image.url}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyImageUrl(image.url);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="Copy URL"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage(image.url, image.name);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(image.url, image.publicId);
                  }}
                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGalleryManager;
