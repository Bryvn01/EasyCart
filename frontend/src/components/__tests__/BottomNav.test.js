import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from '../BottomNav';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';

// Mock the API services to prevent actual API calls
jest.mock('../../services/api', () => ({
  ordersAPI: {
    getCart: jest.fn().mockResolvedValue({ data: { results: [] } }),
  },
  authAPI: {
    checkAuth: jest.fn().mockResolvedValue({ data: { isAuthenticated: false } }),
  },
}));

const MockedBottomNav = () => (
  <MemoryRouter>
    <AuthProvider>
      <CartProvider>
        <BottomNav />
      </CartProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe('BottomNav Component', () => {
  test('renders navigation items correctly', async () => {
    render(<MockedBottomNav />);
    
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Cart')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });
  });

  test('opens search overlay when search button is clicked', async () => {
    render(<MockedBottomNav />);
    
    await waitFor(() => {
      const searchButton = screen.getByText('Search');
      expect(searchButton).toBeInTheDocument();
    });
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Search Products')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search for products...')).toBeInTheDocument();
    });
  });

  test('closes search overlay when close button is clicked', async () => {
    render(<MockedBottomNav />);
    
    await waitFor(() => {
      const searchButton = screen.getByText('Search');
      expect(searchButton).toBeInTheDocument();
    });
    
    // Open search overlay
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Search Products')).toBeInTheDocument();
    });
    
    // Close search overlay
    const closeButton = screen.getByLabelText('Close search');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Search Products')).not.toBeInTheDocument();
    });
  });

  test('has proper ARIA labels for accessibility', async () => {
    render(<MockedBottomNav />);
    
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: 'Bottom navigation' })).toBeInTheDocument();
    });
  });
});
