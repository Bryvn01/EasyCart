import React, { useState, useEffect } from 'react';
import { productsAPI, getApiBaseUrl } from '../services/api';
import { handleApiError, retryWithBackoff, getDetailedErrorMessage, checkApiHealth } from '../utils/errorHandler';

/**
 * ProductList Component
 * Fetches and displays products from the backend API with enhanced error handling
 */
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setIsRetrying(retryCount > 0);
    
    try {
      // Check API health first
      const apiBaseUrl = getApiBaseUrl();
      const isHealthy = await checkApiHealth(apiBaseUrl);
      
      if (!isHealthy && process.env.NODE_ENV === 'development') {
        console.warn('API health check failed, but continuing with request...');
      }
      
      // Fetch products with retry logic
      const response = await retryWithBackoff(
        async () => productsAPI.getProducts(),
        2, // maxRetries
        1500 // initialDelay in ms
      );
      
      const productsData = response.data.results || response.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching products:', err);
      
      // Get detailed error information
      const details = getDetailedErrorMessage(err, 'Failed to fetch products');
      setErrorDetails(details);
      setError(details.userMessage);
      
      // Show toast with specific error
      handleApiError(err, details.userMessage);
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-red-500 text-5xl mb-4">
          {errorDetails?.type === 'NETWORK' ? '📡' : 
           errorDetails?.type === 'CORS' ? '🚫' : 
           errorDetails?.type === 'SERVER' ? '🔧' : '⚠️'}
        </div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Products</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        
        {/* Technical details for development */}
        {process.env.NODE_ENV === 'development' && errorDetails && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left max-w-md mx-auto">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Technical Details (dev only):</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Error Type:</strong> {errorDetails.type}</p>
              <p><strong>Can Retry:</strong> {errorDetails.canRetry ? 'Yes' : 'No'}</p>
              <p><strong>Technical:</strong> {errorDetails.technical}</p>
              <p><strong>API URL:</strong> {getApiBaseUrl()}</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={fetchProducts}
          disabled={isRetrying}
          className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isRetrying ? 'Retrying...' : retryCount > 0 ? `Try Again (Attempt ${retryCount + 1})` : 'Try Again'}
        </button>
        
        {/* Helpful suggestions */}
        {errorDetails && errorDetails.canRetry && (
          <div className="mt-4 p-3 bg-blue-50 rounded text-left max-w-md mx-auto">
            <p className="text-xs text-blue-800">
              {errorDetails.type === 'NETWORK' && 'Check your internet connection and try again.'}
              {errorDetails.type === 'SERVER' && 'The server is experiencing issues. Please try again in a moment.'}
              {errorDetails.type === 'NO_RESPONSE' && 'Unable to reach the server. Please check back shortly.'}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-5xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
        <p className="text-gray-600">Check back later for new products!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
          {/* Product Image */}
          <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
            {product.image || product.image_url ? (
              <img
                src={product.image || product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-full h-full flex items-center justify-center text-gray-400 text-4xl"
              style={{ display: (product.image || product.image_url) ? 'none' : 'flex' }}
            >
              📦
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Category */}
            {product.category && (
              <div className="text-xs text-primary font-semibold mb-1">
                {product.category_name || product.category}
              </div>
            )}

            {/* Product Name */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2" title={product.name}>
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                KSh {product.price?.toLocaleString() || '0'}
              </span>

              {/* Stock Status */}
              {product.stock !== undefined && (
                <span className={`text-xs px-2 py-1 rounded ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Add to Cart Button */}
            <button 
              className="w-full mt-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
