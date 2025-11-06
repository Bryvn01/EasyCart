import { renderHook, waitFor } from '../../test-utils';
import { useProducts } from '../useProducts';
import { productsAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api');

describe('useProducts hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should fetch products successfully with DRF-compatible response', async () => {
    // Mock API response with both 'data' and 'results' keys (backend format)
    const mockResponse = {
      data: {
        success: true,
        message: 'Products retrieved successfully',
        data: [
          {
            _id: '1',
            id: '1',
            name: 'iPhone 14 Pro',
            price: 120000,
            category: '1',
            image: 'https://example.com/image1.jpg'
          },
          {
            _id: '2',
            id: '2',
            name: 'Samsung Galaxy S23',
            price: 95000,
            category: '1',
            image: 'https://example.com/image2.jpg'
          }
        ],
        results: [
          {
            _id: '1',
            id: '1',
            name: 'iPhone 14 Pro',
            price: 120000,
            category: '1',
            image: 'https://example.com/image1.jpg'
          },
          {
            _id: '2',
            id: '2',
            name: 'Samsung Galaxy S23',
            price: 95000,
            category: '1',
            image: 'https://example.com/image2.jpg'
          }
        ],
        count: 2,
        next: false,
        previous: false,
        pagination: {
          page: 1,
          limit: 12,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    };

    productsAPI.getProducts.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useProducts({ page: 1, pageSize: 12 }));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify products are loaded
    expect(result.current.products).toHaveLength(2);
    expect(result.current.products[0].name).toBe('iPhone 14 Pro');
    expect(result.current.products[1].name).toBe('Samsung Galaxy S23');

    // Verify pagination
    expect(result.current.pagination.totalCount).toBe(2);
    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.hasNext).toBe(false);
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('Network error');
    productsAPI.getProducts.mockRejectedValue(mockError);

    const { result } = renderHook(() => useProducts({ page: 1, pageSize: 12 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.products).toEqual([]);
  });
});
