import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';
import { normalizeImageUrl } from '../utils/imageUtils';

/**
 * Custom hook for fetching products with pagination, search, and category filtering
 * @param {Object} options - Configuration options
 * @param {number} options.page - Current page number (1-indexed)
 * @param {number} options.pageSize - Number of items per page
 * @param {string} options.search - Search query
 * @param {string} options.category - Category filter
 * @param {string} options.ordering - Sort order
 * @param {Object} options.priceRange - Price range filter {min, max}
 * @returns {Object} - { products, loading, error, pagination, refresh }
 */
export const useProducts = ({
  page = 1,
  pageSize = 12,
  search = '',
  category = '',
  ordering = '',
  priceRange = { min: '', max: '' }
} = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: page,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
    pageSize: pageSize
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        page_size: pageSize
      };

      // Add optional filters
      if (search) params.search = search;
      if (category) params.category = category;
      if (ordering) params.ordering = ordering;
      if (priceRange.min) params.price_min = priceRange.min;
      if (priceRange.max) params.price_max = priceRange.max;

      const response = await productsAPI.getProducts(params);

      // Handle Django REST Framework paginated response
      let productsData = response.data.results || response.data;
      const totalCount = response.data.count || (Array.isArray(productsData) ? productsData.length : 0);

      // Normalize product data
      if (Array.isArray(productsData)) {
        productsData = productsData.map(p => ({
          ...p,
          id: p._id || p.id,
          // Keep category object as is, and add category_name for backwards compatibility
          category_name: p.category?.name || p.category_name || 'Uncategorized',
          // Normalize image URL for Cloudinary
          image: normalizeImageUrl(p.image || p.image_url),
          // Ensure price is a number for type safety
          price: typeof p.price === 'string' ? parseFloat(p.price) : p.price
        }));
      }

      setProducts(Array.isArray(productsData) ? productsData : []);

      // Update pagination info
      const totalPages = Math.ceil(totalCount / pageSize);
      setPagination({
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        pageSize
      });

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err);
      setProducts([]);
      setPagination({
        currentPage: page,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false,
        pageSize
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, category, ordering, priceRange.min, priceRange.max]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Refresh function to manually refetch data
  const refresh = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    refresh
  };
};

export default useProducts;
