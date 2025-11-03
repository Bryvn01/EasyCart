import { renderHook, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../useProducts';
import { productsAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api');

const wrapper = ({ children }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
};

describe('useProducts hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should fetch products successfully with DRF-compatible response', async () => {
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

    let result;
    await act(async () => {
      result = renderHook(() => useProducts({ page: 1, pageSize: 12 }), { wrapper });
    });

    // Initially may be loading or already loaded depending on timing
    expect(result.result.current.products).toBeDefined();

    await waitFor(() => {
      expect(result.result.current.products.length).toBeGreaterThan(0);
    });

    expect(result.result.current.products).toHaveLength(2);
    expect(result.result.current.products[0].name).toBe('iPhone 14 Pro');
    expect(result.result.current.products[1].name).toBe('Samsung Galaxy S23');
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('Network error');
    productsAPI.getProducts.mockRejectedValue(mockError);

    let result;
    await act(async () => {
      result = renderHook(() => useProducts({ page: 1, pageSize: 12 }), { wrapper });
    });

    await waitFor(() => {
      expect(result.result.current.loading).toBe(false);
    });

    expect(result.result.current.error).toBeTruthy();
    expect(result.result.current.products).toEqual([]);
  });
});
