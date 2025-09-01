import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Products from '../pages/Products';
import * as api from '../services/api';

jest.mock('../services/api');

const mockProducts = {
  data: {
    results: [
      { id: 1, name: 'Test Product', price: 100, category: 'Electronics', image: 'test.jpg', description: 'Test desc', stock: 10, rating: 4.5, brand: 'Test' }
    ],
    count: 1
  }
};

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Products Page', () => {
  beforeEach(() => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    api.productsAPI.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Electronics' }] });
  });

  test('renders products list', async () => {
    renderWithRouter(<Products />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  test('filters products by search', async () => {
    renderWithRouter(<Products />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalledWith(expect.objectContaining({
        search: 'Test'
      }));
    });
  });
});