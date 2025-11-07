import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '../services/api';
import { normalizeImageUrl } from '../utils/imageUtils';

/**
 * Custom hook for fetching products with React Query for optimal caching
 * @param {Object} options - Configuration options
 * @param {number} options.page - Current page number (1-indexed)
 * @param {number} options.pageSize - Number of items per page
 * @param {string} options.search - Search query
 * @param {string} options.category - Category filter
 * @param {string} options.ordering - Sort order
 * @param {Object} options.priceRange - Price range filter {min, max}
 * @returns {Object} - { products, loading, error, pagination, isLoading, isFetching, refetch }
 */
export const useProducts = ({
  page = 1,
  pageSize = 12,
  search = '',
  category = '',
  ordering = '',
  priceRange = { min: '', max: '' }
} = {}) => {
  // Build query key from all parameters
  const queryKey = ['products', { page, pageSize, search, category, ordering, priceRange }];

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
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
          image: normalizeImageUrl(p.image || p.image_url)
        }));
      }

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / pageSize);
      
      return {
        products: Array.isArray(productsData) ? productsData : [],
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
          pageSize
        }
      };
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,    // Keep previous data while fetching new data
  });

  return {
    products: data?.products || [],
    loading: isLoading,
    isFetching,
    error: isError ? error : null,
    pagination: data?.pagination || {
      currentPage: page,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false,
      pageSize
    },
    refresh: refetch,
  };
};

/**
 * Hook for fetching a single product by ID
 * @param {string|number} id - Product ID
 * @returns {Object} - { product, loading, error, refetch }
 */
export const useProduct = (id) => {
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productsAPI.getProduct(id);
      const product = response.data;
      
      // Normalize product data
      return {
        ...product,
        id: product._id || product.id,
        category_name: product.category?.name || product.category_name || 'Uncategorized',
        image: normalizeImageUrl(product.image || product.image_url)
      };
    },
    staleTime: 15 * 60 * 1000,  // 15 minutes for individual products
    enabled: !!id,               // Only run if ID is provided
  });

  return {
    product,
    loading: isLoading,
    error: isError ? error : null,
    refetch,
  };
};

/**
 * Hook for fetching categories
 * @returns {Object} - { categories, loading, error, refetch }
 */
export const useCategories = () => {
  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await productsAPI.getCategories();
      const categoriesData = response.data.results || response.data;
      return Array.isArray(categoriesData) ? categoriesData : [];
    },
    staleTime: 60 * 60 * 1000,  // 1 hour - categories change infrequently
    cacheTime: 2 * 60 * 60 * 1000, // 2 hours
  });

  return {
    categories: categories || [],
    loading: isLoading,
    error: isError ? error : null,
    refetch,
  };
};

export default useProducts;
