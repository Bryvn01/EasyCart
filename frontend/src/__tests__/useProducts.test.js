import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from '../hooks/useProducts';
import * as api from '../services/api';

// Mock the API module
jest.mock('../services/api');

const mockProductsResponse = {
  data: {
    count: 25,
    results: [
      {
        id: 1,
        name: 'Test Product 1',
        price: 100,
        category: 'Electronics',
        image: 'https://res.cloudinary.com/test/image1.jpg',
        description: 'Test description 1',
        stock: 10
      },
      {
        id: 2,
        name: 'Test Product 2',
        price: 200,
        category: 'Fashion',
        image: '/media/products/image2.jpg',
        description: 'Test description 2',
        stock: 5
      }
    ]
  }
};

describe('useProducts hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.productsAPI.getProducts.mockResolvedValue(mockProductsResponse);
  });

  test('fetches products on mount', async () => {
    const { result } = renderHook(() => useProducts());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);

    // Wait for products to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toHaveLength(2);
    expect(result.current.products[0].name).toBe('Test Product 1');
    expect(result.current.error).toBeNull();
  });

  test('includes pagination information', async () => {
    const { result } = renderHook(() => useProducts({ page: 1, pageSize: 12 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pagination).toEqual({
      currentPage: 1,
      totalPages: 3, // 25 items / 12 per page = 3 pages
      totalCount: 25,
      hasNext: true,
      hasPrevious: false,
      pageSize: 12
    });
  });

  test('handles search parameter', async () => {
    renderHook(() => useProducts({ search: 'laptop' }));

    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'laptop'
        })
      );
    });
  });

  test('handles category filter', async () => {
    renderHook(() => useProducts({ category: '1' }));

    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          category: '1'
        })
      );
    });
  });

  test('handles ordering parameter', async () => {
    renderHook(() => useProducts({ ordering: '-price' }));

    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          ordering: '-price'
        })
      );
    });
  });

  test('handles price range filter', async () => {
    renderHook(() => useProducts({ priceRange: { min: '100', max: '500' } }));

    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          price_min: '100',
          price_max: '500'
        })
      );
    });
  });

  test('normalizes image URLs', async () => {
    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // First product has full Cloudinary URL (should stay as is)
    expect(result.current.products[0].image).toBe('https://res.cloudinary.com/test/image1.jpg');

    // Second product has relative URL (should be normalized)
    expect(result.current.products[1].image).toContain('/media/products/image2.jpg');
  });

  test('handles API errors gracefully', async () => {
    const testError = new Error('API Error');
    api.productsAPI.getProducts.mockRejectedValue(testError);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(testError);
    expect(result.current.products).toEqual([]);
  });

  test('refresh function refetches data', async () => {
    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the mock calls
    api.productsAPI.getProducts.mockClear();

    // Call refresh
    result.current.refresh();

    // Should trigger a new API call
    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalled();
    });
  });

  test('handles pagination parameters correctly', async () => {
    renderHook(() => useProducts({ page: 2, pageSize: 10 }));

    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          page_size: 10
        })
      );
    });
  });

  test('handles non-paginated API response', async () => {
    // Some APIs might return array directly
    api.productsAPI.getProducts.mockResolvedValue({
      data: [
        { id: 1, name: 'Product 1', price: 100, image: null }
      ]
    });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.pagination.totalCount).toBe(1);
  });

  test('handles missing image gracefully', async () => {
    api.productsAPI.getProducts.mockResolvedValue({
      data: {
        results: [{ id: 1, name: 'Product', price: 100, image: null }]
      }
    });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products[0].image).toBeNull();
  });

  test('calculates hasNext and hasPrevious correctly', async () => {
    // Test page 1
    const { result: result1 } = renderHook(() => useProducts({ page: 1, pageSize: 12 }));
    await waitFor(() => expect(result1.current.loading).toBe(false));
    expect(result1.current.pagination.hasPrevious).toBe(false);
    expect(result1.current.pagination.hasNext).toBe(true);

    // Test middle page
    const { result: result2 } = renderHook(() => useProducts({ page: 2, pageSize: 12 }));
    await waitFor(() => expect(result2.current.loading).toBe(false));
    expect(result2.current.pagination.hasPrevious).toBe(true);
    expect(result2.current.pagination.hasNext).toBe(true);

    // Test last page
    const { result: result3 } = renderHook(() => useProducts({ page: 3, pageSize: 12 }));
    await waitFor(() => expect(result3.current.loading).toBe(false));
    expect(result3.current.pagination.hasPrevious).toBe(true);
    expect(result3.current.pagination.hasNext).toBe(false);
  });
});
