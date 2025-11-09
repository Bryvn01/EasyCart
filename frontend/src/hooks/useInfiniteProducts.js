import { useInfiniteQuery } from '@tanstack/react-query';
import { productsAPI } from '../services/api';
import { normalizeImageUrl } from '../utils/imageUtils';

/**
 * Custom hook for infinite scroll products using React Query v5
 * @param {Object} options - Configuration options
 * @param {string} options.search - Search query
 * @param {string} options.category - Category filter
 * @param {string} options.ordering - Sort order
 * @param {Object} options.priceRange - Price range filter {min, max}
 * @param {number} options.pageSize - Number of items per page
 * @returns {Object} - React Query infinite query result
 */
export const useInfiniteProducts = ({
  search = '',
  category = '',
  ordering = '',
  priceRange = { min: '', max: '' },
  pageSize = 12
} = {}) => {
  
  const queryResult = useInfiniteQuery({
    queryKey: ['products', 'infinite', search, category, ordering, priceRange.min, priceRange.max, pageSize],
    
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
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
          category_name: p.category?.name || p.category_name || 'Uncategorized',
          image: normalizeImageUrl(p.image || p.image_url)
        }));
      }

      return {
        results: Array.isArray(productsData) ? productsData : [],
        count: totalCount,
        next: response.data.next,
        previous: response.data.previous,
        page: pageParam
      };
    },

    getNextPageParam: (lastPage) => {
      // Return next page number if there are more pages
      return lastPage.next ? lastPage.page + 1 : undefined;
    },

    initialPageParam: 1,
    
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - formerly cacheTime in v3
  });

  // Flatten all pages into a single array
  const products = queryResult.data?.pages.flatMap(page => page.results) ?? [];
  
  // Calculate total count from first page
  const totalCount = queryResult.data?.pages[0]?.count ?? 0;

  return {
    ...queryResult,
    products,
    totalCount
  };
};

export default useInfiniteProducts;
