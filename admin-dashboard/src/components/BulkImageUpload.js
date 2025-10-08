import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Loader } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * BulkImageUpload Component
 * Handles bulk image uploads with drag-and-drop, progress tracking, and preview
 */
const BulkImageUpload = ({ onUploadComplete, maxFiles = 10 }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error(`${file.name}: Invalid file type. Please use JPG, PNG, WebP, or GIF.`);
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`${file.name}: File too large. Maximum size is 5MB.`);
      return false;
    }

    return true;
  };

  const processFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(validateFile);
    
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed. Please remove some files first.`);
      return;
    }

    const filesWithPreviews = newFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      url: null,
      error: null
    }));

    setFiles(prev => [...prev, ...filesWithPreviews]);
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [files.length, maxFiles]);

  const removeFile = (id) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
    
    // Clear progress for this file
    setUploadProgress(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const uploadSingleFile = async (fileData) => {
    const formData = new FormData();
    formData.append('image', fileData.file);
    formData.append('folder', 'products');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: Math.min((prev[fileData.id] || 0) + Math.random() * 30, 90)
        }));
      }, 200);

      const response = await adminAPI.uploadImage(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileData.id]: 100 }));

      return {
        id: fileData.id,
        status: 'success',
        url: response.data?.url || response.data?.file_url,
        publicId: response.data?.publicId
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        id: fileData.id,
        status: 'error',
        error: error.response?.data?.message || error.message || 'Upload failed'
      };
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    setUploading(true);
    
    try {
      // Upload files in parallel with a limit
      const batchSize = 3; // Upload 3 files at a time
      const results = [];

      for (let i = 0; i < pendingFiles.length; i += batchSize) {
        const batch = pendingFiles.slice(i, i + batchSize);
        
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          batch.find(b => b.id === f.id) ? { ...f, status: 'uploading' } : f
        ));

        const batchResults = await Promise.all(
          batch.map(fileData => uploadSingleFile(fileData))
        );
        
        results.push(...batchResults);

        // Update file statuses
        setFiles(prev => prev.map(f => {
          const result = batchResults.find(r => r.id === f.id);
          if (result) {
            return {
              ...f,
              status: result.status,
              url: result.url,
              publicId: result.publicId,
              error: result.error
            };
          }
          return f;
        }));
      }

      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      if (successCount > 0) {
        toast.success(`${successCount} image(s) uploaded successfully`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} image(s) failed to upload`);
      }

      // Call callback with successful uploads
      if (onUploadComplete && successCount > 0) {
        const successfulUploads = results
          .filter(r => r.status === 'success')
          .map(r => ({ url: r.url, publicId: r.publicId }));
        onUploadComplete(successfulUploads);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const clearCompleted = () => {
    setFiles(prev => {
      const completed = prev.filter(f => f.status === 'success' || f.status === 'error');
      completed.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      return prev.filter(f => f.status === 'pending' || f.status === 'uploading');
    });
  };

  const retryFailed = () => {
    setFiles(prev => prev.map(f => 
      f.status === 'error' ? { ...f, status: 'pending', error: null } : f
    ));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <ImageIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          PNG, JPG, WebP or GIF (max {maxFiles} files, 5MB each)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">
                Total: <span className="font-semibold">{files.length}</span>
              </span>
              {pendingCount > 0 && (
                <span className="text-gray-600">
                  Pending: <span className="font-semibold text-yellow-600">{pendingCount}</span>
                </span>
              )}
              {successCount > 0 && (
                <span className="text-gray-600">
                  Success: <span className="font-semibold text-green-600">{successCount}</span>
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-gray-600">
                  Failed: <span className="font-semibold text-red-600">{errorCount}</span>
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              {(successCount > 0 || errorCount > 0) && (
                <button
                  onClick={clearCompleted}
                  className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Clear Completed
                </button>
              )}
              {errorCount > 0 && (
                <button
                  onClick={retryFailed}
                  disabled={uploading}
                  className="text-xs px-3 py-1 text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50 disabled:opacity-50"
                >
                  Retry Failed
                </button>
              )}
            </div>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
            {files.map((fileData) => (
              <div
                key={fileData.id}
                className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
              >
                {/* Image Preview */}
                <div className="aspect-square relative">
                  <img
                    src={fileData.preview}
                    alt={fileData.file.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {getStatusIcon(fileData.status)}
                  </div>

                  {/* Remove Button */}
                  {fileData.status !== 'uploading' && (
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  {/* Progress Bar */}
                  {fileData.status === 'uploading' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${uploadProgress[fileData.id] || 0}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate" title={fileData.file.name}>
                    {fileData.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(fileData.file.size / 1024).toFixed(1)} KB
                  </p>
                  {fileData.error && (
                    <p className="text-xs text-red-500 truncate" title={fileData.error}>
                      {fileData.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {pendingCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={uploadAllFiles}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {pendingCount} Image{pendingCount !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkImageUpload;
